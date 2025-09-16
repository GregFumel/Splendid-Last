import React from "react";
import { Sparkles, Palette, Zap, Users } from "lucide-react";

const NanoBananaSection = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="max-w-6xl mx-auto">
        {/* En-tête de la section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            NanoBanana
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            Le générateur d'images le plus avancé, propulsé par Google Gemini
          </p>
        </div>

        {/* Contenu principal avec mise en page en deux colonnes */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Colonne gauche - Présentation */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Transformez vos idées en visuels époustouflants
              </h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                NanoBanana utilise la puissance de Google Gemini pour créer des images 
                détaillées et personnalisées à partir de vos prompts textuels. 
                Idéal pour les créateurs de contenu, designers, marketeurs et agences.
              </p>
            </div>

            {/* Fonctionnalités */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Images créatives</h4>
                  <p className="text-gray-400 text-sm">Génération d'images réalistes et artistiques</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Palette className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Styles variés</h4>
                  <p className="text-gray-400 text-sm">Réalisme, art numérique, cartoon et plus</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Rapidité optimisée</h4>
                  <p className="text-gray-400 text-sm">Génération ultra-rapide grâce à Gemini</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Users className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Pour tous</h4>
                  <p className="text-gray-400 text-sm">Créateurs, designers, marketeurs</p>
                </div>
              </div>
            </div>

            {/* Bouton CTA */}
            <div className="pt-4">
              <button className="btn-3d-effect bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-full transition shadow-lg shadow-purple-500/30">
                Essayer NanoBanana gratuitement
              </button>
            </div>
          </div>

          {/* Colonne droite - Aperçu visuel */}
          <div className="relative">
            {/* Card avec effet 3D */}
            <div className="relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-lg border border-purple-500/20 rounded-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              {/* Badge "Nouveau" */}
              <div className="absolute -top-3 right-6">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  NOUVEAU
                </span>
              </div>
              
              {/* Logo/Image placeholder */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-8 mb-6 text-center">
                <div className="text-6xl mb-4">🍌</div>
                <h4 className="text-xl font-bold text-white mb-2">NanoBanana</h4>
                <p className="text-gray-400 text-sm">Propulsé par Google Gemini</p>
              </div>
              
              {/* Stats fictives */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-400">99.9%</div>
                  <div className="text-xs text-gray-400">Précision</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-pink-400">2s</div>
                  <div className="text-xs text-gray-400">Génération</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">4K</div>
                  <div className="text-xs text-gray-400">Qualité</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NanoBananaSection;