<script>
  import { onMount } from 'svelte';
  import ArchiveItem from './ArchiveItem.svelte';
  import ArchiveFilters from './ArchiveFilters.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { getArchives, restoreArchive, deleteArchive } from '$lib/services/archives.service';
  import { exportToCSV } from '$lib/services/export.service';
  import { toastSuccess, toastError } from '$lib/stores/notifications';
  import { Archive, Download } from '@lucide/svelte';

  /** @type {import('$lib/services/debts.service').Debt[]} */
  let archives = $state([]);
  let loading = $state(true);
  let search = $state('');

  /** @type {'all' | 'debt' | 'credit'} */
  let typeFilter = $state('all');

  let filtered = $derived(() => {
    let result = [...archives];

    // Filtre par type
    if (typeFilter !== 'all') {
      result = result.filter((item) => item.type === typeFilter);
    }

    // Filtre par recherche
    const query = search.toLowerCase().trim();
    if (query) {
      result = result.filter((item) =>
        item.person?.name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
      );
    }

    return result;
  });

  let filteredList = $derived(typeof filtered === 'function' ? filtered() : filtered);

  onMount(async () => {
    try {
      archives = await getArchives();
    } catch (err) {
      toastError('Erreur lors du chargement des archives');
      console.error(err);
    } finally {
      loading = false;
    }
  });

  /**
   * @param {string} id
   */
  async function handleRestore(id) {
    try {
      await restoreArchive(id);
      archives = archives.filter((a) => a.id !== id);
      toastSuccess('Élément restauré');
    } catch (err) {
      toastError('Erreur lors de la restauration');
      console.error(err);
    }
  }

  /**
   * @param {string} id
   */
  async function handleDelete(id) {
    try {
      await deleteArchive(id);
      archives = archives.filter((a) => a.id !== id);
      toastSuccess('Élément supprimé définitivement');
    } catch (err) {
      toastError('Erreur lors de la suppression');
      console.error(err);
    }
  }

  function handleExport() {
    exportToCSV(archives, typeFilter);
    toastSuccess('Export CSV téléchargé');
  }
</script>

<div class="space-y-4">
  <!-- Filtres -->
  {#if archives.length > 0}
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <ArchiveFilters bind:search bind:typeFilter />
      </div>
      <Button variant="outline" size="sm" onclick={handleExport} class="ml-3 flex-shrink-0">
        <Download size={14} />
        Exporter
      </Button>
    </div>
  {/if}

  <!-- Chargement -->
  {#if loading}
    <Spinner class="py-12" />

  <!-- Vide -->
  {:else if archives.length === 0}
    <EmptyState
      title="Aucune archive"
      description="Les dettes et créances entièrement remboursées apparaîtront ici automatiquement."
      icon={Archive}
    />

  <!-- Résultats vides -->
  {:else if filteredList.length === 0}
    <EmptyState
      title="Aucun résultat"
      description="Aucun élément ne correspond à vos filtres."
    />

  <!-- Liste -->
  {:else}
    <div class="space-y-3">
      {#each filteredList as item (item.id)}
        <ArchiveItem
          {item}
          onrestore={handleRestore}
          ondelete={handleDelete}
        />
      {/each}
    </div>

    <p class="text-xs text-gray-400 text-center pt-2">
      {filteredList.length} élément{filteredList.length > 1 ? 's' : ''}
      {#if search || typeFilter !== 'all'}
        sur {archives.length}
      {/if}
    </p>
  {/if}
</div>