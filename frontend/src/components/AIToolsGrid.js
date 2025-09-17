import React from "react";

const AIToolsGrid = ({ tools, onGenerateIdeas }) => {
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
        return 'https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/1ef3864v_noun-generative-image-8071314.png'; // icône par défaut
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {tools.map((tool) => (
        <div
          key={tool.id}
          className="ai-card bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl shadow-black/20 rounded-2xl overflow-hidden flex flex-col relative"
        >
          {/* Badge New avec liséré animé */}
          {tool.isNew && (
            <div className="absolute top-3 right-3 z-10">
              <div className="relative">
                {/* Liséré animé */}
                <div className="absolute inset-0 rounded-full animate-irregular-spin">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white via-transparent to-white opacity-60"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-l from-white/30 via-transparent to-white/70 rotate-45"></div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/40 via-transparent to-white/50 -rotate-12"></div>
                </div>
                
                {/* Badge New */}
                <span className="relative bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg btn-3d-effect">
                  New
                </span>
              </div>
            </div>
          )}
          
          <img
            src={tool.image}
            alt={`Aperçu de ${tool.name}`}
            className="w-full h-48 object-cover"
          />
          <div className="p-5 flex-grow">
            <h3 className="text-xl font-semibold text-gray-50">{tool.name}</h3>
            <p className="text-gray-300 mt-2">{tool.description}</p>
          </div>
          <div className="p-5 mt-auto">
            <button
              onClick={() => onGenerateIdeas(tool)}
              className="btn-3d-effect bg-blue-500 hover:bg-blue-600 w-full text-white font-medium px-4 py-2.5 rounded-full transition text-sm flex items-center justify-center space-x-2"
            >
              <img 
                src={getCategoryIcon(tool.category)} 
                alt={`Icône ${tool.category}`}
                className="w-5 h-5 filter brightness-0 invert"
              />
              <span>Utiliser {tool.name}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIToolsGrid;