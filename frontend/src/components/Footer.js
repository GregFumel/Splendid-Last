import React from "react";

const Footer = () => {
  return (
    <footer className="border-t border-white/10 mt-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-400">
        <div className="space-y-6">
          <div>
            <div className="mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_pricing-animation/artifacts/5hgv17ws_613b2b7e0_splendid-logo-textcopycopy.png" 
                alt="Splendid"
                className="h-8 w-auto mb-4 mx-auto"
              />
            </div>
            <p className="text-sm">Découvrez les meilleurs outils IA pour créer, éditer et innover.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <h4 className="font-medium text-white mb-2">Catégories</h4>
              <ul className="space-y-1 text-sm">
                <li>Image</li>
                <li>Vidéo</li>
                <li>Edit</li>
                <li>Assist</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">Ressources</h4>
              <ul className="space-y-1 text-sm">
                <li><a href="/mentions-legales" className="hover:text-white transition">Mentions légales</a></li>
                <li><a href="/terms-of-service" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="/refund-policy" className="hover:text-white transition">Refund Policy</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">Communauté</h4>
              <ul className="space-y-1 text-sm">
                <li>Discord</li>
                <li>Twitter</li>
                <li>GitHub</li>
                <li>Support</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <p className="text-sm">&copy; 2025 Splendid. Tous droits réservés.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;