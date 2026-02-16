<script>
  import { forgotPasswordSchema, extractErrors } from '$lib/utils/validators';
  import { forgotPassword } from '$lib/services/auth.service';
  import { Mail, ArrowLeft, Loader2, Send } from '@lucide/svelte';

  let email = $state('');
  let loading = $state(false);
  let success = $state(false);

  /** @type {Record<string, string>} */
  let errors = $state({});
  let globalError = $state('');

  /**
   * @param {Event} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    errors = {};
    globalError = '';

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      errors = extractErrors(result.error);
      return;
    }

    loading = true;
    try {
      await forgotPassword(email);
      success = true;
    } catch (err) {
      globalError = err instanceof Error ? err.message : 'Erreur lors de l\'envoi';
    } finally {
      loading = false;
    }
  }
</script>

<div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
  <h2 class="text-xl font-semibold text-gray-900 mb-2 text-center">Mot de passe oublié</h2>
  <p class="text-sm text-gray-500 text-center mb-6">
    Entre ton email pour recevoir un lien de réinitialisation.
  </p>

  {#if success}
    <div class="text-center space-y-4">
      <div class="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
        Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
      </div>
      <a href="/login" class="inline-flex items-center gap-1 text-green-600 font-medium hover:underline text-sm">
        <ArrowLeft size={16} />
        Retour à la connexion
      </a>
    </div>
  {:else}
    {#if globalError}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        {globalError}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            id="email"
            type="email"
            bind:value={email}
            placeholder="votre@email.com"
            class="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition {errors.email ? 'border-red-500' : 'border-gray-300'}"
          />
        </div>
        {#if errors.email}
          <p class="mt-1 text-sm text-red-600">{errors.email}</p>
        {/if}
      </div>

      <button
        type="submit"
        disabled={loading}
        class="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {#if loading}
          <Loader2 size={18} class="animate-spin" />
          Envoi...
        {:else}
          <Send size={18} />
          Envoyer le lien
        {/if}
      </button>
    </form>

    <p class="mt-6 text-center">
      <a href="/login" class="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft size={16} />
        Retour à la connexion
      </a>
    </p>
  {/if}
</div>