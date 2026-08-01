<script>
  import { goto } from '$app/navigation';
  import { useClerkContext } from 'svelte-clerk';
  import { resetPasswordSchema, extractErrors } from '$lib/utils/validators';
  import { resetPassword, authErrorMessage } from '$lib/services/auth.service';
  import { Lock, Eye, EyeOff, Loader2, KeyRound, Hash } from '@lucide/svelte';

  const ctx = useClerkContext();

  let code = $state('');
  let password = $state('');
  let confirm_password = $state('');
  let showPassword = $state(false);
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

    if (code.trim().length < 6) {
      errors = { code: 'Le code doit contenir 6 chiffres' };
      return;
    }

    const result = resetPasswordSchema.safeParse({ password, confirm_password });
    if (!result.success) {
      errors = extractErrors(result.error);
      return;
    }

    loading = true;
    try {
      const data = await resetPassword(ctx.clerk, { code: code.trim(), password });

      if (data.complete) {
        success = true;
        // La session est active après la réinitialisation : on entre dans l'app.
        setTimeout(() => goto('/', { invalidateAll: true }), 2000);
      } else {
        globalError = 'Réinitialisation incomplète, réessaie.';
      }
    } catch (err) {
      globalError = authErrorMessage(err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
  <h2 class="text-xl font-semibold text-gray-900 mb-2 text-center">Nouveau mot de passe</h2>
  <p class="text-sm text-gray-500 text-center mb-6">
    Saisis le code reçu par email et choisis un nouveau mot de passe.
  </p>

  {#if success}
    <div class="text-center space-y-4">
      <div class="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
        Mot de passe mis à jour ! Redirection...
      </div>
    </div>
  {:else}
    {#if globalError}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        {globalError}
      </div>
    {/if}

    <form onsubmit={handleSubmit} class="space-y-4">
      <div>
        <label for="code" class="block text-sm font-medium text-gray-700 mb-1">
          Code de vérification
        </label>
        <div class="relative">
          <Hash class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            id="code"
            type="text"
            bind:value={code}
            placeholder="000000"
            maxlength="6"
            class="w-full pl-10 pr-4 py-2.5 border rounded-lg font-mono tracking-widest focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition {errors.code ? 'border-red-500' : 'border-gray-300'}"
          />
        </div>
        {#if errors.code}
          <p class="mt-1 text-sm text-red-600">{errors.code}</p>
        {/if}
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
          Nouveau mot de passe
        </label>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            placeholder="8 caractères minimum"
            class="w-full pl-10 pr-12 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition {errors.password ? 'border-red-500' : 'border-gray-300'}"
          />
          <button
            type="button"
            onclick={() => showPassword = !showPassword}
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {#if showPassword}
              <EyeOff size={18} />
            {:else}
              <Eye size={18} />
            {/if}
          </button>
        </div>
        {#if errors.password}
          <p class="mt-1 text-sm text-red-600">{errors.password}</p>
        {/if}
      </div>

      <div>
        <label for="confirm_password" class="block text-sm font-medium text-gray-700 mb-1">
          Confirmer
        </label>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            id="confirm_password"
            type={showPassword ? 'text' : 'password'}
            bind:value={confirm_password}
            placeholder="Retapez le mot de passe"
            class="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition {errors.confirm_password ? 'border-red-500' : 'border-gray-300'}"
          />
        </div>
        {#if errors.confirm_password}
          <p class="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
        {/if}
      </div>

      <button
        type="submit"
        disabled={loading || !ctx.isLoaded}
        class="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {#if loading}
          <Loader2 size={18} class="animate-spin" />
          Mise à jour...
        {:else}
          <KeyRound size={18} />
          Mettre à jour
        {/if}
      </button>
    </form>
  {/if}
</div>
