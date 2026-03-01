<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { setPageTitle } from '$lib/stores/ui';
  import { getCredit } from '$lib/services/credits.service';
  import Card from '$lib/components/ui/Card.svelte';
  import CreditForm from '$lib/components/credit/CreditForm.svelte';
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
        `Modifier - ${credit.person?.name || ''}`,
        'Modification de la créance'
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
  <Card>
    <CreditForm mode="edit" {credit} />
  </Card>
{/if}