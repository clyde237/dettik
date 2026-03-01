<script>
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
  import DateDisplay from '$lib/components/shared/DateDisplay.svelte';
  import AmountDisplay from '$lib/components/shared/AmountDisplay.svelte';
  import { PAYMENT_METHODS } from '$lib/utils/constants';
  import { removePayment } from '$lib/stores/payments';
  import { Trash2, Paperclip, ChevronDown, ChevronUp } from '@lucide/svelte';

  /**
   * @type {{
   *   payment: import('$lib/services/payments.service').Payment,
   *   currency?: string,
   *   type?: 'debt' | 'credit',
   *   debtId: string
   * }}
   */
  let {
    payment,
    currency = 'XAF',
    type = 'debt',
    debtId
  } = $props();

  let expanded = $state(false);
  let showDeleteDialog = $state(false);
  let deleteLoading = $state(false);

  let methodLabel = $derived(
    PAYMENT_METHODS.find((m) => m.value === payment.payment_method)?.label || payment.payment_method
  );

  let proofCount = $derived(payment.proofs?.length || 0);

  async function handleDelete() {
    deleteLoading = true;
    await removePayment(payment.id, debtId, type);
    deleteLoading = false;
    showDeleteDialog = false;
  }
</script>

<div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
  <!-- En-tête cliquable -->
  <button
    type="button"
    onclick={() => expanded = !expanded}
    class="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
        <AmountDisplay amount={Number(payment.amount)} {currency} size="sm" />
      </div>
      <div class="min-w-0">
        <p class="text-sm font-medium text-gray-900">
          <DateDisplay date={payment.payment_date} format="medium" />
        </p>
        <div class="flex items-center gap-2 mt-0.5">
          <Badge variant="default" size="sm">{methodLabel}</Badge>
          {#if proofCount > 0}
            <Badge variant="info" size="sm">
              <Paperclip size={10} />
              {proofCount}
            </Badge>
          {/if}
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-shrink-0">
      {#if expanded}
        <ChevronUp size={16} class="text-gray-400" />
      {:else}
        <ChevronDown size={16} class="text-gray-400" />
      {/if}
    </div>
  </button>

  <!-- Détails (expanded) -->
  {#if expanded}
    <div class="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
      <!-- Notes -->
      {#if payment.notes}
        <div>
          <p class="text-xs text-gray-500 mb-1">Notes</p>
          <p class="text-sm text-gray-700 bg-gray-50 rounded-lg p-2">{payment.notes}</p>
        </div>
      {/if}

      <!-- Preuves -->
      {#if proofCount > 0}
        <div>
          <p class="text-xs text-gray-500 mb-2">Preuves ({proofCount})</p>
          <div class="grid grid-cols-3 gap-2">
            {#each payment.proofs || [] as proof}
              {#if proof.file_type.startsWith('image/')}
                <a
                  href={proof.file_url}
                  target="_blank"
                  rel="noopener"
                  class="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-green-500 transition"
                >
                  <img
                    src={proof.file_url}
                    alt={proof.file_name}
                    class="w-full h-full object-cover"
                  />
                </a>
              {:else}
                <a
                  href={proof.file_url}
                  target="_blank"
                  rel="noopener"
                  class="aspect-square rounded-lg border border-gray-200 hover:border-green-500 transition flex flex-col items-center justify-center p-2"
                >
                  <Paperclip size={20} class="text-gray-400 mb-1" />
                  <span class="text-[10px] text-gray-500 truncate w-full text-center">
                    {proof.file_name}
                  </span>
                </a>
              {/if}
            {/each}
          </div>
        </div>
      {/if}

      <!-- Bouton supprimer -->
      <div class="flex justify-end pt-2">
        <Button variant="ghost" size="sm" onclick={() => showDeleteDialog = true}>
          <Trash2 size={14} class="text-red-500" />
          <span class="text-red-500">Supprimer</span>
        </Button>
      </div>
    </div>
  {/if}
</div>

<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Supprimer ce versement ?"
  message="Le montant sera réajouté au solde restant de la dette/créance."
  confirmLabel="Supprimer"
  variant="danger"
  loading={deleteLoading}
  onconfirm={handleDelete}
/>