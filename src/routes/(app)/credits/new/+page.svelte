<script>
  import { onMount } from 'svelte';
  import { setPageTitle } from '$lib/stores/ui';
  import Card from '$lib/components/ui/Card.svelte';
  import CreditForm from '$lib/components/credit/CreditForm.svelte';

  onMount(() => {
    setPageTitle('Nouvelle créance', 'Enregistrer un prêt');
  });
</script>

<Card>
  <CreditForm mode="create" />
</Card>