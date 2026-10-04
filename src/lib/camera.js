// Three ways to get a leaf photo:
// 1. File input with capture, which opens the phone camera app.
// 2. Live camera with getUserMedia, used when the capture input is not supported (most laptops).
// 3. File upload from saved photos, so a demo can run from saved images.
import { h, icon } from './ui.js';
import { t } from './strings.js';

export function supportsLiveCamera() {
  return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function isTouchPhone() {
  return window.matchMedia('(pointer: coarse)').matches;
}

export function pickImageFile({ useCamera }) {
  return new Promise((resolve) => {
    const fileInput = h('input', { type: 'file', accept: 'image/*', class: 'visually-hidden' });
    if (useCamera) fileInput.setAttribute('capture', 'environment');
    fileInput.addEventListener('change', () => {
      resolve(fileInput.files && fileInput.files[0] ? fileInput.files[0] : null);
      fileInput.remove();
    }, { once: true });
    fileInput.addEventListener('cancel', () => {
      resolve(null);
      fileInput.remove();
    }, { once: true });
    document.body.append(fileInput);
    fileInput.click();
  });
}

// Live camera viewfinder. Resolves with a JPEG blob, or null if closed or not available.
export function captureWithLiveCamera() {
  return new Promise(async (resolve) => {
    let mediaStream = null;
    const videoElement = h('video', { class: 'camera-video', autoplay: true, playsinline: true, muted: true });
    const finish = (photoBlob) => {
      if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
      overlay.remove();
      resolve(photoBlob);
    };
    const captureFrame = () => {
      if (!videoElement.videoWidth) return;
      const frameCanvas = document.createElement('canvas');
      frameCanvas.width = videoElement.videoWidth;
      frameCanvas.height = videoElement.videoHeight;
      frameCanvas.getContext('2d').drawImage(videoElement, 0, 0);
      frameCanvas.toBlob((photoBlob) => finish(photoBlob), 'image/jpeg', 0.9);
    };
    const overlay = h('div', { class: 'camera-overlay', role: 'dialog', 'aria-modal': 'true' },
      videoElement,
      h('div', { class: 'camera-guide', 'aria-hidden': 'true' }),
      h('div', { class: 'camera-controls' },
        h('button', { type: 'button', class: 'camera-close', 'aria-label': t('button_close'), onclick: () => finish(null) }, icon('close')),
        h('button', { type: 'button', class: 'camera-shutter', 'aria-label': t('button_capture'), onclick: captureFrame }, icon('camera')),
      ),
    );
    document.body.append(overlay);
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      videoElement.srcObject = mediaStream;
    } catch (error) {
      console.warn('Live camera not available', error);
      finish(null);
    }
  });
}

// The main "Take photo" button: the camera app on phones, the live viewfinder elsewhere.
export async function takePhoto() {
  if (isTouchPhone() || !supportsLiveCamera()) return pickImageFile({ useCamera: true });
  return captureWithLiveCamera();
}
