<script>
  import { Loader2 } from '@lucide/svelte';

  /**
   * @type {{
   *   size?: number,
   *   class?: string
   * }}
   */
  let { size = 24, class: className = '' } = $props();
</script>

<div class="flex items-center justify-center {className}">
  <Loader2 {size} class="animate-spin text-green-600" />
</div>