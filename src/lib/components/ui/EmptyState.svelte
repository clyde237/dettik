<script>
  import { Inbox } from '@lucide/svelte';

  /**
   * @type {{
   *   title?: string,
   *   description?: string,
   *   icon?: import('svelte').Component,
   *   action?: import('svelte').Snippet,
   *   class?: string
   * }}
   */
  let {
    title = 'Aucun résultat',
    description = '',
    icon: Icon = Inbox,
    action,
    class: className = ''
  } = $props();
</script>

<div class="flex flex-col items-center justify-center py-12 text-center {className}">
  <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
    <Icon size={28} class="text-gray-400" />
  </div>

  <h3 class="text-base font-medium text-gray-900 mb-1">{title}</h3>

  {#if description}
    <p class="text-sm text-gray-500 max-w-xs">{description}</p>
  {/if}

  {#if action}
    <div class="mt-4">
      {@render action()}
    </div>
  {/if}
</div>