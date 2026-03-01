<script>
  import Avatar from '$lib/components/ui/Avatar.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import ProgressBar from '$lib/components/shared/ProgressBar.svelte';
  import { formatAmount } from '$lib/utils/currency';
  import { formatRelative, daysUntil } from '$lib/utils/date';
  import { CalendarClock, ArrowRight } from '@lucide/svelte';

  /**
   * @type {{
   *   credit: import('$lib/services/credits.service').Credit,
   *   class?: string
   * }}
   */
  let {
    credit,
    class: className = ''
  } = $props();

  let received = $derived(Number(credit.total_amount) - Number(credit.remaining_amount));
  let personName = $derived(credit.person?.name || 'Inconnu');
  let dueDays = $derived(credit.due_date ? daysUntil(credit.due_date) : null);

  let dueStatus = $derived(
    dueDays === null ? null :
    dueDays < 0 ? 'overdue' :
    dueDays <= 7 ? 'soon' :
    'ok'
  );
</script>

<a
  href="/credits/{credit.id}"
  class="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-gray-300 transition {className}"
>
  <!-- En-tête -->
  <div class="flex items-start justify-between mb-3">
    <div class="flex items-center gap-3 min-w-0">
      <Avatar name={personName} size="md" />
      <div class="min-w-0">
        <p class="text-sm font-semibold text-gray-900 truncate">{personName}</p>
        {#if credit.description}
          <p class="text-xs text-gray-500 truncate">{credit.description}</p>
        {/if}
      </div>
    </div>

    <div class="text-right flex-shrink-0 ml-3">
      <p class="text-sm font-bold text-green-600">
        {formatAmount(Number(credit.remaining_amount), credit.currency)}
      </p>
      <p class="text-xs text-gray-400">
        sur {formatAmount(Number(credit.total_amount), credit.currency)}
      </p>
    </div>
  </div>

  <!-- Progression -->
  <ProgressBar
    value={received}
    max={Number(credit.total_amount)}
    size="sm"
    showLabel={false}
    class="mb-3"
  />

  <!-- Footer -->
  <div class="flex items-center justify-between">
    <span class="text-xs text-gray-400">
      {formatRelative(credit.loan_date)}
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
      {:else if credit.due_date}
        <Badge variant="default" size="sm">
          <CalendarClock size={10} />
          {dueDays}j
        </Badge>
      {/if}

      <ArrowRight size={14} class="text-gray-300" />
    </div>
  </div>
</a>