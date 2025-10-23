import React from "react";
import LegalHeader from "./LegalHeader";
import Footer from "./Footer";

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <LegalHeader />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Droit de rétractation (14 jours)</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Conformément à la législation française et européenne, vous disposez d'un droit de rétractation de 14 jours calendaires à compter de la souscription de votre abonnement.
                </p>
                <p>
                  <strong className="text-white">Important :</strong> Si vous commencez à utiliser le service, vous renoncez expressément à votre droit de rétractation dès la première utilisation.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Abonnement sans engagement</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Notre abonnement mensuel de 29,99€ TTC est sans engagement.
                </p>
                <p>
                  Vous pouvez annuler votre abonnement à tout moment depuis votre compte.
                </p>
                <p>
                  En cas d'annulation, vous conservez l'accès au service jusqu'à la fin de votre période de facturation en cours.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Remboursements</h2>
              <div className="text-gray-300 space-y-4">
                <p><strong className="text-white">3.1 Remboursement intégral :</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Annulation pendant la période d'essai gratuit</li>
                  <li>Problème technique majeur non résolu dans les 48h</li>
                  <li>Exercice du droit de rétractation dans les 14 jours (si le service n'a pas été utilisé)</li>
                </ul>
                
                <p><strong className="text-white">3.2 Remboursement partiel (au prorata) :</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Annulation en cours de mois (remboursement de la période non utilisée)</li>
                  <li>Suspension du service de notre fait</li>
                </ul>

                <p><strong className="text-white">3.3 Aucun remboursement :</strong></p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Violation des conditions d'utilisation</li>
                  <li>Utilisation abusive du service</li>
                  <li>Demande après 30 jours d'utilisation sans motif technique</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Processus de remboursement</h2>
              <div className="text-gray-300 space-y-4">
                <p>Pour demander un remboursement :</p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Contactez notre service client à : <strong className="text-white">refund@splendid.com</strong></li>
                  <li>Précisez votre nom, email de compte et motif de la demande</li>
                  <li>Nous étudierons votre demande dans les 48h ouvrées</li>
                  <li>Si acceptée, le remboursement sera effectué sous 5-10 jours ouvrés</li>
                </ol>
                <p>
                  Le remboursement sera effectué sur le même moyen de paiement utilisé pour l'achat initial.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Annulation d'abonnement</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Vous pouvez annuler votre abonnement à tout moment :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Depuis votre tableau de bord utilisateur</li>
                  <li>Par email à : <strong className="text-white">cancel@splendid.com</strong></li>
                  <li>L'annulation prend effet à la fin de la période de facturation en cours</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Cas particuliers</h2>
              <div className="text-gray-300 space-y-4">
                <p><strong className="text-white">6.1 Problèmes techniques :</strong></p>
                <p>
                  Si vous rencontrez des problèmes techniques empêchant l'utilisation normale du service, contactez-nous immédiatement. Nous nous engageons à résoudre le problème dans les 48h ou à vous rembourser.
                </p>
                
                <p><strong className="text-white">6.2 Changement de service :</strong></p>
                <p>
                  En cas de modification substantielle de nos services, vous aurez le droit de demander le remboursement de la période non utilisée.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Exceptions légales</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Conformément à l'article L221-28 du Code de la consommation français, le droit de rétractation ne s'applique pas aux contenus numériques non fournis sur un support matériel dont l'exécution a commencé après accord préalable exprès du consommateur.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Résolution des litiges</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  En cas de litige concernant un remboursement :
                </p>
                <ol className="list-decimal list-inside space-y-2 ml-4">
                  <li>Contactez d'abord notre service client</li>
                  <li>Si pas de résolution, vous pouvez saisir le médiateur de la consommation</li>
                  <li>En dernier recours, les tribunaux de Lyon sont compétents</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Modifications de cette politique</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Cette politique de remboursement peut être modifiée. Les changements seront communiqués par email et prendront effet 30 jours après notification.
                </p>
                <p><strong className="text-white">Dernière mise à jour :</strong> Décembre 2024</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
              <div className="text-gray-300">
                <p>Pour toute question concernant les remboursements :</p>
                <p className="mt-2">
                  <strong className="text-white">Email :</strong> refund@splendid.com<br />
                  <strong className="text-white">Service client :</strong> support@splendid.com<br />
                  <strong className="text-white">Adresse :</strong> 120 COURS ALBERT THOMAS, 69008 LYON, France<br />
                  <strong className="text-white">Horaires :</strong> Lundi-Vendredi, 9h-18h (CET)
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

export default RefundPolicy;