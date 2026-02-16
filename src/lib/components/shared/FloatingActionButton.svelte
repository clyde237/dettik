<script>
	// FloatingActionButton component - FAB (mobile)
	export let icon = '+';
	export let onClick = () => {};
</script>

<button class="fab" on:click={onClick} title="Ajouter">
	{icon}
</button>

<style>
	.fab {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--primary);
		color: white;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		transition: all 0.2s;
		display: none;
	}

	.fab:hover {
		transform: scale(1.1);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
	}

	.fab:active {
		transform: scale(0.95);
	}

	@media (max-width: 768px) {
		.fab {
			display: flex;
			align-items: center;
			justify-content: center;
			bottom: 5.5rem;
		}
	}
</style>
