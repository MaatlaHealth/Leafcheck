// Screen 3 building block: one result with photo, class, confidence and exactly one advice item.
import { h, icon, classLabel, confidenceIndicator, speakerButton, photoThumbnail } from '../lib/ui.js';
import { t } from '../lib/strings.js';

export function resultSpokenKeys(result) {
  return [result.resultKey, result.adviceKey].filter(Boolean);
}

export function resultCard({ result, photoBlob = null, photoNumber = null }) {
  return h('section', { class: `result-card result-${result.classId}` },
    photoBlob ? photoThumbnail(photoBlob, 'photo_alt', { number: photoNumber || '' }) : null,
    h('div', { class: 'result-body' },
      h('div', { class: 'result-headline' }, classLabel(result.classId)),
      h('p', { class: 'result-sentence' }, t(result.resultKey)),
      confidenceIndicator(result.level),
      result.adviceKey
        ? h('div', { class: 'advice' },
          h('h3', {}, icon('arrowRight'), t('next_step_label')),
          h('p', {}, t(result.adviceKey)),
        )
        : null,
      speakerButton(resultSpokenKeys(result), { labelKey: 'button_replay' }),
    ),
  );
}
