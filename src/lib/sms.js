// Builds the SIMULATED SMS the farmer would get on her basic phone after an officer decision.
// Every line comes from strings.json. Only the date, plot name and chosen keys are filled in.
import { t } from './strings.js';
import { adviceKeyForClass, classNameKey, formatShortDate } from './results.js';

export function buildSmsLines(report, language) {
  const officerDecision = report.officerDecision;
  if (!officerDecision) return null;
  const smsLines = [
    t('sms_intro', { date: formatShortDate(report.createdAt), plot: report.farmer.plotName }, language),
    t(officerDecision.status === 'corrected' ? 'sms_corrected' : 'sms_confirmed', {}, language),
    t('sms_result', { result: t(classNameKey(officerDecision.overallClassId), {}, language) }, language),
  ];
  const adviceKey = adviceKeyForClass(officerDecision.overallClassId);
  if (adviceKey) smsLines.push(t('sms_next_step', { advice: t(adviceKey, {}, language) }, language));
  if (officerDecision.noteKey) smsLines.push(t('sms_note', { note: t(officerDecision.noteKey, {}, language) }, language));
  return smsLines;
}
