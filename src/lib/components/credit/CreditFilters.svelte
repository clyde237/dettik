<script>
  import SearchInput from '$lib/components/ui/SearchInput.svelte';
  import { setCreditSearch, setCreditSort, credits } from '$lib/stores/credits';
  import { ArrowUpDown, Calendar, DollarSign, User } from '@lucide/svelte';

  let searchValue = $state('');

  /**
   * @param {Event} e
   */
  function handleSearch(e) {
    setCreditSearch(searchValue);
  }

  /** @type {Array<{ value: 'date' | 'amount' | 'name', label: string, icon: import('svelte').Component }>} */
  const sortOptions = [
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'amount', label: 'Montant', icon: DollarSign },
    { value: 'name', label: 'Nom', icon: User }
  ];
</script>

<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
  <SearchInput
    bind:value={searchValue}
    placeholder="Rechercher une créance..."
    oninput={handleSearch}
    class="flex-1"
  />

  <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
    {#each sortOptions as option}
      {@const Icon = option.icon}
      {@const active = $credits.sortBy === option.value}
      <button
        type="button"
        onclick={() => setCreditSort(option.value)}
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition
          {active
            ? 'bg-green-50 text-green-700'
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
      >
        <Icon size={14} />
        {option.label}
        {#if active}
          <ArrowUpDown size={12} />
        {/if}
      </button>
    {/each}
  </div>
</div>