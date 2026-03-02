<script>
  import Card from '$lib/components/ui/Card.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { exportToCSV } from '$lib/services/export.service';
  import { getDebts } from '$lib/services/debts.service';
  import { getCredits } from '$lib/services/credits.service';
  import { getArchives } from '$lib/services/archives.service';
  import { toastSuccess, toastError } from '$lib/stores/notifications';
  import { Database, Download, Trash2 } from '@lucide/svelte';

  let exportLoading = $state(false);
  let clearLoading = $state(false);

  async function handleExportAll() {
    exportLoading = true;
    try {
      const [debts, credits, archives] = await Promise.all([
        getDebts(),
        getCredits(),
        getArchives()
      ]);

      const allItems = [...debts, ...credits, ...archives];
      exportToCSV(allItems, 'all');
      toastSuccess('Export complet téléchargé');
    } catch (err) {
      toastError('Erreur lors de l\'export');
      console.error(err);
    } finally {
      exportLoading = false;
    }
  }

  function handleClearCache() {
    clearLoading = true;
    try {
      localStorage.clear();
      toastSuccess('Cache vidé. Rechargement...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toastError('Erreur lors du nettoyage');
    } finally {
      clearLoading = false;
    }
  }
</script>

<Card>
  <h3 class="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <Database size={18} />
    Données
  </h3>

  <div class="space-y-3">
    <!-- Export -->
    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p class="text-sm font-medium text-gray-900">Exporter toutes les données</p>
        <p class="text-xs text-gray-500 mt-0.5">Télécharger un fichier CSV complet</p>
      </div>
      <Button variant="outline" size="sm" onclick={handleExportAll} loading={exportLoading}>
        <Download size={14} />
        Exporter
      </Button>
    </div>

    <!-- Vider le cache -->
    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p class="text-sm font-medium text-gray-900">Vider le cache local</p>
        <p class="text-xs text-gray-500 mt-0.5">Supprime les données locales et recharge</p>
      </div>
      <Button variant="outline" size="sm" onclick={handleClearCache} loading={clearLoading}>
        <Trash2 size={14} />
        Vider
      </Button>
    </div>
  </div>
</Card>