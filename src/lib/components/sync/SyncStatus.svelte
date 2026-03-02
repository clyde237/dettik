<script>
  import { syncState, syncStatus } from '$lib/stores/sync.js';
  import { isOnline } from '$lib/sync/online.js';
  import { triggerSync } from '$lib/sync/engine.js';
  import { formatRelative } from '$lib/utils/date.js';
  import { RefreshCw } from '@lucide/svelte';

  let syncing = $state(false);

  async function handleSync() {
    syncing = true;
    await triggerSync();
    syncing = false;
  }
</script>

<div class="flex items-center gap-3">
  <div class="text-xs text-gray-500">
    {#if $syncState.lastSync}
      Dernière sync : {formatRelative($syncState.lastSync)}
    {:else}
      Pas encore synchronisé
    {/if}
  </div>

  {#if $isOnline}
    <button
      onclick={handleSync}
      disabled={syncing || $syncStatus === 'syncing'}
      class="p-1.5 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50 transition disabled:opacity-40"
      title="Synchroniser maintenant"
    >
      <RefreshCw size={16} class={syncing ? 'animate-spin' : ''} />
    </button>
  {/if}
</div>