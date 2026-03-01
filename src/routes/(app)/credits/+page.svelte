<script>
  import { onMount } from 'svelte';
  import { setPageTitle } from '$lib/stores/ui';
  import CreditList from '$lib/components/credit/CreditList.svelte';
  import FloatingActionButton from '$lib/components/shared/FloatingActionButton.svelte';
  import { creditsStats } from '$lib/stores/credits';
  import { formatAmount } from '$lib/utils/currency';

  onMount(() => {
    setPageTitle('Mes créances', 'Argent qu\'on vous doit');
  });
</script>

<div class="space-y-6">
  <!-- Résumé -->
  <div class="grid grid-cols-2 gap-3">
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <p class="text-xs text-gray-500 mb-1">Reste à percevoir</p>
      <p class="text-lg font-bold text-green-600">
        {formatAmount($creditsStats.totalRemaining)}
      </p>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-4">
      <p class="text-xs text-gray-500 mb-1">Déjà reçu</p>
      <p class="text-lg font-bold text-gray-900">
        {formatAmount($creditsStats.totalReceived)}
      </p>
    </div>
  </div>

  <!-- Liste -->
  <CreditList />
</div>

<!-- Bouton flottant -->
<FloatingActionButton href="/credits/new" label="Ajouter une créance" />