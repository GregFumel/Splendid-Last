import React from "react";
import LegalHeader from "./LegalHeader";
import Footer from "./Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <LegalHeader />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptation des conditions</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  En accédant et en utilisant Splendid, vous acceptez d'être lié par ces conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description du service</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Splendid est une plateforme qui fournit l'accès à plus de 1200€ d'outils d'intelligence artificielle pour la création de contenu, incluant la génération d'images, de vidéos, et d'autres médias numériques.
                </p>
                <p>
                  Notre service comprend un abonnement mensuel de 29,99€ sans engagement.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Comptes utilisateur</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Vous êtes responsable de maintenir la confidentialité de votre compte et mot de passe. Vous acceptez la responsabilité de toutes les activités qui se déroulent sous votre compte.
                </p>
                <p>
                  Vous devez avoir au moins 16 ans pour utiliser ce service. Les utilisateurs de moins de 18 ans doivent avoir l'autorisation parentale.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Utilisation acceptable</h2>
              <div className="text-gray-300 space-y-4">
                <p>Vous vous engagez à ne pas utiliser le service pour :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Créer du contenu illégal, offensant, diffamatoire ou violant les droits d'autrui</li>
                  <li>Générer du contenu à caractère sexuel impliquant des mineurs</li>
                  <li>Créer de la désinformation ou du contenu trompeur</li>
                  <li>Violer les droits de propriété intellectuelle d'autrui</li>
                  <li>Automatiser l'utilisation du service de manière abusive</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Paiements et abonnements</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  L'abonnement mensuel est facturé 29,99€ TTC par mois après la période d'essai gratuit de 3 jours.
                </p>
                <p>
                  Les paiements sont traités de manière sécurisée. En cas de défaut de paiement, votre accès au service pourra être suspendu.
                </p>
                <p>
                  Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Propriété intellectuelle</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Le contenu que vous créez en utilisant nos outils vous appartient, sous réserve du respect des conditions d'utilisation et des lois en vigueur.
                </p>
                <p>
                  Splendid conserve tous les droits sur la plateforme, les outils et les technologies sous-jacentes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation de responsabilité</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Splendid ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation du service.
                </p>
                <p>
                  Le service est fourni "en l'état" sans garantie de disponibilité continue ou d'absence d'erreurs.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Modifications des conditions</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Splendid se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront notifiés des changements importants.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Droit applicable</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Ces conditions sont régies par le droit français. Tout litige sera soumis à la compétence des tribunaux de Lyon, France.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
              <div className="text-gray-300">
                <p>Pour toute question concernant ces conditions d'utilisation :</p>
                <p className="mt-2">
                  <strong className="text-white">Email :</strong> legal@splendid.com<br />
                  <strong className="text-white">Adresse :</strong> 120 COURS ALBERT THOMAS, 69008 LYON, France
                </p>
              </div>
            </section>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;