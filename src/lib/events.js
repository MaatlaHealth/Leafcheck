// Small app wide events: navigation, data changes (also across tabs) and offline readiness.

export function navigate(route) {
  const targetHash = `#/${route}`;
  if (location.hash === targetHash) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = targetHash;
}

// Lets the farmer tab and the officer tab on the same device see each other's changes.
const dataChannel = 'BroadcastChannel' in window ? new BroadcastChannel('leihlo-data') : null;
const dataListeners = new Set();

export function notifyDataChanged() {
  dataListeners.forEach((listener) => listener());
  if (dataChannel) dataChannel.postMessage('changed');
}

export function onDataChanged(listener) {
  dataListeners.add(listener);
  return () => dataListeners.delete(listener);
}

if (dataChannel) dataChannel.onmessage = () => dataListeners.forEach((listener) => listener());

let offlineReadyFlag = false;

export function markOfflineReady() {
  offlineReadyFlag = true;
}

export function isOfflineReady() {
  return offlineReadyFlag || Boolean(navigator.serviceWorker && navigator.serviceWorker.controller);
}
