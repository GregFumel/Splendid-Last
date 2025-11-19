import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, Settings, Zap, LogOut, Edit, Mail, Phone } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, credits, creditsUsed, loading, login, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Données de l'utilisateur depuis AuthContext
  const userProfile = {
    name: user?.name || "Utilisateur",
    email: user?.email || "",
    phone: "+33 6 12 34 56 78", // À ajouter dans le profil si nécessaire
    plan: "free", // Toujours gratuit
    credits: credits,
    creditsUsed: creditsUsed,
    subscriptionDate: "15 Décembre 2024", // À récupérer depuis la BDD
    trialEndDate: "18 Décembre 2024"
  };

  const isPremium = false; // Plus de plan premium
  const isFreeTrial = false; // Plus d'essai gratuit

  const handleGoToStudio = () => {
    navigate('/studio');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  const handleBuyCreditsClick = (amount) => {
    // Pour l'instant, juste fermer le modal
    // Plus tard, on pourra implémenter la vraie logique de paiement
    console.log(`Achat de ${amount} crédits`);
    setShowBuyCreditsModal(false);
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      // credentialResponse.credential contient le JWT token de Google
      const result = await login(credentialResponse.credential);
      if (result.success) {
        console.log('Connexion réussie!');
      } else {
        alert('Erreur de connexion: ' + result.error);
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      alert('Erreur lors de la connexion');
    }
  };

  const handleGoogleLoginError = () => {
    console.error('Échec de la connexion Google');
    alert('Échec de la connexion Google. Veuillez réessayer.');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  // Vue déconnectée
  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center mb-8 mt-16 md:mt-20">
          {/* Logo Splendid */}
          <div className="mb-6">
            <img 
              src="https://customer-assets.emergentagent.com/job_google-connect-1/artifacts/yzobciwb_splendid-logo-text.png" 
              alt="Logo Splendid"
              className="h-10 sm:h-14 md:h-16 lg:h-20 w-auto mx-auto"
              onError={(e) => {
                console.log("Erreur de chargement du logo");
                e.target.style.display = 'none';
              }}
            />
          </div>
          
          {/* Titre - responsive sans retour à la ligne */}
          <h2 className="text-xs sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-center leading-tight mb-8 px-1 whitespace-nowrap max-w-[95vw]" style={{fontSize: 'clamp(0.75rem, 4.5vw, 2.25rem)'}}>
            Découvrez tous les nouveaux outils IA
          </h2>
          
          {/* Bouton Se Connecter avec Google */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              theme="filled_blue"
              size="large"
              text="continue_with"
              shape="pill"
              locale="fr"
            />
          </div>
        </div>
      </div>
    );
  }

  // Vue connectée
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8 -mt-4 md:mt-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4">
          Tableau de bord
        </h1>
        <p className="text-gray-300 text-sm">
          Gérez votre compte et accédez à vos outils IA
        </p>
      </div>

      <div className="grid grid-cols-1 gap-16">
        
        {/* Bouton Studio centré */}
        <div className="flex justify-center">
          <button
            onClick={handleGoToStudio}
            className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-full transition flex items-center space-x-3 shadow-lg"
          >
            <span>Accéder au Studio</span>
            <img 
              src="https://customer-assets.emergentagent.com/job_responsive-ai-tools/artifacts/kxkeb90j_noun-wizard-5902060.png" 
              alt="Logo"
              className="w-5 h-5 object-contain"
            />
          </button>
        </div>

        {/* Statut d'abonnement avec crédits intégrés - largeur complète */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Statut d'abonnement</h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-white flex items-center justify-end space-x-2">
                <img 
                  src="https://customer-assets.emergentagent.com/job_responsive-ai-tools/artifacts/5rb7fz1f_coins-3d-icon-png-download-5087356.webp" 
                  alt="Crédits"
                  className="w-6 h-6 object-contain"
                />
                <span>{userProfile.credits}</span>
              </div>
              <div className="text-gray-400 text-sm">Crédits restants</div>
            </div>
          </div>
          
          {/* Abonnement actif pour tous les utilisateurs connectés */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-medium text-white">Abonnement actif</span>
              </div>
              <span className="badge-new-3d text-white px-4 py-2 rounded-full text-sm font-semibold">
                Actif
              </span>
            </div>
            
            {/* Affichage des crédits avec barre de progression */}
            <div className="bg-black/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white font-semibold">Vos crédits</span>
                </div>
                <span className="text-sm text-gray-400">
                  {userProfile.credits} / 500 crédits
                </span>
              </div>
              
              {/* Barre de progression */}
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    userProfile.credits > 250 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                    userProfile.credits > 100 ? 'bg-gradient-to-r from-yellow-500 to-amber-400' :
                    'bg-gradient-to-r from-red-500 to-orange-400'
                  }`}
                  style={{ width: `${(userProfile.credits / 500) * 100}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Restants : {userProfile.credits}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-gray-300">Utilisés : {userProfile.creditsUsed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions d'abonnement */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setShowBuyCreditsModal(true)}
              className="btn-3d-effect bg-gradient-to-r from-amber-600 to-yellow-400 hover:from-amber-700 hover:to-yellow-500 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg"
            >
              <img 
                src="https://customer-assets.emergentagent.com/job_google-connect-1/artifacts/njhagw0d_5rb7fz1f_coins-3d-icon-png-download-5087356.webp" 
                alt="Crédits"
                className="w-5 h-5 object-contain"
              />
              <span>Acheter des crédits</span>
            </button>
            <button className="btn-3d-effect bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg">
              <span>Se désabonner</span>
            </button>
          </div>
        </div>

        {/* Informations utilisateur */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Informations personnelles</h2>
            <button
              onClick={() => setShowEditProfile(!showEditProfile)}
              className="btn-3d-effect bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Modifier</span>
            </button>
          </div>

          {!showEditProfile ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-gray-400 text-sm">Nom complet</div>
                  <div className="text-white font-medium">{userProfile.name}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-gray-400 text-sm">Email</div>
                  <div className="text-white font-medium">{userProfile.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-gray-400 text-sm">Téléphone</div>
                  <div className="text-white font-medium">{userProfile.phone}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nom complet</label>
                <input
                  type="text"
                  defaultValue={userProfile.name}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={userProfile.email}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Téléphone</label>
                <input
                  type="tel"
                  defaultValue={userProfile.phone}
                  className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition"
                />
              </div>
            </div>
          )}

          {showEditProfile && (
            <div className="mt-6 flex gap-3">
              <button className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl transition">
                Sauvegarder
              </button>
              <button
                onClick={() => setShowEditProfile(false)}
                className="btn-3d-effect bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-xl transition"
              >
                Annuler
              </button>
            </div>
          )}
        </div>

        {/* Bouton Se Déconnecter */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLogoutClick}
            className="btn-3d-effect bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 w-full max-w-xs"
          >
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </button>
        </div>

        {/* Modal Acheter des crédits - Design moderne responsive mobile */}
        {showBuyCreditsModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowBuyCreditsModal(false)}
          >
            <div 
              className="relative bg-gray-900/95 border border-gray-800 rounded-2xl p-3 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-4xl shadow-2xl my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Bouton fermer */}
              <button
                onClick={() => setShowBuyCreditsModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors z-10"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Titre */}
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 text-center pr-8">
                Acheter des crédits
              </h2>
              
              {/* Message promotionnel */}
              <p className="text-center text-gray-400 text-xs sm:text-sm mb-4 sm:mb-6 md:mb-8">
                Choisissez le pack qui vous convient
              </p>

              {/* Grille de cartes de crédits - Espace pour les badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 pt-4">
                {/* 500 crédits */}
                <div className="bg-gray-800/50 border-2 border-gray-700 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 flex flex-col items-center hover:border-gray-600 transition-all">
                  <img 
                    src="https://customer-assets.emergentagent.com/job_google-connect-1/artifacts/njhagw0d_5rb7fz1f_coins-3d-icon-png-download-5087356.webp" 
                    alt="Crédits"
                    className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain mb-2 sm:mb-3 md:mb-4"
                  />
                  <h3 className="text-base sm:text-xl md:text-2xl font-bold text-white mb-1 sm:mb-2">500 crédits</h3>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3 md:mb-4">29,99€</p>
                  <p className="text-xs text-gray-400 mb-2 sm:mb-4">Pack de base</p>
                  <button
                    onClick={() => handleBuyCreditsClick(500)}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm md:text-base transition shadow-lg hover:shadow-xl transform hover:scale-105"
                    style={{
                      boxShadow: 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.2), 0 4px 12px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    Acheter
                  </button>
                </div>

                {/* 1000 crédits - Populaire avec animation */}
                <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 flex flex-col items-center relative shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all overflow-hidden">
                  {/* Animation du liseré qui tourne */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl" style={{
                    background: 'linear-gradient(90deg, transparent, transparent, rgba(34, 197, 94, 0.8), transparent, transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'borderRotate 3s linear infinite',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                  }}></div>
                  
                  {/* Badge Populaire avec réduction */}
                  <div className="absolute -top-5 sm:-top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-green-500 to-green-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 md:px-4 py-1 rounded-full border border-white/30 shadow-lg z-10 whitespace-nowrap" style={{
                    boxShadow: 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.4), 0 4px 12px rgba(34, 197, 94, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    -25% • Populaire
                  </div>
                  
                  <img 
                    src="https://customer-assets.emergentagent.com/job_google-connect-1/artifacts/njhagw0d_5rb7fz1f_coins-3d-icon-png-download-5087356.webp" 
                    alt="Crédits"
                    className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain mb-2 sm:mb-3 md:mb-4 mt-1 sm:mt-2 relative z-10"
                  />
                  <h3 className="text-base sm:text-xl md:text-2xl font-bold text-green-400 mb-1 sm:mb-2 relative z-10">1000 crédits</h3>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 relative z-10">44,99€</p>
                  <p className="text-xs text-gray-400 line-through mb-2 sm:mb-3 relative z-10">60€</p>
                  <button
                    onClick={() => handleBuyCreditsClick(1000)}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm md:text-base transition shadow-lg hover:shadow-xl transform hover:scale-105 relative z-10"
                    style={{
                      boxShadow: 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.2), 0 4px 12px rgba(34, 197, 94, 0.3)'
                    }}
                  >
                    Acheter
                  </button>
                </div>

                {/* 2000 crédits - Meilleure valeur avec animation */}
                <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-2 sm:p-4 md:p-6 flex flex-col items-center relative shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all overflow-hidden">
                  {/* Animation du liseré qui tourne */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl" style={{
                    background: 'linear-gradient(90deg, transparent, transparent, rgba(234, 179, 8, 0.8), transparent, transparent)',
                    backgroundSize: '200% 100%',
                    animation: 'borderRotate 3s linear infinite',
                    padding: '2px',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                  }}></div>
                  
                  {/* Badge Meilleure valeur avec réduction */}
                  <div className="absolute -top-2 sm:-top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white text-xs font-bold px-3 sm:px-4 py-0.5 sm:py-1 rounded-full border border-white/30 shadow-lg whitespace-nowrap z-10" style={{
                    boxShadow: 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.4), 0 4px 12px rgba(234, 179, 8, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}>
                    -42% • Best Value
                  </div>
                  
                  <img 
                    src="https://customer-assets.emergentagent.com/job_google-connect-1/artifacts/njhagw0d_5rb7fz1f_coins-3d-icon-png-download-5087356.webp" 
                    alt="Crédits"
                    className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain mb-2 sm:mb-3 md:mb-4 mt-1 sm:mt-2 relative z-10"
                  />
                  <h3 className="text-base sm:text-xl md:text-2xl font-bold text-yellow-400 mb-1 sm:mb-2 relative z-10">2000 crédits</h3>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 relative z-10">69€</p>
                  <p className="text-xs text-gray-400 line-through mb-2 sm:mb-3 relative z-10">120€</p>
                  <button
                    onClick={() => handleBuyCreditsClick(2000)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm md:text-base transition shadow-lg hover:shadow-xl transform hover:scale-105 relative z-10"
                    style={{
                      boxShadow: 'inset 0 1px 2px 0 rgba(255, 255, 255, 0.2), 0 4px 12px rgba(234, 179, 8, 0.3)'
                    }}
                  >
                    Acheter
                  </button>
                </div>
              </div>

              <p className="text-center text-gray-500 text-xs sm:text-sm">
                Les crédits seront ajoutés immédiatement à votre compte
              </p>
            </div>
          </div>
        )}

        {/* Modal Confirmation Déconnexion - Glassmorphisme */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
              {/* Bouton fermer */}
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Icône */}
              <div className="flex justify-center mb-4">
                <div className="bg-red-500/20 p-4 rounded-full">
                  <LogOut className="w-12 h-12 text-red-400" />
                </div>
              </div>

              {/* Titre */}
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 text-center">
                Confirmer la déconnexion
              </h2>

              <p className="text-white/80 text-center mb-8">
                Êtes-vous sûr de vouloir vous déconnecter ?
              </p>

              {/* Boutons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-6 py-3 rounded-xl transition"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition"
                >
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;