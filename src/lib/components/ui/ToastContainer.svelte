<script>
	// ToastContainer component
</script>

<div class="toast-container">
	<slot />
</div>

<style>
	.toast-container {
		position: fixed;
		bottom: 1.5rem;
		right: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		z-index: 999;
		pointer-events: none;
	}

	:global(.toast-container > *) {
		pointer-events: auto;
	}
</style>
