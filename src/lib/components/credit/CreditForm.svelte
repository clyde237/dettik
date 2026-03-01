<script>
  import { goto } from '$app/navigation';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import PersonAutocomplete from '$lib/components/person/PersonAutocomplete.svelte';
  import { debtSchema, extractErrors } from '$lib/utils/validators';
  import { addCredit, editCredit } from '$lib/stores/credits';
  import { CURRENCIES } from '$lib/utils/constants';
  import { today } from '$lib/utils/date';
  import { Save, ArrowLeft } from '@lucide/svelte';

  /**
   * @type {{
   *   mode?: 'create' | 'edit',
   *   credit?: import('$lib/services/credits.service').Credit | null
   * }}
   */
  let {
    mode = 'create',
    credit = null
  } = $props();

  /** @type {import('$lib/stores/persons').Person | null} */
  let selectedPerson = $state(credit?.person || null);
  let total_amount = $state(credit ? Number(credit.total_amount) : 0);
  let currency = $state(credit?.currency || 'XAF');
  let description = $state(credit?.description || '');
  let loan_date = $state(credit?.loan_date || today());
  let due_date = $state(credit?.due_date || '');
  let interest_rate = $state(credit?.interest_rate ? Number(credit.interest_rate) : 0);
  let loading = $state(false);

  /** @type {Record<string, string>} */
  let errors = $state({});
  let personError = $state('');

  const currencyOptions = CURRENCIES.map((c) => ({
    value: c.code,
    label: c.label
  }));

  /**
   * @param {Event} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    errors = {};
    personError = '';

    if (!selectedPerson) {
      personError = 'Veuillez sélectionner une personne';
      return;
    }

    const formData = {
      type: /** @type {const} */ ('credit'),
      total_amount: Number(total_amount) || 0,
      currency,
      description,
      loan_date,
      due_date,
      interest_rate: Number(interest_rate) || 0
    };

    const result = debtSchema.safeParse(formData);
    if (!result.success) {
      errors = extractErrors(result.error);
      return;
    }

    loading = true;
    try {
      if (mode === 'edit' && credit) {
        const updated = await editCredit(credit.id, {
          person_id: selectedPerson.id,
          total_amount: formData.total_amount,
          currency: formData.currency,
          description: formData.description,
          loan_date: formData.loan_date,
          due_date: formData.due_date,
          interest_rate: formData.interest_rate
        });

        if (updated) {
          goto(`/credits/${credit.id}`);
        }
      } else {
        const newCredit = await addCredit({
          person_id: selectedPerson.id,
          total_amount: formData.total_amount,
          currency: formData.currency,
          description: formData.description,
          loan_date: formData.loan_date,
          due_date: formData.due_date,
          interest_rate: formData.interest_rate
        });

        if (newCredit) {
          goto('/credits');
        }
      }
    } finally {
      loading = false;
    }
  }
</script>

<form onsubmit={handleSubmit} class="space-y-6">
  <!-- Personne -->
  <PersonAutocomplete
    bind:value={selectedPerson}
    label="Débiteur (qui vous doit)"
    error={personError}
    required
  />

  <!-- Montant + Devise -->
  <div class="grid grid-cols-3 gap-3">
    <div class="col-span-2">
      <Input
        label="Montant prêté"
        type="number"
        bind:value={total_amount}
        placeholder="0"
        error={errors.total_amount}
        required
      />
    </div>
    <Select
      label="Devise"
      bind:value={currency}
      options={currencyOptions}
    />
  </div>

  <!-- Date du prêt -->
  <Input
    label="Date du prêt"
    type="date"
    bind:value={loan_date}
    error={errors.loan_date}
    required
  />

  <!-- Date de remboursement attendue -->
  <Input
    label="Date de remboursement attendue (optionnel)"
    type="date"
    bind:value={due_date}
    error={errors.due_date}
  />

  <!-- Taux d'intérêt -->
  <Input
    label="Taux d'intérêt % (optionnel)"
    type="number"
    bind:value={interest_rate}
    placeholder="0"
    error={errors.interest_rate}
  />

  <!-- Description -->
  <Textarea
    label="Description (optionnel)"
    bind:value={description}
    placeholder="Raison du prêt, conditions, etc."
    error={errors.description}
    rows={3}
  />

  <!-- Actions -->
  <div class="flex items-center justify-between pt-4 border-t border-gray-100">
    <Button variant="ghost" onclick={() => history.back()}>
      <ArrowLeft size={16} />
      Retour
    </Button>

    <Button type="submit" {loading}>
      <Save size={16} />
      {mode === 'edit' ? 'Enregistrer' : 'Ajouter la créance'}
    </Button>
  </div>
</form>