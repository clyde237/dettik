<script>
  import Select from '$lib/components/ui/Select.svelte';
  import { PAYMENT_METHODS } from '$lib/utils/constants';

  /**
   * @type {{
   *   value?: string,
   *   error?: string,
   *   required?: boolean,
   *   class?: string
   * }}
   */
  let {
    value = $bindable(''),
    error = '',
    required = false,
    class: className = ''
  } = $props();
</script>

<Select
  label="Méthode de paiement"
  bind:value
  options={PAYMENT_METHODS}
  placeholder="Choisir une méthode..."
  {error}
  {required}
  class={className}
/>