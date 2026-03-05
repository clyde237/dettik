<script>
  import {
    showNativePrompt,
    showIOSGuide,
    isAndroid,
    triggerInstall,
    dismissInstallPrompt
  } from '$lib/stores/pwa';
  import { Download, X, Smartphone, Share, PlusSquare } from '@lucide/svelte';

  let visible = $state(false);

  // Délai avant affichage (laisser l'app se charger)
  $effect(() => {
    const timer = setTimeout(() => { visible = true; }, 3000);
    return () => clearTimeout(timer);
  });
</script>

<!-- Prompt natif Android/Desktop -->
{#if visible && $showNativePrompt}
  <div
    class="fixed bottom-20 left-4 right-4 lg:bottom-6 lg:left-auto lg:right-6 lg:w-80 z-40
      bg-white border border-gray-200 rounded-2xl shadow-xl p-4
      animate-in slide-in-from-bottom-4 duration-300"
  >
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Smartphone size={20} class="text-green-600" />
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-900">Installer Dettik</p>
        <p class="text-xs text-gray-500 mt-0.5">
          {#if $isAndroid}
            Ajoutez l'app sur votre écran d'accueil pour un accès rapide, même hors ligne.
          {:else}
            Installez l'application pour un accès direct depuis votre bureau.
          {/if}
        </p>

        <div class="flex items-center gap-2 mt-3">
          <button
            onclick={triggerInstall}
            class="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition"
          >
            <Download size={12} />
            Installer
          </button>
          <button
            onclick={dismissInstallPrompt}
            class="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 transition"
          >
            Plus tard
          </button>
        </div>
      </div>

      <button
        onclick={dismissInstallPrompt}
        class="p-1 text-gray-400 hover:text-gray-600 transition flex-shrink-0"
        aria-label="Fermer"
      >
        <X size={16} />
      </button>
    </div>
  </div>
{/if}

<!-- Guide iOS Safari -->
{#if visible && $showIOSGuide}
  <div
    class="fixed bottom-20 left-4 right-4 z-40
      bg-white border border-gray-200 rounded-2xl shadow-xl p-4
      animate-in slide-in-from-bottom-4 duration-300"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
          <Smartphone size={16} class="text-green-600" />
        </div>
        <p class="text-sm font-semibold text-gray-900">Installer Dettik</p>
      </div>
      <button
        onclick={dismissInstallPrompt}
        class="p-1 text-gray-400 hover:text-gray-600 transition"
      >
        <X size={16} />
      </button>
    </div>

    <p class="text-xs text-gray-500 mb-3">
      Pour installer l'app sur votre iPhone/iPad :
    </p>

    <ol class="space-y-2">
      <li class="flex items-center gap-3 text-xs text-gray-700">
        <span class="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0">1</span>
        <span>Appuyez sur <strong>Partager</strong></span>
        <div class="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
          <Share size={12} class="text-gray-500" />
        </div>
      </li>
      <li class="flex items-center gap-3 text-xs text-gray-700">
        <span class="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0">2</span>
        <span>Appuyez sur <strong>Sur l'écran d'accueil</strong></span>
        <div class="w-6 h-6 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
          <PlusSquare size={12} class="text-gray-500" />
        </div>
      </li>
      <li class="flex items-center gap-3 text-xs text-gray-700">
        <span class="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0">3</span>
        <span>Appuyez sur <strong>Ajouter</strong></span>
      </li>
    </ol>

    <button
      onclick={dismissInstallPrompt}
      class="mt-3 w-full py-2 text-xs text-gray-400 hover:text-gray-600 transition"
    >
      Ne plus afficher
    </button>
  </div>
{/if}