<script>
	// Navigation basse (mobile)
</script>

<nav class="bottom-nav">
	<slot />
</nav>

<style>
	.bottom-nav {
		display: none;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: var(--bg-secondary);
		border-top: 1px solid var(--border-color);
	}

	@media (max-width: 768px) {
		.bottom-nav {
			display: flex;
		}
	}
</style>
