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
          {/* Liséré animé irrégulier */}
          <div className="absolute inset-0 rounded-2xl animate-irregular-spin">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white via-transparent to-white opacity-40"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-l from-white/20 via-transparent to-white/60 rotate-45"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/30 via-transparent to-white/40 -rotate-12"></div>
          </div>
          
          {/* Carte pricing */}
          <div className="relative bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl">
            {/* Badge Popular */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                POPULAIRE
              </span>
            </div>
            
            {/* Titre du plan */}
            <h3 className="text-2xl font-bold text-white mt-6 mb-2">
              Premium
            </h3>
            
            {/* Prix */}
            <div className="mb-6 text-center">
              <span className="text-3xl sm:text-4xl font-bold text-white block mb-2">3 jours gratuits</span>
              <span className="text-lg text-gray-300">puis 29,99€ facturés mensuellement</span>
            </div>
            
            {/* Description */}
            <p className="text-gray-300 mb-8">
              Lancez votre créativité avec tous nos outils IA
            </p>
            
            {/* Liste des outils IA disponibles */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Kling AI - Avatars parlants ultra-réalistes</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Google Veo 3 - Vidéos haute définition</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Midjourney V7 - Images artistiques</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">DALL-E 3 - Création d'images uniques</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Video Upscale AI - Amélioration vidéo 8K</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">ChatGPT-4o - Assistant personnel complet</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Support prioritaire 24/7</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Accès à toutes les nouvelles IA en avant-première</span>
              </div>
            </div>
            
            {/* Bouton CTA */}
            <button className="btn-3d-effect bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-full transition w-full shadow-lg">
              Commencer
            </button>
            
            {/* Garantie */}
            <p className="text-xs text-gray-500 mt-4">
              Essai gratuit 7 jours • Sans engagement
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;