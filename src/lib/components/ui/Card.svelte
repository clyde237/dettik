<script>
  /**
   * @type {{
   *   class?: string,
   *   padding?: boolean,
   *   children: import('svelte').Snippet
   * }}
   */
  let {
    class: className = '',
    padding = true,
    children
  } = $props();
</script>

<div class="bg-white rounded-xl border border-gray-200 {padding ? 'p-5' : ''} {className}">
  {@render children()}
</div>