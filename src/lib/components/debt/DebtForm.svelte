<script>
  import { goto } from '$app/navigation';
  import Input from '$lib/components/ui/Input.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import Textarea from '$lib/components/ui/Textarea.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import PersonAutocomplete from '$lib/components/person/PersonAutocomplete.svelte';
  import { debtSchema, extractErrors } from '$lib/utils/validators';
  import { addDebt, editDebt } from '$lib/stores/debts';
  import { CURRENCIES } from '$lib/utils/constants';
  import { today } from '$lib/utils/date';
  import { Save, ArrowLeft } from '@lucide/svelte';

  /**
   * @type {{
   *   mode?: 'create' | 'edit',
   *   debt?: import('$lib/services/debts.service').Debt | null
   * }}
   */
  let {
    mode = 'create',
    debt = null
  } = $props();

  /** @type {import('$lib/stores/persons').Person | null} */
  let selectedPerson = $state(debt?.person || null);
  let total_amount = $state(debt ? Number(debt.total_amount) : 0);
  let currency = $state(debt?.currency || 'XAF');
  let description = $state(debt?.description || '');
  let loan_date = $state(debt?.loan_date || today());
  let due_date = $state(debt?.due_date || '');
  let interest_rate = $state(debt?.interest_rate ? Number(debt.interest_rate) : 0);
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
      type: /** @type {const} */ ('debt'),
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
      if (mode === 'edit' && debt) {
        const updated = await editDebt(debt.id, {
          person_id: selectedPerson.id,
          total_amount: formData.total_amount,
          currency: formData.currency,
          description: formData.description,
          loan_date: formData.loan_date,
          due_date: formData.due_date,
          interest_rate: formData.interest_rate
        });

        if (updated) {
          goto(`/debts/${debt.id}`);
        }
      } else {
        const newDebt = await addDebt({
          person_id: selectedPerson.id,
          type: 'debt',
          total_amount: formData.total_amount,
          currency: formData.currency,
          description: formData.description,
          loan_date: formData.loan_date,
          due_date: formData.due_date,
          interest_rate: formData.interest_rate
        });

        if (newDebt) {
          goto('/debts');
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
    label="Créancier (à qui vous devez)"
    error={personError}
    required
  />

  <!-- Montant + Devise -->
  <div class="grid grid-cols-3 gap-3">
    <div class="col-span-2">
      <Input
        label="Montant"
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

  <!-- Date d'emprunt -->
  <Input
    label="Date de l'emprunt"
    type="date"
    bind:value={loan_date}
    error={errors.loan_date}
    required
  />

  <!-- Date d'échéance -->
  <Input
    label="Date d'échéance (optionnel)"
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
    placeholder="Raison de l'emprunt, conditions, etc."
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
      {mode === 'edit' ? 'Enregistrer' : 'Ajouter la dette'}
    </Button>
  </div>
</form>