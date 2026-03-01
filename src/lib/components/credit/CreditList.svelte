<script>
  import { onMount } from 'svelte';
  import CreditCard from './CreditCard.svelte';
  import CreditFilters from './CreditFilters.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { loadCredits, credits, filteredCredits } from '$lib/stores/credits';
  import { TrendingUp, Plus } from '@lucide/svelte';

  onMount(() => {
    if (!$credits.loaded) {
      loadCredits();
    }
  });
</script>

<div class="space-y-4">
  {#if $credits.list.length > 0}
    <CreditFilters />
  {/if}

  {#if $credits.loading}
    <Spinner class="py-12" />

  {:else if $credits.list.length === 0}
    <EmptyState
      title="Aucune créance"
      description="Vous n'avez enregistré aucune créance pour le moment."
      icon={TrendingUp}
    >
      {#snippet action()}
        <Button variant="primary" onclick={() => window.location.href = '/credits/new'}>
          <Plus size={16} />
          Ajouter une créance
        </Button>
      {/snippet}
    </EmptyState>

  {:else if $filteredCredits.length === 0}
    <EmptyState
      title="Aucun résultat"
      description="Aucune créance ne correspond à votre recherche."
    />

  {:else}
    <div class="space-y-3">
      {#each $filteredCredits as credit (credit.id)}
        <CreditCard {credit} />
      {/each}
    </div>

    <p class="text-xs text-gray-400 text-center pt-2">
      {$filteredCredits.length} créance{$filteredCredits.length > 1 ? 's' : ''}
      {#if $credits.searchQuery}
        sur {$credits.list.length}
      {/if}
    </p>
  {/if}
</div>