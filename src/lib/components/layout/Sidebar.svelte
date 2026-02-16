<script>
	// Navigation latérale (desktop)
</script>

<aside class="sidebar">
	<slot />
</aside>

<style>
	.sidebar {
		width: 260px;
		background: var(--bg-secondary);
	}

	@media (max-width: 768px) {
		.sidebar {
			display: none;
		}
	}
</style>
