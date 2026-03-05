import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

// ─── Online/Offline ──────────────────────────────────────────────────────────
export const isOnline = writable(browser ? navigator.onLine : true);

if (browser) {
  window.addEventListener('online', () => isOnline.set(true));
  window.addEventListener('offline', () => isOnline.set(false));
}

// ─── iOS Detection ───────────────────────────────────────────────────────────
export const isIOS = writable(false);
export const isAndroid = writable(false);

if (browser) {
  const ua = navigator.userAgent;
  isIOS.set(/iPad|iPhone|iPod/.test(ua) && !('MSStream' in window));
  isAndroid.set(/Android/.test(ua));
}

// ─── Install Prompt (Chrome/Android) ─────────────────────────────────────────
/** @type {import('svelte/store').Writable<any>} */
export const installPromptEvent = writable(null);

/** @type {import('svelte/store').Writable<boolean>} */
export const isInstalled = writable(false);

/** @type {import('svelte/store').Writable<boolean>} */
export const promptDismissed = writable(false);

if (browser) {
  // Détecter si déjà installé
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    /** @type {any} */ (window.navigator).standalone === true;

  if (isStandalone) {
    isInstalled.set(true);
  }

  // Écouter le prompt d'installation (Chrome/Android/Desktop)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (!dismissed) {
      installPromptEvent.set(e);
    }
  });

  window.addEventListener('appinstalled', () => {
    isInstalled.set(true);
    installPromptEvent.set(null);
    console.log('[PWA] Application installée');
  });
}

// ─── Show prompt logic ────────────────────────────────────────────────────────
// Android/Desktop : prompt natif disponible
export const showNativePrompt = derived(
  [installPromptEvent, isInstalled, promptDismissed],
  ([$event, $installed, $dismissed]) => !!$event && !$installed && !$dismissed
);

// iOS : pas de prompt natif → montrer un guide manuel
export const showIOSGuide = derived(
  [isIOS, isInstalled, promptDismissed],
  ([$ios, $installed, $dismissed]) => $ios && !$installed && !$dismissed
);

// Afficher un prompt (natif ou iOS)
export const showInstallPrompt = derived(
  [showNativePrompt, showIOSGuide],
  ([$native, $ios]) => $native || $ios
);

// ─── Actions ──────────────────────────────────────────────────────────────────
export async function triggerInstall() {
  const event = get(installPromptEvent);
  if (!event) return;

  event.prompt();
  const { outcome } = await event.userChoice;

  if (outcome === 'accepted') {
    isInstalled.set(true);
    console.log('[PWA] Utilisateur a accepté l\'installation');
  } else {
    console.log('[PWA] Utilisateur a refusé l\'installation');
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
    // Éviter de recharger si l'utilisateur est en train de saisir
    if (document.visibilityState === 'visible') {
      updateAvailable.set(true);
    }
  });
}

export function applyUpdate() {
  window.location.reload();
}