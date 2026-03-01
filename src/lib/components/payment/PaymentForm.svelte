<script>
  import { goto } from '$app/navigation';
  import Input from '$lib/components/ui/Input.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import PaymentMethodSelect from './PaymentMethodSelect.svelte';
  import ProofUploader from '$lib/components/proof/ProofUploader.svelte';
  import AmountDisplay from '$lib/components/shared/AmountDisplay.svelte';
  import { paymentSchema, extractErrors } from '$lib/utils/validators';
  import { addPayment } from '$lib/stores/payments';
  import { today } from '$lib/utils/date';
  import { formatAmount } from '$lib/utils/currency';
  import { Save, ArrowLeft } from '@lucide/svelte';

  /**
   * @type {{
   *   debtId: string,
   *   type: 'debt' | 'credit',
   *   currency?: string,
   *   remainingAmount: number,
   *   backUrl: string
   * }}
   */
  let {
    debtId,
    type,
    currency = 'XAF',
    remainingAmount,
    backUrl
  } = $props();

  let amount = $state(0);
  let payment_date = $state(today());
  let payment_method = $state('');
  let notes = $state('');
  let loading = $state(false);

  /** @type {File[]} */
  let proofFiles = $state([]);

  /** @type {Record<string, string>} */
  let errors = $state({});

  /**
   * @param {Event} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    errors = {};

    const formData = {
      amount: Number(amount) || 0,
      payment_date,
      payment_method,
      notes
    };

    const result = paymentSchema.safeParse(formData);
    if (!result.success) {
      errors = extractErrors(result.error);
      return;
    }

    // Vérifier que le montant ne dépasse pas le restant
    if (formData.amount > remainingAmount) {
      errors.amount = `Le montant ne peut pas dépasser ${formatAmount(remainingAmount, currency)}`;
      return;
    }

    loading = true;
    try {
      const payment = await addPayment(
        {
          debt_id: debtId,
          amount: formData.amount,
          payment_date: formData.payment_date,
          payment_method: formData.payment_method,
          notes: formData.notes,
          type
        },
        proofFiles
      );

      if (payment) {
        goto(backUrl);
      }
    } finally {
      loading = false;
    }
  }

  function fillMax() {
    amount = remainingAmount;
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <!-- Info restant -->
  <div class="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
    <span class="text-sm text-gray-600">
      {type === 'debt' ? 'Reste à payer' : 'Reste à percevoir'}
    </span>
    <AmountDisplay amount={remainingAmount} {currency} size="md" />
  </div>

  <!-- Montant -->
  <div>
    <div class="flex items-end gap-3">
      <div class="flex-1">
        <Input
          label="Montant du {type === 'debt' ? 'versement' : 'remboursement'}"
          type="number"
          bind:value={amount}
          placeholder="0"
          error={errors.amount}
          required
        />
      </div>
      <Button variant="outline" size="sm" onclick={fillMax} class="mb-0.5">
        Max
      </Button>
    </div>
  </div>

  <!-- Date -->
  <Input
    label="Date du {type === 'debt' ? 'versement' : 'remboursement'}"
    type="date"
    bind:value={payment_date}
    error={errors.payment_date}
    required
  />

  <!-- Méthode de paiement -->
  <PaymentMethodSelect
    bind:value={payment_method}
    error={errors.payment_method}
    required
  />

  <!-- Notes -->
  <Textarea
    label="Notes (optionnel)"
    bind:value={notes}
    placeholder="Informations complémentaires..."
    error={errors.notes}
    rows={2}
  />

  <!-- Preuves -->
  <ProofUploader bind:files={proofFiles} />

  <!-- Actions -->
  <div class="flex items-center justify-between pt-4 border-t border-gray-100">
    <Button variant="ghost" onclick={() => history.back()}>
      <ArrowLeft size={16} />
      Retour
    </Button>

    <Button type="submit" {loading}>
      <Save size={16} />
      Enregistrer
    </Button>
  </div>
</form>