import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Globe } from "lucide-react";

const LegalHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-md pt-5 pb-3 z-50">
      <div className="w-full px-6">
        <div className="flex items-center justify-between w-full relative h-16">
          
          {/* Bouton Retour à l'accueil - à gauche */}
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')}
              className="btn-3d-effect bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-full transition flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'accueil</span>
            </button>
          </div>

          {/* Logo Splendid centré - Desktop uniquement */}
          <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <img 
              src="https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/5hgv17ws_613b2b7e0_splendid-logo-textcopycopy.png" 
              alt="Splendid"
              className="h-8 w-auto"
            />
          </div>

          {/* Bouton langue - à droite */}
          <div className="flex items-center">
            <button 
              className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold px-3 py-2 rounded-full transition flex items-center justify-center space-x-1"
            >
              <Globe className="w-4 h-4" />
              <span className="text-xs font-medium">FR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalHeader;