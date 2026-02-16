<script>
	// Wrapper de page avec padding
</script>

<div class="page-container">
	<slot />
</div>

<style>
	.page-container {
		flex: 1;
		padding: 1.5rem;
		overflow-y: auto;
	}

	@media (max-width: 768px) {
		.page-container {
			padding: 1rem;
			padding-bottom: 5rem;
		}
	}
</style>
