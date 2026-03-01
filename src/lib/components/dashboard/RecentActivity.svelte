<script>
  import Card from '$lib/components/ui/Card.svelte';
  import Avatar from '$lib/components/ui/Avatar.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import { formatAmount } from '$lib/utils/currency';
  import { formatRelative } from '$lib/utils/date';
  import { Activity, ArrowRight } from '@lucide/svelte';

  /**
   * @type {{
   *   debts?: Array<import('$lib/services/debts.service').Debt>,
   *   credits?: Array<import('$lib/services/credits.service').Credit>,
   *   limit?: number
   * }}
   */
  let {
    debts = [],
    credits = [],
    limit = 5
  } = $props();

  /** @type {Array<{ id: string, name: string, amount: number, currency: string, date: string, type: 'debt' | 'credit' }>} */
  let recentItems = $derived(() => {
    const items = [];

    for (const debt of debts) {
      items.push({
        id: debt.id,
        name: debt.person?.name || 'Inconnu',
        amount: Number(debt.total_amount),
        currency: debt.currency,
        date: debt.created_at,
        type: /** @type {const} */ ('debt')
      });
    }

    for (const credit of credits) {
      items.push({
        id: credit.id,
        name: credit.person?.name || 'Inconnu',
        amount: Number(credit.total_amount),
        currency: credit.currency,
        date: credit.created_at,
        type: /** @type {const} */ ('credit')
      });
    }

    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  });

  let itemList = $derived(typeof recentItems === 'function' ? recentItems() : recentItems);
</script>

<Card>
  <div class="flex items-center gap-2 mb-4">
    <Activity size={18} class="text-gray-500" />
    <h3 class="text-sm font-semibold text-gray-900">Activité récente</h3>
  </div>

  {#if itemList.length === 0}
    <EmptyState
      title="Aucune activité"
      description="Vos dettes et créances récentes apparaîtront ici."
      icon={Activity}
    />
  {:else}
    <div class="space-y-2">
      {#each itemList as item}
        <a
          href="/{item.type === 'debt' ? 'debts' : 'credits'}/{item.id}"
          class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition -mx-1"
        >
          <div class="flex items-center gap-3 min-w-0">
            <Avatar name={item.name} size="sm" />
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{item.name}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <Badge variant={item.type === 'debt' ? 'danger' : 'success'} size="sm">
                  {item.type === 'debt' ? 'Dette' : 'Créance'}
                </Badge>
                <span class="text-xs text-gray-400">{formatRelative(item.date)}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="text-sm font-semibold {item.type === 'debt' ? 'text-red-600' : 'text-green-600'}">
              {formatAmount(item.amount, item.currency)}
            </span>
            <ArrowRight size={14} class="text-gray-300" />
          </div>
        </a>
      {/each}
    </div>
  {/if}
</Card>