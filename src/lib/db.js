// Local-first storage. Everything is written to IndexedDB on this phone first.
import { openDB } from 'idb';

const DATABASE_NAME = 'leihlo';
const DATABASE_VERSION = 1;
const FARMER_PROFILE_KEY = 'farmer';

let databasePromise = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(database) {
        database.createObjectStore('profile');
        const reportStore = database.createObjectStore('reports', { keyPath: 'id' });
        reportStore.createIndex('createdAt', 'createdAt');
        database.createObjectStore('syncQueue', { keyPath: 'reportId' });
      },
    });
  }
  return databasePromise;
}

export async function getFarmerProfile() {
  return (await getDatabase()).get('profile', FARMER_PROFILE_KEY);
}

export async function saveFarmerProfile(farmerProfile) {
  return (await getDatabase()).put('profile', farmerProfile, FARMER_PROFILE_KEY);
}

// Saves the report and adds it to the sync queue in one transaction.
export async function saveReportAndQueue(report) {
  const database = await getDatabase();
  const transaction = database.transaction(['reports', 'syncQueue'], 'readwrite');
  await Promise.all([
    transaction.objectStore('reports').put(report),
    transaction.objectStore('syncQueue').put({ reportId: report.id, queuedAt: new Date().toISOString(), attempts: 0 }),
    transaction.done,
  ]);
}

export async function putReport(report) {
  return (await getDatabase()).put('reports', report);
}

export async function getReport(reportId) {
  return (await getDatabase()).get('reports', reportId);
}

export async function getAllReportsNewestFirst() {
  const reports = await (await getDatabase()).getAllFromIndex('reports', 'createdAt');
  return reports.reverse();
}

export async function updateReport(reportId, applyChanges) {
  const database = await getDatabase();
  const transaction = database.transaction('reports', 'readwrite');
  const report = await transaction.store.get(reportId);
  if (!report) return null;
  const updatedReport = applyChanges(report) || report;
  await transaction.store.put(updatedReport);
  await transaction.done;
  return updatedReport;
}

export async function getSyncQueue() {
  return (await getDatabase()).getAll('syncQueue');
}

export async function removeFromSyncQueue(reportId) {
  return (await getDatabase()).delete('syncQueue', reportId);
}

export async function deleteAllLocalData() {
  const database = await getDatabase();
  const transaction = database.transaction(['profile', 'reports', 'syncQueue'], 'readwrite');
  await Promise.all([
    transaction.objectStore('profile').clear(),
    transaction.objectStore('reports').clear(),
    transaction.objectStore('syncQueue').clear(),
    transaction.done,
  ]);
}
