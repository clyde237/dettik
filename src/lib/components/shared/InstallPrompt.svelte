<script>
  import { showInstallPrompt, triggerInstall, dismissInstallPrompt } from '$lib/stores/pwa';
  import { Download, X, Smartphone } from '@lucide/svelte';
</script>

{#if $showInstallPrompt}
  <div
    class="fixed bottom-20 left-4 right-4 lg:bottom-6 lg:left-auto lg:right-6 lg:w-80 z-40
      bg-white border border-gray-200 rounded-2xl shadow-xl p-4 animate-in slide-in-from-bottom-4"
  >
    <div class="flex items-start gap-3">
      <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Smartphone size={20} class="text-green-600" />
      </div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-gray-900">Installer Dettik</p>
        <p class="text-xs text-gray-500 mt-0.5">
          Accédez à l'application depuis votre écran d'accueil, même sans connexion.
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