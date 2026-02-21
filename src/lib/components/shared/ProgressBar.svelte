<script>
  /**
   * @type {{
   *   value: number,
   *   max: number,
   *   size?: 'sm' | 'md',
   *   showLabel?: boolean,
   *   class?: string
   * }}
   */
  let {
    value = 0,
    max = 100,
    size = 'md',
    showLabel = true,
    class: className = ''
  } = $props();

  let percentage = $derived(max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0);

  let color = $derived(
    percentage >= 100 ? 'bg-green-500' :
    percentage >= 75 ? 'bg-green-400' :
    percentage >= 50 ? 'bg-yellow-400' :
    percentage >= 25 ? 'bg-orange-400' :
    'bg-red-400'
  );

  const heights = { sm: 'h-1.5', md: 'h-2.5' };
</script>

<div class={className}>
  {#if showLabel}
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs font-medium text-gray-500">{percentage}%</span>
    </div>
  {/if}

  <div class="w-full bg-gray-200 rounded-full overflow-hidden {heights[size]}">
    <div
      class="h-full rounded-full transition-all duration-500 ease-out {color}"
      style="width: {percentage}%"
    ></div>
  </div>
</div>