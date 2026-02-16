<script>
  import { ArrowLeft } from '@lucide/svelte';
</script>

<div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-h-[80vh] overflow-y-auto">
  <!-- En-tête -->
  <div class="flex items-center gap-3 mb-6">
    <button onclick={() => history.back()} class="text-gray-400 hover:text-gray-600 transition">
      <ArrowLeft size={20} />
    </button>
    <h2 class="text-xl font-semibold text-gray-900">Politique de confidentialité</h2>
  </div>

  <p class="text-sm text-gray-400 mb-6">Dernière mise à jour : Février 2025</p>

  <div class="prose prose-sm prose-gray max-w-none space-y-6">
    <!-- 1 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">1. Introduction</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        La présente politique de confidentialité décrit comment <strong>Dettik</strong> collecte, utilise,
        stocke et protège vos données personnelles. Nous nous engageons à respecter votre vie privée
        et à protéger vos informations conformément à la réglementation en vigueur, notamment le
        Règlement Général sur la Protection des Données (RGPD).
      </p>
    </section>

    <!-- 2 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">2. Données collectées</h3>
      <p class="text-sm text-gray-600 leading-relaxed mb-3">
        Nous collectons les données suivantes :
      </p>

      <div class="space-y-3">
        <div class="bg-gray-50 rounded-lg p-3">
          <h4 class="text-sm font-medium text-gray-800 mb-1">Données d'identification</h4>
          <ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Nom complet</li>
            <li>Adresse email</li>
            <li>Photo de profil (si connexion via Google)</li>
          </ul>
        </div>

        <div class="bg-gray-50 rounded-lg p-3">
          <h4 class="text-sm font-medium text-gray-800 mb-1">Données financières</h4>
          <ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Montants des dettes et créances</li>
            <li>Historique des versements</li>
            <li>Noms des créanciers et débiteurs</li>
            <li>Preuves de paiement (fichiers téléversés)</li>
          </ul>
        </div>

        <div class="bg-gray-50 rounded-lg p-3">
          <h4 class="text-sm font-medium text-gray-800 mb-1">Données techniques</h4>
          <ul class="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>Adresse IP</li>
            <li>Type de navigateur et appareil</li>
            <li>Données de connexion et d'utilisation</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 3 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">3. Finalité du traitement</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Vos données sont collectées et traitées pour les finalités suivantes :
      </p>
      <ul class="text-sm text-gray-600 space-y-2 list-disc list-inside">
        <li><strong>Gestion de votre compte</strong> : création, authentification, sécurisation.</li>
        <li><strong>Fonctionnement de l'application</strong> : enregistrement et suivi de vos dettes et créances.</li>
        <li><strong>Synchronisation</strong> : sauvegarde et synchronisation de vos données entre vos appareils.</li>
        <li><strong>Notifications</strong> : rappels d'échéances et alertes (si activées).</li>
        <li><strong>Amélioration du service</strong> : analyse anonyme de l'utilisation pour améliorer l'application.</li>
      </ul>
    </section>

    <!-- 4 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">4. Base légale</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Le traitement de vos données repose sur :
      </p>
      <ul class="text-sm text-gray-600 space-y-2 list-disc list-inside">
        <li><strong>Votre consentement</strong> : acceptation des CGU lors de l'inscription.</li>
        <li><strong>L'exécution du contrat</strong> : fourniture du service que vous avez demandé.</li>
        <li><strong>L'intérêt légitime</strong> : sécurisation et amélioration de l'application.</li>
      </ul>
    </section>

    <!-- 5 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">5. Stockage des données</h3>

      <div class="space-y-3">
        <div class="bg-gray-50 rounded-lg p-3">
          <h4 class="text-sm font-medium text-gray-800 mb-1">Stockage en ligne</h4>
          <p class="text-sm text-gray-600">
            Vos données sont stockées de manière sécurisée sur les serveurs de
            <strong>Supabase</strong> (infrastructure hébergée sur AWS). Les données sont chiffrées
            en transit (TLS) et au repos.
          </p>
        </div>

        <div class="bg-gray-50 rounded-lg p-3">
          <h4 class="text-sm font-medium text-gray-800 mb-1">Stockage local</h4>
          <p class="text-sm text-gray-600">
            Pour permettre le fonctionnement hors-ligne, une copie de vos données est stockée
            localement sur votre appareil via IndexedDB. Ces données restent sur votre appareil et
            ne sont accessibles que par l'application.
          </p>
        </div>
      </div>
    </section>

    <!-- 6 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">6. Partage des données</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Nous ne vendons, ne louons et ne partageons <strong>aucune</strong> de vos données personnelles
        avec des tiers, sauf dans les cas suivants :
      </p>
      <ul class="text-sm text-gray-600 space-y-2 list-disc list-inside">
        <li><strong>Obligation légale</strong> : si la loi nous y contraint.</li>
        <li><strong>Sous-traitants techniques</strong> : Supabase (hébergement), uniquement pour le
          fonctionnement du service, avec des garanties de confidentialité.</li>
      </ul>
    </section>

    <!-- 7 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">7. Durée de conservation</h3>
      <ul class="text-sm text-gray-600 space-y-2 list-disc list-inside">
        <li><strong>Données du compte</strong> : conservées tant que votre compte est actif.</li>
        <li><strong>Données financières</strong> : conservées tant que votre compte est actif, ou
          selon la durée que vous définissez pour les archives.</li>
        <li><strong>Preuves de paiement</strong> : conservées tant que la dette/créance associée
          existe dans votre compte.</li>
        <li><strong>Après suppression du compte</strong> : toutes les données sont supprimées sous
          30 jours.</li>
      </ul>
    </section>

    <!-- 8 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">8. Vos droits</h3>
      <p class="text-sm text-gray-600 leading-relaxed mb-3">
        Conformément au RGPD, vous disposez des droits suivants :
      </p>

      <div class="space-y-2">
        <div class="flex items-start gap-3 bg-green-50 rounded-lg p-3">
          <span class="text-green-600 font-bold text-sm">✓</span>
          <div>
            <h4 class="text-sm font-medium text-gray-800">Droit d'accès</h4>
            <p class="text-xs text-gray-600">Obtenir une copie de toutes vos données personnelles.</p>
          </div>
        </div>

        <div class="flex items-start gap-3 bg-green-50 rounded-lg p-3">
          <span class="text-green-600 font-bold text-sm">✓</span>
          <div>
            <h4 class="text-sm font-medium text-gray-800">Droit de rectification</h4>
            <p class="text-xs text-gray-600">Modifier vos données si elles sont inexactes ou incomplètes.</p>
          </div>
        </div>

        <div class="flex items-start gap-3 bg-green-50 rounded-lg p-3">
          <span class="text-green-600 font-bold text-sm">✓</span>
          <div>
            <h4 class="text-sm font-medium text-gray-800">Droit à l'effacement</h4>
            <p class="text-xs text-gray-600">Demander la suppression de votre compte et de toutes vos données.</p>
          </div>
        </div>

        <div class="flex items-start gap-3 bg-green-50 rounded-lg p-3">
          <span class="text-green-600 font-bold text-sm">✓</span>
          <div>
            <h4 class="text-sm font-medium text-gray-800">Droit à la portabilité</h4>
            <p class="text-xs text-gray-600">Exporter vos données dans un format lisible (CSV, JSON).</p>
          </div>
        </div>

        <div class="flex items-start gap-3 bg-green-50 rounded-lg p-3">
          <span class="text-green-600 font-bold text-sm">✓</span>
          <div>
            <h4 class="text-sm font-medium text-gray-800">Droit d'opposition</h4>
            <p class="text-xs text-gray-600">Vous opposer au traitement de vos données pour des motifs légitimes.</p>
          </div>
        </div>

        <div class="flex items-start gap-3 bg-green-50 rounded-lg p-3">
          <span class="text-green-600 font-bold text-sm">✓</span>
          <div>
            <h4 class="text-sm font-medium text-gray-800">Droit de retrait du consentement</h4>
            <p class="text-xs text-gray-600">Retirer votre consentement à tout moment en supprimant votre compte.</p>
          </div>
        </div>
      </div>

      <p class="text-sm text-gray-600 leading-relaxed mt-3">
        Pour exercer ces droits, contactez-nous à
        <a href="mailto:privacy@dettik.com" class="text-green-600 hover:underline">privacy@dettik.com</a>.
      </p>
    </section>

    <!-- 9 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">9. Sécurité</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Nous mettons en œuvre les mesures de sécurité suivantes pour protéger vos données :
      </p>
      <ul class="text-sm text-gray-600 space-y-2 list-disc list-inside">
        <li>Chiffrement des données en transit (HTTPS/TLS).</li>
        <li>Chiffrement des données au repos sur les serveurs.</li>
        <li>Authentification sécurisée avec option 2FA.</li>
        <li>Isolation des données entre utilisateurs (Row Level Security).</li>
        <li>Mots de passe hashés (jamais stockés en clair).</li>
        <li>Mises à jour de sécurité régulières.</li>
      </ul>
    </section>

    <!-- 10 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">10. Cookies</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Dettik utilise uniquement des cookies essentiels au fonctionnement de l'application :
      </p>
      <ul class="text-sm text-gray-600 space-y-2 list-disc list-inside">
        <li><strong>Cookie de session</strong> : maintient votre connexion active.</li>
        <li><strong>Préférences</strong> : stocke vos choix (thème, langue, devise).</li>
      </ul>
      <p class="text-sm text-gray-600 leading-relaxed">
        Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
      </p>
    </section>

    <!-- 11 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">11. Modifications</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Nous nous réservons le droit de modifier cette politique de confidentialité. Toute modification
        sera communiquée via une notification dans l'application. La date de dernière mise à jour est
        indiquée en haut de ce document.
      </p>
    </section>

    <!-- 12 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">12. Contact</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Pour toute question concernant cette politique de confidentialité ou le traitement de vos
        données personnelles :
      </p>
      <div class="bg-gray-50 rounded-lg p-4 mt-2">
        <p class="text-sm text-gray-700 font-medium">Dettik — Protection des données</p>
        <p class="text-sm text-gray-600 mt-1">
          Email :
          <a href="mailto:privacy@dettik.com" class="text-green-600 hover:underline">privacy@dettik.com</a>
        </p>
      </div>
    </section>
  </div>

  <!-- Bouton retour -->
  <div class="mt-8 pt-4 border-t border-gray-100">
    <button
      onclick={() => history.back()}
      class="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
    >
      <ArrowLeft size={16} />
      Retour
    </button>
  </div>
</div>