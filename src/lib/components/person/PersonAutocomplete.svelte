<script>
  import { onMount } from 'svelte';
  import Avatar from '$lib/components/ui/Avatar.svelte';
  import PersonQuickAdd from './PersonQuickAdd.svelte';
  import { loadPersons, persons, searchPersonsStore } from '$lib/stores/persons';
  import { Search, Plus, X } from '@lucide/svelte';

  /**
   * @type {{
   *   value?: import('$lib/stores/persons').Person | null,
   *   error?: string,
   *   label?: string,
   *   required?: boolean,
   *   class?: string,
   *   onselect?: (person: import('$lib/stores/persons').Person) => void
   * }}
   */
  let {
    value = $bindable(null),
    error = '',
    label = 'Personne',
    required = false,
    class: className = '',
    onselect
  } = $props();

  let query = $state('');
  let showDropdown = $state(false);
  let showQuickAdd = $state(false);

  /** @type {import('$lib/stores/persons').Person[]} */
  let suggestions = $state([]);
  let searching = $state(false);

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let debounceTimer;

  onMount(() => {
    if (!$persons.loaded) {
      loadPersons();
    }
  });

  // Quand query change, rechercher avec debounce
  $effect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    if (query.trim().length === 0) {
      suggestions = $persons.list;
      return;
    }

    debounceTimer = setTimeout(async () => {
      searching = true;
      suggestions = await searchPersonsStore(query);
      searching = false;
    }, 200);
  });

  /**
   * @param {import('$lib/stores/persons').Person} person
   */
  function selectPerson(person) {
    value = person;
    query = '';
    showDropdown = false;
    onselect?.(person);
  }

  function clearSelection() {
    value = null;
    query = '';
  }

  function handleFocus() {
    suggestions = $persons.list;
    showDropdown = true;
  }

  function handleBlur() {
    // Délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      showDropdown = false;
    }, 200);
  }

  /**
   * @param {import('$lib/stores/persons').Person} person
   */
  function handleQuickAddCreated(person) {
    selectPerson(person);
    showQuickAdd = false;
  }
</script>

<div class={className}>
  {#if label}
    <label class="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}

  <!-- Personne sélectionnée -->
  {#if value}
    <div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-center gap-3">
        <Avatar name={value.name} size="sm" />
        <div>
          <p class="text-sm font-medium text-gray-900">{value.name}</p>
          {#if value.phone}
            <p class="text-xs text-gray-500">{value.phone}</p>
          {/if}
        </div>
      </div>
      <button
        type="button"
        onclick={clearSelection}
        class="p-1 text-gray-400 hover:text-red-500 transition"
      >
        <X size={16} />
      </button>
    </div>

  <!-- Champ de recherche -->
  {:else}
    <div class="relative">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        bind:value={query}
        onfocus={handleFocus}
        onblur={handleBlur}
        placeholder="Rechercher une personne..."
        class="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none transition
          focus:ring-2 focus:ring-green-500 focus:border-green-500
          {error ? 'border-red-500' : 'border-gray-300'}"
      />

      <!-- Liste de suggestions -->
      {#if showDropdown}
        <div class="absolute top-full left-0 right-0 mt-1 z-40 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          <!-- Suggestions -->
          {#each suggestions as person (person.id)}
            <button
              type="button"
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left"
              onmousedown={() => selectPerson(person)}
            >
              <Avatar name={person.name} size="sm" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{person.name}</p>
                {#if person.phone || person.email}
                  <p class="text-xs text-gray-500 truncate">
                    {person.phone || person.email}
                  </p>
                {/if}
              </div>
            </button>
          {:else}
            {#if query.trim()}
              <div class="px-4 py-3 text-sm text-gray-500 text-center">
                Aucun résultat pour "{query}"
              </div>
            {:else}
              <div class="px-4 py-3 text-sm text-gray-500 text-center">
                Aucune personne enregistrée
              </div>
            {/if}
          {/each}

          <!-- Bouton créer -->
          <div class="border-t border-gray-100">
            <button
              type="button"
              class="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-green-600 hover:bg-green-50 transition"
              onmousedown={() => { showDropdown = false; showQuickAdd = true; }}
            >
              <Plus size={16} />
              {#if query.trim()}
                Créer "{query.trim()}"
              {:else}
                Nouvelle personne
              {/if}
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#if error}
    <p class="mt-1 text-sm text-red-600">{error}</p>
  {/if}
</div>

<!-- Modal création rapide -->
<PersonQuickAdd
  bind:open={showQuickAdd}
  initialName={query.trim()}
  oncreated={handleQuickAddCreated}
/>