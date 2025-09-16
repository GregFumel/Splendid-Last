import React, { useState, useEffect, useRef } from "react";
import { User, Globe } from "lucide-react";

const Header = ({ selectedCategory, onCategoryChange }) => {
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/10 backdrop-blur-sm py-2">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            {/* Logo Splendid sur desktop */}
            <div className="hidden md:block">
              <img 
                src="https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/5hgv17ws_613b2b7e0_splendid-logo-textcopycopy.png" 
                alt="Splendid"
                className="h-8 w-auto"
              />
            </div>
            {/* Logo S sur mobile */}
            <div className="md:hidden h-6 w-6 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
          </div>

          {/* Navigation principale "Bulle" - Toujours visible */}
          <nav className="flex-1 flex justify-center mx-1 md:mx-4 md:flex-initial">
            <div ref={navContainerRef} className="nav-container relative flex items-center bg-black/20 backdrop-blur-lg border border-white/10 rounded-full p-1 md:p-1.5 w-full md:w-auto max-w-none md:max-w-fit">
              <div 
                className="indicator-3d absolute rounded-full shadow-lg transition-all duration-300 ease-in-out z-0"
                style={activeIndicatorStyle}
              ></div>
              {categories.map((category) => (
                <button
                  key={category.id}
                  ref={selectedCategory === category.id ? activeNavRef : null}
                  onClick={() => onCategoryChange(category.id)}
                  className={`nav-link relative z-10 px-3 md:px-4 py-1.5 md:py-2 text-xs sm:text-sm font-medium transition-colors duration-300 flex items-center justify-center pl-4 md:pl-5 flex-1 md:flex-initial ${
                    selectedCategory === category.id ? 'text-white' : 'text-gray-300'
                  }`}
                  data-category={category.id}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Icône Compte utilisateur - Desktop seulement */}
          <div className="hidden md:flex items-center">
            <button 
              className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold p-1.5 md:p-2 rounded-full transition flex items-center justify-center"
            >
              <User className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
