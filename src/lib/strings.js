// Every message the app shows or speaks comes from /public/strings.json.
// Nothing here generates text. Placeholders like {count} are filled with data only.
import { safeStorageGet, safeStorageSet } from '../config.js';

export const LANGUAGES = ['nso', 'en'];
const LANGUAGE_STORAGE_KEYS = { farmer: 'leihlo.language.farmer', officer: 'leihlo.language.officer' };
const DEFAULT_LANGUAGE_BY_SCOPE = { farmer: 'nso', officer: 'en' };

let stringsByKey = new Map();
let languageScope = 'farmer';
let currentLanguage = 'nso';
const languageListeners = new Set();

export async function loadStrings() {
  const response = await fetch('/strings.json');
  const stringsFile = await response.json();
  stringsByKey = new Map(stringsFile.strings.map((entry) => [entry.key, entry]));
}

export function initLanguage(scope) {
  languageScope = scope;
  const storedLanguage = safeStorageGet(LANGUAGE_STORAGE_KEYS[scope]);
  currentLanguage = LANGUAGES.includes(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE_BY_SCOPE[scope];
  document.documentElement.lang = currentLanguage;
}

export function getLanguage() {
  return currentLanguage;
}

// The farmer's own language, used for the SMS she would receive.
export function getFarmerLanguage() {
  const storedLanguage = safeStorageGet(LANGUAGE_STORAGE_KEYS.farmer);
  return LANGUAGES.includes(storedLanguage) ? storedLanguage : DEFAULT_LANGUAGE_BY_SCOPE.farmer;
}

export function setLanguage(language) {
  if (!LANGUAGES.includes(language) || language === currentLanguage) return;
  currentLanguage = language;
  safeStorageSet(LANGUAGE_STORAGE_KEYS[languageScope], language);
  document.documentElement.lang = language;
  languageListeners.forEach((listener) => listener(language));
}

export function onLanguageChange(listener) {
  languageListeners.add(listener);
  return () => languageListeners.delete(listener);
}

export function hasString(key) {
  return stringsByKey.has(key);
}

// Sepedi falls back to English when the Sepedi text is still blank.
export function t(key, placeholderValues = {}, language = currentLanguage) {
  const entry = stringsByKey.get(key);
  if (!entry) {
    console.warn(`Missing string key: ${key}`);
    return key;
  }
  const sepediText = (entry.sepedi || '').trim();
  const text = language === 'nso' && sepediText ? sepediText : entry.english;
  return text.replace(/\{(\w+)\}/g, (placeholder, name) => (name in placeholderValues ? String(placeholderValues[name]) : placeholder));
}

// Sepedi clips live at /audio/{key}.mp3 (listed in strings.json).
// Optional English clips can be added at /audio/en/{key}.mp3.
export function audioUrlFor(key, language = currentLanguage) {
  const entry = stringsByKey.get(key);
  if (!entry || !entry.spoken) return null;
  return language === 'nso' ? entry.audio : `/audio/en/${key}.mp3`;
}
