<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { setPageTitle } from '$lib/stores/ui';
  import { getDebt } from '$lib/services/debts.service';
  import { localGetDebt } from '$lib/db/debts.js';
  import { isOnline } from '$lib/sync/online.js';
  import DebtDetail from '$lib/components/debt/DebtDetail.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import { toastError, toastWarning } from '$lib/stores/notifications';

  /** @type {import('$lib/services/debts.service').Debt | null} */
  let debt = $state(null);
  let loading = $state(true);

  onMount(async () => {
    const id = $page.params.id;

    try {
      if (get(isOnline)) {
        // En ligne : Supabase
        debt = await getDebt(id);
      } else {
        // Hors ligne : IndexedDB
        debt = await localGetDebt(id);
        if (debt) {
          toastWarning('Mode hors ligne — données locales');
        }
      }
    } catch (err) {
      // Fallback cache si erreur réseau
      try {
        debt = await localGetDebt(id);
        if (debt) {
          toastWarning('Connexion impossible — données locales');
        }
      } catch {
        debt = null;
      }
    }

    if (!debt) {
      toastError('Dette introuvable');
      goto('/debts');
      return;
    }

    setPageTitle(debt.person?.name || 'Détails', 'Détails de la dette');
    loading = false;
  });
</script>

{#if loading}
  <Spinner class="py-12" />
{:else if debt}
  <DebtDetail {debt} />
{/if}