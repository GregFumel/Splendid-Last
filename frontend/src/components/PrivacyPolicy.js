import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header selectedCategory="explore" onCategoryChange={() => {}} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Responsable du traitement</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Le responsable du traitement des données personnelles est :
                </p>
                <p>
                  <strong className="text-white">Splendid</strong><br />
                  MONSIEUR GREGOIRE FUMEL<br />
                  120 COURS ALBERT THOMAS<br />
                  69008 LYON, France<br />
                  Email : privacy@splendid.com
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Données collectées</h2>
              <div className="text-gray-300 space-y-4">
                <p>Nous collectons les données suivantes :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Données d'identification :</strong> nom, prénom, adresse email</li>
                  <li><strong className="text-white">Données de connexion :</strong> adresse IP, logs de connexion</li>
                  <li><strong className="text-white">Données d'utilisation :</strong> outils utilisés, contenu généré, statistiques d'usage</li>
                  <li><strong className="text-white">Données de paiement :</strong> informations de facturation (traitées par nos prestataires sécurisés)</li>
                  <li><strong className="text-white">Cookies :</strong> données de navigation et préférences</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Finalités du traitement</h2>
              <div className="text-gray-300 space-y-4">
                <p>Vos données sont traitées pour :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Fournir et améliorer nos services d'outils IA</li>
                  <li>Gérer votre compte et votre abonnement</li>
                  <li>Traiter les paiements et la facturation</li>
                  <li>Assurer le support client</li>
                  <li>Améliorer l'expérience utilisateur</li>
                  <li>Respecter nos obligations légales</li>
                  <li>Prévenir la fraude et assurer la sécurité</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Base légale</h2>
              <div className="text-gray-300 space-y-4">
                <p>Le traitement de vos données repose sur :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Exécution du contrat :</strong> pour fournir nos services</li>
                  <li><strong className="text-white">Intérêt légitime :</strong> pour améliorer nos services et assurer la sécurité</li>
                  <li><strong className="text-white">Consentement :</strong> pour les cookies non essentiels et marketing</li>
                  <li><strong className="text-white">Obligation légale :</strong> pour la comptabilité et les obligations fiscales</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Partage des données</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Nous ne vendons jamais vos données personnelles. Nous pouvons les partager avec :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Nos prestataires de services (hébergement, paiement, support)</li>
                  <li>Les fournisseurs d'outils IA partenaires (dans le cadre strict du service)</li>
                  <li>Les autorités compétentes si requis par la loi</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Durée de conservation</h2>
              <div className="text-gray-300 space-y-4">
                <p>Nous conservons vos données :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Données de compte :</strong> pendant la durée de votre abonnement + 3 ans</li>
                  <li><strong className="text-white">Données de paiement :</strong> 10 ans (obligation comptable)</li>
                  <li><strong className="text-white">Données de navigation :</strong> 13 mois maximum</li>
                  <li><strong className="text-white">Contenu généré :</strong> selon vos paramètres, jusqu'à suppression</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Vos droits (RGPD)</h2>
              <div className="text-gray-300 space-y-4">
                <p>Conformément au RGPD, vous disposez des droits suivants :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong className="text-white">Accès :</strong> obtenir une copie de vos données</li>
                  <li><strong className="text-white">Rectification :</strong> corriger des données inexactes</li>
                  <li><strong className="text-white">Suppression :</strong> demander l'effacement de vos données</li>
                  <li><strong className="text-white">Limitation :</strong> restreindre le traitement</li>
                  <li><strong className="text-white">Portabilité :</strong> récupérer vos données dans un format structuré</li>
                  <li><strong className="text-white">Opposition :</strong> vous opposer au traitement</li>
                  <li><strong className="text-white">Retrait du consentement :</strong> à tout moment</li>
                </ul>
                <p className="mt-4">
                  Pour exercer ces droits, contactez-nous à : <strong className="text-white">privacy@splendid.com</strong>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Sécurité</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre l'accès non autorisé, la perte, la modification ou la divulgation.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Transferts internationaux</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Certains de nos prestataires peuvent être situés hors de l'UE. Ces transferts sont encadrés par des garanties appropriées (clauses contractuelles types, décisions d'adéquation).
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Cookies</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Nous utilisons des cookies essentiels au fonctionnement du site et des cookies analytiques pour améliorer nos services. Vous pouvez gérer vos préférences dans les paramètres de votre navigateur.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Modifications</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Cette politique peut être modifiée. Les changements importants vous seront notifiés par email ou via le site.
                </p>
                <p><strong className="text-white">Dernière mise à jour :</strong> Décembre 2024</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contact et réclamations</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  <strong className="text-white">Délégué à la protection des données :</strong> privacy@splendid.com<br />
                  <strong className="text-white">Adresse :</strong> 120 COURS ALBERT THOMAS, 69008 LYON, France
                </p>
                <p>
                  Vous avez également le droit de déposer une plainte auprès de la CNIL : www.cnil.fr
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

export default PrivacyPolicy;