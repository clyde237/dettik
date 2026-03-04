<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';
  import { setPageTitle } from '$lib/stores/ui';
  import { getCredit } from '$lib/services/credits.service';
  import { localGetDebt } from '$lib/db/debts.js';
  import { isOnline } from '$lib/sync/online.js';
  import CreditDetail from '$lib/components/credit/CreditDetail.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import { toastError, toastWarning } from '$lib/stores/notifications';

  /** @type {import('$lib/services/credits.service').Credit | null} */
  let credit = $state(null);
  let loading = $state(true);

  onMount(async () => {
    const id = $page.params.id;

    try {
      if (get(isOnline)) {
        // En ligne : Supabase
        credit = await getCredit(id);
      } else {
        // Hors ligne : IndexedDB (même store que debts)
        credit = await localGetDebt(id);
        if (credit) {
          toastWarning('Mode hors ligne — données locales');
        }
      }
    } catch (err) {
      // Fallback cache si erreur réseau
      try {
        credit = await localGetDebt(id);
        if (credit) {
          toastWarning('Connexion impossible — données locales');
        }
      } catch {
        credit = null;
      }
    }

    if (!credit) {
      toastError('Créance introuvable');
      goto('/credits');
      return;
    }

    setPageTitle(credit.person?.name || 'Détails', 'Détails de la créance');
    loading = false;
  });
</script>

{#if loading}
  <Spinner class="py-12" />
{:else if credit}
  <CreditDetail {credit} />
{/if}