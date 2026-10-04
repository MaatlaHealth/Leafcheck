// Leihlo entry point. One single page app with two areas:
//   /         farmer app, hash routes: #/welcome, #/check, #/reports, #/about
//   /officer  officer review page
import './styles.css';
import { registerSW } from 'virtual:pwa-register';
import { loadStrings, initLanguage, onLanguageChange, t } from './lib/strings.js';
import { initClassifier, onClassifierChange } from './lib/classifier.js';
import { startAutoSync, onSyncStatusChange, refreshWaitingCount } from './lib/sync.js';
import { updateAllSyncPills, updateAllClassifierBanners } from './lib/ui.js';
import { stopAudio } from './lib/audio.js';
import { getFarmerProfile } from './lib/db.js';
import { iconMarkup } from './lib/icons.js';
import { markOfflineReady, onDataChanged } from './lib/events.js';
import { renderFarmerShell } from './screens/shell.js';
import { renderOfficerPage } from './screens/officer.js';

const appRoot = document.getElementById('app');
const isOfficerArea = location.pathname.replace(/\/+$/, '') === '/officer';

function currentFarmerRoute() {
  return location.hash.replace(/^#\/?/, '').split('?')[0] || 'check';
}

async function renderCurrentScreen() {
  stopAudio();
  if (isOfficerArea) {
    await renderOfficerPage(appRoot);
    return;
  }
  const farmerProfile = await getFarmerProfile();
  let route = currentFarmerRoute();
  if (!farmerProfile && route !== 'about') route = 'welcome';
  if (farmerProfile && route === 'welcome') route = 'check';
  await renderFarmerShell(appRoot, route, farmerProfile);
  window.scrollTo(0, 0);
}

// Redraw screens that list stored data when reports change, also from another tab.
async function handleDataChanged() {
  if (isOfficerArea) {
    await renderOfficerPage(appRoot, { keepScroll: true });
    return;
  }
  const route = currentFarmerRoute();
  if (route === 'reports' || route === 'welcome') {
    const farmerProfile = await getFarmerProfile();
    await renderFarmerShell(appRoot, farmerProfile ? route : 'welcome', farmerProfile);
  }
}

async function boot() {
  try {
    await loadStrings();
  } catch (error) {
    // Without strings.json there is no approved text to show, so show an icon only.
    console.error('strings.json could not be loaded', error);
    appRoot.innerHTML = `<div class="fatal">${iconMarkup('alert')}</div>`;
    return;
  }
  initLanguage(isOfficerArea ? 'officer' : 'farmer');
  document.title = isOfficerArea ? `${t('app_name')}: ${t('officer_title')}` : t('app_name');

  onLanguageChange(() => renderCurrentScreen());
  onSyncStatusChange(() => updateAllSyncPills());
  onClassifierChange(() => updateAllClassifierBanners());
  onDataChanged(() => handleDataChanged());
  window.addEventListener('hashchange', () => renderCurrentScreen());

  await renderCurrentScreen();
  initClassifier();
  if (isOfficerArea) refreshWaitingCount();
  else startAutoSync();

  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
}

registerSW({
  immediate: true,
  onOfflineReady() {
    markOfflineReady();
  },
});

boot();
