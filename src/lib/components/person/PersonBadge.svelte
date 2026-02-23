<script>
  import Avatar from '$lib/components/ui/Avatar.svelte';

  /**
   * @type {{
   *   name: string,
   *   size?: 'sm' | 'md' | 'lg',
   *   class?: string
   * }}
   */
  let {
    name = '',
    size = 'sm',
    class: className = ''
  } = $props();
</script>

<div class="inline-flex items-center gap-2 {className}">
  <Avatar {name} {size} />
  <span class="text-sm font-medium text-gray-900">{name}</span>
</div>