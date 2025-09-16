import React from "react";
import { Star } from "lucide-react";

const SocialProof = () => {
  // URLs d'avatars de démonstration
  const avatars = [
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  ];

  return (
    <div className="flex flex-col items-center mb-6">
      {/* Avatars avec contour bleu 3D */}
      <div className="flex items-center justify-center mb-3 space-x-0.5 sm:space-x-1">
        {avatars.map((avatar, index) => (
          <div
            key={index}
            className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-r from-blue-500 to-blue-600 btn-3d-effect"
            style={{ zIndex: avatars.length - index }}
          >
            <img
              src={avatar}
              alt={`Créateur ${index + 1}`}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=User${index + 1}&background=random&color=fff&size=150`;
              }}
            />
          </div>
        ))}
        
        {/* Étoiles plus petites et espacées */}
        <div className="flex ml-5 space-x-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
      </div>
      
      {/* Texte de preuve sociale plus petit */}
      <p className="text-gray-300 text-xs sm:text-sm font-medium">
        Reconnu par plus de 270 créateurs !
      </p>
    </div>
  );
};

export default SocialProof;