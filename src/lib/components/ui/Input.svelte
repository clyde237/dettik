<script>
  /**
   * @type {{
   *   label?: string,
   *   type?: string,
   *   value?: string | number,
   *   placeholder?: string,
   *   error?: string,
   *   disabled?: boolean,
   *   required?: boolean,
   *   id?: string,
   *   icon?: import('svelte').Component,
   *   class?: string,
   *   oninput?: (e: Event) => void,
   *   onchange?: (e: Event) => void
   * }}
   */
  let {
    label = '',
    type = 'text',
    value = $bindable(''),
    placeholder = '',
    error = '',
    disabled = false,
    required = false,
    id = crypto.randomUUID(),
    icon: Icon,
    class: className = '',
    oninput,
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

  <div class="relative">
    {#if Icon}
      <Icon class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
    {/if}

    <input
      {id}
      {type}
      {placeholder}
      {disabled}
      {required}
      {oninput}
      {onchange}
      bind:value
      class="w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition
        focus:ring-2 focus:ring-green-500 focus:border-green-500
        disabled:bg-gray-50 disabled:cursor-not-allowed
        {Icon ? 'pl-10' : ''}
        {error ? 'border-red-500' : 'border-gray-300'}"
    />
  </div>

  {#if error}
    <p class="mt-1 text-sm text-red-600">{error}</p>
  {/if}
</div>