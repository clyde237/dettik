<script>
	import { onMount } from 'svelte';
	import { setPageTitle } from '$lib/stores/ui';
	import { initSettings } from '$lib/stores/settings';
	import ProfileSection from '$lib/components/settings/ProfileSection.svelte';
	import GeneralSettings from '$lib/components/settings/GeneralSettings.svelte';
	import ThemeToggle from '$lib/components/settings/ThemeToggle.svelte';
	import SecuritySettings from '$lib/components/settings/SecuritySettings.svelte';
	import DataSettings from '$lib/components/settings/DataSettings.svelte';
	import AboutSection from '$lib/components/settings/AboutSection.svelte';
	import LogoutSection from '$lib/components/settings/LogoutSection.svelte';

	import SyncStatus from '$lib/components/sync/SyncStatus.svelte';
	import { syncState } from '$lib/stores/sync.js';
	import { triggerSync } from '$lib/sync/engine.js';
	import Card from '$lib/components/ui/Card.svelte';
	import { RefreshCw, Database } from '@lucide/svelte';

	onMount(() => {
		setPageTitle('Paramètres', "Configuration de l'application");
		initSettings();
	});
</script>

<div class="max-w-2xl space-y-6">
	<ProfileSection />
	<GeneralSettings />
	<ThemeToggle />
	<SecuritySettings />
	<DataSettings />

	<Card>
		<div class="mb-4 flex items-center gap-3">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
				<Database size={20} class="text-blue-500" />
			</div>
			<div>
				<h3 class="text-sm font-semibold text-gray-900">Synchronisation</h3>
				<p class="text-xs text-gray-500">Données locales et serveur</p>
			</div>
		</div>

		<div class="space-y-3">
			<div class="flex items-center justify-between">
				<span class="text-sm text-gray-600">Statut</span>
				<SyncStatus />
			</div>

			{#if $syncState.pendingCount > 0}
				<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-700">
					{$syncState.pendingCount} modification{$syncState.pendingCount > 1 ? 's' : ''} en attente de
					synchronisation
				</div>
			{/if}

			{#if $syncState.error}
				<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
					{$syncState.error}
				</div>
			{/if}
		</div>
	</Card>

	<LogoutSection />
	<AboutSection />
</div>
