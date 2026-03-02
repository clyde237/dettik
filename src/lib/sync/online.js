import { writable } from 'svelte/store';

/**
 * Store réactif : true si l'utilisateur est en ligne
 * @type {import('svelte/store').Writable<boolean>}
 */
export const isOnline = writable(
  typeof navigator !== 'undefined' ? navigator.onLine : true
);

/**
 * Initialiser les listeners online/offline
 * @returns {() => void} cleanup function
 */
export function initOnlineDetection() {
  if (typeof window === 'undefined') return () => {};

  // Synchroniser avec l'état réel au démarrage
  isOnline.set(navigator.onLine);

  const handleOnline = () => {
    console.log('[Network] En ligne');
    isOnline.set(true);
  };

  const handleOffline = () => {
    console.log('[Network] Hors ligne');
    isOnline.set(false);
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // ⚠️ Pas de vérification active par fetch — trop instable en dev/prod
  // Les événements browser 'online'/'offline' sont suffisants

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Vérifier la connectivité manuellement (pour usage ponctuel)
 * @returns {Promise<boolean>}
 */
export async function checkConnectivity() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return false;
  return true;
}