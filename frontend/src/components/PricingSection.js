import React from "react";
import { Check } from "lucide-react";

const PricingSection = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="flex flex-col items-center">
        {/* Titre de la section */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Accédez à tous les outils IA
        </h2>
        
        {/* Carte pricing avec animation */}
        <div className="relative">
          {/* Liseré animé */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white via-transparent to-white opacity-30 animate-spin-slow btn-3d-effect"></div>
          
          {/* Carte pricing */}
          <div className="relative bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-8 sm:p-10 max-w-md w-full text-center">
            {/* Badge Popular */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold btn-3d-effect">
                POPULAIRE
              </span>
            </div>
            
            {/* Titre du plan */}
            <h3 className="text-xl font-bold text-white mt-4 mb-2">
              Abonnement Premium
            </h3>
            
            {/* Prix */}
            <div className="mb-6">
              <span className="text-4xl sm:text-5xl font-bold text-white">29,99€</span>
              <span className="text-gray-300 text-lg">/mois</span>
            </div>
            
            {/* Description */}
            <p className="text-gray-300 mb-8">
              Accès illimité à tous les outils IA les plus performants
            </p>
            
            {/* Liste des fonctionnalités */}
            <div className="space-y-4 mb-8 text-left">
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-200">Accès à tous les outils IA</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-200">Génération illimitée</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-200">Support prioritaire 24/7</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-200">Nouvelles IA en avant-première</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-gray-200">Sans engagement, résiliable à tout moment</span>
              </div>
            </div>
            
            {/* Bouton CTA */}
            <button className="btn-3d-effect bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-full transition w-full">
              Commencer maintenant
            </button>
            
            {/* Garantie */}
            <p className="text-xs text-gray-400 mt-4">
              Garantie satisfait ou remboursé 30 jours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;