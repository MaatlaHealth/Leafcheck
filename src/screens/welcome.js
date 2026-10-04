// Screen 1: welcome, consent and one time farmer setup.
import { h, icon, spokenLine, speakerButton } from '../lib/ui.js';
import { t } from '../lib/strings.js';
import { saveFarmerProfile } from '../lib/db.js';
import { navigate } from '../lib/events.js';

const CONSENT_SPOKEN_KEYS = ['welcome_intro', 'consent_stored', 'consent_who_sees', 'consent_delete'];

// Keeps typed values when the screen redraws, for example after a language switch.
const setupDraft = { name: '', memberNumber: '', plotName: '' };

function setupField(fieldName, labelKey, iconName, inputMode) {
  const inputId = `setup-${fieldName}`;
  return h('label', { class: 'field', for: inputId },
    h('span', { class: 'field-label' }, icon(iconName), t(labelKey)),
    h('input', {
      id: inputId,
      name: fieldName,
      type: 'text',
      inputmode: inputMode,
      autocomplete: 'off',
      required: true,
      value: setupDraft[fieldName],
      oninput: (event) => {
        setupDraft[fieldName] = event.target.value;
      },
    }),
  );
}

export async function renderWelcome(container) {
  const formError = h('p', { class: 'form-error', role: 'alert', hidden: true }, t('form_missing_fields'));

  async function handleSetupSubmit(event) {
    event.preventDefault();
    const farmerProfile = {
      name: setupDraft.name.trim(),
      memberNumber: setupDraft.memberNumber.trim(),
      plotName: setupDraft.plotName.trim(),
    };
    if (!farmerProfile.name || !farmerProfile.memberNumber || !farmerProfile.plotName) {
      formError.hidden = false;
      return;
    }
    await saveFarmerProfile({ ...farmerProfile, consentAt: new Date().toISOString(), consentVersion: 1 });
    navigate('check');
  }

  container.replaceChildren(
    h('section', { class: 'hero' },
      icon('eye', 'hero-icon'),
      h('h1', {}, t('welcome_title')),
      h('p', { class: 'tagline' }, t('app_tagline')),
    ),
    h('section', { class: 'card' },
      h('div', { class: 'card-title-row' },
        h('h2', {}, icon('shield'), t('consent_title')),
        speakerButton(CONSENT_SPOKEN_KEYS),
      ),
      spokenLine('welcome_intro', 'eye'),
      spokenLine('consent_stored', 'phone'),
      spokenLine('consent_who_sees', 'user'),
      spokenLine('consent_delete', 'trash'),
    ),
    h('form', { class: 'card setup-form', onsubmit: handleSetupSubmit, novalidate: true },
      h('div', { class: 'card-title-row' },
        h('h2', {}, icon('user'), t('setup_title')),
        speakerButton(['setup_prompt']),
      ),
      h('p', { class: 'muted' }, t('setup_prompt')),
      setupField('name', 'field_name', 'user', 'text'),
      setupField('memberNumber', 'field_member_number', 'key', 'text'),
      setupField('plotName', 'field_plot_name', 'leaf', 'text'),
      formError,
      h('button', { type: 'submit', class: 'button primary large' }, icon('check'), t('button_agree_start')),
    ),
    h('a', { href: '#/about', class: 'text-link' }, icon('info'), t('nav_about')),
  );
}
