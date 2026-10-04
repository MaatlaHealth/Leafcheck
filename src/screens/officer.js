// Screen 5 and 6: officer review at /officer, with the simulated SMS preview.
// Works in single device demo mode straight from IndexedDB. The server is optional.
import {
  h, icon, setChildren, appHeader, classLabel, confidenceIndicator, photoThumbnail, smsPreview, showToast,
  reportStatusBadge, simulatedChip,
} from '../lib/ui.js';
import { t } from '../lib/strings.js';
import { getAllReportsNewestFirst, updateReport } from '../lib/db.js';
import {
  fetchServerReportsIntoDevice, sendOfficerDecisionToServer, getOfficerAccessCode, setOfficerAccessCode,
} from '../lib/sync.js';
import { exportLabelledDataset, countLabelledPhotos } from '../lib/export.js';
import { buildSmsLines } from '../lib/sms.js';
import { classNameKey, formatReportDate, summariseOfficerLabels } from '../lib/results.js';
import { notifyDataChanged } from '../lib/events.js';
import { KNOWN_CLASSES } from '../config.js';

const NOTE_KEYS = ['note_visit', 'note_clearer_photos', 'note_bring_sample', 'note_keep_checking'];

const officerViewState = {
  activeTab: 'waiting',
  draftsByReportId: new Map(),
  highlightReportId: null,
};

function getDraft(reportId) {
  if (!officerViewState.draftsByReportId.has(reportId)) {
    officerViewState.draftsByReportId.set(reportId, { leafDecisions: {}, noteKey: null });
  }
  return officerViewState.draftsByReportId.get(reportId);
}

function reportMetaRow(report) {
  const classifierChip = report.classifier.mode === 'mock'
    ? h('span', { class: 'chip' }, simulatedChip(), t('officer_classifier_mock'))
    : h('span', { class: 'chip' }, icon('leaf'), t('officer_classifier_model'));
  return h('div', { class: 'officer-report-meta' },
    h('span', { class: 'meta-item' }, icon('list'), formatReportDate(report.createdAt)),
    h('span', { class: 'meta-item' }, icon('leaf'), t(`zone_${report.zone}`)),
    h('span', { class: 'chip' }, icon(report.source === 'server' ? 'server' : 'phone'), t(report.source === 'server' ? 'officer_source_server' : 'officer_source_device')),
    classifierChip,
  );
}

function farmerLine(report) {
  return h('p', { class: 'meta-item' }, icon('user'),
    t('officer_farmer_line', { name: report.farmer.name, member: report.farmer.memberNumber, plot: report.farmer.plotName }));
}

function modelResultLine(leaf) {
  return h('p', { class: 'muted' }, t('officer_model_result', {
    result: t(classNameKey(leaf.prediction.topClassId)),
    percent: Math.round(leaf.prediction.topProbability * 100),
  }));
}

function classPicker(selectedClassId, onChange) {
  return h('label', { class: 'field' },
    h('span', { class: 'field-label' }, icon('pencil'), t('correct_pick_class')),
    h('select', { class: 'picker', onchange: (event) => onChange(event.target.value) },
      KNOWN_CLASSES.map((classId) => h('option', { value: classId, selected: classId === selectedClassId }, t(classNameKey(classId))))),
  );
}

function waitingLeafPanel(report, leaf, redraw) {
  const draft = getDraft(report.id);
  const leafDecision = draft.leafDecisions[leaf.index];
  const modelClassIsKnown = KNOWN_CLASSES.includes(leaf.prediction.topClassId);
  const chooseConfirm = () => {
    draft.leafDecisions[leaf.index] = { decision: 'confirmed', finalClassId: leaf.prediction.topClassId };
    redraw();
  };
  const chooseCorrect = () => {
    const firstOtherClass = KNOWN_CLASSES.find((classId) => classId !== leaf.prediction.topClassId);
    draft.leafDecisions[leaf.index] = { decision: 'corrected', finalClassId: firstOtherClass };
    redraw();
  };
  return h('div', { class: `officer-leaf ${leafDecision ? `decided-${leafDecision.decision}` : ''}` },
    photoThumbnail(leaf.photo, 'photo_alt', { number: leaf.index + 1 }),
    h('p', { class: 'small-heading' }, t('leaf_label', { number: leaf.index + 1 })),
    modelResultLine(leaf),
    h('div', {}, classLabel(leaf.result.classId)),
    confidenceIndicator(leaf.result.level),
    h('div', { class: 'decision-buttons' },
      h('button', {
        type: 'button',
        class: 'button secondary confirm',
        disabled: !modelClassIsKnown,
        'aria-pressed': String(leafDecision?.decision === 'confirmed'),
        onclick: chooseConfirm,
      }, icon('check'), t('button_confirm')),
      h('button', {
        type: 'button',
        class: 'button secondary correct',
        'aria-pressed': String(leafDecision?.decision === 'corrected'),
        onclick: chooseCorrect,
      }, icon('pencil'), t('button_correct')),
    ),
    leafDecision?.decision === 'corrected'
      ? classPicker(leafDecision.finalClassId, (classId) => {
        leafDecision.finalClassId = classId;
      })
      : null,
  );
}

