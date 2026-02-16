<script>
	// AboutSection component
</script>

<div class="about-section">
	<h2>À propos</h2>
	<div class="info">
		<div class="info-item">
			<h3>Version</h3>
			<p>1.0.0</p>
		</div>

		<div class="info-item">
			<h3>Contact</h3>
			<p>support@dettik.app</p>
		</div>

		<div class="info-item">
			<h3>Licence</h3>
			<p>MIT License</p>
		</div>

		<div class="info-item">
			<h3>Liens utiles</h3>
			<ul>
				<li><a href="#/">Conditions d'utilisation</a></li>
				<li><a href="#/">Politique de confidentialité</a></li>
				<li><a href="#/">Nous contacter</a></li>
			</ul>
		</div>
	</div>
</div>

<style>
	.about-section {
		padding: 1.5rem;
		background: var(--bg-secondary);
		border-radius: 0.5rem;
		border: 1px solid var(--border-color);
	}

	h2 {
		margin: 0 0 1.5rem;
	}

	h3 {
		margin: 0 0 0.5rem;
		font-size: 1rem;
	}

	.info {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 2rem;
	}

	.info-item {
		padding: 1rem;
		background: var(--bg-primary);
		border-radius: 0.375rem;
	}

	.info-item p {
		margin: 0;
		color: var(--text-secondary);
	}

	.info-item ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	.info-item li {
		margin: 0.5rem 0;
	}

	a {
		color: var(--primary);
		text-decoration: none;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
