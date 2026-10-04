// Store and forward. Reports are always saved locally first. When the phone is online the
// queue is sent to a small Netlify Function. Failures never block the check flow.
import { SYNC_API_BASE, safeStorageGet, safeStorageSet } from '../config.js';
import {
  getSyncQueue, getReport, removeFromSyncQueue, updateReport, getAllReportsNewestFirst, putReport,
} from './db.js';
import { blobToDataUrl, dataUrlToBlob } from './images.js';

const OFFICER_KEY_STORAGE_KEY = 'leihlo.officerAccessCode';
const DECIDED_STATUSES = ['confirmed', 'corrected'];

let syncStatus = { isOnline: navigator.onLine, isSending: false, waitingCount: 0, lastAttemptFailed: false };
const syncListeners = new Set();

export function getSyncStatus() {
  return syncStatus;
}

export function onSyncStatusChange(listener) {
  syncListeners.add(listener);
  return () => syncListeners.delete(listener);
}

function updateSyncStatus(changes) {
  syncStatus = { ...syncStatus, ...changes, isOnline: navigator.onLine };
  syncListeners.forEach((listener) => listener(syncStatus));
}

export async function refreshWaitingCount() {
  const syncQueue = await getSyncQueue();
  updateSyncStatus({ waitingCount: syncQueue.length });
}

export function getOfficerAccessCode() {
  return safeStorageGet(OFFICER_KEY_STORAGE_KEY) || '';
}

export function setOfficerAccessCode(accessCode) {
  safeStorageSet(OFFICER_KEY_STORAGE_KEY, accessCode.trim());
}

function officerHeaders() {
  const accessCode = getOfficerAccessCode();
  return accessCode ? { 'x-officer-key': accessCode } : {};
}

async function serialiseReportForServer(report) {
  return {
    id: report.id,
    createdAt: report.createdAt,
    farmer: report.farmer,
    farmerLanguage: report.farmerLanguage,
    zone: report.zone,
    classifier: report.classifier,
    overall: report.overall,
    leaves: await Promise.all(report.leaves.map(async (leaf) => ({
      index: leaf.index,
      prediction: leaf.prediction,
      result: leaf.result,
      photoDataUrl: await blobToDataUrl(leaf.photo),
    }))),
  };
}

async function deserialiseServerReport(serverReport) {
  return {
    id: serverReport.id,
    createdAt: serverReport.createdAt,
    farmer: serverReport.farmer,
    farmerLanguage: serverReport.farmerLanguage,
    zone: serverReport.zone,
    classifier: serverReport.classifier,
    overall: serverReport.overall,
    leaves: await Promise.all(serverReport.leaves.map(async (leaf) => ({
      index: leaf.index,
      prediction: leaf.prediction,
      result: leaf.result,
      photo: await dataUrlToBlob(leaf.photoDataUrl),
    }))),
    status: serverReport.officerDecision ? serverReport.officerDecision.status : 'sent',
    officerDecision: serverReport.officerDecision || null,
    source: 'server',
  };
}

async function sendQueuedReports() {
  const syncQueue = await getSyncQueue();
  for (const queueItem of syncQueue) {
    const report = await getReport(queueItem.reportId);
    if (!report) {
      await removeFromSyncQueue(queueItem.reportId);
      continue;
    }
    const response = await fetch(`${SYNC_API_BASE}/reports`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(await serialiseReportForServer(report)),
    });
    if (!response.ok) throw new Error(`Report upload failed with status ${response.status}`);
    await updateReport(report.id, (storedReport) => {
      storedReport.sentAt = new Date().toISOString();
      if (!DECIDED_STATUSES.includes(storedReport.status)) storedReport.status = 'sent';
    });
    await removeFromSyncQueue(report.id);
  }
}

async function pullOfficerDecisions() {
  const reports = await getAllReportsNewestFirst();
  const waitingReportIds = reports.filter((report) => report.status === 'sent').map((report) => report.id);
  if (waitingReportIds.length === 0) return 0;
  const response = await fetch(`${SYNC_API_BASE}/decisions?ids=${encodeURIComponent(waitingReportIds.join(','))}`);
  if (!response.ok) throw new Error(`Decision download failed with status ${response.status}`);
  const { decisions } = await response.json();
  let appliedCount = 0;
  for (const [reportId, officerDecision] of Object.entries(decisions || {})) {
    await updateReport(reportId, (storedReport) => {
      storedReport.officerDecision = officerDecision;
      storedReport.status = officerDecision.status;
    });
    appliedCount += 1;
  }
  return appliedCount;
}

// Farmer side: push the queue, then pull any officer decisions.
export async function syncNow() {
  if (syncStatus.isSending) return syncStatus;
  if (!navigator.onLine) {
    await refreshWaitingCount();
    return syncStatus;
  }
  updateSyncStatus({ isSending: true });
  let lastAttemptFailed = false;
  try {
    await sendQueuedReports();
    await pullOfficerDecisions();
  } catch (error) {
    console.warn('Sync did not complete. Reports stay saved on this phone.', error);
    lastAttemptFailed = true;
  }
  const syncQueue = await getSyncQueue();
  updateSyncStatus({ isSending: false, waitingCount: syncQueue.length, lastAttemptFailed });
  return syncStatus;
}

export function startAutoSync() {
  window.addEventListener('online', () => syncNow());
  window.addEventListener('offline', () => updateSyncStatus({}));
  refreshWaitingCount().then(() => syncNow());
}

// Officer side: fetch reports from the server into this device's IndexedDB.
export async function fetchServerReportsIntoDevice() {
  const response = await fetch(`${SYNC_API_BASE}/reports`, { headers: officerHeaders() });
  if (!response.ok) throw new Error(`Server returned ${response.status}`);
  const { reports: serverReports } = await response.json();
  let newReportCount = 0;
  for (const serverReport of serverReports || []) {
    const existingReport = await getReport(serverReport.id);
    if (existingReport) continue;
    await putReport(await deserialiseServerReport(serverReport));
    newReportCount += 1;
  }
  return newReportCount;
}

export async function sendOfficerDecisionToServer(reportId, officerDecision) {
  const response = await fetch(`${SYNC_API_BASE}/decisions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...officerHeaders() },
    body: JSON.stringify({ reportId, decision: officerDecision }),
  });
  if (!response.ok) throw new Error(`Server returned ${response.status}`);
}

// Best effort removal of this farmer's sent reports from the server.
export async function deleteReportsFromServer(reportIds) {
  if (reportIds.length === 0 || !navigator.onLine) return false;
  try {
    const response = await fetch(`${SYNC_API_BASE}/reports/delete`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ids: reportIds }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
