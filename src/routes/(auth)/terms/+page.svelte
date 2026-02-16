<script>
  import { ArrowLeft } from '@lucide/svelte';
</script>

<div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-h-[80vh] overflow-y-auto">
  <!-- En-tête -->
  <div class="flex items-center gap-3 mb-6">
    <button onclick={() => history.back()} class="text-gray-400 hover:text-gray-600 transition">
      <ArrowLeft size={20} />
    </button>
    <h2 class="text-xl font-semibold text-gray-900">Conditions d'utilisation</h2>
  </div>

  <p class="text-sm text-gray-400 mb-6">Dernière mise à jour : Février 2025</p>

  <div class="prose prose-sm prose-gray max-w-none space-y-6">
    <!-- 1 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">1. Objet</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Les présentes conditions générales d'utilisation (ci-après « CGU ») ont pour objet de définir
        les modalités et conditions d'utilisation de l'application <strong>Dettik</strong>, ainsi que
        les droits et obligations des utilisateurs.
      </p>
      <p class="text-sm text-gray-600 leading-relaxed">
        Dettik est une application de gestion personnelle de dettes et créances permettant de suivre
        les montants dus et à percevoir, d'enregistrer les versements et de conserver des preuves de paiement.
      </p>
    </section>

    <!-- 2 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">2. Acceptation des conditions</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        L'utilisation de l'application Dettik implique l'acceptation pleine et entière des présentes CGU.
        En créant un compte, vous reconnaissez avoir lu, compris et accepté l'ensemble de ces conditions.
      </p>
      <p class="text-sm text-gray-600 leading-relaxed">
        Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser l'application.
      </p>
    </section>

    <!-- 3 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">3. Inscription et compte utilisateur</h3>
      <ul class="text-sm text-gray-600 space-y-2 list-disc list-inside">
        <li>L'inscription est gratuite et ouverte à toute personne physique majeure.</li>
        <li>Vous devez fournir des informations exactes et à jour lors de l'inscription.</li>
        <li>Vous êtes responsable de la confidentialité de vos identifiants de connexion.</li>
        <li>Toute activité réalisée depuis votre compte est présumée effectuée par vous.</li>
        <li>Vous devez nous notifier immédiatement toute utilisation non autorisée de votre compte.</li>
      </ul>
    </section>

    <!-- 4 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">4. Utilisation de l'application</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Dettik est destinée à un usage personnel de gestion financière. Vous vous engagez à :
      </p>
      <ul class="text-sm text-gray-600 space-y-2 list-disc list-inside">
        <li>Utiliser l'application de manière conforme à sa finalité.</li>
        <li>Ne pas utiliser l'application à des fins illégales ou frauduleuses.</li>
        <li>Ne pas tenter de compromettre la sécurité ou l'intégrité de l'application.</li>
        <li>Ne pas collecter les données d'autres utilisateurs.</li>
        <li>Ne pas transmettre de virus, malware ou tout code malveillant.</li>
      </ul>
    </section>

    <!-- 5 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">5. Données et contenu utilisateur</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Les données saisies dans l'application (dettes, créances, versements, preuves) restent votre
        propriété. Vous êtes seul responsable de l'exactitude et de la légalité des informations que
        vous enregistrez.
      </p>
      <p class="text-sm text-gray-600 leading-relaxed">
        Les fichiers téléversés (preuves de paiement) ne doivent pas contenir de contenu illicite,
        offensant ou portant atteinte aux droits de tiers.
      </p>
    </section>

    <!-- 6 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">6. Disponibilité du service</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Nous nous efforçons d'assurer la disponibilité continue de l'application. Toutefois, nous ne
        garantissons pas un accès ininterrompu. L'application peut être temporairement indisponible
        pour des raisons de maintenance, de mise à jour ou en cas de force majeure.
      </p>
      <p class="text-sm text-gray-600 leading-relaxed">
        Grâce au mode hors-ligne, certaines fonctionnalités restent accessibles même sans connexion
        internet. Les données seront synchronisées au retour de la connexion.
      </p>
    </section>

    <!-- 7 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">7. Limitation de responsabilité</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Dettik est un outil de suivi personnel. L'application :
      </p>
      <ul class="text-sm text-gray-600 space-y-2 list-disc list-inside">
        <li>Ne constitue pas un service financier, juridique ou comptable professionnel.</li>
        <li>Ne peut être tenue responsable des décisions financières prises sur la base des informations affichées.</li>
        <li>Ne garantit pas l'exactitude des calculs en cas de saisie erronée par l'utilisateur.</li>
        <li>Ne peut être tenue responsable de la perte de données en cas de mauvaise utilisation.</li>
      </ul>
    </section>

    <!-- 8 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">8. Propriété intellectuelle</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        L'ensemble des éléments composant l'application (design, code, logos, textes, fonctionnalités)
        sont protégés par le droit de la propriété intellectuelle. Toute reproduction, modification ou
        utilisation non autorisée est interdite.
      </p>
    </section>

    <!-- 9 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">9. Résiliation</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application.
        La suppression entraînera l'effacement définitif de toutes vos données conformément à notre
        politique de confidentialité.
      </p>
      <p class="text-sm text-gray-600 leading-relaxed">
        Nous nous réservons le droit de suspendre ou supprimer un compte en cas de violation des
        présentes CGU.
      </p>
    </section>

    <!-- 10 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">10. Modification des CGU</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Nous nous réservons le droit de modifier les présentes CGU à tout moment. Les utilisateurs
        seront informés des modifications par notification dans l'application. L'utilisation continue
        de l'application après modification vaut acceptation des nouvelles conditions.
      </p>
    </section>

    <!-- 11 -->
    <section>
      <h3 class="text-base font-semibold text-gray-900">11. Contact</h3>
      <p class="text-sm text-gray-600 leading-relaxed">
        Pour toute question relative aux présentes CGU, vous pouvez nous contacter à l'adresse :
        <a href="mailto:contact@dettik.com" class="text-green-600 hover:underline">contact@dettik.com</a>
      </p>
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