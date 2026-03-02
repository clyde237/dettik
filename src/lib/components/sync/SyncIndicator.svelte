<script>
  import { syncStatus, syncState } from '$lib/stores/sync.js';
  import { isOnline } from '$lib/sync/online.js';
  import { CheckCircle, RefreshCw, AlertCircle, WifiOff } from '@lucide/svelte';

  let label = $derived(
    !$isOnline ? 'Hors ligne' :
    $syncStatus === 'syncing' ? 'Sync...' :
    $syncStatus === 'error' ? 'Erreur' :
    $syncStatus === 'pending' ? `${$syncState.pendingCount} en attente` :
    'Synchronisé'
  );

  let colorClass = $derived(
    !$isOnline ? 'text-orange-500' :
    $syncStatus === 'syncing' ? 'text-blue-500' :
    $syncStatus === 'error' ? 'text-red-500' :
    $syncStatus === 'pending' ? 'text-yellow-500' :
    'text-green-500'
  );
</script>

<div class="flex items-center gap-1.5 {colorClass}">
  {#if !$isOnline}
    <WifiOff size={14} />
  {:else if $syncStatus === 'syncing'}
    <RefreshCw size={14} class="animate-spin" />
  {:else if $syncStatus === 'error'}
    <AlertCircle size={14} />
  {:else}
    <CheckCircle size={14} />
  {/if}
  <span class="text-xs font-medium">{label}</span>
</div>