<script>
  import { onMount } from 'svelte';
  import { setPageTitle } from '$lib/stores/ui';
  import DebtList from '$lib/components/debt/DebtList.svelte';
  import FloatingActionButton from '$lib/components/shared/FloatingActionButton.svelte';
  import { debtsStats } from '$lib/stores/debts';
  import { formatAmount } from '$lib/utils/currency';

  onMount(() => {
    setPageTitle('Mes dettes', 'Argent que vous devez');
  });
</script>

<div class="space-y-6">
  <!-- Résumé -->
  <div class="grid grid-cols-2 gap-3">
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <p class="text-xs text-gray-500 mb-1">Total restant</p>
      <p class="text-lg font-bold text-red-600">
        {formatAmount($debtsStats.totalRemaining)}
      </p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <p class="text-xs text-gray-500 mb-1">Déjà remboursé</p>
      <p class="text-lg font-bold text-green-600">
        {formatAmount($debtsStats.totalPaid)}
      </p>
    </div>
  </div>

  <!-- Liste -->
  <DebtList />
</div>

<!-- Bouton flottant -->
<FloatingActionButton href="/debts/new" label="Ajouter une dette" />