async function saveOfficerDecision(report, redraw) {
  const draft = getDraft(report.id);
  const leafDecisions = report.leaves.map((leaf) => {
    const draftDecision = draft.leafDecisions[leaf.index];
    const decision = draftDecision.finalClassId === leaf.prediction.topClassId ? 'confirmed' : 'corrected';
    return { index: leaf.index, decision, finalClassId: draftDecision.finalClassId, modelTopClassId: leaf.prediction.topClassId };
  });
  const overallClassId = summariseOfficerLabels(leafDecisions.map((leafDecision) => leafDecision.finalClassId));
  const everyLeafConfirmed = leafDecisions.every((leafDecision) => leafDecision.decision === 'confirmed');
  const officerDecision = {
    leaves: leafDecisions,
    overallClassId,
    noteKey: draft.noteKey,
    // Confirmed only if the farmer already saw this answer. Otherwise the officer changed it.
    status: everyLeafConfirmed && overallClassId === report.overall.classId ? 'confirmed' : 'corrected',
    decidedAt: new Date().toISOString(),
  };
  await updateReport(report.id, (storedReport) => {
    storedReport.officerDecision = officerDecision;
    storedReport.status = officerDecision.status;
  });
  officerViewState.draftsByReportId.delete(report.id);

  let messageKey = 'decision_saved';
  let messageTone = 'success';
  const reportIsOnServer = report.source === 'server' || Boolean(report.sentAt);
  if (reportIsOnServer) {
    try {
      await sendOfficerDecisionToServer(report.id, officerDecision);
    } catch (error) {
      console.warn('Decision saved on this device only', error);
      messageKey = 'decision_sync_failed';
      messageTone = 'info';
    }
  }
  officerViewState.activeTab = 'done';
  officerViewState.highlightReportId = report.id;
  notifyDataChanged();
  await redraw();
  showToast(messageKey, {}, messageTone);
  const savedCard = document.getElementById(`report-${report.id}`);
  if (savedCard) savedCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function waitingReportCard(report, redraw) {
  const draft = getDraft(report.id);
  const allLeavesDecided = report.leaves.every((leaf) => draft.leafDecisions[leaf.index]);
  return h('article', { class: 'officer-report', id: `report-${report.id}` },
    reportMetaRow(report),
    farmerLine(report),
    h('p', {}, h('span', { class: 'muted' }, `${t('officer_app_overall')}: `), classLabel(report.overall.classId)),
    h('div', { class: 'officer-leaves' }, report.leaves.map((leaf) => waitingLeafPanel(report, leaf, redraw))),
    h('div', { class: 'officer-send-row' },
      h('label', { class: 'field' },
        h('span', { class: 'field-label' }, icon('message'), t('note_label')),
        h('select', {
          class: 'picker',
          onchange: (event) => {
            draft.noteKey = event.target.value || null;
          },
        },
        h('option', { value: '', selected: !draft.noteKey }, t('note_none')),
        NOTE_KEYS.map((noteKey) => h('option', { value: noteKey, selected: draft.noteKey === noteKey }, t(noteKey)))),
      ),
      h('button', {
        type: 'button',
        class: 'button primary',
        disabled: !allLeavesDecided,
        onclick: () => saveOfficerDecision(report, redraw),
      }, icon('message'), t('button_send_decision')),
    ),
    allLeavesDecided ? null : h('p', { class: 'muted' }, t('decision_pending_leaves')),
  );
}

function doneReportCard(report) {
  const officerDecision = report.officerDecision;
  return h('article', { class: 'officer-report', id: `report-${report.id}` },
    reportMetaRow(report),
    farmerLine(report),
    h('p', {}, reportStatusBadge(report.status), ' ', h('span', { class: 'muted' }, t('officer_decided_on', { date: formatReportDate(officerDecision.decidedAt) }))),
    h('div', { class: 'officer-leaves' },
      report.leaves.map((leaf) => {
        const leafDecision = officerDecision.leaves.find((candidate) => candidate.index === leaf.index);
        return h('div', { class: `officer-leaf decided-${leafDecision.decision}` },
          photoThumbnail(leaf.photo, 'photo_alt', { number: leaf.index + 1 }),
          h('p', { class: 'small-heading' }, t('leaf_label', { number: leaf.index + 1 })),
          modelResultLine(leaf),
          h('p', {}, h('span', { class: 'muted' }, `${t('officer_final_label')}: `), classLabel(leafDecision.finalClassId)),
        );
      })),
    smsPreview(buildSmsLines(report, report.farmerLanguage || 'nso')),
  );
}

export async function renderOfficerPage(appRoot, { keepScroll = false } = {}) {
  const previousScroll = window.scrollY;
  const redraw = () => renderOfficerPage(appRoot, { keepScroll: true });
  const reports = await getAllReportsNewestFirst();
  const waitingReports = reports.filter((report) => !report.officerDecision);
  const doneReports = reports.filter((report) => report.officerDecision);
  const labelledPhotoCount = countLabelledPhotos(reports);
  const accessCodeInput = h('input', { type: 'password', autocomplete: 'off', value: getOfficerAccessCode(), id: 'officer-access-code' });

  async function handleFetchFromServer() {
    setOfficerAccessCode(accessCodeInput.value);
    try {
      const newReportCount = await fetchServerReportsIntoDevice();
      await redraw();
      showToast('officer_fetch_done', { count: newReportCount }, 'success');
    } catch (error) {
      console.warn('Server fetch failed', error);
      showToast('officer_fetch_failed', {}, 'error');
    }
  }

  async function handleExport() {
    const exportedCount = await exportLabelledDataset();
    showToast(exportedCount ? 'export_done' : 'export_empty', { count: exportedCount }, exportedCount ? 'success' : 'info');
  }

  const tabButton = (tabId, labelKey, count) => h('button', {
    type: 'button',
    class: 'tab-button',
    'aria-pressed': String(officerViewState.activeTab === tabId),
    onclick: () => {
      officerViewState.activeTab = tabId;
      redraw();
    },
  }, t(labelKey, { count }));

  const visibleReports = officerViewState.activeTab === 'waiting' ? waitingReports : doneReports;
  const emptyKey = officerViewState.activeTab === 'waiting' ? 'officer_queue_empty' : 'officer_done_empty';

  const screenElement = h('main', { class: 'screen screen-officer' },
    h('h1', {}, t('officer_title')),
    h('p', {}, t('officer_intro')),
    h('p', { class: 'note' }, icon('phone'), t('officer_demo_note')),
    h('div', { class: 'officer-toolbar' },
      h('section', { class: 'card' },
        h('p', { class: 'officer-counter' }, icon('image'), t('officer_labelled_count', { count: labelledPhotoCount })),
        h('button', { type: 'button', class: 'button secondary', disabled: labelledPhotoCount === 0, onclick: handleExport },
          icon('download'), t('button_export')),
      ),
      h('section', { class: 'card server-row' },
        h('h2', {}, icon('server'), t('officer_server_title')),
        h('label', { class: 'field', for: 'officer-access-code' },
          h('span', { class: 'field-label' }, icon('key'), t('officer_key_label')),
          accessCodeInput),
        h('button', { type: 'button', class: 'button secondary', onclick: handleFetchFromServer }, icon('sync'), t('officer_fetch')),
      ),
    ),
    h('div', { class: 'tab-row' },
      tabButton('waiting', 'officer_tab_waiting', waitingReports.length),
      tabButton('done', 'officer_tab_done', doneReports.length),
    ),
    visibleReports.length === 0
      ? h('div', { class: 'empty-state' }, icon('check', 'empty-icon'), h('p', {}, t(emptyKey)))
      : visibleReports.map((report) => (report.officerDecision ? doneReportCard(report) : waitingReportCard(report, redraw))),
    h('a', { href: '/', class: 'text-link' }, icon('arrowLeft'), t('link_farmer_app')),
  );

  appRoot.dataset.area = 'officer';
  setChildren(appRoot, appHeader({ area: 'officer' }), screenElement);
  if (keepScroll) window.scrollTo(0, previousScroll);
}
