<script>
  import { goto, invalidate } from '$app/navigation';
  import { loginSchema, extractErrors } from '$lib/utils/validators';
  import { login, loginWithOAuth, verifyMFA } from '$lib/services/auth.service';
  import { Mail, Lock, Eye, EyeOff, Loader2, LogIn, ShieldCheck } from '@lucide/svelte';

  // État du formulaire
  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let loading = $state(false);

  /** @type {Record<string, string>} */
  let errors = $state({});
  let globalError = $state('');

  // État MFA
  /** @type {'credentials' | 'mfa'} */
  let step = $state('credentials');
  let mfaCode = $state('');
  let mfaFactorId = $state('');
  let mfaLoading = $state(false);
  let mfaError = $state('');

  // État OAuth
  let oauthLoading = $state('');

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
      const response = await login({ email, password });

      if (response.mfaRequired && response.factorId) {
        // Passer à l'étape 2FA
        mfaFactorId = response.factorId;
        step = 'mfa';
      } else {
        // Connexion réussie sans 2FA
        await invalidate('supabase:auth');
        goto('/');
      }
    } catch (err) {
      globalError = err instanceof Error ? err.message : 'Erreur de connexion';
    } finally {
      loading = false;
    }
  }

  /**
   * @param {Event} e
   */
  async function handleMFA(e) {
    e.preventDefault();
    mfaError = '';

    if (mfaCode.length !== 6) {
      mfaError = 'Le code doit contenir 6 chiffres';
      return;
    }

    mfaLoading = true;
    try {
      await verifyMFA({ factorId: mfaFactorId, code: mfaCode });
      await invalidate('supabase:auth');
      goto('/');
    } catch (err) {
      mfaError = err instanceof Error ? err.message : 'Code invalide';
    } finally {
      mfaLoading = false;
    }
  }

  /**
   * @param {'google' | 'facebook'} provider
   */
  async function handleOAuth(provider) {
    oauthLoading = provider;
    try {
      await loginWithOAuth(provider);
    } catch (err) {
      globalError = err instanceof Error ? err.message : 'Erreur de connexion';
      oauthLoading = '';
    }
  }
</script>

<div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">

  {#if step === 'credentials'}
    <!-- ======================== -->
    <!-- ÉTAPE 1 : Email + MDP   -->
    <!-- ======================== -->
    <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">Connexion</h2>

    {#if globalError}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        {globalError}
      </div>
    {/if}

    <!-- Boutons OAuth -->
    <div class="space-y-3 mb-6">
      <button
        type="button"
        onclick={() => handleOAuth('google')}
        disabled={oauthLoading !== ''}
        class="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
      >
        {#if oauthLoading === 'google'}
          <Loader2 size={18} class="animate-spin" />
        {:else}
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        {/if}
        <span class="text-sm font-medium text-gray-700">Continuer avec Google</span>
      </button>
    </div>

    <!-- Séparateur -->
    <div class="relative mb-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-200"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-white px-4 text-gray-400">ou</span>
      </div>
    </div>

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
        disabled={loading}
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

  {:else}
    <!-- ======================== -->
    <!-- ÉTAPE 2 : Code 2FA      -->
    <!-- ======================== -->
    <div class="text-center mb-6">
      <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <ShieldCheck size={24} class="text-green-600" />
      </div>
      <h2 class="text-xl font-semibold text-gray-900">Vérification 2FA</h2>
      <p class="text-sm text-gray-500 mt-1">
        Entre le code à 6 chiffres de ton application d'authentification.
      </p>
    </div>

    {#if mfaError}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        {mfaError}
      </div>
    {/if}

    <form onsubmit={handleMFA} class="space-y-4">
      <div>
        <input
          type="text"
          bind:value={mfaCode}
          placeholder="000000"
          maxlength="6"
          class="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
        />
      </div>

      <button
        type="submit"
        disabled={mfaLoading}
        class="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {#if mfaLoading}
          <Loader2 size={18} class="animate-spin" />
          Vérification...
        {:else}
          <ShieldCheck size={18} />
          Vérifier
        {/if}
      </button>

      <button
        type="button"
        onclick={() => { step = 'credentials'; mfaCode = ''; mfaError = ''; }}
        class="w-full text-sm text-gray-500 hover:text-gray-700 transition"
      >
        ← Retour à la connexion
      </button>
    </form>
  {/if}
</div>