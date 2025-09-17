import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockAITools } from "../data/mockData";

const Studio = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState(mockAITools[0]); // NanoBanana par défaut
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Fonction pour obtenir l'icône selon la catégorie
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'assist':
        return 'https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/ae6l6pql_noun-prompt-8071301.png';
      case 'image':
        return 'https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/1ef3864v_noun-generative-image-8071314.png';
      case 'video':
        return 'https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/mjsnat4t_noun-video-8071313.png';
      default:
        return 'https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/1ef3864v_noun-generative-image-8071314.png';
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulation d'une génération
    setTimeout(() => {
      setResult(`Résultat généré avec ${selectedTool.name} :\n\n"${prompt}"\n\nCeci est un exemple de résultat généré par l'IA ${selectedTool.name}. Dans une vraie application, ceci serait le contenu créé par l'intelligence artificielle sélectionnée.`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header avec glassmorphisme - même style que la page d'accueil */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md pt-5 pb-3">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/5hgv17ws_613b2b7e0_splendid-logo-textcopycopy.png" 
                alt="Splendid"
                className="h-8 w-auto"
              />
              <h1 className="text-xl font-bold text-white">Studio</h1>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-full transition"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="pt-24 flex h-screen">
        
        {/* Sidebar - Liste des IA */}
        <div className="w-80 bg-black/20 backdrop-blur-lg border-r border-white/10 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-white mb-6">Outils IA disponibles</h2>
          
          <div className="space-y-2">
            {mockAITools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                  selectedTool.id === tool.id
                    ? 'bg-blue-500/20 border border-blue-400/50 shadow-lg shadow-blue-500/20'
                    : 'bg-white/5 hover:bg-white/10 border border-white/10'
                }`}
              >
                <img 
                  src={getCategoryIcon(tool.category)} 
                  alt={`Icône ${tool.category}`}
                  className="w-6 h-6 filter brightness-0 invert opacity-80"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className={`font-medium ${
                      selectedTool.id === tool.id ? 'text-white' : 'text-gray-300'
                    }`}>
                      {tool.name}
                    </span>
                    {tool.isNew && (
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                        New
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${
                    selectedTool.id === tool.id ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {tool.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Zone de travail principale */}
        <div className="flex-1 flex flex-col">
          
          {/* En-tête de l'outil sélectionné */}
          <div className="bg-black/10 backdrop-blur-sm border-b border-white/10 p-6">
            <div className="flex items-center space-x-4">
              <img 
                src={selectedTool.image} 
                alt={selectedTool.name}
                className="w-16 h-16 rounded-xl object-cover border border-white/20"
              />
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  {selectedTool.name}
                  {selectedTool.isNew && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      New
                    </span>
                  )}
                </h2>
                <p className="text-gray-300 mt-1">{selectedTool.description}</p>
              </div>
            </div>
          </div>

          {/* Zone de prompt et résultat */}
          <div className="flex-1 p-6 space-y-6">
            
            {/* Zone de prompt */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Prompt pour {selectedTool.name}
              </h3>
              
              <div className="space-y-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Décrivez ce que vous voulez créer avec ${selectedTool.name}...`}
                  className="w-full h-32 bg-black/20 border border-white/20 rounded-xl p-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-400 transition"
                />
                
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="btn-3d-effect bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold px-8 py-3 rounded-full transition flex items-center space-x-2 shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Génération en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Générer avec {selectedTool.name}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Zone de résultat */}
            {(result || isGenerating) && (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  <span>Résultat</span>
                </h3>
                
                <div className="bg-black/20 border border-white/20 rounded-xl p-4 min-h-32">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-gray-300">Génération en cours avec {selectedTool.name}...</p>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-gray-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {result}
                    </pre>
                  )}
                </div>
              </div>
            )}

            {/* Message d'accueil si pas de résultat */}
            {!result && !isGenerating && (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center">
                <img 
                  src={selectedTool.image} 
                  alt={selectedTool.name}
                  className="w-24 h-24 rounded-xl object-cover mx-auto mb-4 opacity-60"
                />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Bienvenue dans {selectedTool.name}
                </h3>
                <p className="text-gray-300 mb-4">
                  Commencez par écrire votre prompt dans la zone ci-dessus pour {selectedTool.fullDescription}.
                </p>
                <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-200 px-4 py-2 rounded-full">
                  <img 
                    src={getCategoryIcon(selectedTool.category)} 
                    alt={`Icône ${selectedTool.category}`}
                    className="w-4 h-4 filter brightness-0 invert"
                  />
                  <span className="text-sm font-medium capitalize">{selectedTool.category}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;