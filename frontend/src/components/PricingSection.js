import React, { useEffect, useRef } from "react";
import { Check } from "lucide-react";

const PricingSection = () => {
  const paypalRef = useRef(null);
  const paypalLoaded = useRef(false);

  useEffect(() => {
    // Vérifier si le script PayPal est déjà chargé
    if (paypalLoaded.current) {
      return;
    }

    // Vérifier si PayPal SDK existe déjà
    if (window.paypal) {
      initPayPalButton();
      return;
    }

    // Charger le script PayPal
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AWkoEEE4PYBAeWYtFYRBeV6W4E5jLfZT-5L7liFr69A8inAP6_Sh08g0L9H1fSnWiLvW0kHHPT3h-qoJ&vault=true&intent=subscription";
    script.setAttribute('data-sdk-integration-source', 'button-factory');
    script.async = true;
    
    script.onload = () => {
      initPayPalButton();
    };

    script.onerror = () => {
      console.error('Erreur lors du chargement du script PayPal');
    };

    document.body.appendChild(script);
    paypalLoaded.current = true;

    return () => {
      // Cleanup: supprimer le script lors du démontage du composant
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initPayPalButton = () => {
    if (window.paypal && paypalRef.current && !paypalRef.current.hasChildNodes()) {
      window.paypal.Buttons({
        style: {
          shape: 'pill',
          color: 'blue',
          layout: 'vertical',
          label: 'subscribe'
        },
        createSubscription: function(data, actions) {
          return actions.subscription.create({
            plan_id: 'P-20B33183X5530231LND7XNPI'
          });
        },
        onApprove: function(data, actions) {
          alert('Abonnement créé avec succès! ID: ' + data.subscriptionID);
        }
      }).render(paypalRef.current);
    }
  };

  return (
    <section id="pricing-section" className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
      <div className="flex flex-col items-center">
        {/* Titre de la section */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-center mb-16 md:mb-20">
          Accédez à tous les outils IA
        </h2>
        
        {/* Carte pricing avec animation */}
        <div className="relative">
          {/* Liséré animé irrégulier */}
          <div className="absolute inset-0 rounded-2xl animate-irregular-spin">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white via-transparent to-white opacity-40"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-l from-white/20 via-transparent to-white/60 rotate-45"></div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-white/30 via-transparent to-white/40 -rotate-12"></div>
          </div>
          
          {/* Carte pricing */}
          <div className="relative bg-slate-900/80 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 sm:p-10 max-w-md w-full text-center shadow-2xl">
            {/* Badge Popular */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                POPULAIRE
              </span>
            </div>
            
            {/* Logo Premium */}
            <div className="flex justify-center mb-4 mt-6">
              <img 
                src="https://customer-assets.emergentagent.com/job_ai-video-enhance-1/artifacts/3fcr0lo4_ChatGPT%20Image%2026%20may%202025%2C%2019_23_50-min%20%281%29%20%281%29.png" 
                alt="Premium Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            
            {/* Titre du plan */}
            <h3 className="text-2xl font-bold text-white mb-2">
              Premium
            </h3>
            
            {/* Prix */}
            <div className="mb-6 text-center">
              <span className="text-3xl sm:text-4xl font-bold text-white block mb-2">29,99€</span>
              <span className="text-xs sm:text-sm text-gray-300">facturés mensuellement</span>
            </div>
            
            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-300 mb-8">
              Lancez votre créativité avec tous nos outils IA
            </p>
            
            {/* Liste des outils IA disponibles */}
            <div className="space-y-3 mb-8 text-left">
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Google Veo 3.1 - Vidéos haute définition</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">NanoBanana - Générateur d'images Gemini</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">SORA 2 - Vidéos cinématographiques</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Kling AI v2.1 - Vidéos image-to-video</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Image Upscaler - Meilleur upscaler</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Seedream 4 - Images ultra-réalistes</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Grok - Création d'images créatives</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Alibaba Wan 2.5 - Génération vidéo avancée</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Flux Kontext Pro - Images artistiques</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Video Upscale AI - Amélioration vidéo 4K</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">ChatGPT-5 - IA conversationnelle avancée</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Support prioritaire 24/7</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-200 text-sm">Accès à toutes les nouvelles IA en avant-première</span>
              </div>
            </div>
            
            {/* Bouton PayPal */}
            <div ref={paypalRef} id="paypal-button-container-P-20B33183X5530231LND7XNPI" className="w-full"></div>
            
            {/* Garantie */}
            <p className="text-gray-500 mt-4 px-2" style={{fontSize: '10px'}}>
              29,99€/mois • Sans engagement
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;