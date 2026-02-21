<script>
  /**
   * @type {{
   *   label?: string,
   *   value?: string,
   *   options: Array<{ value: string, label: string }>,
   *   placeholder?: string,
   *   error?: string,
   *   disabled?: boolean,
   *   required?: boolean,
   *   id?: string,
   *   class?: string,
   *   onchange?: (e: Event) => void
   * }}
   */
  let {
    label = '',
    value = $bindable(''),
    options = [],
    placeholder = 'Sélectionner...',
    error = '',
    disabled = false,
    required = false,
    id = crypto.randomUUID(),
    class: className = '',
    onchange
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

  <select
    {id}
    {disabled}
    {required}
    {onchange}
    bind:value
    class="w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition
      focus:ring-2 focus:ring-green-500 focus:border-green-500
      disabled:bg-gray-50 disabled:cursor-not-allowed
      {error ? 'border-red-500' : 'border-gray-300'}"
  >
    {#if placeholder}
      <option value="" disabled>{placeholder}</option>
    {/if}

    {#each options as opt}
      <option value={opt.value}>{opt.label}</option>
    {/each}
  </select>

  {#if error}
    <p class="mt-1 text-sm text-red-600">{error}</p>
  {/if}
</div>