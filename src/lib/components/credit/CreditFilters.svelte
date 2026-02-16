<script>
	// CreditFilters component - Barre de filtres/tri
	export let filters = { status: '', search: '' };
</script>

<div class="credit-filters">
	<div class="filter-group">
		<input
			type="text"
			placeholder="Rechercher..."
			bind:value={filters.search}
			on:input
		/>
	</div>

	<div class="filter-group">
		<select bind:value={filters.status} on:change>
			<option value="">Tous les statuts</option>
			<option value="active">En cours</option>
			<option value="received">Reçues</option>
			<option value="overdue">En retard</option>
		</select>
	</div>

	<slot />
</div>

<style>
	.credit-filters {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: 0.5rem;
		flex-wrap: wrap;
	}

	.filter-group {
		flex: 1;
		min-width: 200px;
	}

	input,
	select {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: 0.375rem;
	}

	@media (max-width: 768px) {
		.credit-filters {
			flex-direction: column;
		}

		.filter-group {
			min-width: auto;
		}
	}
</style>
