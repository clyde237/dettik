<script>
  /**
   * @type {{
   *   items: Array<{ value: string, label: string }>,
   *   value?: string,
   *   class?: string,
   *   onchange?: (value: string) => void
   * }}
   */
  let {
    items = [],
    value = $bindable(''),
    class: className = '',
    onchange
  } = $props();

  /**
   * @param {string} val
   */
  function select(val) {
    value = val;
    onchange?.(val);
  }
</script>

<div class="flex border-b border-gray-200 {className}">
  {#each items as item}
    <button
      type="button"
      onclick={() => select(item.value)}
      class="px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px
        {value === item.value
          ? 'border-green-600 text-green-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
    >
      {item.label}
    </button>
  {/each}
</div>