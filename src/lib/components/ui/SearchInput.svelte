<script>
  import { Search, X } from '@lucide/svelte';

  /**
   * @type {{
   *   value?: string,
   *   placeholder?: string,
   *   class?: string,
   *   oninput?: (e: Event) => void
   * }}
   */
  let {
    value = $bindable(''),
    placeholder = 'Rechercher...',
    class: className = '',
    oninput
  } = $props();

  function clear() {
    value = '';
  }
</script>

<div class="relative {className}">
  <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />

  <input
    type="text"
    {placeholder}
    {oninput}
    bind:value
    class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm
      bg-white outline-none transition
      focus:ring-2 focus:ring-green-500 focus:border-green-500"
  />

  {#if value}
    <button
      type="button"
      onclick={clear}
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
    >
      <X size={16} />
    </button>
  {/if}
</div>