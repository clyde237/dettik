<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { setPageTitle } from '$lib/stores/ui';
  import { getDebt } from '$lib/services/debts.service';
  import DebtDetail from '$lib/components/debt/DebtDetail.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import { toastError } from '$lib/stores/notifications';

  /** @type {import('$lib/services/debts.service').Debt | null} */
  let debt = $state(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      const id = $page.params.id;
      debt = await getDebt(id);
      setPageTitle(
        debt.person?.name || 'Détails',
        'Détails de la dette'
      );
    } catch (err) {
      toastError('Dette introuvable');
      goto('/debts');
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <Spinner class="py-12" />
{:else if debt}
  <DebtDetail {debt} />
{/if}