<script>
  import SearchInput from '$lib/components/ui/SearchInput.svelte';
  import Tabs from '$lib/components/ui/Tabs.svelte';

  /**
   * @type {{
   *   search?: string,
   *   typeFilter?: 'all' | 'debt' | 'credit',
   *   onsearch?: (value: string) => void,
   *   onfilter?: (value: string) => void
   * }}
   */
  let {
    search = $bindable(''),
    typeFilter = $bindable('all'),
    onsearch,
    onfilter
  } = $props();

  const tabs = [
    { value: 'all', label: 'Tous' },
    { value: 'debt', label: 'Dettes' },
    { value: 'credit', label: 'Créances' }
  ];

  /**
   * @param {string} value
   */
  function handleFilterChange(value) {
    typeFilter = /** @type {'all' | 'debt' | 'credit'} */ (value);
    onfilter?.(value);
  }
</script>

<div class="space-y-3">
  <Tabs
    items={tabs}
    bind:value={typeFilter}
    onchange={handleFilterChange}
  />

  <SearchInput
    bind:value={search}
    placeholder="Rechercher dans les archives..."
    oninput={() => onsearch?.(search)}
  />
</div>