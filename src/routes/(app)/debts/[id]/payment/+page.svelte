<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { setPageTitle } from '$lib/stores/ui';
  import { getDebt } from '$lib/services/debts.service';
  import Card from '$lib/components/ui/Card.svelte';
  import PaymentForm from '$lib/components/payment/PaymentForm.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import { toastError } from '$lib/stores/notifications';

  /** @type {import('$lib/services/debts.service').Debt | null} */
  let debt = $state(null);
  let loading = $state(true);

  onMount(async () => {
    try {
      const id = $page.params.id;
      debt = await getDebt(id);
      setPageTitle('Nouveau versement', debt.person?.name || '');
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
  <Card>
    <PaymentForm
      debtId={debt.id}
      type="debt"
      currency={debt.currency}
      remainingAmount={Number(debt.remaining_amount)}
      backUrl="/debts/{debt.id}"
    />
  </Card>
{/if}