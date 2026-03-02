<script>
  import { isOnline } from '$lib/sync/online.js';
  import { syncState, syncStatus } from '$lib/stores/sync.js';
  import { WifiOff, RefreshCw } from '@lucide/svelte';
  import { triggerSync } from '$lib/sync/engine.js';

  let syncing = $state(false);

  async function handleRetry() {
    syncing = true;
    await triggerSync();
    syncing = false;
  }
</script>

{#if !$isOnline}
  <div class="bg-orange-500 text-white px-4 py-2.5 flex items-center justify-between gap-3">
    <div class="flex items-center gap-2">
      <WifiOff size={16} />
      <span class="text-sm font-medium">Mode hors ligne</span>
      {#if $syncState.pendingCount > 0}
        <span class="bg-white/20 rounded-full px-2 py-0.5 text-xs">
          {$syncState.pendingCount} en attente
        </span>
      {/if}
    </div>
    <p class="text-xs opacity-80 hidden sm:block">
      Les modifications seront synchronisées au retour
    </p>
  </div>
{:else if $syncStatus === 'pending'}
  <div class="bg-blue-500 text-white px-4 py-2 flex items-center justify-between gap-3">
    <div class="flex items-center gap-2">
      <RefreshCw size={16} class={syncing ? 'animate-spin' : ''} />
      <span class="text-sm font-medium">
        {$syncState.pendingCount} modification{$syncState.pendingCount > 1 ? 's' : ''} à synchroniser
      </span>
    </div>
    <button
      onclick={handleRetry}
      disabled={syncing}
      class="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition disabled:opacity-50"
    >
      Synchroniser
    </button>
  </div>
{/if}