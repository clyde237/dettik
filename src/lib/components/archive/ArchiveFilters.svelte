<script>
	// ArchiveFilters component - Filtres archives
	export let filters = { type: '', dateRange: '' };
</script>

<div class="archive-filters">
	<div class="filter-group">
		<select bind:value={filters.type} on:change>
			<option value="">Tous les types</option>
			<option value="debt">Dettes</option>
			<option value="credit">Créances</option>
		</select>
	</div>

	<div class="filter-group">
		<input
			type="text"
			placeholder="Rechercher..."
			on:input
		/>
	</div>

	<slot />
</div>

<style>
	.archive-filters {
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
		.archive-filters {
			flex-direction: column;
		}

		.filter-group {
			min-width: auto;
		}
	}
</style>
