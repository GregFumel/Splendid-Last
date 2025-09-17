import React, { useState } from "react";
import { Send, Sparkles, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockAITools } from "../data/mockData";

const Studio = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState(mockAITools[0]); // NanoBanana par défaut
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToolSelector, setShowToolSelector] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header avec glassmorphisme - même style que la page d'accueil */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md pt-5 pb-3">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Bouton menu mobile */}
              <button 
                onClick={() => setShowToolSelector(!showToolSelector)}
                className="md:hidden btn-3d-effect bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-white">Studio</h1>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-1.5 rounded-full transition text-sm"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
        
        {/* Sélecteur d'outils mobile */}
        {showToolSelector && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-white/10 max-h-80 overflow-y-auto">
            <div className="p-4 space-y-2">
              {mockAITools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setSelectedTool(tool);
                    setShowToolSelector(false);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                    selectedTool.id === tool.id
                      ? 'bg-blue-500/20 border border-blue-400/50'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <img 
                    src={getCategoryIcon(tool.category)} 
                    alt={`Icône ${tool.category}`}
                    className="w-5 h-5 filter brightness-0 invert opacity-80"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium text-sm ${
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
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="pt-20 flex h-screen gap-4 p-4">
        
        {/* Sidebar - Liste des IA avec arrondis - Desktop seulement */}
        <div className="hidden md:block w-80 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 overflow-y-auto">
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

        {/* Zone de travail principale avec arrondis */}
        <div className="flex-1 flex flex-col w-full md:w-auto">
          
          {/* En-tête de l'outil sélectionné avec arrondis complets */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-4">
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

          {/* Espace flexible au milieu */}
          <div className="flex-1">
            {/* Zone de résultat si présente */}
            {(result || isGenerating) && (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-4">
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
          </div>

          {/* Zone de prompt compacte en bas */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={`Demandez à ${selectedTool.name}...`}
                className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg py-2 md:py-0"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && prompt.trim() && !isGenerating) {
                    handleGenerate();
                  }
                }}
              />
              
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="btn-3d-effect bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg w-full md:w-auto flex-shrink-0"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span className="hidden md:inline">Génération en cours...</span>
                    <span className="md:hidden">Génération...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Générer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;