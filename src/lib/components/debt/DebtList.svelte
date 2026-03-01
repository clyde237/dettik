<script>
  import { onMount } from 'svelte';
  import DebtCard from './DebtCard.svelte';
  import DebtFilters from './DebtFilters.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { loadDebts, debts, filteredDebts } from '$lib/stores/debts';
  import { TrendingDown, Plus } from '@lucide/svelte';

  onMount(() => {
    if (!$debts.loaded) {
      loadDebts();
    }
  });
</script>

<div class="space-y-4">
  <!-- Filtres (visible seulement si on a des dettes) -->
  {#if $debts.list.length > 0}
    <DebtFilters />
  {/if}

  <!-- Chargement -->
  {#if $debts.loading}
    <Spinner class="py-12" />

  <!-- Liste vide -->
  {:else if $debts.list.length === 0}
    <EmptyState
      title="Aucune dette"
      description="Vous n'avez enregistré aucune dette pour le moment."
      icon={TrendingDown}
    >
      {#snippet action()}
        <Button variant="primary" onclick={() => window.location.href = '/debts/new'}>
          <Plus size={16} />
          Ajouter une dette
        </Button>
      {/snippet}
    </EmptyState>

  <!-- Résultats de recherche vides -->
  {:else if $filteredDebts.length === 0}
    <EmptyState
      title="Aucun résultat"
      description="Aucune dette ne correspond à votre recherche."
    />

  <!-- Liste des dettes -->
  {:else}
    <div class="space-y-3">
      {#each $filteredDebts as debt (debt.id)}
        <DebtCard {debt} />
      {/each}
    </div>

    <!-- Compteur -->
    <p class="text-xs text-gray-400 text-center pt-2">
      {$filteredDebts.length} dette{$filteredDebts.length > 1 ? 's' : ''}
      {#if $debts.searchQuery}
        sur {$debts.list.length}
      {/if}
    </p>
  {/if}
</div>