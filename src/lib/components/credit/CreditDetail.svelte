<script>
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Avatar from '$lib/components/ui/Avatar.svelte';
  import ProgressBar from '$lib/components/shared/ProgressBar.svelte';
  import AmountDisplay from '$lib/components/shared/AmountDisplay.svelte';
  import DateDisplay from '$lib/components/shared/DateDisplay.svelte';
  import StatusBadge from '$lib/components/shared/StatusBadge.svelte';
  import ConfirmDialog from '$lib/components/ui/ConfirmDialog.svelte';
  import PaymentHistory from '$lib/components/payment/PaymentHistory.svelte';
  import { formatAmount } from '$lib/utils/currency';
  import { daysUntil } from '$lib/utils/date';
  import { removeCredit, archiveCreditStore } from '$lib/stores/credits';
  import { goto } from '$app/navigation';
  import {
    Pencil,
    Trash2,
    Archive,
    Plus,
    CalendarClock,
    Percent,
    FileText,
    Phone,
    Mail
  } from '@lucide/svelte';

  /**
   * @type {{
   *   credit: import('$lib/services/credits.service').Credit
   * }}
   */
  let { credit } = $props();

  let showDeleteDialog = $state(false);
  let showArchiveDialog = $state(false);
  let deleteLoading = $state(false);
  let archiveLoading = $state(false);

  let received = $derived(Number(credit.total_amount) - Number(credit.remaining_amount));
  let personName = $derived(credit.person?.name || 'Inconnu');
  let dueDays = $derived(credit.due_date ? daysUntil(credit.due_date) : null);

  let dueStatus = $derived(
    dueDays === null ? null :
    dueDays < 0 ? 'overdue' :
    dueDays <= 7 ? 'soon' :
    'ok'
  );

  async function handleDelete() {
    deleteLoading = true;
    const success = await removeCredit(credit.id);
    deleteLoading = false;
    if (success) {
      showDeleteDialog = false;
      goto('/credits');
    }
  }

  async function handleArchive() {
    archiveLoading = true;
    const success = await archiveCreditStore(credit.id);
    archiveLoading = false;
    if (success) {
      showArchiveDialog = false;
      goto('/credits');
    }
  }
</script>

