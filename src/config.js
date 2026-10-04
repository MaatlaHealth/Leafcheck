// Central settings. Change values here, not inside the screens.

// Below this top-class confidence the app says "Not sure, ask the extension officer".
// Can be overridden for a demo with ?threshold=0.85 in the URL (remembered on this device).
const DEFAULT_CONFIDENCE_THRESHOLD = 0.75;
const THRESHOLD_STORAGE_KEY = 'leihlo.confidenceThreshold';

// At or above this confidence the indicator shows "high", otherwise "medium".
export const HIGH_CONFIDENCE = 0.9;

// Classes the app knows how to talk about. Any other model label is treated as "not sure".
export const KNOWN_CLASSES = ['healthy', 'leaf_rust', 'leaf_miner', 'not_a_leaf'];
export const RESULT_CLASSES = ['healthy', 'leaf_rust', 'leaf_miner'];
// Order matters: on a tie the first disease wins the overall result.
export const DISEASE_CLASSES = ['leaf_rust', 'leaf_miner'];

export const LEAVES_PER_CHECK = 3;
export const PHOTO_MAX_SIDE = 640;
export const PHOTO_JPEG_QUALITY = 0.82;

export const MODEL_BASE_URL = '/model/';
export const SYNC_API_BASE = '/api';

export function getConfidenceThreshold() {
  const fromUrl = Number.parseFloat(new URLSearchParams(location.search).get('threshold'));
  if (fromUrl > 0 && fromUrl < 1) {
    safeStorageSet(THRESHOLD_STORAGE_KEY, String(fromUrl));
    return fromUrl;
  }
  const stored = Number.parseFloat(safeStorageGet(THRESHOLD_STORAGE_KEY));
  if (stored > 0 && stored < 1) return stored;
  return DEFAULT_CONFIDENCE_THRESHOLD;
}

export function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked. The app still works with defaults.
  }
}
