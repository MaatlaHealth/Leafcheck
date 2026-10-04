// Screen 4: My reports. Past checks with their status, the officer answer and the simulated SMS.
import {
  h, icon, classLabel, confidenceIndicator, reportStatusBadge, photoThumbnail, smsPreview, showConfirmDialog, showToast,
} from '../lib/ui.js';
import { t, getLanguage } from '../lib/strings.js';
import { getAllReportsNewestFirst, deleteAllLocalData } from '../lib/db.js';
import { getSyncStatus, syncNow, deleteReportsFromServer, refreshWaitingCount } from '../lib/sync.js';
import { buildSmsLines } from '../lib/sms.js';
import { formatReportDate } from '../lib/results.js';
import { navigate, notifyDataChanged } from '../lib/events.js';

function syncCard(redraw) {
  const syncStatus = getSyncStatus();
  const isOffline = !syncStatus.isOnline;
  let statusKey = 'status_all_sent';
  let iconName = 'cloudCheck';
  if (isOffline) {
    statusKey = syncStatus.waitingCount > 0 ? 'status_offline_saved' : 'status_offline';
    iconName = 'cloudOff';
  } else if (syncStatus.waitingCount > 0) {
    statusKey = syncStatus.lastAttemptFailed ? 'sync_failed' : 'status_waiting_count';
    iconName = 'phone';
  }
  return h('section', { class: `card sync-card ${isOffline ? 'is-offline' : ''}` },
    icon(iconName, 'sync-card-icon'),
    h('p', {}, t(statusKey, { count: syncStatus.waitingCount })),
    h('button', {
      type: 'button',
      class: 'button secondary',
      disabled: isOffline || syncStatus.isSending,
      onclick: async () => {
        await syncNow();
        redraw();
      },
    }, icon('sync'), t('button_sync_now')),
  );
}

function leafDetailRow(report, leaf) {
  const officerLeafDecision = report.officerDecision
    ? report.officerDecision.leaves.find((leafDecision) => leafDecision.index === leaf.index)
    : null;
  return h('li', { class: 'leaf-detail' },
    photoThumbnail(leaf.photo, 'photo_alt', { number: leaf.index + 1 }),
    h('div', { class: 'leaf-detail-text' },
      h('p', { class: 'small-heading' }, t('leaf_label', { number: leaf.index + 1 })),
      h('p', {}, h('span', { class: 'muted' }, `${t('model_answer_label')}: `), classLabel(leaf.result.classId)),
      confidenceIndicator(leaf.result.level),
      officerLeafDecision
        ? h('p', {}, h('span', { class: 'muted' }, `${t('officer_answer_label')}: `), classLabel(officerLeafDecision.finalClassId))
        : null,
    ),
  );
}

function reportListItem(report) {
  const smsLines = buildSmsLines(report, getLanguage());
  const firstLeaf = report.leaves[0];
  return h('li', { class: 'report-item' },
    h('details', {},
      h('summary', {},
        firstLeaf ? photoThumbnail(firstLeaf.photo, 'photo_alt', { number: 1 }) : null,
        h('div', { class: 'report-summary-text' },
          h('p', { class: 'report-date' }, formatReportDate(report.createdAt)),
          h('p', { class: 'muted' }, `${t(`zone_${report.zone}`)}, ${report.farmer.plotName}`),
          classLabel(report.officerDecision ? report.officerDecision.overallClassId : report.overall.classId),
          reportStatusBadge(report.status),
        ),
      ),
      h('div', { class: 'report-details' },
        report.classifier.mode === 'mock' ? h('p', { class: 'sim-note' }, h('span', { class: 'sim-chip' }, t('simulated_label')), t('mock_result_note')) : null,
        h('ul', { class: 'leaf-detail-list' }, report.leaves.map((leaf) => leafDetailRow(report, leaf))),
        smsLines ? smsPreview(smsLines) : h('p', { class: 'note' }, icon('user'), t('waiting_for_officer')),
      ),
    ),
  );
}

export async function renderReports(container) {
  const redraw = () => renderReports(container);
  const reports = await getAllReportsNewestFirst();

  async function handleDeleteAll() {
    const confirmed = await showConfirmDialog({
      titleKey: 'delete_confirm_title',
      bodyKey: 'delete_warning',
      confirmKey: 'button_delete_confirm',
      spokenKeys: ['delete_warning'],
      danger: true,
    });
    if (!confirmed) return;
    const sentReportIds = reports.filter((report) => report.sentAt || report.status !== 'saved').map((report) => report.id);
    await deleteReportsFromServer(sentReportIds);
    await deleteAllLocalData();
    await refreshWaitingCount();
    notifyDataChanged();
    showToast('delete_done', {}, 'info');
    navigate('welcome');
  }

  container.replaceChildren(
    h('h1', {}, t('reports_title')),
    syncCard(redraw),
    reports.length === 0
      ? h('div', { class: 'empty-state' }, icon('leaf', 'empty-icon'), h('p', {}, t('reports_empty')))
      : h('ul', { class: 'report-list' }, reports.map(reportListItem)),
    h('section', { class: 'danger-zone' },
      h('p', { class: 'muted' }, t('delete_server_note')),
      h('button', { type: 'button', class: 'button danger', onclick: handleDeleteAll }, icon('trash'), t('button_delete_all')),
    ),
  );
}
