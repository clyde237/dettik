<script>
  import { updateAvailable, applyUpdate } from '$lib/stores/pwa';
  import { RefreshCw } from '@lucide/svelte';
</script>

{#if $updateAvailable}
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-blue-600 text-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
    <RefreshCw size={16} />
    <span class="text-sm font-medium">Mise à jour disponible</span>
    <button
      onclick={applyUpdate}
      class="ml-2 px-3 py-1 bg-white text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-50 transition"
    >
      Actualiser
    </button>
  </div>
{/if}