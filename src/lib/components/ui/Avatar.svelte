<script>
	// Avatar component
	export let src = '';
	export let name = '';
	export let size = 'md';
</script>

<div class={`avatar avatar-${size}`}>
	{#if src}
		<img {src} alt={name} />
	{:else}
		<span>{name.charAt(0).toUpperCase()}</span>
	{/if}
</div>

<style>
	.avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--primary);
		color: white;
		font-weight: 600;
	}

	.avatar-sm {
		width: 32px;
		height: 32px;
		font-size: 0.875rem;
	}

	.avatar-md {
		width: 40px;
		height: 40px;
		font-size: 1rem;
	}

	.avatar-lg {
		width: 56px;
		height: 56px;
		font-size: 1.25rem;
	}

	img {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		object-fit: cover;
	}
</style>
