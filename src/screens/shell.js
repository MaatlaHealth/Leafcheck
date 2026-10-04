// Farmer app frame: header, simulated banner, the screen, and the bottom navigation.
import { h, appHeader, classifierBanner, icon } from '../lib/ui.js';
import { t } from '../lib/strings.js';
import { renderWelcome } from './welcome.js';
import { renderCheck } from './check.js';
import { renderReports } from './reports.js';
import { renderAbout } from './about.js';

const SCREEN_RENDERERS = { welcome: renderWelcome, check: renderCheck, reports: renderReports, about: renderAbout };

const NAV_ITEMS = [
  { route: 'check', iconName: 'camera', labelKey: 'nav_check' },
  { route: 'reports', iconName: 'list', labelKey: 'nav_reports' },
  { route: 'about', iconName: 'info', labelKey: 'nav_about' },
];

function bottomNavigation(activeRoute) {
  return h('nav', { class: 'bottom-nav', 'aria-label': t('nav_label') },
    NAV_ITEMS.map((navItem) =>
      h('a', {
        href: `#/${navItem.route}`,
        class: navItem.route === activeRoute ? 'nav-item active' : 'nav-item',
        'aria-current': navItem.route === activeRoute ? 'page' : null,
      }, icon(navItem.iconName), h('span', {}, t(navItem.labelKey))),
    ),
  );
}

export async function renderFarmerShell(appRoot, route, farmerProfile) {
  const renderScreen = SCREEN_RENDERERS[route] || renderCheck;
  const screenElement = h('main', { class: `screen screen-${route}`, id: 'main' });
  const shellParts = [appHeader(), classifierBanner(), screenElement];
  if (farmerProfile) shellParts.push(bottomNavigation(route));
  appRoot.replaceChildren(...shellParts);
  appRoot.dataset.area = 'farmer';
  await renderScreen(screenElement, { farmerProfile, route });
}
