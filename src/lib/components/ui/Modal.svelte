<script>
  import { X } from '@lucide/svelte';

  /**
   * @type {{
   *   open?: boolean,
   *   title?: string,
   *   size?: 'sm' | 'md' | 'lg',
   *   onclose?: () => void,
   *   children: import('svelte').Snippet,
   *   footer?: import('svelte').Snippet
   * }}
   */
  let {
    open = $bindable(false),
    title = '',
    size = 'md',
    onclose,
    children,
    footer
  } = $props();

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  function close() {
    open = false;
    onclose?.();
  }

  /**
   * @param {KeyboardEvent} e
   */
  function handleKeydown(e) {
    if (e.key === 'Escape' && open) close();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
  <!-- Overlay -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <button
      class="absolute inset-0 bg-black/50"
      onclick={close}
      aria-label="Fermer"
    ></button>

    <!-- Contenu -->
    <div class="relative bg-white rounded-2xl shadow-xl w-full {sizes[size]} max-h-[90vh] flex flex-col">
      <!-- Header -->
      {#if title}
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">{title}</h2>
          <button
            onclick={close}
            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>
      {/if}

      <!-- Body -->
      <div class="px-6 py-4 overflow-y-auto flex-1">
        {@render children()}
      </div>

      <!-- Footer -->
      {#if footer}
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          {@render footer()}
        </div>
      {/if}
    </div>
  </div>
{/if}