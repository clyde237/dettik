<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { setPageTitle } from '$lib/stores/ui';
  import { getCredit } from '$lib/services/credits.service';
  import CreditDetail from '$lib/components/credit/CreditDetail.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import { toastError } from '$lib/stores/notifications';

  /** @type {import('$lib/services/credits.service').Credit | null} */
  let credit = $state(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      const id = $page.params.id;
      credit = await getCredit(id);
      setPageTitle(
        credit.person?.name || 'Détails',
        'Détails de la créance'
      );
    } catch (err) {
      toastError('Créance introuvable');
      goto('/credits');
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <Spinner class="py-12" />
{:else if credit}
  <CreditDetail {credit} />
{/if}