<script>
  import { onMount } from 'svelte';
  import { setPageTitle } from '$lib/stores/ui';
  import Card from '$lib/components/ui/Card.svelte';
  import DebtForm from '$lib/components/debt/DebtForm.svelte';

  onMount(() => {
    setPageTitle('Nouvelle dette', 'Enregistrer un emprunt');
  });
</script>

<Card>
  <DebtForm mode="create" />
</Card>