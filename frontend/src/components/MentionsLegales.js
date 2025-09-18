import React from "react";
import LegalHeader from "./LegalHeader";
import Footer from "./Footer";

const MentionsLegales = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <Header selectedCategory="explore" onCategoryChange={() => {}} />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Mentions légales</h1>
          
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 space-y-8">
            
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Informations légales</h2>
              <div className="text-gray-300 space-y-4">
                <p><strong className="text-white">Dénomination sociale :</strong> Splendid</p>
                <p><strong className="text-white">Forme juridique :</strong> Entrepreneur individuel</p>
                <p><strong className="text-white">Dirigeant :</strong> MONSIEUR GREGOIRE FUMEL</p>
                <p><strong className="text-white">SIRET :</strong> 897 986 188 00018</p>
                <p><strong className="text-white">Numéro de TVA :</strong> FR80897986188</p>
                <p><strong className="text-white">Date de création :</strong> 06 avril 2021</p>
                <p><strong className="text-white">Activité (NAF/APE) :</strong> Post-production de films cinématographiques, de vidéo et de programmes de télévision - 5912Z</p>
                <p><strong className="text-white">Adresse du siège social :</strong><br />
                120 COURS ALBERT THOMAS<br />
                69008 LYON<br />
                France</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Hébergement</h2>
              <div className="text-gray-300">
                <p>Ce site est hébergé par :</p>
                <p className="mt-2">
                  <strong className="text-white">Nom de l'hébergeur :</strong> À définir selon votre hébergeur<br />
                  <strong className="text-white">Adresse :</strong> À compléter selon votre hébergeur
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Propriété intellectuelle</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  L'ensemble du contenu de ce site web (textes, images, vidéos, logos, etc.) est protégé par les droits d'auteur et appartient à Splendid ou à ses partenaires.
                </p>
                <p>
                  Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans l'accord exprès par écrit de Splendid.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Responsabilité</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Splendid s'efforce de fournir sur le site des informations aussi précises que possible. Toutefois, il ne pourra être tenu responsable des omissions, des inexactitudes et des carences dans la mise à jour, qu'elles soient de son fait ou du fait des tiers partenaires qui lui fournissent ces informations.
                </p>
                <p>
                  L'utilisation des outils IA disponibles sur la plateforme se fait sous la responsabilité de l'utilisateur. Splendid ne peut être tenu responsable du contenu généré par les utilisateurs via les outils mis à disposition.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
              <div className="text-gray-300">
                <p>Pour toute question concernant ces mentions légales, vous pouvez nous contacter :</p>
                <p className="mt-2">
                  <strong className="text-white">Email :</strong> contact@splendid.com<br />
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

export default MentionsLegales;