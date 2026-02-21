<script>
  /**
   * @type {{
   *   open?: boolean,
   *   align?: 'left' | 'right',
   *   trigger: import('svelte').Snippet,
   *   children: import('svelte').Snippet
   * }}
   */
  let {
    open = $bindable(false),
    align = 'right',
    trigger,
    children
  } = $props();

  /**
   * @param {MouseEvent} e
   */
  function toggle(e) {
    e.stopPropagation();
    open = !open;
  }

  /**
   * @param {MouseEvent} e
   */
  function stopProp(e) {
    e.stopPropagation();
  }

  function close() {
    open = false;
  }
</script>

<svelte:window onclick={close} />

<div class="relative inline-block">
  <button type="button" onclick={toggle}>
    {@render trigger()}
  </button>

  {#if open}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="absolute top-full mt-2 z-50 min-w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1
        {align === 'right' ? 'right-0' : 'left-0'}"
      onclick={stopProp}
    >
      {@render children()}
    </div>
  {/if}
</div>