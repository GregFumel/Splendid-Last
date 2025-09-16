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
    
    setActiveIndicatorStyle({
      width: `${targetRect.width}px`,
      transform: `translateX(${targetRect.left - containerRect.left}px)`
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1 relative" ref={navContainerRef}>
            <div 
              className="absolute bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 ease-out"
              style={activeIndicatorStyle}
            />
            {categories.map((category) => (
              <button
                key={category.id}
                ref={selectedCategory === category.id ? activeNavRef : null}
                onClick={() => onCategoryChange(category.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 relative ${
                  selectedCategory === category.id
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {category.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-gray-400 hover:text-white">
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
