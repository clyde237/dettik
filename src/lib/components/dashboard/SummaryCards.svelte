<script>
  import Card from '$lib/components/ui/Card.svelte';
  import AmountDisplay from '$lib/components/shared/AmountDisplay.svelte';
  import { TrendingDown, TrendingUp, Wallet } from '@lucide/svelte';

  /**
   * @type {{
   *   totalDebts: number,
   *   totalCredits: number,
   *   currency?: string
   * }}
   */
  let {
    totalDebts = 0,
    totalCredits = 0,
    currency = 'XAF'
  } = $props();

  let netBalance = $derived(totalCredits - totalDebts);

  let netStatus = $derived(
    netBalance > 0 ? 'positive' :
    netBalance < 0 ? 'negative' :
    'neutral'
  );
</script>

<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
  <!-- Total dettes -->
  <Card class="hover:shadow-md transition">
    <div class="flex items-center gap-3 mb-3">
      <div class="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
        <TrendingDown size={20} class="text-red-500" />
      </div>
      <p class="text-sm font-medium text-gray-500">Je dois</p>
    </div>
    <AmountDisplay amount={totalDebts} {currency} size="lg" />
  </Card>

  <!-- Total créances -->
  <Card class="hover:shadow-md transition">
    <div class="flex items-center gap-3 mb-3">
      <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
        <TrendingUp size={20} class="text-green-500" />
      </div>
      <p class="text-sm font-medium text-gray-500">On me doit</p>
    </div>
    <AmountDisplay amount={totalCredits} {currency} size="lg" />
  </Card>

  <!-- Solde net -->
  <Card class="hover:shadow-md transition">
    <div class="flex items-center gap-3 mb-3">
      <div class="w-10 h-10 rounded-lg flex items-center justify-center
        {netStatus === 'positive' ? 'bg-green-50' : netStatus === 'negative' ? 'bg-red-50' : 'bg-gray-50'}">
        <Wallet size={20} class="{netStatus === 'positive' ? 'text-green-500' : netStatus === 'negative' ? 'text-red-500' : 'text-gray-500'}" />
      </div>
      <p class="text-sm font-medium text-gray-500">Solde net</p>
    </div>
    <AmountDisplay amount={netBalance} {currency} size="lg" colored />
  </Card>
</div>