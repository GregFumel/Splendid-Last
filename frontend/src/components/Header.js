import React, { useState, useEffect, useRef } from "react";
import { User, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = ({ selectedCategory, onCategoryChange }) => {
  const navigate = useNavigate();
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({});
  const navContainerRef = useRef(null);
  const activeNavRef = useRef(null);

  const categories = [
    { id: "all", label: "Explore" },
    { id: "image", label: "Image" },
    { id: "video", label: "Vidéo" },
    { id: "assist", label: "Assist" },
    { id: "account", label: "Compte" }
  ];

  const updateIndicator = (targetElement) => {
    if (!targetElement || !navContainerRef.current) return;
    
    const containerRect = navContainerRef.current.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();
    
    // Approche avec beaucoup plus de marge à gauche pour centrer visuellement
    const buttonPadding = 16; // px-4 du bouton
    const textWidth = targetRect.width - (buttonPadding * 2); // Largeur réelle du texte
    const leftPadding = 20; // Beaucoup de marge à gauche (20px)
    const rightPadding = 8; // Moins à droite (8px)
    const bubbleWidth = textWidth + leftPadding + rightPadding;
    
    // Position de la bulle pour être parfaitement centrée sur le bouton
    const bubbleLeft = (targetRect.width - bubbleWidth) / 2;
    
    setActiveIndicatorStyle({
      width: `${bubbleWidth}px`,
      transform: `translateX(${targetRect.left - containerRect.left + bubbleLeft}px)`
    });
  };

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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md pt-5 pb-3 md:py-3">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center relative h-16">
          
          {/* Logo - Desktop uniquement */}
          <div className="hidden md:flex items-center absolute left-0">
            <img 
              src="https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/5hgv17ws_613b2b7e0_splendid-logo-textcopycopy.png" 
              alt="Splendid"
              className="h-8 w-auto"
            />
          </div>

          {/* Navigation principale centrée absolument par rapport à la page */}
          <nav className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center">
              <div ref={navContainerRef} className="nav-container relative flex items-center bg-black/20 backdrop-blur-lg border border-white/10 rounded-full p-1 md:p-1.5">
                <div 
                  className="indicator-3d absolute rounded-full shadow-lg transition-all duration-300 ease-in-out z-0"
                  style={activeIndicatorStyle}
                ></div>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    ref={selectedCategory === category.id ? activeNavRef : null}
                    onClick={() => {
                      onCategoryChange(category.id);
                    }}
                    className={`nav-link relative z-10 px-2 md:px-4 py-1.5 md:py-2 text-xs sm:text-sm font-medium transition-colors duration-300 flex items-center justify-center pl-3 md:pl-5 flex-1 md:flex-initial ${
                      selectedCategory === category.id ? 'text-white' : 'text-gray-300'
                    }`}
                    data-category={category.id}
                  >
                    {category.icon && <category.icon className="w-3 h-3 md:w-4 md:h-4 mr-1" />}
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* Sélecteur de langue - Desktop uniquement - Positionné à droite */}
          <div className="hidden md:flex items-center absolute right-0">
            <button 
              className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-2 rounded-full transition flex items-center justify-center space-x-1 flex-shrink-0"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">FR</span>
            </button>
          </div>

          {/* Bouton langue sur mobile - en haut à droite */}
          <div className="md:hidden absolute right-0">
            <button 
              className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1.5 rounded-full transition flex items-center justify-center space-x-1"
            >
              <Globe className="w-3 h-3" />
              <span className="text-xs font-medium">FR</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
