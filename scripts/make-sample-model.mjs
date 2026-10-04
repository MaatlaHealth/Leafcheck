// Writes a tiny model in the Teachable Machine export format to test-fixtures/sample-tm-model/.
// It is NOT trained on leaves. It only exists to prove that dropping model.json, metadata.json and
// weights.bin into public/model switches the app out of mock mode with no code change.
// Weights are set by hand: green images lean "healthy", orange images lean "leaf_rust".
// Run: npm run sample-model
import { mkdirSync, writeFileSync } from 'node:fs';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-cpu';
import * as tfLayers from '@tensorflow/tfjs-layers';

const OUTPUT_DIRECTORY = 'test-fixtures/sample-tm-model';
const LABELS = ['healthy', 'leaf_rust', 'leaf_miner', 'not_a_leaf'];
const IMAGE_SIZE = 224;
const CELLS = 7 * 7;

await tf.setBackend('cpu');

const model = tfLayers.sequential();
model.add(tfLayers.layers.averagePooling2d({ inputShape: [IMAGE_SIZE, IMAGE_SIZE, 3], poolSize: 32, strides: 32 }));
model.add(tfLayers.layers.flatten());
model.add(tfLayers.layers.dense({ units: LABELS.length, activation: 'softmax' }));

// Per cell colour weights for each class, on pixels scaled to the range -1 to 1.
const colourWeightsByClass = {
  healthy: [-1, 2, -1],
  leaf_rust: [2, -1, -1.5],
  leaf_miner: [0.6, 0.6, 0.6],
  not_a_leaf: [0, 0, 0],
};
const kernelValues = [];
for (let cell = 0; cell < CELLS; cell += 1) {
  for (let channel = 0; channel < 3; channel += 1) {
    for (const classId of LABELS) kernelValues.push(colourWeightsByClass[classId][channel] * 0.12);
  }
}
const biasValues = [0, 0, -1.5, 1.2];
model.layers[2].setWeights([tf.tensor2d(kernelValues, [CELLS * 3, LABELS.length]), tf.tensor1d(biasValues)]);

mkdirSync(OUTPUT_DIRECTORY, { recursive: true });
await model.save(tf.io.withSaveHandler(async (modelArtifacts) => {
  const modelJson = {
    modelTopology: modelArtifacts.modelTopology,
    weightsManifest: [{ paths: ['weights.bin'], weights: modelArtifacts.weightSpecs }],
    format: 'layers-model',
    generatedBy: 'leihlo sample-model script',
    convertedBy: null,
  };
  writeFileSync(`${OUTPUT_DIRECTORY}/model.json`, JSON.stringify(modelJson));
  writeFileSync(`${OUTPUT_DIRECTORY}/weights.bin`, Buffer.from(modelArtifacts.weightData));
  return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
}));

writeFileSync(`${OUTPUT_DIRECTORY}/metadata.json`, JSON.stringify({
  tfjsVersion: tf.version_core,
  tmVersion: 'sample',
  packageVersion: 'sample',
  packageName: '@teachablemachine/image',
  timeStamp: new Date().toISOString(),
  userMetadata: { note: 'Test fixture only. Not trained on real leaves.' },
  modelName: 'leihlo-sample-test-model',
  labels: LABELS,
  imageSize: IMAGE_SIZE,
}, null, 2));

console.log(`Sample Teachable Machine format model written to ${OUTPUT_DIRECTORY}`);
