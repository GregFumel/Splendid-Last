import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredTools(mockAITools);
    } else {
      setFilteredTools(mockAITools.filter(tool => tool.category === selectedCategory));
    }
  }, [selectedCategory]);

  const handleGenerateIdeas = (tool) => {
    setSelectedTool(tool);
    setShowIdeasModal(true);
  };

  return (
    <div className="min-h-screen text-gray-100 relative">
      {/* Fond d'écran avec effet flou et opacité */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: 'url(https://customer-assets.emergentagent.com/job_af984ef4-d93e-474e-9397-0c3398144eb6/artifacts/85yt527h_unnamed.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(3px)',
          opacity: '0.7'
        }}
      ></div>
      
      {/* Overlay subtile pour améliorer la lisibilité */}
      <div className="fixed inset-0 -z-10 bg-black/20"></div>
      <Header 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 whitespace-nowrap">
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