// On-device leaf classifier.
// Real mode: a Teachable Machine image export in /public/model (model.json, metadata.json, weights.bin).
// Mock mode: used automatically when those files are missing. It is a simple colour rule, clearly
// labelled as simulated in the interface. It is not a real model.
import { MODEL_BASE_URL } from '../config.js';
import { centreSquareCrop } from './images.js';

export const MOCK_LABELS = ['healthy', 'leaf_rust', 'leaf_miner', 'not_a_leaf'];

// Teachable Machine labels are typed by hand, so accept a few common spellings.
const LABEL_ALIASES = {
  rust: 'leaf_rust',
  coffee_leaf_rust: 'leaf_rust',
  miner: 'leaf_miner',
  coffee_leaf_miner: 'leaf_miner',
  not_leaf: 'not_a_leaf',
  no_leaf: 'not_a_leaf',
  background: 'not_a_leaf',
  other: 'not_a_leaf',
};

let classifierInfo = { mode: 'detecting', labels: [], modelName: null, failureReason: null, backend: null };
let classifierReadyPromise = null;
let layersModel = null;
let tensorflowModule = null;
let modelImageSize = 224;
const classifierListeners = new Set();

export function normaliseLabel(rawLabel) {
  const cleaned = String(rawLabel).trim().toLowerCase().replace(/[\s\-]+/g, '_');
  return LABEL_ALIASES[cleaned] || cleaned;
}

export function getClassifierInfo() {
  return classifierInfo;
}

export function onClassifierChange(listener) {
  classifierListeners.add(listener);
  return () => classifierListeners.delete(listener);
}

function setClassifierInfo(nextInfo) {
  classifierInfo = nextInfo;
  classifierListeners.forEach((listener) => listener(classifierInfo));
}

async function fetchJsonOrNull(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    // A missing file can come back as the HTML page from a dev server, so parse defensively.
    return await response.json();
  } catch {
    return null;
  }
}

export function initClassifier() {
  if (!classifierReadyPromise) classifierReadyPromise = detectAndLoadClassifier();
  return classifierReadyPromise;
}

async function detectAndLoadClassifier() {
  const [modelMetadata, modelDefinition] = await Promise.all([
    fetchJsonOrNull(`${MODEL_BASE_URL}metadata.json`),
    fetchJsonOrNull(`${MODEL_BASE_URL}model.json`),
  ]);
  const modelFilesLookValid =
    modelMetadata && Array.isArray(modelMetadata.labels) && modelMetadata.labels.length > 0 &&
    modelDefinition && modelDefinition.modelTopology && Array.isArray(modelDefinition.weightsManifest);

  if (!modelFilesLookValid) {
    setClassifierInfo({ mode: 'mock', labels: MOCK_LABELS, modelName: null, failureReason: 'no_model_files', backend: null });
    return classifierInfo;
  }

  try {
    tensorflowModule = await import('./tf.js');
    const backendName = await tensorflowModule.prepareBackend();
    layersModel = await tensorflowModule.loadLayersModel(`${MODEL_BASE_URL}model.json`);
    const inputShape = layersModel.inputs[0].shape;
    modelImageSize = modelMetadata.imageSize || inputShape[1] || 224;
    const outputUnits = layersModel.outputs[0].shape[layersModel.outputs[0].shape.length - 1];
    if (outputUnits !== modelMetadata.labels.length) {
      throw new Error(`Model has ${outputUnits} outputs but metadata lists ${modelMetadata.labels.length} labels`);
    }
    // One blank prediction compiles the GPU shaders now, so the farmer's first leaf is quick.
    const { tf } = tensorflowModule;
    tf.tidy(() => {
      layersModel.predict(tf.zeros([1, modelImageSize, modelImageSize, 3]));
    });
    setClassifierInfo({
      mode: 'model',
      labels: modelMetadata.labels.map(normaliseLabel),
      rawLabels: modelMetadata.labels,
      modelName: modelMetadata.modelName || 'model',
      failureReason: null,
      backend: backendName,
    });
  } catch (error) {
    console.error('Model failed to load, using mock mode', error);
    setClassifierInfo({ mode: 'mock', labels: MOCK_LABELS, modelName: null, failureReason: 'model_failed_to_load', backend: null });
  }
  return classifierInfo;
}

function softmax(values) {
  const maxValue = Math.max(...values);
  const exponentials = values.map((value) => Math.exp(value - maxValue));
  const total = exponentials.reduce((sum, value) => sum + value, 0);
  return exponentials.map((value) => value / total);
}

