<script>
  import Card from '$lib/components/ui/Card.svelte';
  import { formatAmount } from '$lib/utils/currency';
  import { TrendingDown, TrendingUp } from '@lucide/svelte';

  /**
   * @type {{
   *   debtCount: number,
   *   creditCount: number,
   *   debtPaid: number,
   *   debtTotal: number,
   *   creditReceived: number,
   *   creditTotal: number,
   *   currency?: string
   * }}
   */
  let {
    debtCount = 0,
    creditCount = 0,
    debtPaid = 0,
    debtTotal = 0,
    creditReceived = 0,
    creditTotal = 0,
    currency = 'XAF'
  } = $props();

  let debtProgress = $derived(debtTotal > 0 ? Math.round((debtPaid / debtTotal) * 100) : 0);
  let creditProgress = $derived(creditTotal > 0 ? Math.round((creditReceived / creditTotal) * 100) : 0);
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <!-- Résumé dettes -->
  <Card>
    <div class="flex items-center gap-2 mb-4">
      <TrendingDown size={18} class="text-red-500" />
      <h3 class="text-sm font-semibold text-gray-900">Mes dettes</h3>
      {#if debtCount > 0}
        <span class="text-xs text-gray-400">({debtCount})</span>
      {/if}
    </div>

    {#if debtCount === 0}
      <p class="text-sm text-gray-400">Aucune dette active</p>
    {:else}
      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Remboursé</span>
          <span class="font-medium text-gray-900">{formatAmount(debtPaid, currency)}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="h-full rounded-full bg-red-400 transition-all duration-500"
            style="width: {debtProgress}%"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-400">
          <span>{debtProgress}% remboursé</span>
          <span>Total : {formatAmount(debtTotal, currency)}</span>
        </div>
      </div>
    {/if}

    <a href="/debts" class="block mt-4 text-sm text-green-600 font-medium hover:underline">
      Voir les dettes →
    </a>
  </Card>

  <!-- Résumé créances -->
  <Card>
    <div class="flex items-center gap-2 mb-4">
      <TrendingUp size={18} class="text-green-500" />
      <h3 class="text-sm font-semibold text-gray-900">Mes créances</h3>
      {#if creditCount > 0}
        <span class="text-xs text-gray-400">({creditCount})</span>
      {/if}
    </div>

    {#if creditCount === 0}
      <p class="text-sm text-gray-400">Aucune créance active</p>
    {:else}
      <div class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-gray-500">Reçu</span>
          <span class="font-medium text-gray-900">{formatAmount(creditReceived, currency)}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="h-full rounded-full bg-green-400 transition-all duration-500"
            style="width: {creditProgress}%"
          ></div>
        </div>
        <div class="flex justify-between text-xs text-gray-400">
          <span>{creditProgress}% perçu</span>
          <span>Total : {formatAmount(creditTotal, currency)}</span>
        </div>
      </div>
    {/if}

    <a href="/credits" class="block mt-4 text-sm text-green-600 font-medium hover:underline">
      Voir les créances →
    </a>
  </Card>
</div>