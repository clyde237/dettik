import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// ─── Online/Offline ──────────────────────────────────────────────────────────
export const isOnline = writable(browser ? navigator.onLine : true);

if (browser) {
  window.addEventListener('online', () => isOnline.set(true));
  window.addEventListener('offline', () => isOnline.set(false));
}

// ─── Install Prompt ──────────────────────────────────────────────────────────
/** @type {import('svelte/store').Writable<BeforeInstallPromptEvent | null>} */
export const installPromptEvent = writable(null);

/** @type {import('svelte/store').Writable<boolean>} */
export const isInstalled = writable(false);

/** @type {import('svelte/store').Writable<boolean>} */
export const promptDismissed = writable(false);

// Écouter l'événement beforeinstallprompt
if (browser) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (!dismissed) {
      installPromptEvent.set(/** @type {BeforeInstallPromptEvent} */ (e));
    }
  });

  // Détecter si déjà installé (standalone mode)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    isInstalled.set(true);
  }

  window.addEventListener('appinstalled', () => {
    isInstalled.set(true);
    installPromptEvent.set(null);
  });
}

// Afficher le prompt seulement si : prompt disponible + pas installé + pas rejeté
export const showInstallPrompt = derived(
  [installPromptEvent, isInstalled, promptDismissed],
  ([$event, $installed, $dismissed]) => !!$event && !$installed && !$dismissed
);

// ─── Actions ──────────────────────────────────────────────────────────────────

export async function triggerInstall() {
  let event;
  installPromptEvent.subscribe(($e) => (event = $e))();
  if (!event) return;

  event.prompt();
  const { outcome } = await event.userChoice;

  if (outcome === 'accepted') {
    isInstalled.set(true);
  }
  installPromptEvent.set(null);
}

export function dismissInstallPrompt() {
  installPromptEvent.set(null);
  promptDismissed.set(true);
  if (browser) {
    localStorage.setItem('pwa-prompt-dismissed', '1');
  }
}

// ─── SW Update ───────────────────────────────────────────────────────────────
export const updateAvailable = writable(false);

if (browser && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    updateAvailable.set(true);
  });
}

export function applyUpdate() {
  window.location.reload();
}