function buildPrediction(labels, probabilities) {
  const rankedClasses = labels
    .map((classId, index) => ({ classId, probability: probabilities[index] }))
    .sort((first, second) => second.probability - first.probability);
  return {
    topClassId: rankedClasses[0].classId,
    topProbability: rankedClasses[0].probability,
    probabilities: Object.fromEntries(labels.map((classId, index) => [classId, Number(probabilities[index].toFixed(4))])),
  };
}

async function classifyWithModel(photoCanvas) {
  const { tf } = tensorflowModule;
  const inputCanvas = centreSquareCrop(photoCanvas, modelImageSize);
  const outputTensor = tf.tidy(() => {
    // Same preprocessing as the Teachable Machine library: scale pixels to the range -1 to 1.
    const pixels = tf.cast(tf.browser.fromPixels(inputCanvas), 'float32');
    const normalisedBatch = tf.expandDims(tf.sub(tf.div(pixels, 127), 1), 0);
    const prediction = layersModel.predict(normalisedBatch);
    return Array.isArray(prediction) ? prediction[0] : prediction;
  });
  let probabilities = Array.from(await outputTensor.data());
  outputTensor.dispose();
  const total = probabilities.reduce((sum, value) => sum + value, 0);
  if (probabilities.some((value) => value < 0 || value > 1) || Math.abs(total - 1) > 0.02) {
    probabilities = softmax(probabilities);
  }
  return buildPrediction(classifierInfo.labels, probabilities);
}

function rgbToHsv(red, green, blue) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const maxChannel = Math.max(r, g, b);
  const minChannel = Math.min(r, g, b);
  const delta = maxChannel - minChannel;
  let hue = 0;
  if (delta > 0) {
    if (maxChannel === r) hue = 60 * (((g - b) / delta) % 6);
    else if (maxChannel === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }
  if (hue < 0) hue += 360;
  return [hue, maxChannel === 0 ? 0 : delta / maxChannel, maxChannel];
}

// SIMULATED. Counts green, orange and pale pixels and turns the counts into scores.
// Good enough to walk through every screen, including the not sure path. Not a diagnosis.
function classifyWithMock(photoCanvas) {
  const sampleSize = 64;
  const sampleCanvas = centreSquareCrop(photoCanvas, sampleSize);
  const pixelData = sampleCanvas.getContext('2d').getImageData(0, 0, sampleSize, sampleSize).data;
  const totalPixels = sampleSize * sampleSize;
  const pixelKinds = new Array(totalPixels);
  for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex += 1) {
    const offset = pixelIndex * 4;
    const [hue, saturation, value] = rgbToHsv(pixelData[offset], pixelData[offset + 1], pixelData[offset + 2]);
    if (value > 0.12 && saturation > 0.18 && hue >= 65 && hue <= 170) pixelKinds[pixelIndex] = 'green';
    else if (value > 0.35 && saturation > 0.45 && hue >= 12 && hue < 55) pixelKinds[pixelIndex] = 'rust';
    else if (saturation < 0.2 && value > 0.72) pixelKinds[pixelIndex] = 'pale';
    else pixelKinds[pixelIndex] = 'other';
  }
  const isGreenAt = (x, y) => x >= 0 && y >= 0 && x < sampleSize && y < sampleSize && pixelKinds[y * sampleSize + x] === 'green';
  let greenPixels = 0;
  let rustPixels = 0;
  let palePixels = 0;
  for (let y = 0; y < sampleSize; y += 1) {
    for (let x = 0; x < sampleSize; x += 1) {
      const pixelKind = pixelKinds[y * sampleSize + x];
      if (pixelKind === 'green') greenPixels += 1;
      else if (pixelKind === 'rust') rustPixels += 1;
      // A pale trail counts only when it has leaf green on both sides, so pale backgrounds do not.
      else if (pixelKind === 'pale' && ((isGreenAt(x - 3, y) && isGreenAt(x + 3, y)) || (isGreenAt(x, y - 3) && isGreenAt(x, y + 3)))) palePixels += 1;
    }
  }
  const greenShare = greenPixels / totalPixels;
  const rustShare = rustPixels / totalPixels;
  const paleShare = palePixels / totalPixels;
  const scores = [
    greenShare * 4,
    rustShare * 25,
    paleShare * 12 * (greenShare > 0.2 ? 1 : 0.2),
    Math.max(0, 0.45 - greenShare - rustShare) * 8,
  ];
  const sharpening = 1.8;
  return buildPrediction(MOCK_LABELS, softmax(scores.map((score) => score * sharpening)));
}

export async function classifyLeafPhoto(photoCanvas) {
  await initClassifier();
  if (classifierInfo.mode === 'model') return classifyWithModel(photoCanvas);
  return classifyWithMock(photoCanvas);
}
