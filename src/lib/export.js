// Builds the corrected dataset: a zip with manifest.json and one folder of photos per final label.
// The folder layout can be uploaded class by class into Teachable Machine for retraining.
// Labels are the officer's final answer. No farmer names or member numbers are included.
import { zipSync, strToU8 } from 'fflate';
import { getAllReportsNewestFirst } from './db.js';
import { KNOWN_CLASSES } from '../config.js';

export function countLabelledPhotos(reports) {
  return reports.reduce((total, report) => total + (report.officerDecision ? report.officerDecision.leaves.length : 0), 0);
}

export async function exportLabelledDataset() {
  const reports = await getAllReportsNewestFirst();
  const zipEntries = {};
  const manifestItems = [];
  const countsByLabel = {};

  for (const report of reports) {
    if (!report.officerDecision) continue;
    for (const leafDecision of report.officerDecision.leaves) {
      const leaf = report.leaves.find((candidateLeaf) => candidateLeaf.index === leafDecision.index);
      if (!leaf || !leaf.photo) continue;
      const fileName = `images/${leafDecision.finalClassId}/${report.id.slice(0, 8)}_leaf${leaf.index + 1}.jpg`;
      zipEntries[fileName] = new Uint8Array(await leaf.photo.arrayBuffer());
      countsByLabel[leafDecision.finalClassId] = (countsByLabel[leafDecision.finalClassId] || 0) + 1;
      manifestItems.push({
        file: fileName,
        label: leafDecision.finalClassId,
        labelSource: 'extension_officer',
        officerDecision: leafDecision.decision,
        modelTopClass: leaf.prediction.topClassId,
        modelTopProbability: Number(leaf.prediction.topProbability.toFixed(4)),
        appResultShownToFarmer: leaf.result.classId,
        classifierMode: report.classifier.mode,
        plotZone: report.zone,
        capturedAt: report.createdAt,
        reviewedAt: report.officerDecision.decidedAt,
        reportId: report.id,
      });
    }
  }

  if (manifestItems.length === 0) return 0;

  const manifest = {
    name: 'Leihlo corrected leaf dataset',
    exportedAt: new Date().toISOString(),
    labelSource: 'Final answer of the extension officer for each photo.',
    classes: KNOWN_CLASSES,
    countsByLabel,
    photoCount: manifestItems.length,
    privacy: 'Photos and labels only. No farmer names, member numbers or plot names.',
    note: 'Photos from mock mode reports were labelled by the officer, but the model result in them is simulated.',
    items: manifestItems,
  };
  zipEntries['manifest.json'] = strToU8(JSON.stringify(manifest, null, 2));

  // Photos are already JPEG, so store them without extra compression.
  const zipBytes = zipSync(zipEntries, { level: 0 });
  const downloadUrl = URL.createObjectURL(new Blob([zipBytes], { type: 'application/zip' }));
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadUrl;
  downloadLink.download = `leihlo-dataset-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);
  return manifestItems.length;
}
