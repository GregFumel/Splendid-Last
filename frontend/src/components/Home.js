import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";
import AIToolsGrid from "./AIToolsGrid";
import SuggestionModal from "./SuggestionModal";
import IdeasModal from "./IdeasModal";
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
    
    // Ajustement pour mobile avec padding plus important
    const buttonPadding = 16; // px-4 pour mobile
    const textWidth = targetRect.width - (buttonPadding * 2);
    const leftPadding = 12; // Marge à gauche
    const rightPadding = 6; // Moins à droite
    const bubbleWidth = textWidth + leftPadding + rightPadding;
    
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
      
      {/* Navigation mobile sous le header */}
      <div className="md:hidden container mx-auto px-4 py-4">
        <nav className="flex justify-center">
          <div ref={navContainerRef} className="nav-container relative flex items-center bg-black/20 backdrop-blur-lg border border-white/10 rounded-full p-2">
            <div 
              className="indicator-3d absolute rounded-full shadow-lg transition-all duration-300 ease-in-out z-0"
              style={activeIndicatorStyle}
            ></div>
            {categories.map((category) => (
              <button
                key={`mobile-${category.id}`}
                ref={selectedCategory === category.id ? activeNavRef : null}
                onClick={() => setSelectedCategory(category.id)}
                className={`nav-link relative z-10 px-4 py-3 text-sm font-medium transition-colors duration-300 flex items-center justify-center min-h-[44px] ${
                  selectedCategory === category.id ? 'text-white' : 'text-gray-300'
                }`}
                data-category={category.id}
              >
                {category.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 leading-tight">
            Découvrez les meilleurs outils IA
          </h1>
          <button
            onClick={() => setShowSuggestionModal(true)}
            className="btn-3d-effect mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-full transition text-sm sm:text-base flex items-center space-x-2 shadow-lg shadow-blue-500/30 whitespace-nowrap"
          >
            <span>✨ Quel outil IA choisir ?</span>
          </button>
        </div>
        
        <AIToolsGrid 
          tools={filteredTools}
          onGenerateIdeas={handleGenerateIdeas}
        />
      </main>
      
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