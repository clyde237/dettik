<script>
  import Badge from '$lib/components/ui/Badge.svelte';

  /**
   * @type {{
   *   status: 'active' | 'archived',
   *   class?: string
   * }}
   */
  let { status = 'active', class: className = '' } = $props();

  const config = {
    active: { label: 'En cours', variant: /** @type {const} */ ('info') },
    archived: { label: 'Archivée', variant: /** @type {const} */ ('default') }
  };
</script>

<Badge variant={config[status].variant} class={className}>
  {config[status].label}
</Badge>