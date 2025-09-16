import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AIToolsGrid from "./AIToolsGrid";
import SuggestionModal from "./SuggestionModal";
import IdeasModal from "./IdeasModal";
import SocialProof from "./SocialProof";
import PricingSection from "./PricingSection";
import { mockAITools } from "../data/mockData";

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredTools, setFilteredTools] = useState(mockAITools);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showIdeasModal, setShowIdeasModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({});
  const navContainerRef = useRef(null);
  const activeNavRef = useRef(null);

  const categories = [
    { id: "all", label: "Explore" },
    { id: "image", label: "Image" },
    { id: "video", label: "Vidéo" },
    { id: "edit", label: "Edit" },
    { id: "assist", label: "Assist" }
  ];

  const updateIndicator = (targetElement) => {
    if (!targetElement || !navContainerRef.current) return;
    
    const containerRect = navContainerRef.current.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Calcul pour un meilleur centrage avec le nouveau padding
    const isMobile = window.innerWidth < 768;
    const leftPadding = isMobile ? 16 : 20; // pl-4 mobile, pl-5 desktop
    const rightPadding = isMobile ? 12 : 16; // px-3/px-4 original
    const textWidth = targetRect.width - leftPadding - rightPadding;
    const bubbleLeftPadding = 14; // Marge supplémentaire à gauche de la bulle
    const bubbleRightPadding = 8; // Moins à droite pour centrage visuel
    const bubbleWidth = textWidth + bubbleLeftPadding + bubbleRightPadding;
    
    const bubbleLeft = (targetRect.width - bubbleWidth) / 2;
    
    setActiveIndicatorStyle({
      width: `${bubbleWidth}px`,
      transform: `translateX(${targetRect.left - containerRect.left + bubbleLeft}px)`
    });
  };

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredTools(mockAITools);
    } else {
      setFilteredTools(mockAITools.filter(tool => tool.category === selectedCategory));
    }
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeNavRef.current) {
        updateIndicator(activeNavRef.current);
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [selectedCategory]);

  useEffect(() => {
    const handleResize = () => {
      if (activeNavRef.current) {
        updateIndicator(activeNavRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedCategory]);

  const handleGenerateIdeas = (tool) => {
    setSelectedTool(tool);
    setShowIdeasModal(true);
  };

  return (
    <div className="min-h-screen text-gray-100 relative">
      {/* Fond d'écran brut sans effets */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_af984ef4-d93e-474e-9397-0c3398144eb6/artifacts/85yt527h_unnamed.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat'
        }}
      ></div>
      
      {/* Overlay subtile pour améliorer la lisibilité */}
      <div className="fixed inset-0 -z-10 bg-black/20"></div>
      <Header 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12 pt-24 md:pt-64">
        <div className="flex flex-col items-center text-center mb-8">
          {/* Section vide - Desktop seulement */}
          <div className="hidden md:block w-full h-10 mb-8"></div>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight mb-4">
            Découvrez les meilleurs outils IA
          </h1>
          
          <p className="text-xs sm:text-sm md:text-lg text-gray-300 max-w-6xl mx-auto leading-relaxed mb-8">
            Plus de 1200€ d'outils IA, pour le prix d'un resto.<br />
            L'abonnement tout-en-un qui remplace tous les autres.
          </p>
          
          {/* Preuve sociale */}
          <SocialProof />
          
          <button
            onClick={() => setShowSuggestionModal(true)}
            className="btn-3d-effect mt-4 mb-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-full transition text-sm sm:text-base flex items-center space-x-2 shadow-lg shadow-blue-500/30 whitespace-nowrap"
          >
            <span>✨ Commencer mon essai gratuit</span>
          </button>
        </div>
        
        <AIToolsGrid 
          tools={filteredTools}
          onGenerateIdeas={handleGenerateIdeas}
        />
      </main>
      
      {/* Section Pricing */}
      <PricingSection />
      
      <Footer />
      
      <SuggestionModal
        isOpen={showSuggestionModal}
        onClose={() => setShowSuggestionModal(false)}
      />
      
      <IdeasModal
        isOpen={showIdeasModal}
        onClose={() => setShowIdeasModal(false)}
        tool={selectedTool}
      />
    </div>
  );
};

export default Home;