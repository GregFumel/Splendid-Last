import React from "react";
import { Sparkles } from "lucide-react";

const AIToolsGrid = ({ tools, onGenerateIdeas }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
      {tools.map((tool) => (
        <div
          key={tool.id}
          className="ai-card bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl shadow-black/20 rounded-2xl overflow-hidden flex flex-col relative"
        >
          {/* Badge New */}
          {tool.isNew && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                New
              </span>
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
              <Sparkles className="w-4 h-4" />
              <span>Utiliser {tool.name}</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AIToolsGrid;