<script>
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Avatar from '$lib/components/ui/Avatar.svelte';
  import { formatAmount } from '$lib/utils/currency';
  import { daysUntil, formatDate } from '$lib/utils/date';
  import { AlertTriangle, CalendarClock, ArrowRight } from '@lucide/svelte';

  /**
   * @type {{
   *   debts?: Array<import('$lib/services/debts.service').Debt>,
   *   credits?: Array<import('$lib/services/credits.service').Credit>
   * }}
   */
  let {
    debts = [],
    credits = []
  } = $props();

  /** @type {Array<{ id: string, name: string, amount: number, currency: string, due_date: string, type: 'debt' | 'credit', days: number }>} */
  let alerts = $derived(() => {
    const items = [];

    for (const debt of debts) {
      if (debt.due_date && Number(debt.remaining_amount) > 0) {
        const days = daysUntil(debt.due_date);
        if (days <= 7) {
          items.push({
            id: debt.id,
            name: debt.person?.name || 'Inconnu',
            amount: Number(debt.remaining_amount),
            currency: debt.currency,
            due_date: debt.due_date,
            type: /** @type {const} */ ('debt'),
            days
          });
        }
      }
    }

    for (const credit of credits) {
      if (credit.due_date && Number(credit.remaining_amount) > 0) {
        const days = daysUntil(credit.due_date);
        if (days <= 7) {
          items.push({
            id: credit.id,
            name: credit.person?.name || 'Inconnu',
            amount: Number(credit.remaining_amount),
            currency: credit.currency,
            due_date: credit.due_date,
            type: /** @type {const} */ ('credit'),
            days
          });
        }
      }
    }

    return items.sort((a, b) => a.days - b.days);
  });

  let alertList = $derived(typeof alerts === 'function' ? alerts() : alerts);
</script>

{#if alertList.length > 0}
  <Card>
    <div class="flex items-center gap-2 mb-4">
      <AlertTriangle size={18} class="text-yellow-500" />
      <h3 class="text-sm font-semibold text-gray-900">Échéances proches</h3>
      <Badge variant="warning" size="sm">{alertList.length}</Badge>
    </div>

    <div class="space-y-3">
      {#each alertList as alert}
        <a
          href="/{alert.type === 'debt' ? 'debts' : 'credits'}/{alert.id}"
          class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition -mx-1"
        >
          <div class="flex items-center gap-3 min-w-0">
            <Avatar name={alert.name} size="sm" />
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{alert.name}</p>
              <div class="flex items-center gap-2 mt-0.5">
                <Badge variant={alert.type === 'debt' ? 'danger' : 'success'} size="sm">
                  {alert.type === 'debt' ? 'Dette' : 'Créance'}
                </Badge>
                {#if alert.days < 0}
                  <Badge variant="danger" size="sm">
                    <CalendarClock size={10} />
                    {Math.abs(alert.days)}j en retard
                  </Badge>
                {:else if alert.days === 0}
                  <Badge variant="warning" size="sm">
                    <CalendarClock size={10} />
                    Aujourd'hui
                  </Badge>
                {:else}
                  <Badge variant="warning" size="sm">
                    <CalendarClock size={10} />
                    Dans {alert.days}j
                  </Badge>
                {/if}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-shrink-0">
            <span class="text-sm font-semibold text-gray-900">
              {formatAmount(alert.amount, alert.currency)}
            </span>
            <ArrowRight size={14} class="text-gray-300" />
          </div>
        </a>
      {/each}
    </div>
  </Card>
{/if}