<script>
	// ThemeToggle component
	export let isDark = false;

	function toggleTheme() {
		isDark = !isDark;
		// Update theme in DOM
	}
</script>

<div class="theme-toggle">
	<h3>Thème</h3>
	<button class={`toggle-btn ${isDark ? 'dark' : 'light'}`} on:click={toggleTheme}>
		<span class="toggle-icon">{isDark ? '🌙' : '☀️'}</span>
		<span class="toggle-label">{isDark ? 'Mode sombre' : 'Mode clair'}</span>
	</button>
</div>

<style>
	.theme-toggle {
		padding: 1.5rem;
		background: var(--bg-secondary);
		border-radius: 0.5rem;
		border: 1px solid var(--border-color);
	}

	h3 {
		margin: 0 0 1rem;
	}

	.toggle-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		background: var(--primary);
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
		transition: all 0.2s;
	}

	.toggle-btn:hover {
		opacity: 0.9;
	}

	.toggle-icon {
		font-size: 1.25rem;
	}

	.toggle-label {
		flex: 1;
		text-align: left;
	}
</style>
