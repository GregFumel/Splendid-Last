import React, { useState, useEffect } from "react";
import { Send, Sparkles, Menu, X } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mockAITools } from "../data/mockData";

const Studio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedTool, setSelectedTool] = useState(mockAITools[0]); // NanoBanana par défaut
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToolSelector, setShowToolSelector] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // États pour NanoBanana
  const [sessionId, setSessionId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isNanoBanana, setIsNanoBanana] = useState(false);

  // Sélectionner l'outil basé sur le paramètre URL
  useEffect(() => {
    const toolId = searchParams.get('tool');
    if (toolId) {
      // Convertir toolId en nombre pour la comparaison
      const tool = mockAITools.find(t => t.id === parseInt(toolId));
      if (tool) {
        setSelectedTool(tool);
        console.log(`Outil sélectionné via URL: ${tool.name} (ID: ${tool.id})`);
      } else {
        console.log(`Outil non trouvé pour l'ID: ${toolId}`);
      }
    }
    
    // Nouvelle approche : scroller au maximum vers le haut, même en négatif
    const forceScrollToVeryTop = () => {
      // Essayer de scroller à des positions négatives pour "déborder" vers le haut
      const targetScroll = -20; // Position négative pour aller plus haut que 0
      
      const scrollToNegative = () => {
        try {
          // Forcer le scroll à une position négative
          window.scrollTo(0, targetScroll);
          document.documentElement.scrollTop = targetScroll;
          document.body.scrollTop = targetScroll;
          
          // Si ça ne marche pas, essayer avec 0
          setTimeout(() => {
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
          }, 10);
          
          // Puis réessayer le négatif
          setTimeout(() => {
            window.scrollTo(0, targetScroll);
            document.documentElement.scrollTop = targetScroll;
            document.body.scrollTop = targetScroll;
          }, 20);
          
        } catch (e) {
          // Si le scroll négatif ne marche pas, forcer à 0
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      };
      
      // Répéter plusieurs fois
      scrollToNegative();
      setTimeout(scrollToNegative, 50);
      setTimeout(scrollToNegative, 100);
      setTimeout(scrollToNegative, 200);
      setTimeout(scrollToNegative, 400);
      setTimeout(scrollToNegative, 600);
      setTimeout(scrollToNegative, 1000);
      setTimeout(scrollToNegative, 1500);
    };
    
    forceScrollToVeryTop();
  }, [searchParams]);
  
  // Initialiser la session NanoBanana quand l'outil change
  useEffect(() => {
    const isNanoBananaTool = selectedTool && selectedTool.name === "NanoBanana";
    setIsNanoBanana(isNanoBananaTool);
    
    if (isNanoBananaTool && !sessionId) {
      // Créer une nouvelle session pour NanoBanana
      initializeNanoBananaSession();
    } else if (!isNanoBananaTool) {
      // Réinitialiser pour les autres outils
      setConversationHistory([]);
      setResult("");
    }
  }, [selectedTool]);

  const initializeNanoBananaSession = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/nanobanana/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Session response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session');
      }
      
      const session = await response.json();
      console.log('Session créée:', session.id);
      setSessionId(session.id);
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session NanoBanana:', error);
    }
  };

  const loadConversationHistory = async (sessionIdToLoad) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/nanobanana/session/${sessionIdToLoad}`);
      
      console.log('History response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'historique');
      }
      
      const history = await response.json();
      console.log('Historique chargé:', history.length, 'messages');
      console.log('Historique détaillé:', history);
      setConversationHistory(history);
      console.log('State conversationHistory mis à jour avec:', history.length, 'messages');
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      setConversationHistory([]);
    }
  };

  // Scroll additionnel au montage du composant
  useEffect(() => {
    const forceScrollOnMount = () => {
      const scrollToTop = () => {
        window.scrollTo(0, -10); // Essayer légèrement négatif
        setTimeout(() => {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }, 10);
      };
      
      scrollToTop();
      setTimeout(scrollToTop, 100);
      setTimeout(scrollToTop, 300);
    };
    
    forceScrollOnMount();
  }, []);

  // Détection mobile avec une méthode plus fiable
  useEffect(() => {
    const checkIsMobile = () => {
      // Utiliser matchMedia pour une détection plus précise
      const mediaQuery = window.matchMedia('(max-width: 1023px)');
      setIsMobile(mediaQuery.matches);
    };
    
    checkIsMobile();
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    mediaQuery.addListener(checkIsMobile);
    
    return () => mediaQuery.removeListener(checkIsMobile);
  }, []);

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
    
    if (isNanoBanana && sessionId) {
      // Traitement spécial pour NanoBanana
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        console.log('Génération avec backend URL:', backendUrl);
        console.log('Session ID:', sessionId);
        console.log('Prompt:', prompt);
        
        const response = await fetch(`${backendUrl}/api/nanobanana/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            session_id: sessionId,
            prompt: prompt,
          }),
        });
        
        console.log('Generate response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la génération d\'image');
        }
        
        const result = await response.json();
        console.log('Résultat de génération:', result);
        
        // Recharger l'historique de conversation
        await loadConversationHistory(sessionId);
        
        // Vider le prompt après succès
        setPrompt("");
        
      } catch (error) {
        console.error('Erreur lors de la génération avec NanoBanana:', error);
        alert('Erreur lors de la génération d\'image. Veuillez réessayer.');
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Simulation pour les autres outils
      setTimeout(() => {
        setResult(`Résultat généré avec ${selectedTool.name} :\n\n"${prompt}"\n\nCeci est un exemple de résultat généré par l'IA ${selectedTool.name}. Dans une vraie application, ceci serait le contenu créé par l'intelligence artificielle sélectionnée.`);
        setIsGenerating(false);
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      {/* Fond d'écran */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_responsive-ai-tools/artifacts/aymwousi_85yt527h_unnamed.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      {/* Overlay subtile pour améliorer la lisibilité */}
      <div className="fixed inset-0 -z-10 bg-black/20"></div>
      {/* Header avec glassmorphisme - même style que la page d'accueil */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md pt-5 pb-3">
        <div className="w-full px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              {/* Bouton menu mobile */}
              {isMobile && (
                <button 
                  onClick={() => setShowToolSelector(!showToolSelector)}
                  className="btn-3d-effect bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
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
        {showToolSelector && isMobile && (
          <div className="absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border border-white/10 border-t-0 max-h-80 overflow-y-auto rounded-b-2xl shadow-2xl">
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
                    <div className="flex items-center space-x-3">
                      <span className={`font-medium text-sm ${
                        selectedTool.id === tool.id ? 'text-white' : 'text-gray-300'
                      }`}>
                        {tool.name}
                      </span>
                      {tool.isNew && (
                        <span className="badge-new-3d text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {/* Indicateur de scroll visuel */}
            <div className="h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
        )}
      </div>

      {/* Contenu principal */}
      <div className="pt-20 md:pt-20 flex h-screen gap-4 p-4" style={{ paddingTop: isMobile ? '6.5rem' : '5rem' }}>
        
        {/* Sidebar - Liste des IA avec arrondis - Desktop seulement */}
        {!isMobile && (
          <div className="w-80 bg-black/20 backdrop-blur-lg border border-white/10 rounded-2xl p-6 overflow-y-auto flex flex-col h-full">
          <h2 className="text-lg font-semibold text-white mb-6">Outils IA disponibles</h2>
          
          <div className="space-y-2 flex-1">
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
                  <div className="flex items-center space-x-3">
                    <span className={`font-medium ${
                      selectedTool.id === tool.id ? 'text-white' : 'text-gray-300'
                    }`}>
                      {tool.name}
                    </span>
                    {tool.isNew && (
                      <span className="badge-new-3d text-white px-2 py-0.5 rounded-full text-xs font-semibold">
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
        )}

        {/* Zone de travail principale avec arrondis */}
        <div className={`flex-1 flex flex-col h-full ${isMobile ? 'pb-24' : ''}`}>
          
          {/* En-tête de l'outil sélectionné avec arrondis complets */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-4 relative">
            {/* Badge New en haut à droite */}
            {selectedTool.isNew && (
              <span className="badge-new-3d text-white px-3 py-1 rounded-full text-sm font-semibold absolute top-4 right-4">
                New
              </span>
            )}
            
            <div className="flex items-center space-x-4">
              <img 
                src={selectedTool.image} 
                alt={selectedTool.name}
                className="w-16 h-16 rounded-xl object-cover border border-white/20"
              />
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {selectedTool.name}
                </h2>
                <p className="text-gray-300 mt-1">{selectedTool.description}</p>
              </div>
            </div>
          </div>

          {/* Espace flexible au milieu */}
          <div className="flex-1">
            {/* Historique conversationnel pour NanoBanana ou zone de résultat pour les autres */}
            {isNanoBanana ? (
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {console.log('🔍 Rendu - conversationHistory.length:', conversationHistory.length)}
                {console.log('🔍 Rendu - conversationHistory:', conversationHistory)}
                
                {conversationHistory.map((message, index) => {
                  console.log('🔄 Rendu message', index, ':', message);
                  return (
                    <div key={message.id || index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-xl p-4 ${
                        message.role === 'user' 
                          ? 'bg-blue-500/20 border border-blue-400/50 text-white' 
                          : 'bg-gray-700/50 border border-gray-600/50 text-gray-100'
                      }`}>
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        
                        {/* Affichage des images générées */}
                        {message.image_urls && message.image_urls.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {console.log('🖼️ Images à afficher pour message', index, ':', message.image_urls.length)}
                            {message.image_urls.map((imageUrl, imgIndex) => (
                              <div key={imgIndex} className="rounded-lg overflow-hidden border border-white/20">
                                <img 
                                  src={imageUrl} 
                                  alt={`Image générée ${imgIndex + 1}`}
                                  className="w-full h-auto max-w-sm"
                                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {conversationHistory.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <p>Aucun message dans l'historique</p>
                  </div>
                )}
                
                {/* Indicateur de génération en cours pour NanoBanana */}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700/50 border border-gray-600/50 rounded-xl p-4 max-w-xs">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                        <span className="text-sm text-gray-300">Génération d'image en cours...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Zone de résultat pour les autres outils */
              (result || isGenerating) && (
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
              )
            )}
          </div>

          {/* Zone de prompt compacte en bas */}
          <div className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 ${
            isMobile 
              ? 'fixed bottom-0 left-0 right-0 mx-4 mb-4 z-50 shadow-2xl' 
              : ''
          }`}>
            {isMobile ? (
              /* Layout mobile : vertical avec zone fixe */
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Demandez à ${selectedTool.name}...`}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg py-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && prompt.trim() && !isGenerating) {
                      handleGenerate();
                    }
                  }}
                />
                
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="btn-3d-effect bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg px-4 py-3 w-full"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Génération...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Générer</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Layout desktop : horizontal avec bouton petit à droite */
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Demandez à ${selectedTool.name}...`}
                  className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg py-2"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && prompt.trim() && !isGenerating) {
                      handleGenerate();
                    }
                  }}
                />
                
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="btn-3d-effect bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg px-4 py-2 flex-shrink-0"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Générer</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Générer</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Studio;