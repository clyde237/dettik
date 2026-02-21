<script>
  /**
   * @type {{
   *   label?: string,
   *   value?: string,
   *   placeholder?: string,
   *   error?: string,
   *   disabled?: boolean,
   *   required?: boolean,
   *   rows?: number,
   *   id?: string,
   *   class?: string
   * }}
   */
  let {
    label = '',
    value = $bindable(''),
    placeholder = '',
    error = '',
    disabled = false,
    required = false,
    rows = 3,
    id = crypto.randomUUID(),
    class: className = ''
  } = $props();
</script>

<div class={className}>
  {#if label}
    <label for={id} class="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}

  <textarea
    {id}
    {placeholder}
    {disabled}
    {required}
    {rows}
    bind:value
    class="w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition resize-none
      focus:ring-2 focus:ring-green-500 focus:border-green-500
      disabled:bg-gray-50 disabled:cursor-not-allowed
      {error ? 'border-red-500' : 'border-gray-300'}"
  ></textarea>

  {#if error}
    <p class="mt-1 text-sm text-red-600">{error}</p>
  {/if}
</div>