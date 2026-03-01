<script>
  import { onMount } from 'svelte';
  import { setPageTitle } from '$lib/stores/ui';
  import { loadDebts, debts, debtsStats } from '$lib/stores/debts';
  import { loadCredits, credits, creditsStats } from '$lib/stores/credits';
  import SummaryCards from '$lib/components/dashboard/SummaryCards.svelte';
  import DeadlineAlerts from '$lib/components/dashboard/DeadlineAlerts.svelte';
  import RecentActivity from '$lib/components/dashboard/RecentActivity.svelte';
  import BalanceCard from '$lib/components/dashboard/BalanceCard.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';

  let loading = $state(true);

  onMount(async () => {
    setPageTitle('Tableau de bord', 'Vue d\'ensemble de vos finances');

    const promises = [];

    if (!$debts.loaded) {
      promises.push(loadDebts());
    }
    if (!$credits.loaded) {
      promises.push(loadCredits());
    }

    await Promise.all(promises);
    loading = false;
  });
</script>

{#if loading && !$debts.loaded && !$credits.loaded}
  <Spinner class="py-12" />
{:else}
  <div class="space-y-6">
    <!-- Résumé financier -->
    <SummaryCards
      totalDebts={$debtsStats.totalRemaining}
      totalCredits={$creditsStats.totalRemaining}
    />

    <!-- Alertes échéances -->
    <DeadlineAlerts
      debts={$debts.list}
      credits={$credits.list}
    />

    <!-- Progression dettes / créances -->
    <BalanceCard
      debtCount={$debtsStats.count}
      creditCount={$creditsStats.count}
      debtPaid={$debtsStats.totalPaid}
      debtTotal={$debtsStats.totalAmount}
      creditReceived={$creditsStats.totalReceived}
      creditTotal={$creditsStats.totalAmount}
    />

    <!-- Activité récente -->
    <RecentActivity
      debts={$debts.list}
      credits={$credits.list}
    />
  </div>
{/if}