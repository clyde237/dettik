<script>
  import { onMount } from 'svelte';
  import { setPageTitle } from '$lib/stores/ui';
  import { TrendingDown, TrendingUp, Wallet } from '@lucide/svelte';

  onMount(() => {
    setPageTitle('Tableau de bord', 'Vue d\'ensemble de vos finances');
  });
</script>

<!-- Contenu temporaire du dashboard — sera remplacé dans le Module 8 -->
<div class="space-y-6">
  <!-- Cartes résumé -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <!-- Total dettes -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
          <TrendingDown size={20} class="text-red-500" />
        </div>
        <p class="text-sm font-medium text-gray-500">Total dettes</p>
      </div>
      <p class="text-2xl font-bold text-gray-900">0 XAF</p>
    </div>

    <!-- Total créances -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
          <TrendingUp size={20} class="text-green-500" />
        </div>
        <p class="text-sm font-medium text-gray-500">Total créances</p>
      </div>
      <p class="text-2xl font-bold text-gray-900">0 XAF</p>
    </div>

    <!-- Solde net -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          <Wallet size={20} class="text-blue-500" />
        </div>
        <p class="text-sm font-medium text-gray-500">Solde net</p>
      </div>
      <p class="text-2xl font-bold text-gray-900">0 XAF</p>
    </div>
  </div>

  <!-- Sections temporaires -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Dettes récentes -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <h2 class="text-base font-semibold text-gray-900 mb-4">Dettes récentes</h2>
      <div class="flex flex-col items-center justify-center py-8 text-gray-400">
        <TrendingDown size={32} class="mb-2 opacity-50" />
        <p class="text-sm">Aucune dette enregistrée</p>
        <a href="/debts/new" class="mt-3 text-sm text-green-600 font-medium hover:underline">
          + Ajouter une dette
        </a>
      </div>
    </div>

    <!-- Créances récentes -->
    <div class="bg-white rounded-xl border border-gray-200 p-5">
      <h2 class="text-base font-semibold text-gray-900 mb-4">Créances récentes</h2>
      <div class="flex flex-col items-center justify-center py-8 text-gray-400">
        <TrendingUp size={32} class="mb-2 opacity-50" />
        <p class="text-sm">Aucune créance enregistrée</p>
        <a href="/credits/new" class="mt-3 text-sm text-green-600 font-medium hover:underline">
          + Ajouter une créance
        </a>
      </div>
    </div>
  </div>
</div>