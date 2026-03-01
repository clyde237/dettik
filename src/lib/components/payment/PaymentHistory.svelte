<script>
  import { onMount } from 'svelte';
  import PaymentItem from './PaymentItem.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import { loadPayments, payments } from '$lib/stores/payments';
  import { Receipt } from '@lucide/svelte';

  /**
   * @type {{
   *   debtId: string,
   *   currency?: string,
   *   type?: 'debt' | 'credit'
   * }}
   */
  let {
    debtId,
    currency = 'XAF',
    type = 'debt'
  } = $props();

  onMount(() => {
    loadPayments(debtId);
  });
</script>

<div class="space-y-3">
  <h3 class="text-sm font-semibold text-gray-900">
    Historique des {type === 'debt' ? 'versements' : 'remboursements'}
  </h3>

  {#if $payments.loading}
    <Spinner class="py-8" />

  {:else if $payments.list.length === 0}
    <EmptyState
      title="Aucun {type === 'debt' ? 'versement' : 'remboursement'}"
      description="Les {type === 'debt' ? 'versements' : 'remboursements'} apparaîtront ici."
      icon={Receipt}
    />

  {:else}
    {#each $payments.list as payment (payment.id)}
      <PaymentItem {payment} {currency} {type} {debtId} />
    {/each}
  {/if}
</div>