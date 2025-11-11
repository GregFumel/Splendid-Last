import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, Settings, Zap, LogOut, Edit, Mail, Phone } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, credits, creditsUsed, loading, login, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  
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

  const handleLogout = () => {
    logout();
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
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
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
                  <span className="text-gray-300">Restants: {userProfile.credits}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span className="text-gray-300">Utilisés: {userProfile.creditsUsed}</span>
                </div>
              </div>
              
              {/* Valeur en euros */}
              <div className="text-center pt-2 border-t border-white/10">
                <span className="text-xs text-gray-400">
                  Valeur: {(userProfile.credits * 0.026).toFixed(2)}€ restants / {(userProfile.creditsUsed * 0.026).toFixed(2)}€ utilisés
                </span>
              </div>
            </div>
          </div>

          {/* Actions d'abonnement */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button className="btn-3d-effect bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg">
              <Zap className="w-5 h-5" />
              <span>Acheter des crédits</span>
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
            onClick={handleLogout}
            className="btn-3d-effect bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center space-x-2 w-full max-w-xs"
          >
            <LogOut className="w-5 h-5" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;