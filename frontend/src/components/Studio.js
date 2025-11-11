import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Send, Sparkles, Menu, X, Download, Plus, ChevronDown, ChevronUp, Maximize2, ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { mockAITools } from "../data/mockData";
import { useAuth } from "../context/AuthContext";

// Composant de comparaison avant-après avec slider sobre et ultra-fluide
const BeforeAfterSlider = ({ beforeImage, afterImage, onDownload }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const beforeImgRef = useRef(null);
  const afterImgRef = useRef(null);

  // Précharger les images pour des performances optimales
  useEffect(() => {
    let mounted = true;
    
    const preloadImages = async () => {
      try {
        const loadImage = (src) => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
          });
        };

        await Promise.all([
          loadImage(beforeImage),
          loadImage(afterImage)
        ]);

        if (mounted) {
          setImagesLoaded(true);
        }
      } catch (error) {
        console.error('Erreur de préchargement des images:', error);
        if (mounted) {
          setImagesLoaded(true); // Afficher quand même en cas d'erreur
        }
      }
    };

    preloadImages();

    return () => {
      mounted = false;
    };
  }, [beforeImage, afterImage]);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    
    // Annuler l'animation frame précédente
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Utiliser requestAnimationFrame pour une mise à jour fluide à 60 FPS
    animationFrameRef.current = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      
      // Limiter entre 0 et 100
      const newPosition = Math.min(Math.max(percentage, 0), 100);
      setSliderPosition(newPosition);
    });
  }, []);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  }, [handleMove]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.touches[0].clientX);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  useEffect(() => {
    if (isDragging) {
      const options = { passive: false, capture: true };
      
      document.addEventListener('mousemove', handleMouseMove, options);
      document.addEventListener('mouseup', handleMouseUp, options);
      document.addEventListener('touchmove', handleTouchMove, options);
      document.addEventListener('touchend', handleMouseUp, options);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove, options);
        document.removeEventListener('mouseup', handleMouseUp, options);
        document.removeEventListener('touchmove', handleTouchMove, options);
        document.removeEventListener('touchend', handleMouseUp, options);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  // Nettoyer l'animation frame au démontage
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const toggleFullscreen = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    setIsFullscreen(prev => !prev);
  }, []);

  // Mémoriser les styles pour éviter les recalculs
  const sliderStyle = useMemo(() => ({
    left: `${sliderPosition}%`,
    transform: 'translateX(-50%)',
    willChange: 'transform'
  }), [sliderPosition]);

  const clipPathStyle = useMemo(() => ({
    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
    willChange: 'clip-path',
    WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, // Support Safari
  }), [sliderPosition]);

  if (!imagesLoaded) {
    return (
      <div className="space-y-3">
        <div className="relative w-full rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center" style={{ aspectRatio: '16/9', maxHeight: '600px' }}>
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            <span className="text-gray-400 text-sm">Chargement des images...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Vue normale */}
      {!isFullscreen && (
        <div 
          ref={containerRef}
          className="relative w-full overflow-hidden cursor-ew-resize select-none"
          style={{ 
            aspectRatio: '16/9',
            maxHeight: '600px',
            borderRadius: '0.5rem',
            willChange: 'transform',
            transform: 'translateZ(0)', // Force GPU acceleration
            backfaceVisibility: 'hidden',
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Image AFTER (upscalée) - en arrière-plan */}
          <div className="absolute inset-0" style={{ transform: 'translateZ(0)' }}>
            <img 
              ref={afterImgRef}
              src={afterImage} 
              alt="Image upscalée (Après)"
              className="w-full h-full object-contain bg-gray-900"
              draggable={false}
              loading="eager"
              decoding="async"
              style={{ 
                pointerEvents: 'none',
                transform: 'translateZ(0)',
                imageRendering: 'crisp-edges'
              }}
            />
            <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded pointer-events-none">
              APRÈS
            </div>
          </div>

          {/* Image BEFORE (originale) - avec clip */}
          <div 
            className="absolute inset-0 overflow-hidden"
            style={clipPathStyle}
          >
            <img 
              ref={beforeImgRef}
              src={beforeImage} 
              alt="Image originale (Avant)"
              className="w-full h-full object-contain bg-gray-900"
              draggable={false}
              loading="eager"
              decoding="async"
              style={{ 
                pointerEvents: 'none',
                transform: 'translateZ(0)',
                imageRendering: 'crisp-edges'
              }}
            />
            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded pointer-events-none">
              AVANT
            </div>
          </div>

          {/* Ligne de séparation fine avec flèches réduites */}
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-lg cursor-ew-resize pointer-events-none"
            style={sliderStyle}
          >
            {/* Flèches au milieu - plus petites */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center bg-white/90 rounded-full shadow-xl px-0.5 py-1.5 pointer-events-none">
              <ChevronLeft className="w-3 h-3 text-gray-700" strokeWidth={3} />
              <ChevronRight className="w-3 h-3 text-gray-700" strokeWidth={3} />
            </div>
          </div>

          {/* Bouton plein écran */}
          <button
            onClick={toggleFullscreen}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white p-2 rounded-lg transition-colors pointer-events-auto z-10"
            title="Voir en plein écran"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bouton télécharger l'image upscalée */}
      {!isFullscreen && (
        <div className="flex justify-center">
          <button
            onClick={onDownload}
            className="bg-green-600/80 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
            title="Télécharger l'image upscalée"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger l'image upscalée</span>
          </button>
        </div>
      )}

      {/* Modal Plein écran */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
          {/* Bouton fermer en haut à droite */}
          <button
            onClick={toggleFullscreen}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white p-3 rounded-full transition-colors z-[10000] pointer-events-auto"
            title="Fermer le plein écran"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Slider en plein écran */}
          <div 
            ref={containerRef}
            className="w-full h-full cursor-ew-resize select-none"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{ 
              willChange: 'transform',
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          >
            {/* Image AFTER (upscalée) - en arrière-plan */}
            <div className="absolute inset-0" style={{ transform: 'translateZ(0)' }}>
              <img 
                src={afterImage} 
                alt="Image upscalée (Après)"
                className="w-full h-full object-contain bg-black"
                draggable={false}
                loading="eager"
                decoding="async"
                style={{ 
                  pointerEvents: 'none',
                  transform: 'translateZ(0)',
                  imageRendering: 'crisp-edges'
                }}
              />
              <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-sm px-4 py-2 rounded mr-16 pointer-events-none">
                APRÈS
              </div>
            </div>

            {/* Image BEFORE (originale) - avec clip */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={clipPathStyle}
            >
              <img 
                src={beforeImage} 
                alt="Image originale (Avant)"
                className="w-full h-full object-contain bg-black"
                draggable={false}
                loading="eager"
                decoding="async"
                style={{ 
                  pointerEvents: 'none',
                  transform: 'translateZ(0)',
                  imageRendering: 'crisp-edges'
                }}
              />
              <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white text-sm px-4 py-2 rounded pointer-events-none">
                AVANT
              </div>
            </div>

            {/* Ligne de séparation fine avec flèches réduites */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-2xl cursor-ew-resize pointer-events-none"
              style={sliderStyle}
            >
              {/* Flèches au milieu - plus petites */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center bg-white/90 rounded-full shadow-2xl px-1 py-2 pointer-events-none">
                <ChevronLeft className="w-3.5 h-3.5 text-gray-700" strokeWidth={3} />
                <ChevronRight className="w-3.5 h-3.5 text-gray-700" strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Studio = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, credits, loading } = useAuth();
  const [selectedTool, setSelectedTool] = useState(mockAITools.find(t => t.name === "NanoBanana") || mockAITools[0]); // NanoBanana par défaut
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToolSelector, setShowToolSelector] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // États pour les outils IA
  const [sessionId, setSessionId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isNanoBanana, setIsNanoBanana] = useState(false);
  const [isChatGPT5, setIsChatGPT5] = useState(false);
  const [isGoogleVeo, setIsGoogleVeo] = useState(false); // Pour Google Veo 3.1
  const [isSora2, setIsSora2] = useState(false); // Pour SORA 2
  const [isImageUpscaler, setIsImageUpscaler] = useState(false); // Pour AI Image Upscaler
  const [isFluxKontext, setIsFluxKontext] = useState(false); // Pour Flux Kontext Pro
  const [isKling, setIsKling] = useState(false); // Pour Kling AI v2.1
  const [isSeedream, setIsSeedream] = useState(false); // Pour Seedream 4
  const [isGrok, setIsGrok] = useState(false); // Pour Grok
  const [isAlibabaWan, setIsAlibabaWan] = useState(false); // Pour Alibaba Wan 2.5
  const [toolSessions, setToolSessions] = useState({}); // Stocker les sessions par outil
  const [isLoadingHistory, setIsLoadingHistory] = useState(false); // État pour l'animation de chargement
  
  // États pour l'upload d'images
  const [uploadedImage, setUploadedImage] = useState(null); // {file, dataUrl}
  const fileInputRef = useRef(null);

  // États pour l'upload d'images Kling (start et end)
  const [klingStartImage, setKlingStartImage] = useState(null); // {file, dataUrl, name}
  const [klingEndImage, setKlingEndImage] = useState(null); // {file, dataUrl, name}
  const klingStartInputRef = useRef(null);
  const klingEndInputRef = useRef(null);

  // États pour les options Google Veo 3.1
  const [veoOptions, setVeoOptions] = useState({
    duration: 8,  // 4 ou 8 secondes
    resolution: "1080p",  // 720p ou 1080p
    generateAudio: true  // avec ou sans son
  });
  const [showVeoOptions, setShowVeoOptions] = useState(true); // Par défaut dépliées

  // États pour les options SORA 2
  const [sora2Options, setSora2Options] = useState({
    seconds: 8,  // 4 ou 8 secondes
    aspectRatio: "landscape"  // landscape ou portrait
  });
  const [showSora2Options, setShowSora2Options] = useState(true); // Par défaut dépliées

  // États pour les options AI Image Upscaler
  const [upscalerOptions, setUpscalerOptions] = useState({
    scaleFactor: 2  // 2, 4 ou 8
  });
  const [showUpscalerOptions, setShowUpscalerOptions] = useState(true); // Par défaut dépliées

  // États pour les options Flux Kontext Pro
  const [fluxKontextOptions, setFluxKontextOptions] = useState({
    aspectRatio: "1:1",  // Default aspect ratio
    promptUpsampling: false,
    safetyTolerance: 2
  });
  const [showFluxKontextOptions, setShowFluxKontextOptions] = useState(true); // Par défaut dépliées

  // États pour les options Kling AI v2.1
  const [klingOptions, setKlingOptions] = useState({
    duration: 5,  // 5 ou 10 secondes
    mode: "standard",  // "standard" (720p) ou "pro" (1080p)
    negativePrompt: ""  // Ce qu'on ne veut pas voir
  });
  const [showKlingOptions, setShowKlingOptions] = useState(true); // Par défaut dépliées

  // États pour les options Seedream 4
  const [seedreamOptions, setSeedreamOptions] = useState({
    size: "2K",  // "1K", "2K", ou "4K"
    aspectRatio: "1:1"  // "1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "21:9"
  });
  const [showSeedreamOptions, setShowSeedreamOptions] = useState(true); // Par défaut dépliées

  // États pour les options Alibaba Wan 2.5
  const [alibabaWanOptions, setAlibabaWanOptions] = useState({
    duration: 5,  // 5 ou 10 secondes
    size: "1280*720"  // "832*480", "480*832", "1280*720", "720*1280", "1920*1080", "1080*1920"
  });
  const [showAlibabaWanOptions, setShowAlibabaWanOptions] = useState(true); // Par défaut dépliées

  // États pour Video Upscale AI
  const [isVideoUpscale, setIsVideoUpscale] = useState(false);
  const [videoUpscaleOptions, setVideoUpscaleOptions] = useState({
    targetResolution: "1080p",  // "720p", "1080p", "4k"
    targetFps: 30  // 25, 30, 40, 50, 60
  });
  const [showVideoUpscaleOptions, setShowVideoUpscaleOptions] = useState(true); // Par défaut dépliées
  const [uploadedVideo, setUploadedVideo] = useState(null); // {file, dataUrl, name}
  const videoUpscaleInputRef = useRef(null);


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
  
  // Initialiser la session quand l'outil change
  useEffect(() => {
    const isNanoBananaTool = selectedTool && selectedTool.name === "NanoBanana";
    const isChatGPT5Tool = selectedTool && selectedTool.name === "ChatGPT-5";
    const isGoogleVeoTool = selectedTool && selectedTool.name === "Google Veo 3.1";
    const isSora2Tool = selectedTool && selectedTool.name === "SORA 2";
    const isImageUpscalerTool = selectedTool && selectedTool.name === "Image Upscaler";
    const isFluxKontextTool = selectedTool && selectedTool.name === "Flux Kontext Pro";
    const isKlingTool = selectedTool && selectedTool.name === "Kling AI v2.1";
    const isSeedreamTool = selectedTool && selectedTool.name === "Seedream 4";
    const isGrokTool = selectedTool && selectedTool.name === "Grok";
    const isAlibabaWanTool = selectedTool && selectedTool.name === "Alibaba Wan 2.5";
    const isVideoUpscaleTool = selectedTool && selectedTool.name === "Video Upscale AI";
    
    setIsNanoBanana(isNanoBananaTool);
    setIsChatGPT5(isChatGPT5Tool);
    setIsGoogleVeo(isGoogleVeoTool);
    setIsSora2(isSora2Tool);
    setIsImageUpscaler(isImageUpscalerTool);
    setIsFluxKontext(isFluxKontextTool);
    setIsKling(isKlingTool);
    setIsSeedream(isSeedreamTool);
    setIsGrok(isGrokTool);
    setIsAlibabaWan(isAlibabaWanTool);
    setIsVideoUpscale(isVideoUpscaleTool);
    
    if (isNanoBananaTool || isChatGPT5Tool || isGoogleVeoTool || isSora2Tool || isImageUpscalerTool || isFluxKontextTool || isKlingTool || isSeedreamTool || isGrokTool || isAlibabaWanTool || isVideoUpscaleTool) {
      // Commencer l'animation de chargement
      setIsLoadingHistory(true);
      setConversationHistory([]); // Vider l'historique précédent immédiatement
      
      // Vérifier s'il y a déjà une session pour cet outil
      const existingSession = toolSessions[selectedTool.id];
      if (existingSession) {
        setSessionId(existingSession.sessionId);
        const toolType = isNanoBananaTool ? 'nanobanana' : isGoogleVeoTool ? 'google-veo' : isSora2Tool ? 'sora2' : isImageUpscalerTool ? 'image-upscaler' : isFluxKontextTool ? 'flux-kontext' : isKlingTool ? 'kling' : isVideoUpscaleTool ? 'video-upscale' : 'chatgpt5';
        loadConversationHistory(existingSession.sessionId, toolType);
      } else {
        // Créer une nouvelle session
        if (isNanoBananaTool) {
          initializeNanoBananaSession();
        } else if (isChatGPT5Tool) {
          initializeChatGPT5Session();
        } else if (isGoogleVeoTool) {
          initializeGoogleVeoSession();
        } else if (isSora2Tool) {
          initializeSora2Session();
        } else if (isImageUpscalerTool) {
          initializeImageUpscalerSession();
        } else if (isFluxKontextTool) {
          initializeFluxKontextSession();
        } else if (isKlingTool) {
          initializeKlingSession();
        } else if (isSeedreamTool) {
          initializeSeedreamSession();
        } else if (isGrokTool) {
          initializeGrokSession();
        } else if (isAlibabaWanTool) {
          initializeAlibabaWanSession();
        } else if (isVideoUpscaleTool) {
          initializeVideoUpscaleSession();
        }
      }
    } else {
      // Réinitialiser pour les autres outils
      setIsLoadingHistory(false);
      setConversationHistory([]);
      setResult("");
    }
  }, [selectedTool]);

  const initializeChatGPT5Session = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL ChatGPT-5:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/chatgpt5/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('ChatGPT-5 Session response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session ChatGPT-5');
      }
      
      const session = await response.json();
      console.log('Session ChatGPT-5 créée:', session.id);
      setSessionId(session.id);
      
      // Sauvegarder la session pour cet outil
      setToolSessions(prev => ({
        ...prev,
        [selectedTool.id]: {
          sessionId: session.id,
          toolName: selectedTool.name
        }
      }));
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id, 'chatgpt5');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session ChatGPT-5:', error);
      // Arrêter l'animation en cas d'erreur
      setIsLoadingHistory(false);
    }
  };

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
      
      // Sauvegarder la session pour cet outil
      setToolSessions(prev => ({
        ...prev,
        [selectedTool.id]: {
          sessionId: session.id,
          toolName: selectedTool.name
        }
      }));
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id, 'nanobanana');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session NanoBanana:', error);
      // Arrêter l'animation en cas d'erreur
      setIsLoadingHistory(false);
    }
  };


  const initializeGoogleVeoSession = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL Google Veo:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/google-veo/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Google Veo Session response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session Google Veo');
      }
      
      const session = await response.json();
      console.log('Session Google Veo créée:', session.id);
      setSessionId(session.id);
      
      // Sauvegarder la session pour cet outil
      setToolSessions(prev => ({
        ...prev,
        [selectedTool.id]: {
          sessionId: session.id,
          toolName: selectedTool.name
        }
      }));
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id, 'google-veo');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session Google Veo:', error);
      // Arrêter l'animation en cas d'erreur
      setIsLoadingHistory(false);
    }
  };


  const initializeSora2Session = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL SORA 2:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/sora2/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('SORA 2 Session response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session SORA 2');
      }
      
      const session = await response.json();
      console.log('Session SORA 2 créée:', session.id);
      setSessionId(session.id);
      
      // Sauvegarder la session pour cet outil
      setToolSessions(prev => ({
        ...prev,
        [selectedTool.id]: {
          sessionId: session.id,
          toolName: selectedTool.name
        }
      }));
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id, 'sora2');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session SORA 2:', error);
      // Arrêter l'animation en cas d'erreur
      setIsLoadingHistory(false);
    }
  };


  const initializeImageUpscalerSession = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL AI Image Upscaler:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/image-upscaler/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('AI Image Upscaler Session response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session AI Image Upscaler');
      }
      
      const session = await response.json();
      console.log('Session AI Image Upscaler créée:', session.id);
      setSessionId(session.id);
      
      // Sauvegarder la session pour cet outil
      setToolSessions(prev => ({
        ...prev,
        [selectedTool.id]: {
          sessionId: session.id,
          toolName: selectedTool.name
        }
      }));
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id, 'image-upscaler');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session AI Image Upscaler:', error);
      // Arrêter l'animation en cas d'erreur
      setIsLoadingHistory(false);
    }
  };

  const initializeFluxKontextSession = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL Flux Kontext Pro:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/flux-kontext/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Flux Kontext Pro Session response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session Flux Kontext Pro');
      }
      
      const session = await response.json();
      console.log('Session Flux Kontext Pro créée:', session.id);
      setSessionId(session.id);
      
      // Sauvegarder la session pour cet outil
      setToolSessions(prev => ({
        ...prev,
        [selectedTool.id]: {
          sessionId: session.id,
          toolName: selectedTool.name
        }
      }));
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id, 'flux-kontext');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session Flux Kontext Pro:', error);
      // Arrêter l'animation en cas d'erreur
      setIsLoadingHistory(false);
    }
  };

  const initializeKlingSession = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL Kling AI v2.1:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/kling/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Kling AI v2.1 Session response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session Kling AI');
      }
      
      const session = await response.json();
      console.log('Session Kling AI v2.1 créée:', session.id);
      setSessionId(session.id);
      
      // Sauvegarder la session pour cet outil
      setToolSessions(prev => ({
        ...prev,
        [selectedTool.id]: {
          sessionId: session.id,
          toolName: selectedTool.name
        }
      }));
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id, 'kling');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session Kling AI:', error);
      // Arrêter l'animation en cas d'erreur
      setIsLoadingHistory(false);
    }
  };

  const initializeSeedreamSession = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL Seedream 4:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/seedream/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Seedream 4 Session response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session Seedream 4');
      }
      
      const session = await response.json();
      console.log('Session Seedream 4 créée:', session.id);
      setSessionId(session.id);
      
      // Sauvegarder la session pour cet outil
      setToolSessions(prev => ({
        ...prev,
        [selectedTool.id]: {
          sessionId: session.id,
          toolName: selectedTool.name
        }
      }));
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id, 'seedream');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session Seedream 4:', error);
      // Arrêter l'animation en cas d'erreur
      setIsLoadingHistory(false);
    }
  };

  const initializeGrokSession = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL Grok:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/grok/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Grok Session response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session Grok');
      }
      
      const session = await response.json();
      console.log('Session Grok créée:', session.id);
      setSessionId(session.id);
      
      // Sauvegarder la session pour cet outil
      setToolSessions(prev => ({
        ...prev,
        [selectedTool.id]: {
          sessionId: session.id,
          toolName: selectedTool.name
        }
      }));
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id, 'grok');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session Grok:', error);
      // Arrêter l'animation en cas d'erreur
      setIsLoadingHistory(false);
    }
  };

  const initializeAlibabaWanSession = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL Alibaba Wan 2.5:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/alibaba-wan/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Alibaba Wan 2.5 Session response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session Alibaba Wan 2.5');
      }
      
      const session = await response.json();
      console.log('Session Alibaba Wan 2.5 créée:', session.id);
      setSessionId(session.id);
      
      // Sauvegarder la session pour cet outil
      setToolSessions(prev => ({
        ...prev,
        [selectedTool.id]: {
          sessionId: session.id,
          toolName: selectedTool.name
        }
      }));
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id, 'alibaba-wan');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session Alibaba Wan 2.5:', error);
      // Arrêter l'animation en cas d'erreur
      setIsLoadingHistory(false);
    }
  };

  const initializeVideoUpscaleSession = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      console.log('Backend URL Video Upscale AI:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/video-upscale/session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Video Upscale AI Session response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la création de la session Video Upscale AI');
      }
      
      const session = await response.json();
      console.log('Session Video Upscale AI créée:', session.id);
      setSessionId(session.id);
      
      // Sauvegarder la session pour cet outil
      setToolSessions(prev => ({
        ...prev,
        [selectedTool.id]: {
          sessionId: session.id,
          toolName: selectedTool.name
        }
      }));
      
      // Charger l'historique existant (vide pour une nouvelle session)
      loadConversationHistory(session.id, 'video-upscale');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la session Video Upscale AI:', error);
      // Arrêter l'animation en cas d'erreur
      setIsLoadingHistory(false);
    }
  };


  const loadConversationHistory = async (sessionIdToLoad, toolType) => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const endpoint = toolType === 'nanobanana' ? 'nanobanana' : toolType === 'google-veo' ? 'google-veo' : toolType === 'sora2' ? 'sora2' : toolType === 'image-upscaler' ? 'image-upscaler' : toolType === 'flux-kontext' ? 'flux-kontext' : toolType === 'kling' ? 'kling' : toolType === 'seedream' ? 'seedream' : toolType === 'grok' ? 'grok' : toolType === 'alibaba-wan' ? 'alibaba-wan' : toolType === 'video-upscale' ? 'video-upscale' : 'chatgpt5';
      const url = `${backendUrl}/api/${endpoint}/session/${sessionIdToLoad}`;
      console.log('🌐 Chargement historique depuis:', url);
      
      const response = await fetch(url);
      
      console.log(`📡 ${toolType} History response status:`, response.status);
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement de l\'historique');
      }
      
      const history = await response.json();
      console.log(`📜 Historique ${toolType} chargé:`, history.length, 'messages');
      console.log(`📝 Historique ${toolType} détaillé:`, history);
      
      // Log spécial pour les images NanoBanana
      if (toolType === 'nanobanana') {
        const messagesWithImages = history.filter(m => m.image_urls && m.image_urls.length > 0);
        console.log('🖼️ Messages avec images NanoBanana:', messagesWithImages.length);
        messagesWithImages.forEach((msg, idx) => {
          console.log(`  Image ${idx + 1}:`, {
            role: msg.role,
            imageCount: msg.image_urls.length,
            firstImagePreview: msg.image_urls[0]?.substring(0, 50) + '...'
          });
        });
      }
      
      // Log spécial pour les vidéos Google Veo
      if (toolType === 'google-veo') {
        const messagesWithVideos = history.filter(m => m.video_urls && m.video_urls.length > 0);
        console.log('🎬 Messages avec vidéos Google Veo:', messagesWithVideos.length);
        messagesWithVideos.forEach((msg, idx) => {
          console.log(`  Vidéo ${idx + 1}:`, {
            role: msg.role,
            videoCount: msg.video_urls.length,
            firstVideoPreview: msg.video_urls[0]?.substring(0, 50) + '...'
          });
        });
      }
      
      // Log spécial pour les vidéos SORA 2
      if (toolType === 'sora2') {
        const messagesWithVideos = history.filter(m => m.video_urls && m.video_urls.length > 0);
        console.log('🎬 Messages avec vidéos SORA 2:', messagesWithVideos.length);
        messagesWithVideos.forEach((msg, idx) => {
          console.log(`  Vidéo ${idx + 1}:`, {
            role: msg.role,
            videoCount: msg.video_urls.length,
            firstVideoPreview: msg.video_urls[0]?.substring(0, 50) + '...'
          });
        });
      }
      
      // Log spécial pour les images AI Image Upscaler
      if (toolType === 'image-upscaler') {
        const messagesWithImages = history.filter(m => m.image_urls && m.image_urls.length > 0);
        console.log('🔍 Messages avec images AI Image Upscaler:', messagesWithImages.length);
        messagesWithImages.forEach((msg, idx) => {
          console.log(`  Image ${idx + 1}:`, {
            role: msg.role,
            imageCount: msg.image_urls.length,
            firstImagePreview: msg.image_urls[0]?.substring(0, 50) + '...'
          });
        });
      }
      
      // Log spécial pour les images Flux Kontext Pro
      if (toolType === 'flux-kontext') {
        const messagesWithImages = history.filter(m => m.image_urls && m.image_urls.length > 0);
        console.log('🎨 Messages avec images Flux Kontext Pro:', messagesWithImages.length);
        messagesWithImages.forEach((msg, idx) => {
          console.log(`  Image ${idx + 1}:`, {
            role: msg.role,
            imageCount: msg.image_urls.length,
            firstImagePreview: msg.image_urls[0]?.substring(0, 50) + '...'
          });
        });
      }
      
      // Log spécial pour les vidéos Kling AI
      if (toolType === 'kling') {
        const messagesWithVideos = history.filter(m => m.video_urls && m.video_urls.length > 0);
        console.log('🎬 Messages avec vidéos Kling AI:', messagesWithVideos.length);
        messagesWithVideos.forEach((msg, idx) => {
          console.log(`  Vidéo ${idx + 1}:`, {
            role: msg.role,
            videoCount: msg.video_urls.length,
            firstVideoPreview: msg.video_urls[0]?.substring(0, 50) + '...'
          });
        });
      }
      
      setConversationHistory([...history]); // Force new array reference for React
      console.log(`✅ State conversationHistory mis à jour avec:`, history.length, 'messages');
      
      // Arrêter l'animation de chargement
      setIsLoadingHistory(false);
    } catch (error) {
      console.error(`❌ Erreur lors du chargement de l'historique ${toolType}:`, error);
      setConversationHistory([]);
      // Arrêter l'animation même en cas d'erreur
      setIsLoadingHistory(false);
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

  // Logger les changements de conversationHistory
  useEffect(() => {
    console.log('🔔 conversationHistory a changé! Nombre de messages:', conversationHistory.length);
    if (isNanoBanana && conversationHistory.length > 0) {
      const assistantMessages = conversationHistory.filter(m => m.role === 'assistant');
      const messagesWithImages = assistantMessages.filter(m => m.image_urls && m.image_urls.length > 0);
      console.log('🖼️ Messages assistant NanoBanana:', assistantMessages.length);
      console.log('🎨 Messages assistant avec images:', messagesWithImages.length);
      if (messagesWithImages.length > 0) {
        console.log('✅ Images disponibles pour affichage:', messagesWithImages.map(m => ({
          id: m.id,
          imageCount: m.image_urls.length
        })));
      } else {
        console.warn('⚠️ Aucune image trouvée dans les messages assistant');
      }
    }
  }, [conversationHistory, isNanoBanana]);

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
    // Pour AI Image Upscaler, une image est requise
    if (isImageUpscaler && !uploadedImage) {
      alert('Veuillez uploader une image à upscaler');
      return;
    }
    
    // Pour Kling AI, une start_image est obligatoire
    if (isKling && !klingStartImage) {
      alert('Veuillez uploader une image de départ (obligatoire)');
      return;
    }
    
    // Pour Kling AI avec end_image, le mode pro est obligatoire
    if (isKling && klingEndImage && klingOptions.mode !== "pro") {
      alert('L\'image de fin nécessite le mode "Pro (1080p)"');
      return;
    }
    
    // Pour Video Upscale AI, une vidéo est obligatoire
    if (isVideoUpscale && !uploadedVideo) {
      alert('Veuillez uploader une vidéo à upscaler');
      return;
    }
    
    if (!isImageUpscaler && !isFluxKontext && !isKling && !isSeedream && !isGrok && !isAlibabaWan && !isVideoUpscale && !prompt.trim()) return;
    
    // Pour Flux Kontext, un prompt est requis
    if (isFluxKontext && !prompt.trim()) {
      alert('Veuillez entrer un prompt pour générer ou éditer une image');
      return;
    }
    
    // Pour Kling AI, un prompt est requis
    if (isKling && !prompt.trim()) {
      alert('Veuillez entrer un prompt pour générer la vidéo');
      return;
    }
    
    // Pour Seedream 4, un prompt est requis
    if (isSeedream && !prompt.trim()) {
      alert('Veuillez entrer un prompt pour générer l\'image');
      return;
    }
    
    setIsGenerating(true);
    
    if ((isNanoBanana || isChatGPT5 || isGoogleVeo || isSora2 || isImageUpscaler || isFluxKontext || isKling || isSeedream || isGrok || isAlibabaWan || isVideoUpscale) && sessionId) {
      // Traitement pour NanoBanana, ChatGPT-5, Google Veo, SORA 2, Image Upscaler et Flux Kontext
      try {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        console.log('Génération avec backend URL:', backendUrl);
        console.log('Session ID:', sessionId);
        console.log('Prompt:', prompt);
        console.log('Outil:', isNanoBanana ? 'NanoBanana' : isGoogleVeo ? 'Google Veo 3.1' : isSora2 ? 'SORA 2' : isImageUpscaler ? 'AI Image Upscaler' : isFluxKontext ? 'Flux Kontext Pro' : 'ChatGPT-5');
        
        let endpoint, requestBody;
        
        if (isImageUpscaler) {
          // Upscaler nécessite une image et un scale_factor
          endpoint = 'image-upscaler/upscale';
          requestBody = {
            session_id: sessionId,
            image_data: uploadedImage.dataUrl,
            scale_factor: upscalerOptions.scaleFactor
          };
        } else if (isFluxKontext) {
          // Flux Kontext peut avoir ou non une image de référence
          endpoint = 'flux-kontext/generate';
          requestBody = {
            session_id: sessionId,
            prompt: prompt,
            aspect_ratio: fluxKontextOptions.aspectRatio,
            prompt_upsampling: fluxKontextOptions.promptUpsampling,
            safety_tolerance: fluxKontextOptions.safetyTolerance
          };
          
          // Ajouter l'image de référence si une image est uploadée
          if (uploadedImage) {
            requestBody.input_image = uploadedImage.dataUrl;
          }
        } else if (isKling) {
          // Kling AI v2.1 - génération de vidéo à partir d'images
          endpoint = 'kling/generate';
          requestBody = {
            session_id: sessionId,
            prompt: prompt,
            start_image: klingStartImage.dataUrl,  // Obligatoire
            mode: klingOptions.mode,
            duration: klingOptions.duration,
            negative_prompt: klingOptions.negativePrompt || ""
          };
          
          // Ajouter l'image de fin si uploadée (nécessite mode pro)
          if (klingEndImage) {
            requestBody.end_image = klingEndImage.dataUrl;
          }
        } else if (isSeedream) {
          // Seedream 4 - génération d'image text-to-image ou image-to-image
          endpoint = 'seedream/generate';
          requestBody = {
            session_id: sessionId,
            prompt: prompt,
            size: seedreamOptions.size,
            aspect_ratio: seedreamOptions.aspectRatio
          };
          
          // Ajouter l'image input si uploadée (optionnelle)
          if (uploadedImage) {
            requestBody.image_input = uploadedImage.dataUrl;
          }
        } else if (isGrok) {
          // Grok - génération d'image text-to-image simple
          endpoint = 'grok/generate';
          requestBody = {
            session_id: sessionId,
            prompt: prompt
          };
        } else if (isAlibabaWan) {
          // Alibaba Wan 2.5 - génération de vidéo text-to-video
          endpoint = 'alibaba-wan/generate';
          requestBody = {
            session_id: sessionId,
            prompt: prompt,
            duration: alibabaWanOptions.duration,
            size: alibabaWanOptions.size
          };
        } else if (isVideoUpscale) {
          // Video Upscale AI - upscaling de vidéo
          console.log('🎬 Video Upscale AI - Preparing request');
          console.log('📹 uploadedVideo:', uploadedVideo ? `${uploadedVideo.name} (${(uploadedVideo.dataUrl.length / 1024 / 1024).toFixed(2)}MB)` : 'null');
          console.log('⚙️ Options:', videoUpscaleOptions);
          
          endpoint = 'video-upscale/generate';
          requestBody = {
            session_id: sessionId,
            video_input: uploadedVideo.dataUrl,  // Obligatoire
            target_resolution: videoUpscaleOptions.targetResolution,
            target_fps: videoUpscaleOptions.targetFps
          };
          
          console.log('📤 Request body prepared (video_input length:', uploadedVideo.dataUrl.length, 'chars)');
        } else {
          // Autres outils
          endpoint = isNanoBanana ? 'nanobanana/generate' : isGoogleVeo ? 'google-veo/generate' : isSora2 ? 'sora2/generate' : 'chatgpt5/generate';
          requestBody = {
            session_id: sessionId,
            prompt: prompt,
          };
        }
        
        // Ajouter l'image pour ChatGPT-5 ou NanoBanana si une image est uploadée
        if ((isChatGPT5 || isNanoBanana) && uploadedImage) {
          requestBody.image_data = uploadedImage.dataUrl;
          requestBody.image_name = uploadedImage.name;
        }
        
        // Paramètres spécifiques pour Google Veo 3.1 - utiliser les options choisies
        if (isGoogleVeo) {
          requestBody.duration = veoOptions.duration;
          requestBody.aspect_ratio = "16:9";
          requestBody.resolution = veoOptions.resolution;
          requestBody.generate_audio = veoOptions.generateAudio;
        }
        
        // Paramètres spécifiques pour SORA 2 - utiliser les options choisies
        if (isSora2) {
          requestBody.seconds = sora2Options.seconds;
          requestBody.aspect_ratio = sora2Options.aspectRatio;
          // Ajouter l'image de référence si uploadée
          if (uploadedImage) {
            requestBody.input_reference = uploadedImage.dataUrl;
          }
        }
        
        // Paramètres spécifiques pour Seedream 4
        if (isSeedream) {
          requestBody.size = seedreamOptions.size;
          requestBody.aspect_ratio = seedreamOptions.aspectRatio;
          // Ajouter l'image input si uploadée (optionnelle)
          if (uploadedImage) {
            requestBody.image_input = uploadedImage.dataUrl;
          }
        }
        
        const response = await fetch(`${backendUrl}/api/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
        
        console.log('Generate response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Erreur lors de la génération');
        }
        
        const result = await response.json();
        console.log('✅ Résultat de génération reçu:', result);
        console.log('📊 Détails result:', {
          hasImageUrl: !!result.image_url,
          hasVideoUrl: !!result.video_urls,
          hasResponseText: !!result.response_text,
          imageUrlLength: result.image_url?.length || 0,
          videoUrlsCount: result.video_urls?.length || 0
        });
        
        // Recharger l'historique de conversation
        const toolType = isNanoBanana ? 'nanobanana' : isGoogleVeo ? 'google-veo' : isSora2 ? 'sora2' : isImageUpscaler ? 'image-upscaler' : isFluxKontext ? 'flux-kontext' : isKling ? 'kling' : isSeedream ? 'seedream' : isGrok ? 'grok' : isAlibabaWan ? 'alibaba-wan' : isVideoUpscale ? 'video-upscale' : 'chatgpt5';
        console.log('🔄 Rechargement historique pour session:', sessionId, 'type:', toolType);
        await loadConversationHistory(sessionId, toolType);
        console.log('✅ Historique rechargé, conversationHistory.length:', conversationHistory.length);
        
        // Vider le prompt et les images uploadées
        setPrompt("");
        if (isChatGPT5 || isNanoBanana || isGoogleVeo || isSora2 || isImageUpscaler || isFluxKontext || isSeedream || isGrok) {
          setUploadedImage(null);
        }
        if (isKling) {
          setKlingStartImage(null);
          setKlingEndImage(null);
        }
        if (isVideoUpscale) {
          setUploadedVideo(null);
        }
        
      } catch (error) {
        console.error('Erreur lors de la génération:', error);
        alert('Erreur lors de la génération. Veuillez réessayer.');
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

  // Fonction pour télécharger une image
  const handleDownloadImage = async (imageUrl, messageId) => {
    try {
      console.log('📥 Téléchargement de l\'image en cours...');
      
      // Fetch l'image depuis l'URL
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement de l\'image');
      }
      
      // Convertir en blob
      const blob = await response.blob();
      
      // Créer une URL blob locale
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Créer un élément anchor pour télécharger
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `image-${messageId}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Libérer l'URL blob
      window.URL.revokeObjectURL(blobUrl);
      
      console.log('✅ Image téléchargée avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement de l\'image:', error);
      alert('Erreur lors du téléchargement de l\'image. Veuillez réessayer.');
    }
  };


  // Fonction pour télécharger une vidéo
  const handleDownloadVideo = async (videoUrl, messageId) => {
    try {
      // Afficher un message de chargement
      console.log('Téléchargement de la vidéo en cours...');
      
      // Fetch la vidéo depuis l'URL Replicate
      const response = await fetch(videoUrl);
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement de la vidéo');
      }
      
      // Convertir en blob
      const blob = await response.blob();
      
      // Créer une URL locale du blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Créer un élément anchor pour télécharger
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `google-veo-video-${messageId}-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Libérer la mémoire
      window.URL.revokeObjectURL(blobUrl);
      
      console.log('✅ Vidéo téléchargée avec succès!');
    } catch (error) {
      console.error('❌ Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement de la vidéo. Veuillez réessayer.');
    }
  };



  // Fonctions pour l'upload d'images
  const handleImageUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage({
          file: file,
          dataUrl: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Veuillez sélectionner un fichier image valide.');
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fonctions pour l'upload d'images Kling (start et end)
  const handleKlingStartImageUpload = () => {
    if (klingStartInputRef.current) {
      klingStartInputRef.current.click();
    }
  };

  const handleKlingEndImageUpload = () => {
    if (klingEndInputRef.current) {
      klingEndInputRef.current.click();
    }
  };

  const handleKlingStartFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setKlingStartImage({
          file: file,
          dataUrl: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Veuillez sélectionner un fichier image valide.');
    }
  };

  const handleKlingEndFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setKlingEndImage({
          file: file,
          dataUrl: e.target.result,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    } else {
      alert('Veuillez sélectionner un fichier image valide.');
    }
  };

  const removeKlingStartImage = () => {
    setKlingStartImage(null);
    if (klingStartInputRef.current) {
      klingStartInputRef.current.value = '';
    }
  };

  const removeKlingEndImage = () => {
    setKlingEndImage(null);
    if (klingEndInputRef.current) {
      klingEndInputRef.current.value = '';
    }
  };

  // Fonctions pour l'upload de vidéo (Video Upscale AI)
  const handleVideoUpscaleUpload = () => {
    if (videoUpscaleInputRef.current) {
      videoUpscaleInputRef.current.click();
    }
  };

  const handleVideoUpscaleFileSelect = (event) => {
    const file = event.target.files[0];
    console.log('📹 Video file selected:', file ? file.name : 'none', file ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : '');
    
    if (file && file.type.startsWith('video/')) {
      console.log('✅ Valid video file, starting FileReader...');
      const reader = new FileReader();
      
      reader.onload = (e) => {
        console.log('✅ FileReader onload triggered, data URL length:', e.target.result.length);
        setUploadedVideo({
          file: file,
          dataUrl: e.target.result,
          name: file.name
        });
        console.log('✅ uploadedVideo state set successfully');
      };
      
      reader.onerror = (e) => {
        console.error('❌ FileReader error:', e);
        alert('Erreur lors de la lecture de la vidéo');
      };
      
      reader.readAsDataURL(file);
      console.log('📖 FileReader.readAsDataURL() called');
    } else {
      console.error('❌ Invalid file type:', file ? file.type : 'no file');
      alert('Veuillez sélectionner un fichier vidéo valide.');
    }
  };

  const removeUploadedVideo = () => {
    setUploadedVideo(null);
    if (videoUpscaleInputRef.current) {
      videoUpscaleInputRef.current.value = '';
    }
  };

  // Vérifier l'authentification et l'abonnement
  useEffect(() => {
    if (!loading && (!user || !isPremium)) {
      // Rediriger vers la page d'accueil avec section pricing
      navigate('/?section=pricing');
    }
  }, [user, isPremium, loading, navigate]);

  // Afficher un écran de chargement pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-white text-xl">Chargement...</p>
      </div>
    );
  }

  // Si pas connecté ou pas premium, ne rien afficher (redirection en cours)
  if (!user || !isPremium) {
    return null;
  }

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
                      {tool.isTop && (
                        <span className="badge-top-3d text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          TOP
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
                    {tool.isTop && (
                      <span className="badge-top-3d text-white px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        TOP
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
        <div className="flex-1 flex flex-col h-full relative">
          
          {/* En-tête de l'outil sélectionné - GLASMORPHISME */}
          <div className="bg-black/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-4 relative flex-shrink-0 z-20 sticky top-0">            
            {/* Badge New en haut à droite */}
            {selectedTool.isNew && (
              <span className="badge-new-3d text-white px-3 py-1 rounded-full text-sm font-semibold absolute top-4 right-4">
                New
              </span>
            )}
            
            {/* Badge TOP en haut à droite avec effet 3D */}
            {selectedTool.isTop && (
              <span className="badge-top-3d text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold absolute top-2 sm:top-4 right-2 sm:right-4 flex items-center gap-1 sm:gap-1.5">
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                TOP
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

          {/* Zone de discussion scrollable - SIMPLE */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 min-h-0 max-h-full pb-32">
            {/* Historique conversationnel pour NanoBanana, ChatGPT-5, Google Veo, SORA 2, Image Upscaler, Flux Kontext, Kling AI, Seedream 4, Grok, Alibaba Wan et Video Upscale ou zone de résultat pour les autres */}
            {(isNanoBanana || isChatGPT5 || isGoogleVeo || isSora2 || isImageUpscaler || isFluxKontext || isKling || isSeedream || isGrok || isAlibabaWan || isVideoUpscale) ? (
              <>
                {/* Animation de chargement de l'historique */}
                {isLoadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="relative">
                      {/* Cercle principal animé */}
                      <div className="w-12 h-12 border-4 border-blue-500/20 rounded-full animate-spin border-t-blue-500"></div>
                      {/* Cercles secondaires pour l'effet */}
                      <div className="absolute top-0 left-0 w-12 h-12 border-4 border-purple-500/20 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-gray-300 font-medium">Chargement de {selectedTool.name}</p>
                      <div className="flex space-x-1 justify-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {conversationHistory.map((message, index) => (
                      <div key={message.id || index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                        <div className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-xl p-4 ${
                          message.role === 'user' 
                            ? 'bg-blue-500/20 border border-blue-400/50 text-white' 
                            : 'bg-gray-700/50 border border-gray-600/50 text-gray-100'
                        }`}>
                          <div className="text-sm whitespace-pre-wrap mb-2">{message.content}</div>
                          
                          {/* Affichage des images uploadées par l'utilisateur */}
                          {message.role === 'user' && message.image_urls && message.image_urls.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.image_urls.map((imageUrl, imgIndex) => (
                                <div key={imgIndex} className="rounded-lg overflow-hidden border border-blue-400/30">
                                  <img 
                                    src={imageUrl} 
                                    alt={`Image uploadée ${imgIndex + 1}`}
                                    className="w-full h-auto max-w-sm"
                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Affichage des vidéos uploadées par l'utilisateur pour Video Upscale AI */}
                          {isVideoUpscale && message.role === 'user' && message.video_urls && message.video_urls.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.video_urls.map((videoUrl, vidIndex) => (
                                <div key={vidIndex} className="rounded-lg overflow-hidden border border-teal-400/30">
                                  <video 
                                    src={videoUrl} 
                                    controls
                                    className="w-full h-auto max-w-sm"
                                    style={{ maxHeight: '200px', objectFit: 'contain' }}
                                    preload="metadata"
                                  >
                                    Votre navigateur ne supporte pas la balise vidéo.
                                  </video>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Affichage des images générées pour NanoBanana, Flux Kontext Pro, Seedream 4 et Grok */}
                          {(isNanoBanana || isFluxKontext || isSeedream || isGrok) && message.role === 'assistant' && message.image_urls && message.image_urls.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.image_urls.map((imageUrl, imgIndex) => (
                                <div key={imgIndex} className="rounded-lg overflow-hidden border border-white/20">
                                  <img 
                                    src={imageUrl} 
                                    alt={`Image générée ${imgIndex + 1}`}
                                    className="w-full h-auto max-w-sm"
                                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                                  />
                                  
                                  {/* Bouton télécharger uniquement */}
                                  <div className="p-3 bg-black/20 flex justify-center">
                                    <button
                                      onClick={() => handleDownloadImage(imageUrl, message.id)}
                                      className={`${isFluxKontext ? 'bg-orange-600/80 hover:bg-orange-600' : 'bg-gray-600/80 hover:bg-gray-600'} text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm`}
                                      title="Télécharger l'image"
                                    >
                                      <Download className="w-4 h-4" />
                                      <span>Télécharger</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Affichage des images upscalées pour AI Image Upscaler avec slider avant-après */}
                          {isImageUpscaler && message.role === 'assistant' && message.image_urls && message.image_urls.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.image_urls.map((upscaledImageUrl, imgIndex) => {
                                // Trouver l'image originale (message utilisateur précédent)
                                const messageIndex = conversationHistory.findIndex(m => m.id === message.id);
                                let originalImageUrl = null;
                                
                                // Chercher le message utilisateur juste avant ce message assistant
                                if (messageIndex > 0) {
                                  const userMessage = conversationHistory[messageIndex - 1];
                                  if (userMessage.role === 'user' && userMessage.image_urls && userMessage.image_urls.length > 0) {
                                    originalImageUrl = userMessage.image_urls[0];
                                  }
                                }
                                
                                return (
                                  <div key={imgIndex}>
                                    {originalImageUrl ? (
                                      <BeforeAfterSlider
                                        beforeImage={originalImageUrl}
                                        afterImage={upscaledImageUrl}
                                        onDownload={() => handleDownloadImage(upscaledImageUrl, message.id)}
                                      />
                                    ) : (
                                      // Fallback si on ne trouve pas l'image originale
                                      <div className="rounded-lg overflow-hidden border border-green-400/30">
                                        <img 
                                          src={upscaledImageUrl} 
                                          alt={`Image upscalée ${imgIndex + 1}`}
                                          className="w-full h-auto max-w-2xl"
                                          style={{ maxHeight: '600px', objectFit: 'contain' }}
                                        />
                                        
                                        <div className="p-3 bg-black/20 flex justify-center">
                                          <button
                                            onClick={() => handleDownloadImage(upscaledImageUrl, message.id)}
                                            className="bg-green-600/80 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm"
                                            title="Télécharger l'image upscalée"
                                          >
                                            <Download className="w-4 h-4" />
                                            <span>Télécharger</span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          
                          {/* Affichage des vidéos générées pour Google Veo, SORA 2, Kling AI, Alibaba Wan et Video Upscale */}
                          {(isGoogleVeo || isSora2 || isKling || isAlibabaWan || isVideoUpscale) && message.role === 'assistant' && message.video_urls && message.video_urls.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.video_urls.map((videoUrl, vidIndex) => (
                                <div key={vidIndex} className="rounded-lg overflow-hidden border border-white/20">
                                  <video 
                                    src={videoUrl} 
                                    controls
                                    className="w-full h-auto max-w-2xl"
                                    style={{ maxHeight: '500px', objectFit: 'contain' }}
                                    preload="metadata"
                                  >
                                    Votre navigateur ne supporte pas la balise vidéo.
                                  </video>
                                  
                                  {/* Bouton télécharger uniquement */}
                                  <div className="p-3 bg-black/20 flex justify-center">
                                    <button
                                      onClick={() => handleDownloadVideo(videoUrl, message.id)}
                                      className={`${isKling ? 'bg-purple-600/80 hover:bg-purple-600' : isVideoUpscale ? 'bg-teal-600/80 hover:bg-teal-600' : 'bg-gray-600/80 hover:bg-gray-600'} text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 text-sm`}
                                      title="Télécharger la vidéo"
                                    >
                                      <Download className="w-4 h-4" />
                                      <span>Télécharger</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                    
                    {/* Indicateur de génération en cours */}
                    {isGenerating && (
                      <div className="flex justify-start mb-4">
                        <div className="bg-gray-700/50 border border-gray-600/50 rounded-xl p-4 max-w-md">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                            <span className="text-sm text-gray-300">
                              {isNanoBanana ? 'Génération d\'image en cours...' : isImageUpscaler ? 'Upscaling de l\'image en cours...' : isVideoUpscale ? 'Upscaling de la vidéo en cours...' : isFluxKontext ? (uploadedImage ? 'Édition d\'image en cours...' : 'Génération d\'image en cours...') : (isGoogleVeo || isSora2 || isKling) ? 'Génération de vidéo en cours...' : 'Réflexion en cours...'}
                            </span>
                          </div>
                          {(isGoogleVeo || isSora2) && (
                            <p className="text-xs text-gray-400 mt-1">
                              La génération peut prendre 1 à 2 minutes, veuillez patienter.
                            </p>
                          )}
                          {(isKling || isAlibabaWan) && (
                            <p className="text-xs text-gray-400 mt-1">
                              ⏳ La génération peut prendre 2 à 3 minutes ou plus, veuillez patienter...
                            </p>
                          )}
                          {isImageUpscaler && (
                            <p className="text-xs text-gray-400 mt-1">
                              L'upscaling peut prendre quelques secondes selon la taille de l'image.
                            </p>
                          )}
                          {isVideoUpscale && (
                            <p className="text-xs text-gray-400 mt-1">
                              ⏳ L'upscaling peut prendre 3 à 5 minutes ou plus selon la taille de la vidéo...
                            </p>
                          )}
                          {isFluxKontext && (
                            <p className="text-xs text-gray-400 mt-1">
                              {uploadedImage ? 'L\'édition peut prendre quelques instants.' : 'La génération peut prendre quelques instants.'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Espace en bas pour éviter que le dernier message soit caché */}
                    <div className="h-4"></div>
                  </>
                )}
              </>
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
        </div>

        {/* Zone de prompt fixée en bas - GLASMORPHISME SIMPLE */}
        <div className={`fixed bottom-0 z-30 ${!isMobile ? 'left-80 right-0' : 'left-0 right-0'}`}>
          <div className={`bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 shadow-2xl ${
            !isMobile ? 'mx-6 mb-4' : 'm-4'
          }`}>
            {isMobile ? (
              /* Layout mobile : vertical avec zone fixe */
              <div className="flex flex-col gap-3">
                {/* Aperçu de l'image uploadée pour ChatGPT-5 ou NanoBanana */}
                {(isChatGPT5 || isNanoBanana) && uploadedImage && (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
                    <img 
                      src={uploadedImage.dataUrl} 
                      alt="Image uploadée"
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-green-200">Image attachée</p>
                      <p className="text-xs text-green-300">{uploadedImage.name}</p>
                    </div>
                    <button
                      onClick={removeUploadedImage}
                      className="text-green-300 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                
                {/* Options de configuration pour Google Veo 3.1 */}
                {isGoogleVeo && (
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg overflow-hidden">
                    {/* En-tête cliquable avec flèche */}
                    <button
                      onClick={() => setShowVeoOptions(!showVeoOptions)}
                      className="w-full flex items-center justify-between p-3 hover:bg-blue-500/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-200">Options de génération</span>
                      {showVeoOptions ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {/* Contenu pliable */}
                    {showVeoOptions && (
                      <div className="flex flex-wrap gap-3 px-3 pb-3 pt-2 border-t border-blue-400/20 mt-2">
                        {/* Durée */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Durée:</label>
                          <select
                            value={veoOptions.duration}
                            onChange={(e) => setVeoOptions({...veoOptions, duration: parseInt(e.target.value)})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-400 focus:outline-none"
                          >
                            <option value={4}>4 secondes</option>
                            <option value={8}>8 secondes</option>
                          </select>
                        </div>
                        
                        {/* Résolution */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Résolution:</label>
                          <select
                            value={veoOptions.resolution}
                            onChange={(e) => setVeoOptions({...veoOptions, resolution: e.target.value})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-400 focus:outline-none"
                          >
                            <option value="720p">720p</option>
                            <option value="1080p">1080p</option>
                          </select>
                        </div>
                        
                        {/* Audio */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Audio:</label>
                          <select
                            value={veoOptions.generateAudio}
                            onChange={(e) => setVeoOptions({...veoOptions, generateAudio: e.target.value === 'true'})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-400 focus:outline-none"
                          >
                            <option value="true">Avec son</option>
                            <option value="false">Sans son</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Options de configuration pour SORA 2 - Mobile */}
                {isSora2 && (
                  <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg overflow-hidden">
                    {/* En-tête cliquable avec flèche */}
                    <button
                      onClick={() => setShowSora2Options(!showSora2Options)}
                      className="w-full flex items-center justify-between p-3 hover:bg-purple-500/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-200">Options de génération</span>
                      {showSora2Options ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {/* Contenu pliable */}
                    {showSora2Options && (
                      <div className="flex flex-wrap gap-3 px-3 pb-3 pt-2 border-t border-purple-400/20 mt-2">
                        {/* Durée */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Durée:</label>
                          <select
                            value={sora2Options.seconds}
                            onChange={(e) => setSora2Options({...sora2Options, seconds: parseInt(e.target.value)})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-purple-400 focus:outline-none"
                          >
                            <option value={4}>4 secondes</option>
                            <option value={8}>8 secondes</option>
                          </select>
                        </div>
                        
                        {/* Aspect Ratio */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Format:</label>
                          <select
                            value={sora2Options.aspectRatio}
                            onChange={(e) => setSora2Options({...sora2Options, aspectRatio: e.target.value})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-purple-400 focus:outline-none"
                          >
                            <option value="landscape">Paysage (16:9)</option>
                            <option value="portrait">Portrait (9:16)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Aperçu de l'image uploadée pour AI Image Upscaler - Mobile */}
                {isImageUpscaler && uploadedImage && (
                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-2">
                    <div className="relative flex-shrink-0">
                      <img src={uploadedImage.dataUrl} className="h-20 w-auto object-cover rounded border border-green-400/30 mx-auto" />
                      <button
                        onClick={removeUploadedImage}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        title="Supprimer l'image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 text-center truncate">{uploadedImage.name}</span>
                    </div>
                  </div>
                )}

                {/* Options de configuration pour AI Image Upscaler - Mobile */}
                {isImageUpscaler && (
                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg overflow-hidden">
                    {/* En-tête cliquable avec flèche */}
                    <button
                      onClick={() => setShowUpscalerOptions(!showUpscalerOptions)}
                      className="w-full flex items-center justify-between p-3 hover:bg-green-500/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-200">Options d'upscaling</span>
                      {showUpscalerOptions ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {/* Contenu pliable */}
                    {showUpscalerOptions && (
                      <div className="flex flex-wrap gap-3 px-3 pb-3 pt-2 border-t border-green-400/20 mt-2">
                        {/* Facteur d'agrandissement */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Facteur:</label>
                          <select
                            value={upscalerOptions.scaleFactor}
                            onChange={(e) => setUpscalerOptions({...upscalerOptions, scaleFactor: parseInt(e.target.value)})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-green-400 focus:outline-none"
                          >
                            <option value={2}>X2</option>
                            <option value={4}>X4</option>
                            <option value={8}>X8</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Aperçu de l'image uploadée pour Flux Kontext Pro - Mobile */}
                {isFluxKontext && uploadedImage && (
                  <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg p-2">
                    <div className="relative flex-shrink-0">
                      <img src={uploadedImage.dataUrl} className="h-20 w-auto object-cover rounded border border-orange-400/30 mx-auto" />
                      <button
                        onClick={removeUploadedImage}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        title="Supprimer l'image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 text-center truncate">{uploadedImage.name}</span>
                    </div>
                  </div>
                )}

                {/* Options de configuration pour Flux Kontext Pro - Mobile */}
                {isFluxKontext && (
                  <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg overflow-hidden">
                    {/* En-tête cliquable avec flèche */}
                    <button
                      onClick={() => setShowFluxKontextOptions(!showFluxKontextOptions)}
                      className="w-full flex items-center justify-between p-3 hover:bg-orange-500/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-200">Options de génération</span>
                      {showFluxKontextOptions ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {/* Contenu pliable */}
                    {showFluxKontextOptions && (
                      <div className="flex flex-col gap-3 px-3 pb-3 pt-2 border-t border-orange-400/20 mt-2">
                        {/* Aspect Ratio */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Aspect Ratio:</label>
                          <select
                            value={fluxKontextOptions.aspectRatio}
                            onChange={(e) => setFluxKontextOptions({...fluxKontextOptions, aspectRatio: e.target.value})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-orange-400 focus:outline-none"
                          >
                            <option value="1:1">1:1 (Carré)</option>
                            <option value="16:9">16:9 (Paysage)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                            <option value="4:3">4:3</option>
                            <option value="3:4">3:4</option>
                            <option value="3:2">3:2</option>
                            <option value="2:3">2:3</option>
                            <option value="4:5">4:5</option>
                            <option value="5:4">5:4</option>
                            <option value="21:9">21:9 (Ultra-large)</option>
                            <option value="9:21">9:21 (Ultra-portrait)</option>
                            <option value="2:1">2:1</option>
                            <option value="1:2">1:2</option>
                          </select>
                        </div>
                        
                        {/* Prompt Upsampling */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Amélioration du prompt:</label>
                          <select
                            value={fluxKontextOptions.promptUpsampling}
                            onChange={(e) => setFluxKontextOptions({...fluxKontextOptions, promptUpsampling: e.target.value === 'true'})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-orange-400 focus:outline-none"
                          >
                            <option value="false">Désactivée</option>
                            <option value="true">Activée</option>
                          </select>
                        </div>
                        
                        {/* Safety Tolerance */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Tolérance de sécurité:</label>
                          <select
                            value={fluxKontextOptions.safetyTolerance}
                            onChange={(e) => setFluxKontextOptions({...fluxKontextOptions, safetyTolerance: parseInt(e.target.value)})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-orange-400 focus:outline-none"
                          >
                            <option value={0}>0 (Stricte)</option>
                            <option value={1}>1</option>
                            <option value={2}>2 (Modérée)</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6 (Permissive)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Aperçu des images uploadées pour Kling AI - Mobile */}
                {isKling && (klingStartImage || klingEndImage) && (
                  <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-2 flex gap-2 overflow-x-auto">
                    {klingStartImage && (
                      <div className="relative flex-shrink-0">
                        <img src={klingStartImage.dataUrl} alt="Start" className="h-20 w-20 object-cover rounded border border-purple-400/30" />
                        <button
                          onClick={removeKlingStartImage}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                          title="Supprimer start"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 text-center">Start</span>
                      </div>
                    )}
                    {klingEndImage && (
                      <div className="relative flex-shrink-0">
                        <img src={klingEndImage.dataUrl} alt="End" className="h-20 w-20 object-cover rounded border border-purple-400/30" />
                        <button
                          onClick={removeKlingEndImage}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                          title="Supprimer end"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 text-center">End</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Options de configuration pour Kling AI - Mobile */}
                {isKling && (
                  <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setShowKlingOptions(!showKlingOptions)}
                        className="w-full flex items-center justify-between p-3 hover:bg-purple-500/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-200">Options de génération</span>
                        {showKlingOptions ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {showKlingOptions && (
                        <div className="flex flex-col gap-3 px-3 pb-3 pt-2 border-t border-purple-400/20 mt-2">
                          {/* Durée */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Durée:</label>
                            <select
                              value={klingOptions.duration}
                              onChange={(e) => setKlingOptions({...klingOptions, duration: parseInt(e.target.value)})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-purple-400 focus:outline-none"
                            >
                              <option value={5}>5 secondes</option>
                              <option value={10}>10 secondes</option>
                            </select>
                          </div>
                          
                          {/* Qualité / Mode */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Qualité:</label>
                            <select
                              value={klingOptions.mode}
                              onChange={(e) => {
                                const newMode = e.target.value;
                                setKlingOptions({...klingOptions, mode: newMode});
                                // Supprimer l'image de fin si on passe en mode standard
                                if (newMode === "standard" && klingEndImage) {
                                  setKlingEndImage(null);
                                }
                              }}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-purple-400 focus:outline-none"
                            >
                              <option value="standard">Standard (720p)</option>
                              <option value="pro">Pro (1080p)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                )}

                {/* Options de configuration pour Seedream 4 - Mobile */}
                {isSeedream && (
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setShowSeedreamOptions(!showSeedreamOptions)}
                        className="w-full flex items-center justify-between p-3 hover:bg-blue-500/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-200">Options de génération</span>
                        {showSeedreamOptions ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {showSeedreamOptions && (
                        <div className="flex flex-col gap-3 px-3 pb-3 pt-2 border-t border-blue-400/20 mt-2">
                          {/* Résolution */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Résolution:</label>
                            <select
                              value={seedreamOptions.size}
                              onChange={(e) => setSeedreamOptions({...seedreamOptions, size: e.target.value})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-400 focus:outline-none"
                            >
                              <option value="1K">1K (1024px)</option>
                              <option value="2K">2K (2048px)</option>
                              <option value="4K">4K (4096px)</option>
                            </select>
                          </div>
                          
                          {/* Aspect Ratio */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Ratio:</label>
                            <select
                              value={seedreamOptions.aspectRatio}
                              onChange={(e) => setSeedreamOptions({...seedreamOptions, aspectRatio: e.target.value})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-400 focus:outline-none"
                            >
                              <option value="1:1">1:1 (Carré)</option>
                              <option value="4:3">4:3</option>
                              <option value="3:4">3:4 (Portrait)</option>
                              <option value="16:9">16:9 (Paysage)</option>
                              <option value="9:16">9:16 (Portrait)</option>
                              <option value="3:2">3:2</option>
                              <option value="2:3">2:3</option>
                              <option value="21:9">21:9 (Ultra-large)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                )}

                {/* Options de configuration pour Alibaba Wan 2.5 - Mobile */}
                {isAlibabaWan && (
                  <div className="bg-red-500/10 border border-red-400/30 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setShowAlibabaWanOptions(!showAlibabaWanOptions)}
                        className="w-full flex items-center justify-between p-3 hover:bg-red-500/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-200">Options de génération</span>
                        {showAlibabaWanOptions ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {showAlibabaWanOptions && (
                        <div className="flex flex-col gap-3 px-3 pb-3 pt-2 border-t border-red-400/20 mt-2">
                          {/* Durée */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Durée:</label>
                            <select
                              value={alibabaWanOptions.duration}
                              onChange={(e) => setAlibabaWanOptions({...alibabaWanOptions, duration: parseInt(e.target.value)})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-red-400 focus:outline-none"
                            >
                              <option value={5}>5 secondes</option>
                              <option value={10}>10 secondes</option>
                            </select>
                          </div>
                          
                          {/* Résolution */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Taille:</label>
                            <select
                              value={alibabaWanOptions.size}
                              onChange={(e) => setAlibabaWanOptions({...alibabaWanOptions, size: e.target.value})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-red-400 focus:outline-none"
                            >
                              <option value="832*480">832×480 (Paysage)</option>
                              <option value="480*832">480×832 (Portrait)</option>
                              <option value="1280*720">1280×720 (HD)</option>
                              <option value="720*1280">720×1280 (HD Portrait)</option>
                              <option value="1920*1080">1920×1080 (Full HD)</option>
                              <option value="1080*1920">1080×1920 (Full HD Portrait)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                )}

                {/* Aperçu de la vidéo uploadée pour Video Upscale AI - Mobile */}
                {isVideoUpscale && uploadedVideo && (
                  <div className="bg-teal-500/10 border border-teal-400/30 rounded-lg p-2">
                    <div className="relative flex-shrink-0">
                      <video src={uploadedVideo.dataUrl} className="h-20 w-auto object-cover rounded border border-teal-400/30 mx-auto" controls={false} />
                      <button
                        onClick={removeUploadedVideo}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        title="Supprimer la vidéo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 text-center truncate">{uploadedVideo.name}</span>
                    </div>
                  </div>
                )}

                {/* Options de configuration pour Video Upscale AI - Mobile */}
                {isVideoUpscale && (
                  <div className="bg-teal-500/10 border border-teal-400/30 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setShowVideoUpscaleOptions(!showVideoUpscaleOptions)}
                        className="w-full flex items-center justify-between p-3 hover:bg-teal-500/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-200">Options d'upscaling</span>
                        {showVideoUpscaleOptions ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {showVideoUpscaleOptions && (
                        <div className="flex flex-col gap-3 px-3 pb-3 pt-2 border-t border-teal-400/20 mt-2">
                          {/* Résolution cible */}
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-sm text-gray-300">Résolution:</label>
                            <select
                              value={videoUpscaleOptions.targetResolution}
                              onChange={(e) => setVideoUpscaleOptions({...videoUpscaleOptions, targetResolution: e.target.value})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-teal-400 focus:outline-none flex-1"
                            >
                              <option value="720p">720p (HD)</option>
                              <option value="1080p">1080p (Full HD)</option>
                              <option value="4k">4K (Ultra HD)</option>
                            </select>
                          </div>
                          
                          {/* FPS cible */}
                          <div className="flex items-center justify-between gap-2">
                            <label className="text-sm text-gray-300">FPS:</label>
                            <select
                              value={videoUpscaleOptions.targetFps}
                              onChange={(e) => setVideoUpscaleOptions({...videoUpscaleOptions, targetFps: parseInt(e.target.value)})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-teal-400 focus:outline-none flex-1"
                            >
                              <option value={25}>25 FPS</option>
                              <option value={30}>30 FPS</option>
                              <option value={40}>40 FPS</option>
                              <option value={50}>50 FPS</option>
                              <option value={60}>60 FPS</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                )}
                
                {/* Zone de saisie pour Kling AI avec boutons upload à gauche - Mobile */}
                {isKling ? (
                  <div className="flex items-center gap-2">
                    {/* Bouton start image */}
                    <button
                      onClick={handleKlingStartImageUpload}
                      className={`${klingStartImage ? 'bg-purple-600' : 'bg-purple-600/80 hover:bg-purple-600'} text-white p-2 rounded-lg transition-colors relative`}
                      title="Image de départ (obligatoire)"
                    >
                      <Plus className="w-5 h-5" />
                      {klingStartImage && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></span>
                      )}
                    </button>
                    
                    {/* Bouton end image */}
                    <button
                      onClick={handleKlingEndImageUpload}
                      disabled={klingOptions.mode !== "pro"}
                      className={`${klingEndImage ? 'bg-purple-600' : klingOptions.mode === "pro" ? 'bg-purple-600/80 hover:bg-purple-600' : 'bg-gray-600/50 cursor-not-allowed'} text-white p-2 rounded-lg transition-colors relative`}
                      title={klingOptions.mode === "pro" ? "Image de fin (optionnelle)" : "Image de fin (nécessite mode Pro)"}
                    >
                      <Plus className="w-5 h-5" />
                      {klingEndImage && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></span>
                      )}
                    </button>
                    
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Décrivez la vidéo que vous souhaitez générer..."
                      className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg py-2"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && prompt.trim() && !isGenerating && klingStartImage) {
                          handleGenerate();
                        }
                      }}
                    />
                  </div>
                ) : (isChatGPT5 || isNanoBanana || isImageUpscaler || isFluxKontext || isVideoUpscale) ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={isVideoUpscale ? handleVideoUpscaleUpload : handleImageUpload}
                      className={`${isImageUpscaler ? 'bg-green-600/80 hover:bg-green-600' : isFluxKontext ? 'bg-orange-600/80 hover:bg-orange-600' : isVideoUpscale ? (uploadedVideo ? 'bg-teal-600' : 'bg-teal-600/80 hover:bg-teal-600') : 'bg-gray-600/80 hover:bg-gray-600'} text-white p-2 rounded-lg transition-colors relative`}
                      title={isVideoUpscale ? "Uploader une vidéo (obligatoire)" : "Ajouter une image"}
                    >
                      <Plus className="w-5 h-5" />
                      {isVideoUpscale && uploadedVideo && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></span>
                      )}
                    </button>
                    {!isImageUpscaler && !isVideoUpscale && (
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={uploadedImage && isNanoBanana ? "Décrivez les modifications à apporter à l'image..." : uploadedImage && isFluxKontext ? "Décrivez les modifications à apporter à l'image..." : `Demandez à ${selectedTool.name}...`}
                        className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg py-2"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && prompt.trim() && !isGenerating) {
                            handleGenerate();
                          }
                        }}
                      />
                    )}
                    {isImageUpscaler && (
                      <span className="flex-1 text-gray-400 text-sm">
                        {uploadedImage ? `Image prête à être upscalée (X${upscalerOptions.scaleFactor})` : "Uploadez une image à upscaler"}
                      </span>
                    )}
                    {isVideoUpscale && (
                      <span className="flex-1 text-gray-400 text-sm">
                        {uploadedVideo ? `Vidéo prête à être upscalée (${videoUpscaleOptions.targetResolution} @ ${videoUpscaleOptions.targetFps} FPS)` : "Uploadez une vidéo à upscaler"}
                      </span>
                    )}
                  </div>
                ) : (
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
                )}
                
                <button
                  onClick={handleGenerate}
                  disabled={(isImageUpscaler ? !uploadedImage : isKling ? (!klingStartImage || !prompt.trim()) : isVideoUpscale ? !uploadedVideo : !prompt.trim()) || isGenerating}
                  className={`btn-3d-effect ${isKling ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' : isImageUpscaler ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : isFluxKontext ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' : isVideoUpscale ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'} disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg px-4 py-3 w-full`}
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>{isImageUpscaler ? 'Upscaling...' : isVideoUpscale ? 'Upscaling...' : isFluxKontext ? 'Génération...' : 'Génération...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{isImageUpscaler ? 'Upscaler' : isVideoUpscale ? 'Upscaler' : isFluxKontext ? 'Générer' : 'Générer'}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Layout desktop : horizontal avec bouton petit à droite */
              <div className="flex flex-col gap-3">
                {/* Aperçu de l'image uploadée pour ChatGPT-5, NanoBanana, Image Upscaler, Flux Kontext et Seedream 4 */}
                {(isChatGPT5 || isNanoBanana || isImageUpscaler || isFluxKontext || isSeedream) && uploadedImage && (
                  <div className={`flex items-center gap-3 p-3 ${isImageUpscaler ? 'bg-green-500/10 border-green-400/30' : isFluxKontext ? 'bg-orange-500/10 border-orange-400/30' : 'bg-green-500/10 border-green-400/30'} border rounded-lg`}>
                    <img 
                      src={uploadedImage.dataUrl} 
                      alt="Image uploadée"
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className={`text-sm ${isFluxKontext ? 'text-orange-200' : 'text-green-200'}`}>Image attachée</p>
                      <p className={`text-xs ${isFluxKontext ? 'text-orange-300' : 'text-green-300'}`}>{uploadedImage.name}</p>
                    </div>
                    <button
                      onClick={removeUploadedImage}
                      className={`${isFluxKontext ? 'text-orange-300' : 'text-green-300'} hover:text-white transition-colors`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                
                {/* Options de configuration pour Google Veo 3.1 - Desktop */}
                {isGoogleVeo && (
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg mb-3 overflow-hidden">
                    {/* En-tête cliquable avec flèche */}
                    <button
                      onClick={() => setShowVeoOptions(!showVeoOptions)}
                      className="w-full flex items-center justify-between p-3 hover:bg-blue-500/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-200">Options de génération</span>
                      {showVeoOptions ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {/* Contenu pliable */}
                    {showVeoOptions && (
                      <div className="flex flex-wrap gap-3 px-3 pb-3 pt-2 border-t border-blue-400/20 mt-2">
                        {/* Durée */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Durée:</label>
                          <select
                            value={veoOptions.duration}
                            onChange={(e) => setVeoOptions({...veoOptions, duration: parseInt(e.target.value)})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-400 focus:outline-none"
                          >
                            <option value={4}>4 secondes</option>
                            <option value={8}>8 secondes</option>
                          </select>
                        </div>
                        
                        {/* Résolution */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Résolution:</label>
                          <select
                            value={veoOptions.resolution}
                            onChange={(e) => setVeoOptions({...veoOptions, resolution: e.target.value})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-400 focus:outline-none"
                          >
                            <option value="720p">720p</option>
                            <option value="1080p">1080p</option>
                          </select>
                        </div>
                        
                        {/* Audio */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Audio:</label>
                          <select
                            value={veoOptions.generateAudio}
                            onChange={(e) => setVeoOptions({...veoOptions, generateAudio: e.target.value === 'true'})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-400 focus:outline-none"
                          >
                            <option value="true">Avec son</option>
                            <option value="false">Sans son</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Options de configuration pour SORA 2 - Desktop */}
                {isSora2 && (
                  <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg mb-3 overflow-hidden">
                    {/* En-tête cliquable avec flèche */}
                    <button
                      onClick={() => setShowSora2Options(!showSora2Options)}
                      className="w-full flex items-center justify-between p-3 hover:bg-purple-500/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-200">Options de génération</span>
                      {showSora2Options ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {/* Contenu pliable */}
                    {showSora2Options && (
                      <div className="flex flex-wrap gap-3 px-3 pb-3 pt-2 border-t border-purple-400/20 mt-2">
                        {/* Durée */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Durée:</label>
                          <select
                            value={sora2Options.seconds}
                            onChange={(e) => setSora2Options({...sora2Options, seconds: parseInt(e.target.value)})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-purple-400 focus:outline-none"
                          >
                            <option value={4}>4 secondes</option>
                            <option value={8}>8 secondes</option>
                          </select>
                        </div>
                        
                        {/* Aspect Ratio */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Format:</label>
                          <select
                            value={sora2Options.aspectRatio}
                            onChange={(e) => setSora2Options({...sora2Options, aspectRatio: e.target.value})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-purple-400 focus:outline-none"
                          >
                            <option value="landscape">Paysage (16:9)</option>
                            <option value="portrait">Portrait (9:16)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Options de configuration pour AI Image Upscaler - Desktop */}
                {isImageUpscaler && (
                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg mb-3 overflow-hidden">
                    {/* En-tête cliquable avec flèche */}
                    <button
                      onClick={() => setShowUpscalerOptions(!showUpscalerOptions)}
                      className="w-full flex items-center justify-between p-3 hover:bg-green-500/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-200">Options d'upscaling</span>
                      {showUpscalerOptions ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {/* Contenu pliable */}
                    {showUpscalerOptions && (
                      <div className="flex flex-wrap gap-3 px-3 pb-3 pt-2 border-t border-green-400/20 mt-2">
                        {/* Facteur d'agrandissement */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Facteur:</label>
                          <select
                            value={upscalerOptions.scaleFactor}
                            onChange={(e) => setUpscalerOptions({...upscalerOptions, scaleFactor: parseInt(e.target.value)})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-green-400 focus:outline-none"
                          >
                            <option value={2}>X2</option>
                            <option value={4}>X4</option>
                            <option value={8}>X8</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}


                {/* Options de configuration pour Flux Kontext Pro - Desktop */}
                {isFluxKontext && (
                  <div className="bg-orange-500/10 border border-orange-400/30 rounded-lg mb-3 overflow-hidden">
                    {/* En-tête cliquable avec flèche */}
                    <button
                      onClick={() => setShowFluxKontextOptions(!showFluxKontextOptions)}
                      className="w-full flex items-center justify-between p-3 hover:bg-orange-500/5 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-200">Options de génération</span>
                      {showFluxKontextOptions ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                    
                    {/* Contenu pliable */}
                    {showFluxKontextOptions && (
                      <div className="flex flex-wrap gap-3 px-3 pb-3 pt-2 border-t border-orange-400/20 mt-2">
                        {/* Aspect Ratio */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Aspect Ratio:</label>
                          <select
                            value={fluxKontextOptions.aspectRatio}
                            onChange={(e) => setFluxKontextOptions({...fluxKontextOptions, aspectRatio: e.target.value})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-orange-400 focus:outline-none"
                          >
                            <option value="1:1">1:1 (Carré)</option>
                            <option value="16:9">16:9 (Paysage)</option>
                            <option value="9:16">9:16 (Portrait)</option>
                            <option value="4:3">4:3</option>
                            <option value="3:4">3:4</option>
                            <option value="3:2">3:2</option>
                            <option value="2:3">2:3</option>
                            <option value="4:5">4:5</option>
                            <option value="5:4">5:4</option>
                            <option value="21:9">21:9 (Ultra-large)</option>
                            <option value="9:21">9:21 (Ultra-portrait)</option>
                            <option value="2:1">2:1</option>
                            <option value="1:2">1:2</option>
                          </select>
                        </div>
                        
                        {/* Prompt Upsampling */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Amélioration du prompt:</label>
                          <select
                            value={fluxKontextOptions.promptUpsampling}
                            onChange={(e) => setFluxKontextOptions({...fluxKontextOptions, promptUpsampling: e.target.value === 'true'})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-orange-400 focus:outline-none"
                          >
                            <option value="false">Désactivée</option>
                            <option value="true">Activée</option>
                          </select>
                        </div>
                        
                        {/* Safety Tolerance */}
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-300">Tolérance de sécurité:</label>
                          <select
                            value={fluxKontextOptions.safetyTolerance}
                            onChange={(e) => setFluxKontextOptions({...fluxKontextOptions, safetyTolerance: parseInt(e.target.value)})}
                            className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-orange-400 focus:outline-none"
                          >
                            <option value={0}>0 (Stricte)</option>
                            <option value={1}>1</option>
                            <option value={2}>2 (Modérée)</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6 (Permissive)</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Aperçu des images uploadées pour Kling AI - Desktop */}
                {isKling && (klingStartImage || klingEndImage) && (
                  <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-2 mb-3 flex gap-2">
                    {klingStartImage && (
                      <div className="relative flex-shrink-0">
                        <img src={klingStartImage.dataUrl} alt="Start" className="h-24 w-24 object-cover rounded border border-purple-400/30" />
                        <button
                          onClick={removeKlingStartImage}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                          title="Supprimer start"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 text-center">Start</span>
                      </div>
                    )}
                    {klingEndImage && (
                      <div className="relative flex-shrink-0">
                        <img src={klingEndImage.dataUrl} alt="End" className="h-24 w-24 object-cover rounded border border-purple-400/30" />
                        <button
                          onClick={removeKlingEndImage}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                          title="Supprimer end"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 text-center">End</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Options de configuration pour Kling AI - Desktop */}
                {isKling && (
                  <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg mb-3 overflow-hidden">
                      <button
                        onClick={() => setShowKlingOptions(!showKlingOptions)}
                        className="w-full flex items-center justify-between p-3 hover:bg-purple-500/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-200">Options de génération</span>
                        {showKlingOptions ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {showKlingOptions && (
                        <div className="flex flex-wrap gap-3 px-3 pb-3 pt-2 border-t border-purple-400/20 mt-2">
                          {/* Durée */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Durée:</label>
                            <select
                              value={klingOptions.duration}
                              onChange={(e) => setKlingOptions({...klingOptions, duration: parseInt(e.target.value)})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-purple-400 focus:outline-none"
                            >
                              <option value={5}>5 secondes</option>
                              <option value={10}>10 secondes</option>
                            </select>
                          </div>
                          
                          {/* Qualité / Mode */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Qualité:</label>
                            <select
                              value={klingOptions.mode}
                              onChange={(e) => {
                                const newMode = e.target.value;
                                setKlingOptions({...klingOptions, mode: newMode});
                                // Supprimer l'image de fin si on passe en mode standard
                                if (newMode === "standard" && klingEndImage) {
                                  setKlingEndImage(null);
                                }
                              }}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-purple-400 focus:outline-none"
                            >
                              <option value="standard">Standard (720p)</option>
                              <option value="pro">Pro (1080p)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                )}

                {/* Options de configuration pour Seedream 4 - Desktop */}
                {isSeedream && (
                  <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg mb-3 overflow-hidden">
                      <button
                        onClick={() => setShowSeedreamOptions(!showSeedreamOptions)}
                        className="w-full flex items-center justify-between p-3 hover:bg-blue-500/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-200">Options de génération</span>
                        {showSeedreamOptions ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {showSeedreamOptions && (
                        <div className="flex flex-wrap gap-3 px-3 pb-3 pt-2 border-t border-blue-400/20 mt-2">
                          {/* Résolution */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Résolution:</label>
                            <select
                              value={seedreamOptions.size}
                              onChange={(e) => setSeedreamOptions({...seedreamOptions, size: e.target.value})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-400 focus:outline-none"
                            >
                              <option value="1K">1K (1024px)</option>
                              <option value="2K">2K (2048px)</option>
                              <option value="4K">4K (4096px)</option>
                            </select>
                          </div>
                          
                          {/* Aspect Ratio */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Ratio:</label>
                            <select
                              value={seedreamOptions.aspectRatio}
                              onChange={(e) => setSeedreamOptions({...seedreamOptions, aspectRatio: e.target.value})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-blue-400 focus:outline-none"
                            >
                              <option value="1:1">1:1 (Carré)</option>
                              <option value="4:3">4:3</option>
                              <option value="3:4">3:4 (Portrait)</option>
                              <option value="16:9">16:9 (Paysage)</option>
                              <option value="9:16">9:16 (Portrait)</option>
                              <option value="3:2">3:2</option>
                              <option value="2:3">2:3</option>
                              <option value="21:9">21:9 (Ultra-large)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                )}

                {/* Options de configuration pour Alibaba Wan 2.5 - Desktop */}
                {isAlibabaWan && (
                  <div className="bg-red-500/10 border border-red-400/30 rounded-lg mb-3 overflow-hidden">
                      <button
                        onClick={() => setShowAlibabaWanOptions(!showAlibabaWanOptions)}
                        className="w-full flex items-center justify-between p-3 hover:bg-red-500/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-200">Options de génération</span>
                        {showAlibabaWanOptions ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {showAlibabaWanOptions && (
                        <div className="flex flex-wrap gap-3 px-3 pb-3 pt-2 border-t border-red-400/20 mt-2">
                          {/* Durée */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Durée:</label>
                            <select
                              value={alibabaWanOptions.duration}
                              onChange={(e) => setAlibabaWanOptions({...alibabaWanOptions, duration: parseInt(e.target.value)})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-red-400 focus:outline-none"
                            >
                              <option value={5}>5 secondes</option>
                              <option value={10}>10 secondes</option>
                            </select>
                          </div>
                          
                          {/* Résolution */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Taille:</label>
                            <select
                              value={alibabaWanOptions.size}
                              onChange={(e) => setAlibabaWanOptions({...alibabaWanOptions, size: e.target.value})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-red-400 focus:outline-none"
                            >
                              <option value="832*480">832×480 (Paysage)</option>
                              <option value="480*832">480×832 (Portrait)</option>
                              <option value="1280*720">1280×720 (HD)</option>
                              <option value="720*1280">720×1280 (HD Portrait)</option>
                              <option value="1920*1080">1920×1080 (Full HD)</option>
                              <option value="1080*1920">1080×1920 (Full HD Portrait)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                )}

                {/* Aperçu de la vidéo uploadée pour Video Upscale AI - Desktop */}
                {isVideoUpscale && uploadedVideo && (
                  <div className="bg-teal-500/10 border border-teal-400/30 rounded-lg p-2 mb-3">
                    <div className="relative flex-shrink-0">
                      <video src={uploadedVideo.dataUrl} className="h-24 w-auto object-cover rounded border border-teal-400/30" controls={false} />
                      <button
                        onClick={removeUploadedVideo}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                        title="Supprimer la vidéo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs px-1 text-center truncate">{uploadedVideo.name}</span>
                    </div>
                  </div>
                )}

                {/* Options de configuration pour Video Upscale AI - Desktop */}
                {isVideoUpscale && (
                  <div className="bg-teal-500/10 border border-teal-400/30 rounded-lg mb-3 overflow-hidden">
                      <button
                        onClick={() => setShowVideoUpscaleOptions(!showVideoUpscaleOptions)}
                        className="w-full flex items-center justify-between p-3 hover:bg-teal-500/5 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-200">Options d'upscaling</span>
                        {showVideoUpscaleOptions ? (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      
                      {showVideoUpscaleOptions && (
                        <div className="flex flex-wrap gap-3 px-3 pb-3 pt-2 border-t border-teal-400/20 mt-2">
                          {/* Résolution cible */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">Résolution:</label>
                            <select
                              value={videoUpscaleOptions.targetResolution}
                              onChange={(e) => setVideoUpscaleOptions({...videoUpscaleOptions, targetResolution: e.target.value})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-teal-400 focus:outline-none"
                            >
                              <option value="720p">720p (HD)</option>
                              <option value="1080p">1080p (Full HD)</option>
                              <option value="4k">4K (Ultra HD)</option>
                            </select>
                          </div>
                          
                          {/* FPS cible */}
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-300">FPS:</label>
                            <select
                              value={videoUpscaleOptions.targetFps}
                              onChange={(e) => setVideoUpscaleOptions({...videoUpscaleOptions, targetFps: parseInt(e.target.value)})}
                              className="bg-gray-700 text-white px-3 py-1 rounded text-sm border border-gray-600 focus:border-teal-400 focus:outline-none"
                            >
                              <option value={25}>25 FPS</option>
                              <option value={30}>30 FPS</option>
                              <option value={40}>40 FPS</option>
                              <option value={50}>50 FPS</option>
                              <option value={60}>60 FPS</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                )}
                
                <div className="flex items-center gap-3">
                  {/* Bouton upload pour Video Upscale AI - Desktop */}
                  {isVideoUpscale && (
                    <button
                      onClick={handleVideoUpscaleUpload}
                      className={`${uploadedVideo ? 'bg-teal-600' : 'bg-teal-600/80 hover:bg-teal-600'} text-white p-2 rounded-lg transition-colors relative`}
                      title="Uploader une vidéo (obligatoire)"
                    >
                      <Plus className="w-5 h-5" />
                      {uploadedVideo && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></span>
                      )}
                    </button>
                  )}

                  {/* Boutons upload pour Kling AI - Desktop */}
                  {isKling && (
                    <>
                      <button
                        onClick={handleKlingStartImageUpload}
                        className={`${klingStartImage ? 'bg-purple-600' : 'bg-purple-600/80 hover:bg-purple-600'} text-white p-2 rounded-lg transition-colors relative`}
                        title="Image de départ (obligatoire)"
                      >
                        <Plus className="w-5 h-5" />
                        {klingStartImage && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></span>
                        )}
                      </button>
                      
                      <button
                        onClick={handleKlingEndImageUpload}
                        disabled={klingOptions.mode !== "pro"}
                        className={`${klingEndImage ? 'bg-purple-600' : klingOptions.mode === "pro" ? 'bg-purple-600/80 hover:bg-purple-600' : 'bg-gray-600/50 cursor-not-allowed'} text-white p-2 rounded-lg transition-colors relative`}
                        title={klingOptions.mode === "pro" ? "Image de fin (optionnelle)" : "Image de fin (nécessite mode Pro)"}
                      >
                        <Plus className="w-5 h-5" />
                        {klingEndImage && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-white"></span>
                        )}
                      </button>
                    </>
                  )}
                
                  {/* Icône d'upload pour ChatGPT-5, NanoBanana, Image Upscaler, Flux Kontext et Seedream 4 */}
                  {(isChatGPT5 || isNanoBanana || isImageUpscaler || isFluxKontext || isSeedream) && (
                    <button
                      onClick={handleImageUpload}
                      className={`${isImageUpscaler ? 'bg-green-600/80 hover:bg-green-600' : isFluxKontext ? 'bg-orange-600/80 hover:bg-orange-600' : 'bg-gray-600/80 hover:bg-gray-600'} text-white p-2 rounded-lg transition-colors`}
                      title="Ajouter une image"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                  
                  {!isImageUpscaler && !isKling && !isVideoUpscale && (
                    <input
                      type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={uploadedImage && isNanoBanana ? "Décrivez les modifications à apporter à l'image..." : uploadedImage && isFluxKontext ? "Décrivez les modifications à apporter à l'image..." : `Demandez à ${selectedTool.name}...`}
                    className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg py-2"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && prompt.trim() && !isGenerating) {
                        handleGenerate();
                      }
                    }}
                  />
                  )}
                  
                  {isKling && (
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Décrivez la vidéo que vous souhaitez générer..."
                      className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg py-2"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && prompt.trim() && !isGenerating && klingStartImage) {
                          handleGenerate();
                        }
                      }}
                    />
                  )}
                  
                  {isImageUpscaler && (
                    <span className="flex-1 text-gray-400 text-sm">
                      {uploadedImage ? `Image prête à être upscalée (X${upscalerOptions.scaleFactor})` : "Uploadez une image à upscaler"}
                    </span>
                  )}
                  
                  {isVideoUpscale && (
                    <span className="flex-1 text-gray-400 text-sm">
                      {uploadedVideo ? `Vidéo prête à être upscalée (${videoUpscaleOptions.targetResolution} @ ${videoUpscaleOptions.targetFps} FPS)` : "Uploadez une vidéo à upscaler"}
                    </span>
                  )}
                  
                  <button
                    onClick={handleGenerate}
                    disabled={(isImageUpscaler ? !uploadedImage : isKling ? (!klingStartImage || !prompt.trim()) : isVideoUpscale ? !uploadedVideo : !prompt.trim()) || isGenerating}
                    className={`btn-3d-effect ${isKling ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700' : isImageUpscaler ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : isFluxKontext ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700' : isVideoUpscale ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700' : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'} disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-xl transition flex items-center justify-center space-x-2 shadow-lg px-4 py-2 flex-shrink-0`}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>{isImageUpscaler ? 'Upscaling...' : isVideoUpscale ? 'Upscaling...' : isFluxKontext ? 'Génération...' : 'Générer'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{isImageUpscaler ? 'Upscaler' : isVideoUpscale ? 'Upscaler' : isFluxKontext ? 'Générer' : 'Générer'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Input file caché pour l'upload d'images */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        {/* Inputs cachés pour Kling AI start et end images */}
        <input
          type="file"
          ref={klingStartInputRef}
          onChange={handleKlingStartFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <input
          type="file"
          ref={klingEndInputRef}
          onChange={handleKlingEndFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        {/* Input caché pour Video Upscale AI */}
        <input
          type="file"
          ref={videoUpscaleInputRef}
          onChange={handleVideoUpscaleFileSelect}
          accept="video/*"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default Studio;