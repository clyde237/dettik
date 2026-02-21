import { writable } from 'svelte/store';

/**
 * @typedef {Object} Toast
 * @property {string} id
 * @property {'success' | 'error' | 'warning' | 'info'} type
 * @property {string} message
 * @property {number} [duration=4000]
 */

/** @type {import('svelte/store').Writable<Toast[]>} */
export const toasts = writable([]);

/**
 * Ajouter un toast
 * @param {{ type: Toast['type'], message: string, duration?: number }} params
 */
function addToast({ type, message, duration = 4000 }) {
  const id = crypto.randomUUID();
  toasts.update((all) => [...all, { id, type, message, duration }]);

  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }
}

/**
 * Supprimer un toast
 * @param {string} id
 */
export function removeToast(id) {
  toasts.update((all) => all.filter((t) => t.id !== id));
}

/**
 * @param {string} message
 */
export function toastSuccess(message) {
  addToast({ type: 'success', message });
}

/**
 * @param {string} message
 */
export function toastError(message) {
  addToast({ type: 'error', message, duration: 6000 });
}

/**
 * @param {string} message
 */
export function toastWarning(message) {
  addToast({ type: 'warning', message });
}

/**
 * @param {string} message
 */
export function toastInfo(message) {
  addToast({ type: 'info', message });
}