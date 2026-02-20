<script>
  /** @type {{ children: import('svelte').Snippet }} */
  let { children } = $props();
</script>

<main class="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 overflow-y-auto">
  <div class="max-w-5xl mx-auto">
    {@render children()}
  </div>
</main>