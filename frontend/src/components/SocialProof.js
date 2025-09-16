import React from "react";
import { Star } from "lucide-react";

const SocialProof = () => {
  // URLs des avatars personnalisés
  const avatars = [
    "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/d7nohskx_jodie-influenceuse-mode-france-739x1024.png",
    "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/l2ll08hm_eileen-kelly-influencer-podcast-host-v0-a9la8w1vhh8a1.webp",
    "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/iw5h3b2q_images%20%283%29.jpeg",
    "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/2nvd3ab8_images%20%282%29.jpeg",
    "https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/023myz63_HE4c8y8Y_400x400.jpg"
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