<div class="space-y-6">
  <!-- En-tête -->
  <Card>
    <div class="flex items-start justify-between mb-4">
      <div class="flex items-center gap-4">
        <Avatar name={personName} size="lg" />
        <div>
          <h2 class="text-lg font-semibold text-gray-900">{personName}</h2>
          <div class="flex items-center gap-2 mt-1">
            <StatusBadge status={credit.status} />
            {#if dueStatus === 'overdue'}
              <Badge variant="danger" size="sm">
                <CalendarClock size={10} />
                En retard de {Math.abs(dueDays || 0)} jours
              </Badge>
            {:else if dueStatus === 'soon'}
              <Badge variant="warning" size="sm">
                <CalendarClock size={10} />
                Échéance dans {dueDays}j
              </Badge>
            {/if}
          </div>
        </div>
      </div>

      {#if credit.status === 'active'}
        <div class="flex items-center gap-2">
          <Button variant="ghost" size="sm" onclick={() => goto(`/credits/${credit.id}/edit`)}>
            <Pencil size={14} />
          </Button>
          <Button variant="ghost" size="sm" onclick={() => showArchiveDialog = true}>
            <Archive size={14} />
          </Button>
          <Button variant="ghost" size="sm" onclick={() => showDeleteDialog = true}>
            <Trash2 size={14} class="text-red-500" />
          </Button>
        </div>
      {/if}
    </div>

    <!-- Montants -->
    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="text-center p-3 bg-gray-50 rounded-lg">
        <p class="text-xs text-gray-500 mb-1">Montant prêté</p>
        <AmountDisplay amount={Number(credit.total_amount)} currency={credit.currency} size="sm" />
      </div>
      <div class="text-center p-3 bg-green-50 rounded-lg">
        <p class="text-xs text-gray-500 mb-1">Déjà reçu</p>
        <AmountDisplay amount={received} currency={credit.currency} size="sm" />
      </div>
      <div class="text-center p-3 bg-orange-50 rounded-lg">
        <p class="text-xs text-gray-500 mb-1">Reste à percevoir</p>
        <AmountDisplay amount={Number(credit.remaining_amount)} currency={credit.currency} size="sm" />
      </div>
    </div>

    <!-- Progression -->
    <ProgressBar value={received} max={Number(credit.total_amount)} />
  </Card>

  <!-- Informations -->
  <Card>
    <h3 class="text-sm font-semibold text-gray-900 mb-4">Informations</h3>

    <div class="space-y-3">
      <div class="flex items-center justify-between py-2 border-b border-gray-50">
        <span class="text-sm text-gray-500">Date du prêt</span>
        <DateDisplay date={credit.loan_date} class="text-sm font-medium text-gray-900" />
      </div>

      {#if credit.due_date}
        <div class="flex items-center justify-between py-2 border-b border-gray-50">
          <span class="text-sm text-gray-500">Remboursement attendu</span>
          <div class="flex items-center gap-2">
            <DateDisplay date={credit.due_date} class="text-sm font-medium text-gray-900" />
            {#if dueDays !== null}
              <span class="text-xs {dueDays < 0 ? 'text-red-500' : 'text-gray-400'}">
                ({dueDays < 0 ? `${Math.abs(dueDays)}j en retard` : `dans ${dueDays}j`})
              </span>
            {/if}
          </div>
        </div>
      {/if}

      {#if credit.interest_rate}
        <div class="flex items-center justify-between py-2 border-b border-gray-50">
          <span class="text-sm text-gray-500 flex items-center gap-1">
            <Percent size={14} />
            Taux d'intérêt
          </span>
          <span class="text-sm font-medium text-gray-900">{credit.interest_rate}%</span>
        </div>
      {/if}

      <div class="flex items-center justify-between py-2 border-b border-gray-50">
        <span class="text-sm text-gray-500">Devise</span>
        <span class="text-sm font-medium text-gray-900">{credit.currency}</span>
      </div>

      {#if credit.description}
        <div class="py-2">
          <span class="text-sm text-gray-500 flex items-center gap-1 mb-1">
            <FileText size={14} />
            Description
          </span>
          <p class="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
            {credit.description}
          </p>
        </div>
      {/if}
    </div>
  </Card>

  <!-- Contact -->
  {#if credit.person?.phone || credit.person?.email}
    <Card>
      <h3 class="text-sm font-semibold text-gray-900 mb-4">Contact</h3>

      <div class="space-y-3">
        {#if credit.person?.phone}
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Phone size={14} class="text-gray-500" />
            </div>
            <a href="tel:{credit.person.phone}" class="text-sm text-green-600 hover:underline">
              {credit.person.phone}
            </a>
          </div>
        {/if}

        {#if credit.person?.email}
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <Mail size={14} class="text-gray-500" />
            </div>
            <a href="mailto:{credit.person.email}" class="text-sm text-green-600 hover:underline">
              {credit.person.email}
            </a>
          </div>
        {/if}
      </div>
    </Card>
  {/if}

  <!-- Historique des remboursements -->
  <Card>
    <PaymentHistory debtId={credit.id} currency={credit.currency} type="credit" />
  </Card>

  <!-- Bouton ajouter remboursement -->
  {#if credit.status === 'active' && Number(credit.remaining_amount) > 0}
    <Button
      variant="primary"
      size="lg"
      class="w-full"
      onclick={() => goto(`/credits/${credit.id}/payment`)}
    >
      <Plus size={18} />
      Ajouter un remboursement
    </Button>
  {/if}
</div>

<!-- Dialogs -->
<ConfirmDialog
  bind:open={showDeleteDialog}
  title="Supprimer cette créance ?"
  message="Cette action est irréversible. La créance et tous ses remboursements seront supprimés définitivement."
  confirmLabel="Supprimer"
  variant="danger"
  loading={deleteLoading}
  onconfirm={handleDelete}
/>

<ConfirmDialog
  bind:open={showArchiveDialog}
  title="Archiver cette créance ?"
  message="La créance sera déplacée dans les archives. Vous pourrez la restaurer plus tard."
  confirmLabel="Archiver"
  variant="warning"
  loading={archiveLoading}
  onconfirm={handleArchive}
/>