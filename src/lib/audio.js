// Plays pre-recorded clips only. There is no text to speech, local or remote.
// If a clip file is missing the app simply shows the text.
import { audioUrlFor } from './strings.js';

const clipObjectUrlCache = new Map();
let currentAudioElement = null;
let playbackToken = 0;

async function resolveClipObjectUrl(clipUrl) {
  if (clipObjectUrlCache.has(clipUrl)) return clipObjectUrlCache.get(clipUrl);
  let clipObjectUrl = null;
  try {
    const response = await fetch(clipUrl);
    const contentType = response.headers.get('content-type') || '';
    // A missing file can come back as the app's HTML page, so check the type.
    if (response.ok && /audio|mpeg|octet-stream/i.test(contentType)) {
      clipObjectUrl = URL.createObjectURL(await response.blob());
    }
  } catch {
    clipObjectUrl = null;
  }
  clipObjectUrlCache.set(clipUrl, clipObjectUrl);
  return clipObjectUrl;
}

export async function hasAnyClip(keys) {
  for (const key of keys) {
    const clipUrl = audioUrlFor(key);
    if (clipUrl && (await resolveClipObjectUrl(clipUrl))) return true;
  }
  return false;
}

export function stopAudio() {
  playbackToken += 1;
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement = null;
  }
}

export async function playClips(keys) {
  stopAudio();
  const myToken = playbackToken;
  for (const key of keys) {
    const clipUrl = audioUrlFor(key);
    if (!clipUrl) continue;
    const clipObjectUrl = await resolveClipObjectUrl(clipUrl);
    if (myToken !== playbackToken) return;
    if (!clipObjectUrl) continue;
    await new Promise((resolve) => {
      const audioElement = new Audio(clipObjectUrl);
      currentAudioElement = audioElement;
      audioElement.addEventListener('ended', resolve, { once: true });
      audioElement.addEventListener('error', resolve, { once: true });
      audioElement.play().catch(resolve);
    });
    if (myToken !== playbackToken) return;
  }
}
