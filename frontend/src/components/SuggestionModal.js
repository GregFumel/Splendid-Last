import React, { useState } from "react";
import { X, Loader2 } from "lucide-react";

const SuggestionModal = ({ isOpen, onClose }) => {
  const [userInput, setUserInput] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestion = async () => {
    if (!userInput.trim()) {
      setResult("Veuillez décrire ce que vous souhaitez créer.");
      return;
    }

    setIsLoading(true);
    setResult("");

    // Simulate API call with mock response
    setTimeout(() => {
      const mockSuggestions = [
        "**SORA 2:** Le meilleur choix pour créer des vidéos cinématographiques de qualité exceptionnelle.",
        "**Google Veo 3.1:** Idéal pour créer des vidéos haute définition avec la dernière IA avancée de Google.",
        "**Alibaba Wan 2.5:** Parfait pour générer des vidéos de haute qualité avec une IA puissante.",
        "**Seedream 4:** Excellent pour créer des images ultra-réalistes et artistiques.",
        "**Grok:** IA puissante pour la génération d'images créatives et réalistes.",
        "**NanoBanana:** Générateur d'images avancé propulsé par Google Gemini.",
        "**Midjourney V7:** Parfait pour créer des images artistiques et photoréalistes à partir de votre description.",
        "**Kling AI:** Parfait pour générer des avatars parlants ultra-réalistes.",
        "**ChatGPT-5:** Votre meilleur assistant pour la rédaction, le codage et la création de contenu."
      ];
      
      const randomSuggestion = mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)];
      setResult(randomSuggestion);
      setIsLoading(false);
    }, 2000);
  };

  const handleClose = () => {
    setUserInput("");
    setResult("");
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8 max-w-lg w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <span>✨</span>
            <span>Assistant de Choix IA</span>
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <p className="text-gray-300 mb-6">
          Décrivez ce que vous souhaitez créer, et notre IA vous suggérera le meilleur outil.
        </p>
        
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full bg-white/5 border border-white/10 text-white rounded-xl p-3 h-24 resize-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none"
          placeholder="Ex: Une image photoréaliste d'un chat dans l'espace..."
        />
        
        {isLoading && (
          <div className="mt-4 min-h-[50px] flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}
        
        {result && !isLoading && (
          <div className="mt-4 p-4 bg-white/5 rounded-lg min-h-[50px] text-gray-200">
            <div dangerouslySetInnerHTML={{
              __html: result.replace(/\*\*(.*?):\*\*/g, '<strong class="text-white">$1:</strong>')
            }} />
          </div>
        )}
        
        <div className="flex justify-end items-center mt-6 space-x-4">
          <button
            onClick={handleClose}
            className="btn-3d-effect bg-gray-600 hover:bg-gray-700 text-white font-semibold px-5 py-2.5 rounded-full transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSuggestion}
            disabled={isLoading}
            className="btn-3d-effect bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-full transition"
          >
            Suggérer un outil
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionModal;