<script>
  import { isOnline } from '$lib/stores/pwa';
  import { WifiOff } from '@lucide/svelte';
</script>

{#if !$isOnline}
  <div class="sticky top-0 z-50 bg-orange-500 text-white">
    <div class="flex items-center gap-3 px-4 py-2.5 max-w-5xl mx-auto">
      <WifiOff size={16} class="flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium">Mode hors ligne</p>
        <p class="text-xs opacity-90">
          Les modifications seront synchronisées à la reconnexion.
        </p>
      </div>
    </div>
  </div>
{/if}