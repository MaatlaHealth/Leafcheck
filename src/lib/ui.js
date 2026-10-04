// Small DOM helpers and shared interface pieces. All visible text goes through t().
import { iconMarkup } from './icons.js';
import { t, getLanguage, setLanguage, LANGUAGES } from './strings.js';
import { playClips, hasAnyClip } from './audio.js';
import { getSyncStatus } from './sync.js';
import { getClassifierInfo } from './classifier.js';
import { classNameKey } from './results.js';

const PROPERTY_NAMES = new Set(['value', 'checked', 'disabled', 'selected', 'type', 'accept', 'multiple']);

export function h(tagName, properties = {}, ...children) {
  const element = document.createElement(tagName);
  for (const [name, value] of Object.entries(properties || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (name === 'class') element.className = value;
    else if (name === 'html') element.innerHTML = value;
    else if (name === 'dataset') Object.assign(element.dataset, value);
    else if (name.startsWith('on') && typeof value === 'function') element.addEventListener(name.slice(2).toLowerCase(), value);
    else if (PROPERTY_NAMES.has(name)) element[name] = value;
    else element.setAttribute(name, value === true ? '' : value);
  }
  appendChildren(element, children);
  return element;
}

// replaceChildren that skips null and false, so optional parts can be passed inline.
export function setChildren(element, ...children) {
  element.replaceChildren();
  appendChildren(element, children);
}

function appendChildren(element, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    element.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export function icon(iconName, className = '') {
  return h('span', { class: `icon-wrap ${className}`.trim(), html: iconMarkup(iconName) });
}

export function simulatedChip(labelKey = 'simulated_label') {
  return h('span', { class: 'sim-chip' }, t(labelKey));
}

// Header shown on every screen: brand, sync status and the language toggle.
export function appHeader({ area = 'farmer' } = {}) {
  const languageButtons = LANGUAGES.map((language) =>
    h('button', {
      type: 'button',
      class: 'language-option',
      'aria-pressed': String(getLanguage() === language),
      onclick: () => setLanguage(language),
    }, t(`lang_${language}`)),
  );
  const syncPill = h('div', { class: 'sync-pill', 'data-sync-pill': area, role: 'status' });
  updateSyncPill(syncPill);
  return h('header', { class: 'app-header' },
    h('div', { class: 'brand' }, icon('eye', 'brand-icon'), h('span', { class: 'brand-name' }, t('app_name'))),
    h('div', { class: 'header-actions' },
      syncPill,
      h('div', { class: 'language-toggle', role: 'group', 'aria-label': t('lang_toggle_label') }, languageButtons),
    ),
  );
}

function syncPillContent(syncStatus, area) {
  // The officer does not have a farmer send queue, so only show the connection.
  if (area === 'officer') {
    return syncStatus.isOnline
      ? { iconName: 'cloudCheck', textKey: 'status_online', tone: 'online' }
      : { iconName: 'cloudOff', textKey: 'status_offline', tone: 'offline' };
  }
  if (!syncStatus.isOnline) {
    return syncStatus.waitingCount > 0
      ? { iconName: 'cloudOff', textKey: 'status_offline_saved', tone: 'offline' }
      : { iconName: 'cloudOff', textKey: 'status_offline', tone: 'offline' };
  }
  if (syncStatus.isSending) return { iconName: 'sync', textKey: 'status_sending', tone: 'busy' };
  if (syncStatus.waitingCount > 0) return { iconName: 'phone', textKey: 'status_waiting_count', tone: 'waiting' };
  return { iconName: 'cloudCheck', textKey: 'status_all_sent', tone: 'online' };
}

function updateSyncPill(syncPill) {
  const syncStatus = getSyncStatus();
  const { iconName, textKey, tone } = syncPillContent(syncStatus, syncPill.dataset.syncPill);
  syncPill.dataset.tone = tone;
  syncPill.replaceChildren(icon(iconName), h('span', {}, t(textKey, { count: syncStatus.waitingCount })));
}

export function updateAllSyncPills() {
  document.querySelectorAll('[data-sync-pill]').forEach(updateSyncPill);
}

// Visible label whenever the classifier is the simulated one.
export function classifierBanner() {
  const banner = h('div', { class: 'sim-banner', 'data-classifier-banner': '' });
  updateClassifierBanner(banner);
  return banner;
}

function updateClassifierBanner(banner) {
  const classifierInfo = getClassifierInfo();
  if (classifierInfo.mode === 'mock') {
    banner.hidden = false;
    banner.replaceChildren(simulatedChip(), h('span', {}, t(classifierInfo.failureReason === 'model_failed_to_load' ? 'mock_banner_failed' : 'mock_banner')));
  } else {
    banner.hidden = true;
    banner.replaceChildren();
  }
}

export function updateAllClassifierBanners() {
  document.querySelectorAll('[data-classifier-banner]').forEach(updateClassifierBanner);
}

// Speaker button that only appears if at least one of the clips exists.
export function speakerButton(spokenKeys, { compact = false, labelKey = 'button_play' } = {}) {
  const button = h('button', {
    type: 'button',
    class: compact ? 'speaker-button compact' : 'speaker-button',
    'aria-label': t(labelKey),
    onclick: () => playClips(spokenKeys),
  }, icon('speaker'), compact ? null : h('span', {}, t(labelKey)));
  button.hidden = true;
  hasAnyClip(spokenKeys).then((clipExists) => {
    button.hidden = !clipExists;
  });
  return button;
}

// A spoken prompt: icon, text and a speaker button.
export function spokenLine(textKey, iconName, placeholderValues = {}) {
  return h('div', { class: 'spoken-line' },
    iconName ? icon(iconName, 'spoken-line-icon') : null,
    h('p', {}, t(textKey, placeholderValues)),
    speakerButton([textKey], { compact: true }),
  );
}

export function classIconName(classId) {
  return { healthy: 'leaf', leaf_rust: 'spots', leaf_miner: 'squiggle', not_a_leaf: 'close', not_sure: 'question' }[classId] || 'question';
}

export function classLabel(classId) {
  return h('span', { class: `class-label class-${classId}` }, icon(classIconName(classId)), h('span', {}, t(classNameKey(classId))));
}

export function confidenceIndicator(level) {
  const filledBars = { high: 3, medium: 2, not_sure: 0 }[level] ?? 0;
  const bars = [1, 2, 3].map((barNumber) => h('span', { class: barNumber <= filledBars ? 'bar filled' : 'bar' }));
  return h('div', { class: `confidence confidence-${level}` },
    h('span', { class: 'confidence-bars', 'aria-hidden': 'true' }, bars),
    h('span', { class: 'confidence-text' }, `${t('confidence_label')}: ${t(`confidence_${level}`)}`),
  );
}

const STATUS_ICONS = { saved: 'phone', sent: 'cloudCheck', confirmed: 'check', corrected: 'pencil' };

export function reportStatusBadge(status) {
  return h('span', { class: `status-badge status-${status}` }, icon(STATUS_ICONS[status] || 'phone'), h('span', {}, t(`report_status_${status}`)));
}

export function showToast(textKey, placeholderValues = {}, tone = 'info') {
  const toast = h('div', { class: `toast toast-${tone}`, role: 'status' }, t(textKey, placeholderValues));
  document.body.append(toast);
  setTimeout(() => toast.classList.add('toast-leaving'), 3200);
  setTimeout(() => toast.remove(), 3700);
}

export function showConfirmDialog({ titleKey, bodyKey, confirmKey, spokenKeys = [], iconName = 'alert', danger = false }) {
  return new Promise((resolve) => {
    const close = (answer) => {
      overlay.remove();
      resolve(answer);
    };
    const overlay = h('div', { class: 'dialog-overlay', role: 'dialog', 'aria-modal': 'true' },
      h('div', { class: 'dialog' },
        icon(iconName, danger ? 'dialog-icon danger' : 'dialog-icon'),
        h('h2', {}, t(titleKey)),
        h('p', {}, t(bodyKey)),
        spokenKeys.length ? speakerButton(spokenKeys) : null,
        h('div', { class: 'dialog-actions' },
          h('button', { type: 'button', class: 'button secondary', onclick: () => close(false) }, icon('close'), t('button_cancel')),
          h('button', { type: 'button', class: danger ? 'button danger' : 'button primary', onclick: () => close(true) }, icon(danger ? 'trash' : 'check'), t(confirmKey)),
        ),
      ),
    );
    document.body.append(overlay);
    if (spokenKeys.length) playClips(spokenKeys);
  });
}

// GSM 7 bit basic characters. Anything else forces the shorter Unicode SMS parts.
const GSM_BASIC_CHARACTERS = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà]*$/;

function smsPartCount(messageText) {
  const isGsm = GSM_BASIC_CHARACTERS.test(messageText);
  const singleLimit = isGsm ? 160 : 70;
  const partLimit = isGsm ? 153 : 67;
  return messageText.length <= singleLimit ? 1 : Math.ceil(messageText.length / partLimit);
}

// Basic phone style preview of the SIMULATED SMS.
export function smsPreview(smsLines) {
  const messageText = smsLines.join(' ');
  const keypadLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
  return h('figure', { class: 'sms-preview' },
    h('figcaption', {}, simulatedChip('sms_simulated_label'), h('span', {}, t('sms_preview_caption'))),
    h('div', { class: 'basic-phone', 'aria-label': t('sms_simulated_label') },
      h('div', { class: 'phone-earpiece' }),
      h('div', { class: 'phone-screen' },
        h('div', { class: 'phone-screen-top' }, h('span', {}, t('sms_from')), h('span', {}, icon('message'))),
        h('p', { class: 'phone-message' }, messageText),
        h('div', { class: 'phone-screen-bottom' }, t('sms_length', { count: messageText.length, parts: smsPartCount(messageText) })),
      ),
      h('div', { class: 'phone-keypad', 'aria-hidden': 'true' }, keypadLabels.map((keyLabel) => h('span', {}, keyLabel))),
    ),
  );
}

export function photoThumbnail(photoBlob, altKey = 'photo_alt', placeholderValues = {}) {
  const objectUrl = URL.createObjectURL(photoBlob);
  const image = h('img', { class: 'photo', src: objectUrl, alt: t(altKey, placeholderValues), loading: 'lazy' });
  image.addEventListener('load', () => URL.revokeObjectURL(objectUrl), { once: true });
  return image;
}
