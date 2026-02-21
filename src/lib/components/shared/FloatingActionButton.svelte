<script>
  import { Plus } from '@lucide/svelte';

  /**
   * @type {{
   *   href?: string,
   *   onclick?: () => void,
   *   icon?: import('svelte').Component,
   *   label?: string,
   *   class?: string
   * }}
   */
  let {
    href = '',
    onclick,
    icon: Icon = Plus,
    label = 'Ajouter',
    class: className = ''
  } = $props();
</script>

{#if href}
  <a
    {href}
    aria-label={label}
    class="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-30
      w-14 h-14 bg-green-600 text-white rounded-full shadow-lg
      flex items-center justify-center
      hover:bg-green-700 active:scale-95 transition {className}"
  >
    <Icon size={24} />
  </a>
{:else}
  <button
    {onclick}
    aria-label={label}
    class="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-30
      w-14 h-14 bg-green-600 text-white rounded-full shadow-lg
      flex items-center justify-center
      hover:bg-green-700 active:scale-95 transition {className}"
  >
    <Icon size={24} />
  </button>
{/if}