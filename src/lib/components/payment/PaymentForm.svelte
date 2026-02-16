<script>
	// PaymentForm component - Formulaire ajout versement
	export let payment = { amount: '', date: '', method: '' };

	let isSubmitting = false;

	async function handleSubmit() {
		isSubmitting = true;
		try {
			// Form submission logic here
		} finally {
			isSubmitting = false;
		}
	}
</script>

<form on:submit|preventDefault={handleSubmit}>
	<div class="form-group">
		<label for="amount">Montant</label>
		<input type="number" id="amount" bind:value={payment.amount} step="0.01" required />
	</div>

	<div class="form-group">
		<label for="date">Date</label>
		<input type="date" id="date" bind:value={payment.date} required />
	</div>

	<div class="form-group">
		<label for="method">Méthode</label>
		<select id="method" bind:value={payment.method} required>
			<option value="">-- Sélectionner --</option>
			<option value="cash">Espèces</option>
			<option value="card">Carte</option>
			<option value="transfer">Virement</option>
			<option value="check">Chèque</option>
		</select>
	</div>

	<button type="submit" disabled={isSubmitting}>
		{isSubmitting ? 'Enregistrement...' : 'Enregistrer le versement'}
	</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
	}

	label {
		margin-bottom: 0.25rem;
		font-weight: 500;
	}

	input,
	select {
		padding: 0.5rem;
		border: 1px solid var(--border-color);
		border-radius: 0.375rem;
	}

	button {
		padding: 0.75rem;
		background: var(--primary);
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-weight: 500;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
