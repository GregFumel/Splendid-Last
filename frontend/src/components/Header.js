import React, { useState, useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";

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
    
    // Calcul précis pour centrer parfaitement la bulle sur le texte avec plus de padding
    const paddingHorizontal = 16; // px-4 = 16px de chaque côté du bouton
    const textWidth = targetRect.width - (paddingHorizontal * 2);
    const bubblePadding = 12; // Padding supplémentaire pour la bulle (6px de chaque côté)
    const bubbleWidth = textWidth + bubblePadding * 2; // Plus d'espace autour du texte
    const leftOffset = (targetRect.width - bubbleWidth) / 2;
    
    setActiveIndicatorStyle({
      width: `${bubbleWidth}px`,
      transform: `translateX(${targetRect.left - containerRect.left + leftOffset}px)`
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
    <header className="sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="ml-2 text-xl font-bold text-white">Splendid</span>
          </div>

          {/* Navigation principale "Bulle" */}
          <nav className="hidden md:block">
            <div ref={navContainerRef} className="nav-container relative flex items-center bg-black/20 backdrop-blur-lg border border-white/10 rounded-full p-1.5">
              <div 
                className="indicator-3d absolute rounded-full shadow-lg transition-all duration-300 ease-in-out z-0"
                style={activeIndicatorStyle}
              ></div>
              {categories.map((category) => (
                <button
                  key={category.id}
                  ref={selectedCategory === category.id ? activeNavRef : null}
                  onClick={() => onCategoryChange(category.id)}
                  className={`nav-link relative z-10 px-4 py-2 text-sm font-medium transition-colors duration-300 flex items-center justify-center ${
                    selectedCategory === category.id ? 'text-white' : 'text-gray-300'
                  }`}
                  data-category={category.id}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Boutons d'action */}
          <div className="flex items-center space-x-4">
            <a href="#" className="hidden sm:block text-gray-300 hover:text-white font-medium transition">
              Pricing
            </a>
            <a 
              href="#" 
              className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2 rounded-full transition text-sm flex items-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Discord</span>
            </a>
          </div>
        </div>

        {/* Navigation pour mobile */}
        <nav className="md:hidden flex space-x-4 overflow-x-auto py-2 -mx-4 px-4 border-t border-white/10">
          {categories.map((category) => (
            <button
              key={`mobile-${category.id}`}
              onClick={() => onCategoryChange(category.id)}
              className={`nav-link-mobile whitespace-nowrap px-2 pb-1 transition ${
                selectedCategory === category.id
                  ? "text-white font-semibold border-b-2 border-cyan-400"
                  : "text-gray-300 hover:text-white"
              }`}
              data-category={category.id}
            >
              {category.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
