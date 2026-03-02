<script>
  import { ui, toggleSidebar } from '$lib/stores/ui';
  import { Menu } from '@lucide/svelte';
  import SyncIndicator from '$lib/components/sync/SyncIndicator.svelte';

  let { actions } = $props();
</script>

<header class="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
  <div class="flex items-center justify-between h-16 px-4 lg:px-6">
    <div class="flex items-center gap-3">
      <button
        class="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        onclick={toggleSidebar}
        aria-label="Ouvrir le menu"
      >
        <Menu size={22} />
      </button>

      <div>
        <h1 class="text-lg font-semibold text-gray-900">{$ui.pageTitle}</h1>
        {#if $ui.pageDescription}
          <p class="text-xs text-gray-500">{$ui.pageDescription}</p>
        {/if}
      </div>
    </div>

    <div class="flex items-center gap-3">
      <!-- Indicateur de sync (desktop uniquement) -->
      <div class="hidden sm:flex">
        <SyncIndicator />
      </div>

      {#if actions}
        <div class="flex items-center gap-2">
          {@render actions()}
        </div>
      {/if}
    </div>
  </div>
</header>