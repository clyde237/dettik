<script>
	// CreditForm component - Formulaire création/édition
	export let credit = { title: '', amount: '', dueDate: '', person: '' };

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
		<label for="title">Titre</label>
		<input type="text" id="title" bind:value={credit.title} required />
	</div>

	<div class="form-group">
		<label for="amount">Montant</label>
		<input type="number" id="amount" bind:value={credit.amount} step="0.01" required />
	</div>

	<div class="form-group">
		<label for="dueDate">Échéance</label>
		<input type="date" id="dueDate" bind:value={credit.dueDate} required />
	</div>

	<div class="form-group">
		<label for="person">Personne</label>
		<input type="text" id="person" bind:value={credit.person} required />
	</div>

	<button type="submit" disabled={isSubmitting}>
		{isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
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

	input {
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
