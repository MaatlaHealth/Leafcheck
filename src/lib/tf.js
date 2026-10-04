// TensorFlow.js, bundled from npm. Loaded only when a real model is present.
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import '@tensorflow/tfjs-backend-webgl';
import { loadLayersModel } from '@tensorflow/tfjs-layers';

export { tf, loadLayersModel };

export async function prepareBackend() {
  try {
    const webglReady = await tf.setBackend('webgl');
    if (!webglReady) throw new Error('WebGL not available');
  } catch {
    await tf.setBackend('cpu');
  }
  await tf.ready();
  return tf.getBackend();
}
