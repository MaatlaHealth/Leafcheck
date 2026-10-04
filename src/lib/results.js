// Turns model numbers into one of a few fixed messages. This is the guardrail layer:
// low confidence, "not_a_leaf" and unknown labels all become "not sure" with no advice.
import { HIGH_CONFIDENCE, RESULT_CLASSES, DISEASE_CLASSES } from '../config.js';

export const NOT_SURE = 'not_sure';

export function adviceKeyForClass(classId) {
  return RESULT_CLASSES.includes(classId) ? `advice_${classId}` : null;
}

export function interpretLeafPrediction(prediction, confidenceThreshold) {
  const { topClassId, topProbability } = prediction;
  const isConfident = RESULT_CLASSES.includes(topClassId) && topProbability >= confidenceThreshold;
  if (!isConfident) {
    return { classId: NOT_SURE, isSure: false, level: 'not_sure', resultKey: 'result_not_sure', adviceKey: null };
  }
  const highThreshold = Math.max(HIGH_CONFIDENCE, confidenceThreshold);
  return {
    classId: topClassId,
    isSure: true,
    level: topProbability >= highThreshold ? 'high' : 'medium',
    resultKey: `result_${topClassId}`,
    adviceKey: adviceKeyForClass(topClassId),
  };
}

function mostCommonDisease(classIds) {
  let bestDisease = null;
  let bestCount = 0;
  for (const diseaseClassId of DISEASE_CLASSES) {
    const count = classIds.filter((classId) => classId === diseaseClassId).length;
    if (count > bestCount) {
      bestDisease = diseaseClassId;
      bestCount = count;
    }
  }
  return bestDisease;
}

// Overall result for the farmer. A confident disease on any leaf wins. All leaves must be
// confidently healthy to say healthy. Anything else is "not sure".
export function summariseLeafResults(leafResults) {
  const confidentResults = leafResults.filter((leafResult) => leafResult.isSure);
  const disease = mostCommonDisease(confidentResults.map((leafResult) => leafResult.classId));
  if (disease) {
    const diseaseLevels = confidentResults.filter((leafResult) => leafResult.classId === disease).map((leafResult) => leafResult.level);
    return {
      classId: disease,
      isSure: true,
      level: diseaseLevels.includes('high') ? 'high' : 'medium',
      resultKey: `overall_${disease}`,
      adviceKey: adviceKeyForClass(disease),
    };
  }
  const allHealthy = leafResults.length > 0 && leafResults.every((leafResult) => leafResult.isSure && leafResult.classId === 'healthy');
  if (allHealthy) {
    return {
      classId: 'healthy',
      isSure: true,
      level: leafResults.every((leafResult) => leafResult.level === 'high') ? 'high' : 'medium',
      resultKey: 'overall_healthy',
      adviceKey: adviceKeyForClass('healthy'),
    };
  }
  return { classId: NOT_SURE, isSure: false, level: 'not_sure', resultKey: 'result_not_sure', adviceKey: null };
}

// Overall answer from the officer's final labels. The officer is the authority, so no threshold.
export function summariseOfficerLabels(finalClassIds) {
  const disease = mostCommonDisease(finalClassIds);
  if (disease) return disease;
  if (finalClassIds.includes('healthy')) return 'healthy';
  return 'not_a_leaf';
}

export function classNameKey(classId) {
  if (classId === NOT_SURE) return 'confidence_not_sure';
  return ['healthy', 'leaf_rust', 'leaf_miner', 'not_a_leaf'].includes(classId) ? `class_${classId}` : 'class_unknown';
}

export function formatReportDate(isoDate) {
  const date = new Date(isoDate);
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatShortDate(isoDate) {
  const date = new Date(isoDate);
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
