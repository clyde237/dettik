<script>
  import { goto, invalidate } from '$app/navigation';
  import { registerSchema, extractErrors } from '$lib/utils/validators';
  import { register, loginWithOAuth } from '$lib/services/auth.service';
  import { UserPlus, Mail, Lock, User, Eye, EyeOff, Loader2, Check, X } from '@lucide/svelte';

  let full_name = $state('');
  let email = $state('');
  let password = $state('');
  let confirm_password = $state('');
  let terms = $state(false);
  let showPassword = $state(false);
  let loading = $state(false);
  let success = $state(false);

  /** @type {Record<string, string>} */
  let errors = $state({});
  let globalError = $state('');
  let oauthLoading = $state('');

  // Règles de validation du mot de passe (affichage en temps réel)
  let rules = $derived({
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  });

  let passwordStrength = $derived(
    Object.values(rules).filter(Boolean).length
  );

  let strengthLabel = $derived(
    passwordStrength === 0 ? '' :
    passwordStrength <= 2 ? 'Faible' :
    passwordStrength <= 4 ? 'Moyen' :
    'Fort'
  );

  let strengthColor = $derived(
    passwordStrength <= 2 ? 'bg-red-500' :
    passwordStrength <= 4 ? 'bg-yellow-500' :
    'bg-green-500'
  );

  /**
   * @param {Event} e
   */
  async function handleSubmit(e) {
    e.preventDefault();
    errors = {};
    globalError = '';

    const result = registerSchema.safeParse({ full_name, email, password, confirm_password, terms });
    if (!result.success) {
      errors = extractErrors(result.error);
      return;
    }

    loading = true;
    try {
      const data = await register({ email, password, full_name });

      if (data.session) {
        await invalidate('supabase:auth');
        goto('/');
      } else {
        success = true;
      }
    } catch (err) {
      globalError = err instanceof Error ? err.message : 'Erreur lors de l\'inscription';
    } finally {
      loading = false;
    }
  }

  /**
   * @param {'google'} provider
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
  <h2 class="text-xl font-semibold text-gray-900 mb-6 text-center">Créer un compte</h2>

  {#if success}
    <div class="text-center space-y-4">
      <div class="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
        Inscription réussie ! Vérifie ton email pour confirmer ton compte.
      </div>
      <a href="/login" class="text-green-600 font-medium hover:underline text-sm">
        Retour à la connexion
      </a>
    </div>
  {:else}
    {#if globalError}
      <div class="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
        {globalError}
      </div>
    {/if}

    <!-- Bouton OAuth Google -->
    <div class="mb-6">
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

    <form onsubmit={handleSubmit} class="space-y-4">
      <!-- Nom complet -->
      <div>
        <label for="full_name" class="block text-sm font-medium text-gray-700 mb-1">
          Nom complet
        </label>
        <div class="relative">
          <User class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            id="full_name"
            type="text"
            bind:value={full_name}
            placeholder="Jean Dupont"
            class="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition {errors.full_name ? 'border-red-500' : 'border-gray-300'}"
          />
        </div>
        {#if errors.full_name}
          <p class="mt-1 text-sm text-red-600">{errors.full_name}</p>
        {/if}
      </div>

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

        <!-- Indicateur de force -->
        {#if password.length > 0}
          <div class="mt-3 space-y-2">
            <!-- Barre de force -->
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300 {strengthColor}"
                  style="width: {(passwordStrength / 5) * 100}%"
                ></div>
              </div>
              <span class="text-xs font-medium {
                passwordStrength <= 2 ? 'text-red-600' :
                passwordStrength <= 4 ? 'text-yellow-600' :
                'text-green-600'
              }">
                {strengthLabel}
              </span>
            </div>

            <!-- Règles détaillées -->
            <ul class="space-y-1">
              <li class="flex items-center gap-2 text-xs {rules.minLength ? 'text-green-600' : 'text-gray-400'}">
                {#if rules.minLength}
                  <Check size={14} />
                {:else}
                  <X size={14} />
                {/if}
                8 caractères minimum
              </li>
              <li class="flex items-center gap-2 text-xs {rules.uppercase ? 'text-green-600' : 'text-gray-400'}">
                {#if rules.uppercase}
                  <Check size={14} />
                {:else}
                  <X size={14} />
                {/if}
                Une lettre majuscule
              </li>
              <li class="flex items-center gap-2 text-xs {rules.lowercase ? 'text-green-600' : 'text-gray-400'}">
                {#if rules.lowercase}
                  <Check size={14} />
                {:else}
                  <X size={14} />
                {/if}
                Une lettre minuscule
              </li>
              <li class="flex items-center gap-2 text-xs {rules.number ? 'text-green-600' : 'text-gray-400'}">
                {#if rules.number}
                  <Check size={14} />
                {:else}
                  <X size={14} />
                {/if}
                Un chiffre
              </li>
              <li class="flex items-center gap-2 text-xs {rules.special ? 'text-green-600' : 'text-gray-400'}">
                {#if rules.special}
                  <Check size={14} />
                {:else}
                  <X size={14} />
                {/if}
                Un caractère spécial (!@#$%...)
              </li>
            </ul>
          </div>
        {/if}
      </div>

      <!-- Confirmation mot de passe -->
      <div>
        <label for="confirm_password" class="block text-sm font-medium text-gray-700 mb-1">
          Confirmer le mot de passe
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

      <!-- Conditions d'utilisation -->
      <div>
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            bind:checked={terms}
            class="mt-0.5 w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span class="text-sm text-gray-600">
            J'accepte les
            <a href="/terms" target="_blank" class="text-green-600 font-medium hover:underline">
              conditions d'utilisation
            </a>
            et la
            <a href="/privacy" target="_blank" class="text-green-600 font-medium hover:underline">
              politique de confidentialité
            </a>
            de Dettik.
          </span>
        </label>
        {#if errors.terms}
          <p class="mt-1 text-sm text-red-600">{errors.terms}</p>
        {/if}
      </div>

      <!-- Bouton inscription -->
      <button
        type="submit"
        disabled={loading}
        class="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {#if loading}
          <Loader2 size={18} class="animate-spin" />
          Inscription...
        {:else}
          <UserPlus size={18} />
          S'inscrire
        {/if}
      </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-600">
      Déjà un compte ?
      <a href="/login" class="text-green-600 font-medium hover:underline">Se connecter</a>
    </p>
  {/if}
</div>