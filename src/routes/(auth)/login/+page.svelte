<script>
  import { goto } from '$app/navigation';
  import { useClerkContext } from 'svelte-clerk';
  import { loginSchema, extractErrors } from '$lib/utils/validators';
  import { login, authErrorMessage } from '$lib/services/auth.service';
  import { Mail, Lock, Eye, EyeOff, Loader2, LogIn } from '@lucide/svelte';

  const ctx = useClerkContext();

  // État du formulaire
  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let loading = $state(false);

  /** @type {Record<string, string>} */
  let errors = $state({});
  let globalError = $state('');

  /**
   * @param {Event} e
   */
  async function handleLogin(e) {
    e.preventDefault();
    errors = {};
    globalError = '';

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      errors = extractErrors(result.error);
      return;
    }

    loading = true;
    try {
      const response = await login(ctx.clerk, { email, password });

      if (response.complete) {
        // invalidateAll relance les load côté serveur avec le nouveau cookie
        // de session Clerk.
        await goto('/', { invalidateAll: true });
      } else {
        globalError = 'Connexion incomplète, réessaie.';
      }
    } catch (err) {
      globalError = authErrorMessage(err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
  <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">Connexion</h2>

  {#if globalError}
    <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
      {globalError}
    </div>
  {/if}

  <!-- Formulaire email/password -->
  <form onsubmit={handleLogin} class="space-y-4">
    <!-- Email -->
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

    <!-- Mot de passe -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
        Mot de passe
      </label>
      <div class="relative">
        <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          bind:value={password}
          placeholder="••••••••"
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

    <!-- Lien mot de passe oublié -->
    <div class="text-right">
      <a href="/forgot-password" class="text-sm text-green-600 hover:underline">
        Mot de passe oublié ?
      </a>
    </div>

    <!-- Bouton connexion -->
    <button
      type="submit"
      disabled={loading || !ctx.isLoaded}
      class="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
    >
      {#if loading}
        <Loader2 size={18} class="animate-spin" />
        Connexion...
      {:else}
        <LogIn size={18} />
        Se connecter
      {/if}
    </button>
  </form>

  <!-- Lien inscription -->
  <p class="mt-6 text-center text-sm text-gray-600">
    Pas encore de compte ?
    <a href="/register" class="text-green-600 font-medium hover:underline">S'inscrire</a>
  </p>
</div>
