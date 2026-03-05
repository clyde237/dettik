<script>
  import { updateAvailable, applyUpdate } from '$lib/stores/pwa';
  import { RefreshCw, X } from '@lucide/svelte';

  let dismissed = $state(false);
</script>

{#if $updateAvailable && !dismissed}
  <div class="fixed top-0 left-0 right-0 z-[200] bg-blue-600 text-white">
    <div class="flex items-center gap-3 px-4 py-2.5 max-w-5xl mx-auto">
      <RefreshCw size={16} class="flex-shrink-0" />
      <span class="flex-1 text-sm font-medium">
        Une mise à jour est disponible
      </span>
      <button
        onclick={applyUpdate}
        class="px-3 py-1 bg-white text-blue-600 text-xs font-semibold rounded-lg hover:bg-blue-50 transition"
      >
        Mettre à jour
      </button>
      <button
        onclick={() => dismissed = true}
        class="p-1 text-white/70 hover:text-white transition"
        aria-label="Ignorer"
      >
        <X size={16} />
      </button>
    </div>
  </div>
{/if}