<script>
  import Card from '$lib/components/ui/Card.svelte';
  import Select from '$lib/components/ui/Select.svelte';
  import { settings, updateSettings } from '$lib/stores/settings';
  import { CURRENCIES } from '$lib/utils/constants';
  import { Globe, Coins } from '@lucide/svelte';

  const currencyOptions = CURRENCIES.map((c) => ({
    value: c.code,
    label: c.label
  }));

  const languageOptions = [
    { value: 'fr', label: 'Français' }
  ];

  /**
   * @param {Event} e
   */
  function handleCurrencyChange(e) {
    const target = /** @type {HTMLSelectElement} */ (e.target);
    updateSettings({ currency: target.value });
  }

  /**
   * @param {Event} e
   */
  function handleLanguageChange(e) {
    const target = /** @type {HTMLSelectElement} */ (e.target);
    updateSettings({ language: target.value });
  }
</script>

<Card>
  <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <Coins size={18} />
    Général
  </h3>

  <div class="space-y-4">
    <Select
      label="Devise par défaut"
      value={$settings.currency}
      options={currencyOptions}
      onchange={handleCurrencyChange}
    />

    <Select
      label="Langue"
      value={$settings.language}
      options={languageOptions}
      onchange={handleLanguageChange}
    />
  </div>
</Card>