// Photo helpers: decode, shrink, crop and convert. All work happens on the phone.
import { PHOTO_MAX_SIDE, PHOTO_JPEG_QUALITY } from '../config.js';

async function decodeImage(imageBlob) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(imageBlob, { imageOrientation: 'from-image' });
    } catch {
      // Fall through to the image element below.
    }
  }
  const objectUrl = URL.createObjectURL(imageBlob);
  try {
    const imageElement = new Image();
    imageElement.src = objectUrl;
    await imageElement.decode();
    return imageElement;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// Returns a canvas no larger than PHOTO_MAX_SIDE on its longest side.
export async function imageBlobToCanvas(imageBlob, maxSide = PHOTO_MAX_SIDE) {
  const decodedImage = await decodeImage(imageBlob);
  const sourceWidth = decodedImage.width;
  const sourceHeight = decodedImage.height;
  if (!sourceWidth || !sourceHeight) throw new Error('Empty image');
  const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sourceWidth * scale);
  canvas.height = Math.round(sourceHeight * scale);
  canvas.getContext('2d').drawImage(decodedImage, 0, 0, canvas.width, canvas.height);
  if (typeof decodedImage.close === 'function') decodedImage.close();
  return canvas;
}

export function canvasToJpegBlob(canvas, quality = PHOTO_JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((jpegBlob) => (jpegBlob ? resolve(jpegBlob) : reject(new Error('Could not encode photo'))), 'image/jpeg', quality);
  });
}

// Centre square crop resized to size by size, the same way Teachable Machine prepares images.
export function centreSquareCrop(sourceCanvas, size) {
  const squareSide = Math.min(sourceCanvas.width, sourceCanvas.height);
  const offsetX = (sourceCanvas.width - squareSide) / 2;
  const offsetY = (sourceCanvas.height - squareSide) / 2;
  const croppedCanvas = document.createElement('canvas');
  croppedCanvas.width = size;
  croppedCanvas.height = size;
  const context = croppedCanvas.getContext('2d', { willReadFrequently: true });
  context.drawImage(sourceCanvas, offsetX, offsetY, squareSide, squareSide, 0, 0, size, size);
  return croppedCanvas;
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

export async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl);
  return response.blob();
}
