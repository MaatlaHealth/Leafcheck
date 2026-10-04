// Screen 2 and 3: the guided weekend check.
// Steps: choose plot zone, then for each of 3 leaves: photo, on-device result. Then the overall result,
// which is saved on the phone and queued for the extension officer.
import { h, icon, spokenLine, showToast, classLabel, photoThumbnail, simulatedChip } from '../lib/ui.js';
import { t, getLanguage } from '../lib/strings.js';
import { zoneArtMarkup } from '../lib/icons.js';
import { playClips } from '../lib/audio.js';
import { takePhoto, pickImageFile, captureWithLiveCamera, supportsLiveCamera } from '../lib/camera.js';
import { imageBlobToCanvas, canvasToJpegBlob } from '../lib/images.js';
import { classifyLeafPhoto, getClassifierInfo, initClassifier } from '../lib/classifier.js';
import { interpretLeafPrediction, summariseLeafResults } from '../lib/results.js';
import { saveReportAndQueue } from '../lib/db.js';
import { refreshWaitingCount, syncNow } from '../lib/sync.js';
import { navigate, notifyDataChanged } from '../lib/events.js';
import { getConfidenceThreshold, LEAVES_PER_CHECK } from '../config.js';
import { resultCard, resultSpokenKeys } from './result-card.js';

const ZONES = [
  { zoneId: 'upper', labelKey: 'zone_upper' },
  { zoneId: 'lower', labelKey: 'zone_lower' },
];
const TOTAL_STEPS = LEAVES_PER_CHECK + 1;

function newCheckSession() {
  return { step: 'zone', zoneId: null, leaves: [], currentLeafIndex: 0, isWorking: false, savedReport: null };
}

let checkSession = newCheckSession();

