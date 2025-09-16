import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

const IdeasModal = ({ isOpen, onClose, tool }) => {
  const [ideas, setIdeas] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && tool) {
      generateIdeas();
    }
  }, [isOpen, tool]);

  const generateIdeas = async () => {
    setIsLoading(true);
    setIdeas("");

    // Simulate API call with mock ideas based on tool category
    setTimeout(() => {
      const mockIdeas = {
        video: `• Créez une vidéo promotionnelle pour votre startup avec des animations dynamiques
• Générez un clip musical avec des effets visuels synchronisés au rythme
• Réalisez un tutoriel animé expliquant un concept complexe de manière visuelle`,
        
        image: `• Concevez des illustrations pour votre livre de fiction avec un style artistique unique
• Créez des visuels pour vos réseaux sociaux avec une identité graphique cohérente
• Générez des concepts art pour votre jeu vidéo ou votre projet créatif`,
        
        edit: `• Restaurez et améliorez vos anciennes vidéos de famille en haute définition
• Upscalez vos contenus pour les diffuser sur des écrans 4K ou 8K
• Optimisez vos vidéos marketing pour une qualité professionnelle`,
        
        assist: `• Rédigez des articles de blog SEO-optimisés pour votre site web
• Créez des scripts de présentation percutants pour vos meetings
• Développez du code avec assistance IA pour accélérer vos projets`
      };

      const categoryIdeas = mockIdeas[tool.category] || mockIdeas.assist;
      setIdeas(categoryIdeas);
      setIsLoading(false);
    }, 1500);
  };

  const handleClose = () => {
    setIdeas("");
    setIsLoading(false);
    onClose();
  };

  if (!isOpen || !tool) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800/50 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-8 max-w-lg w-full m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">
            Idées pour {tool.name}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {isLoading ? (
          <div className="mt-4 min-h-[150px] flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="mt-4 p-4 bg-white/5 rounded-lg min-h-[150px] text-gray-200 whitespace-pre-wrap">
            {ideas}
          </div>
        )}
        
        <div className="flex justify-end items-center mt-6">
          <button
            onClick={handleClose}
            className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-full transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeasModal;