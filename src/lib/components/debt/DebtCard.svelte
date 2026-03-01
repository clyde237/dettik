<script>
  import Avatar from '$lib/components/ui/Avatar.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import ProgressBar from '$lib/components/shared/ProgressBar.svelte';
  import { formatAmount } from '$lib/utils/currency';
  import { formatRelative, daysUntil } from '$lib/utils/date';
  import { CalendarClock, ArrowRight } from '@lucide/svelte';

  /**
   * @type {{
   *   debt: import('$lib/services/debts.service').Debt,
   *   class?: string
   * }}
   */
  let {
    debt,
    class: className = ''
  } = $props();

  let paid = $derived(Number(debt.total_amount) - Number(debt.remaining_amount));
  let personName = $derived(debt.person?.name || 'Inconnu');

  let dueDays = $derived(debt.due_date ? daysUntil(debt.due_date) : null);

  let dueStatus = $derived(
    dueDays === null ? null :
    dueDays < 0 ? 'overdue' :
    dueDays <= 7 ? 'soon' :
    'ok'
  );
</script>

<a
  href="/debts/{debt.id}"
  class="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition {className}"
>
  <!-- En-tête : personne + montant -->
  <div class="flex items-start justify-between mb-3">
    <div class="flex items-center gap-3 min-w-0">
      <Avatar name={personName} size="md" />
      <div class="min-w-0">
        <p class="text-sm font-semibold text-gray-900 truncate">{personName}</p>
        {#if debt.description}
          <p class="text-xs text-gray-500 truncate">{debt.description}</p>
        {/if}
      </div>
    </div>

    <div class="text-right flex-shrink-0 ml-3">
      <p class="text-sm font-bold text-gray-900">
        {formatAmount(Number(debt.remaining_amount), debt.currency)}
      </p>
      <p class="text-xs text-gray-400">
        sur {formatAmount(Number(debt.total_amount), debt.currency)}
      </p>
    </div>
  </div>

  <!-- Barre de progression -->
  <ProgressBar
    value={paid}
    max={Number(debt.total_amount)}
    size="sm"
    showLabel={false}
    class="mb-3"
  />

  <!-- Footer : date + échéance -->
  <div class="flex items-center justify-between">
    <span class="text-xs text-gray-400">
      {formatRelative(debt.loan_date)}
    </span>

    <div class="flex items-center gap-2">
      {#if dueStatus === 'overdue'}
        <Badge variant="danger" size="sm">
          <CalendarClock size={10} />
          En retard
        </Badge>
      {:else if dueStatus === 'soon'}
        <Badge variant="warning" size="sm">
          <CalendarClock size={10} />
          {dueDays === 0 ? "Aujourd'hui" : `${dueDays}j`}
        </Badge>
      {:else if debt.due_date}
        <Badge variant="default" size="sm">
          <CalendarClock size={10} />
          {dueDays}j
        </Badge>
      {/if}

      <ArrowRight size={14} class="text-gray-300" />
    </div>
  </div>
</a>