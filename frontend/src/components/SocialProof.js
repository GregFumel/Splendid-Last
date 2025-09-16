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
    <div className="flex flex-col items-center mb-8">
      {/* Avatars avec contour bleu */}
      <div className="flex items-center justify-center mb-4 space-x-1 sm:space-x-2">
        {avatars.map((avatar, index) => (
          <div
            key={index}
            className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-r from-blue-500 to-blue-600"
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
        
        {/* Étoiles */}
        <div className="flex ml-4 space-x-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
      </div>
      
      {/* Texte de preuve sociale */}
      <p className="text-gray-300 text-sm sm:text-base font-medium">
        Reconnu par plus de 27 000 créateurs !
      </p>
    </div>
  );
};

export default SocialProof;