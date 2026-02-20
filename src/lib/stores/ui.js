import { writable } from 'svelte/store';

/**
 * @typedef {Object} UIState
 * @property {boolean} sidebarOpen - Sidebar ouverte sur mobile
 * @property {string} pageTitle - Titre affiché dans le header
 * @property {string} pageDescription - Description sous le titre (optionnel)
 */

/** @type {import('svelte/store').Writable<UIState>} */
export const ui = writable({
  sidebarOpen: false,
  pageTitle: 'Tableau de bord',
  pageDescription: ''
});

/**
 * Ouvrir/fermer la sidebar (mobile)
 */
export function toggleSidebar() {
  ui.update((state) => ({ ...state, sidebarOpen: !state.sidebarOpen }));
}

/**
 * Fermer la sidebar
 */
export function closeSidebar() {
  ui.update((state) => ({ ...state, sidebarOpen: false }));
}

/**
 * Définir le titre de la page
 * @param {string} title
 * @param {string} [description]
 */
export function setPageTitle(title, description = '') {
  ui.update((state) => ({ ...state, pageTitle: title, pageDescription: description }));
}