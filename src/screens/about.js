// Screen 7: about and limits. Placeholders in strings.json are filled in by the team.
import { h, icon, setChildren } from '../lib/ui.js';
import { t, hasMachineDraftSepedi } from '../lib/strings.js';
import { getClassifierInfo, initClassifier } from '../lib/classifier.js';
import { isOfflineReady } from '../lib/events.js';
import { getConfidenceThreshold } from '../config.js';
import { classNameKey } from '../lib/results.js';

function aboutSection(iconName, titleKey, bodyKeys, extraContent = null) {
  return h('section', { class: 'card about-section' },
    h('h2', {}, icon(iconName), t(titleKey)),
    bodyKeys.map((bodyKey) => h('p', {}, t(bodyKey))),
    extraContent,
  );
}

export async function renderAbout(container) {
  await initClassifier();
  const classifierInfo = getClassifierInfo();
  const thresholdPercent = Math.round(getConfidenceThreshold() * 100);
  // Show class names from strings.json, not the raw model labels, so they follow the language toggle.
  const classNames = classifierInfo.labels.map((classId) => t(classNameKey(classId))).join(', ');
  const modelLines = classifierInfo.mode === 'model'
    ? [h('p', {}, t('about_model_real', { labels: classNames }))]
    : [h('p', {}, h('span', { class: 'sim-chip' }, t('simulated_label')), t('about_model_mock'))];

  setChildren(container,
    h('h1', {}, t('about_title')),
    aboutSection('eye', 'about_what_title', ['about_what_body', 'about_human_decides']),
    aboutSection('leaf', 'about_model_title', [], [...modelLines, h('p', {}, t('about_threshold', { percent: thresholdPercent }))]),
    aboutSection('list', 'about_data_title', ['about_data_source', 'about_data_license', 'about_data_size']),
    aboutSection('alert', 'about_limits_title', ['about_limits_fields', 'about_limits_conditions', 'about_limits_classes']),
    aboutSection('check', 'about_advice_title', ['about_advice_draft']),
    aboutSection('shield', 'about_privacy_title', ['about_privacy_stored', 'about_privacy_sent', 'about_privacy_export']),
    aboutSection('phone', 'about_lost_title', ['about_lost_shared', 'about_lost_lost']),
    aboutSection('cloudOff', 'about_offline_title', [isOfflineReady() ? 'about_offline_ready' : 'about_offline_not_ready']),
    hasMachineDraftSepedi() ? h('p', { class: 'note' }, icon('alert'), t('about_sepedi_draft')) : null,
    h('p', { class: 'muted center' }, t('about_version')),
    h('a', { href: '/officer', class: 'text-link' }, icon('user'), t('link_officer')),
  );
}