function createReportId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return `r${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function leafPromptKey(leafIndex) {
  return `leaf_prompt_${leafIndex + 1}`;
}

function stepIndicator(stepNumber) {
  const dots = Array.from({ length: TOTAL_STEPS }, (unused, index) =>
    h('span', { class: index < stepNumber ? 'step-dot done' : 'step-dot' }));
  return h('div', { class: 'step-indicator' },
    h('div', { class: 'step-dots', 'aria-hidden': 'true' }, dots),
    h('span', { class: 'step-text' }, t('step_label', { step: stepNumber, total: TOTAL_STEPS })),
  );
}

function capturedLeafStrip() {
  if (checkSession.leaves.length === 0) return null;
  return h('div', { class: 'leaf-strip' },
    checkSession.leaves.map((leaf) =>
      h('figure', { class: 'leaf-strip-item' },
        photoThumbnail(leaf.photo, 'photo_alt', { number: leaf.index + 1 }),
        h('figcaption', {}, classLabel(leaf.result.classId)),
      ),
    ),
  );
}

export async function renderCheck(container, context) {
  const redraw = () => renderCheck(container, context);

  if (checkSession.isWorking) {
    container.replaceChildren(
      h('div', { class: 'working' }, h('div', { class: 'spinner', 'aria-hidden': 'true' }), h('p', {}, t('checking_leaf'))),
    );
    return;
  }

  if (checkSession.step === 'zone') {
    container.replaceChildren(
      h('h1', {}, t('check_title')),
      stepIndicator(1),
      spokenLine('zone_prompt', 'leaf'),
      h('div', { class: 'zone-grid' },
        ZONES.map((zone) =>
          h('button', {
            type: 'button',
            class: 'zone-button',
            onclick: () => {
              checkSession.zoneId = zone.zoneId;
              checkSession.step = 'capture';
              checkSession.currentLeafIndex = 0;
              redraw();
              playClips([leafPromptKey(0), 'photo_tip']);
            },
          }, h('span', { html: zoneArtMarkup(zone.zoneId) }), h('span', { class: 'zone-label' }, t(zone.labelKey))),
        ),
      ),
    );
    return;
  }

  if (checkSession.step === 'capture') {
    const leafIndex = checkSession.currentLeafIndex;
    const handlePhoto = async (photoSourcePromise) => {
      const photoFile = await photoSourcePromise;
      if (!photoFile) return;
      await analyseLeafPhoto(photoFile, leafIndex, redraw);
    };
    container.replaceChildren(
      h('h1', {}, t('leaf_label', { number: leafIndex + 1 })),
      stepIndicator(leafIndex + 2),
      capturedLeafStrip(),
      spokenLine(leafPromptKey(leafIndex), 'camera'),
      spokenLine('photo_tip', 'leaf'),
      h('div', { class: 'capture-actions' },
        h('button', { type: 'button', class: 'button primary large', onclick: () => handlePhoto(takePhoto()) },
          icon('camera'), t('button_take_photo')),
        h('button', { type: 'button', class: 'button secondary large', onclick: () => handlePhoto(pickImageFile({ useCamera: false })) },
          icon('image'), t('button_choose_photo')),
        supportsLiveCamera()
          ? h('button', { type: 'button', class: 'button tertiary', onclick: () => handlePhoto(captureWithLiveCamera()) },
            icon('video'), t('button_live_camera'))
          : null,
      ),
      h('button', {
        type: 'button',
        class: 'text-button',
        onclick: () => {
          checkSession = newCheckSession();
          redraw();
        },
      }, icon('close'), t('button_cancel_check')),
    );
    return;
  }

  if (checkSession.step === 'leafResult') {
    const leaf = checkSession.leaves[checkSession.currentLeafIndex];
    const isLastLeaf = checkSession.currentLeafIndex === LEAVES_PER_CHECK - 1;
    container.replaceChildren(
      h('h1', {}, t('leaf_result_title', { number: leaf.index + 1 })),
      stepIndicator(leaf.index + 2),
      classifierNote(),
      resultCard({ result: leaf.result, photoBlob: leaf.photo, photoNumber: leaf.index + 1 }),
      h('div', { class: 'action-row' },
        h('button', {
          type: 'button',
          class: 'button secondary',
          onclick: () => {
            checkSession.leaves = checkSession.leaves.slice(0, leaf.index);
            checkSession.step = 'capture';
            redraw();
            playClips([leafPromptKey(leaf.index)]);
          },
        }, icon('camera'), t('button_retake')),
        h('button', {
          type: 'button',
          class: 'button primary',
          onclick: async () => {
            if (isLastLeaf) {
              await finishCheck(context.farmerProfile);
              redraw();
              playClips([...resultSpokenKeys(checkSession.savedReport.overall), 'report_saved']);
            } else {
              checkSession.currentLeafIndex += 1;
              checkSession.step = 'capture';
              redraw();
              playClips([leafPromptKey(checkSession.currentLeafIndex)]);
            }
          },
        }, t(isLastLeaf ? 'button_see_overall' : 'button_next_leaf'), icon('arrowRight')),
      ),
    );
    return;
  }

  if (checkSession.step === 'overall') {
    const savedReport = checkSession.savedReport;
    container.replaceChildren(
      h('h1', {}, t('overall_title')),
      classifierNote(),
      capturedLeafStrip(),
      resultCard({ result: savedReport.overall }),
      h('p', { class: 'note' }, icon('user'), t('not_final_note')),
      spokenLine('report_saved', 'phone'),
      h('div', { class: 'action-row' },
        h('button', {
          type: 'button',
          class: 'button secondary',
          onclick: () => {
            checkSession = newCheckSession();
            redraw();
            playClips(['zone_prompt']);
          },
        }, icon('camera'), t('button_new_check')),
        h('button', {
          type: 'button',
          class: 'button primary',
          onclick: () => {
            checkSession = newCheckSession();
            navigate('reports');
          },
        }, icon('list'), t('button_done')),
      ),
    );
  }
}

function classifierNote() {
  const classifierInfo = getClassifierInfo();
  if (classifierInfo.mode !== 'mock') return null;
  return h('p', { class: 'sim-note' }, simulatedChip(), t('mock_result_note'));
}

async function analyseLeafPhoto(photoFile, leafIndex, redraw) {
  checkSession.isWorking = true;
  redraw();
  try {
    await initClassifier();
    const photoCanvas = await imageBlobToCanvas(photoFile);
    const photoBlob = await canvasToJpegBlob(photoCanvas);
    const prediction = await classifyLeafPhoto(photoCanvas);
    const result = interpretLeafPrediction(prediction, getConfidenceThreshold());
    checkSession.leaves[leafIndex] = { index: leafIndex, photo: photoBlob, prediction, result };
    checkSession.leaves = checkSession.leaves.slice(0, leafIndex + 1);
    checkSession.step = 'leafResult';
    checkSession.isWorking = false;
    redraw();
    playClips(resultSpokenKeys(result));
  } catch (error) {
    console.error('Photo could not be checked', error);
    checkSession.isWorking = false;
    redraw();
    showToast('photo_failed', {}, 'error');
    playClips(['photo_failed']);
  }
}

async function finishCheck(farmerProfile) {
  const classifierInfo = getClassifierInfo();
  const overall = summariseLeafResults(checkSession.leaves.map((leaf) => leaf.result));
  const report = {
    id: createReportId(),
    createdAt: new Date().toISOString(),
    farmer: { name: farmerProfile.name, memberNumber: farmerProfile.memberNumber, plotName: farmerProfile.plotName },
    farmerLanguage: getLanguage(),
    zone: checkSession.zoneId,
    classifier: {
      mode: classifierInfo.mode,
      labels: classifierInfo.labels,
      modelName: classifierInfo.modelName,
      confidenceThreshold: getConfidenceThreshold(),
    },
    leaves: checkSession.leaves,
    overall,
    status: 'saved',
    source: 'device',
    officerDecision: null,
  };
  await saveReportAndQueue(report);
  checkSession.savedReport = report;
  checkSession.step = 'overall';
  notifyDataChanged();
  await refreshWaitingCount();
  syncNow();
}
