// Screen 5: officer review. Placeholder for phase 1, completed in phase 3.
import { h, appHeader } from '../lib/ui.js';
import { t } from '../lib/strings.js';

export async function renderOfficerPage(appRoot) {
  appRoot.dataset.area = 'officer';
  appRoot.replaceChildren(appHeader(), h('main', { class: 'screen' }, h('h1', {}, t('officer_title'))));
}
