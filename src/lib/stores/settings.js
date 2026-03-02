import { writable } from 'svelte/store';

/**
 * @typedef {Object} Settings
 * @property {string} currency
 * @property {string} language
 * @property {'light' | 'dark' | 'auto'} theme
 */

const DEFAULT_SETTINGS = {
  currency: 'XAF',
  language: 'fr',
  theme: /** @type {const} */ ('auto')
};

/**
 * Charger les settings depuis localStorage
 * @returns {Settings}
 */
function loadSettings() {
  try {
    const stored = localStorage.getItem('dettik_settings');
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.error('Erreur chargement settings:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

/** @type {import('svelte/store').Writable<Settings>} */
export const settings = writable(DEFAULT_SETTINGS);

/**
 * Initialiser les settings (appeler au démarrage côté client)
 */
export function initSettings() {
  const loaded = loadSettings();
  settings.set(loaded);
  applyTheme(loaded.theme);
}

/**
 * Mettre à jour un setting
 * @param {Partial<Settings>} updates
 */
export function updateSettings(updates) {
  settings.update((current) => {
    const newSettings = { ...current, ...updates };

    // Sauvegarder dans localStorage
    try {
      localStorage.setItem('dettik_settings', JSON.stringify(newSettings));
    } catch (err) {
      console.error('Erreur sauvegarde settings:', err);
    }

    // Appliquer le thème si changé
    if (updates.theme) {
      applyTheme(updates.theme);
    }

    return newSettings;
  });
}

/**
 * Appliquer le thème
 * @param {'light' | 'dark' | 'auto'} theme
 */
function applyTheme(theme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // Auto : suivre le système
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
}

/**
 * Réinitialiser les settings
 */
export function resetSettings() {
  try {
    localStorage.removeItem('dettik_settings');
  } catch (err) {
    console.error(err);
  }
  settings.set({ ...DEFAULT_SETTINGS });
  applyTheme(DEFAULT_SETTINGS.theme);
}