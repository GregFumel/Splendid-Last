import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, Settings, Zap, LogOut, Edit, Mail, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isPremium, loading, login, logout } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Données mockées pour l'utilisateur
  const [userProfile, setUserProfile] = useState({
    name: "Jean Dupont",
    email: "jean.dupont@email.com",
    phone: "+33 6 12 34 56 78",
    plan: "premium", // "free_trial" ou "premium"
    credits: 485,
    subscriptionDate: "15 Décembre 2024",
    trialEndDate: "18 Décembre 2024"
  });

  const isPremium = userProfile.plan === "premium";
  const isFreeTrial = userProfile.plan === "free_trial";

  const handleGoToStudio = () => {
    navigate('/studio');
  };

  const handleLogout = () => {
    logout();
  };

  const handleGoogleLogin = async () => {
    // Pour le développement, on simule avec un email
    // En production, utiliser Google OAuth réel
    const email = prompt('Entrez votre email Google:');
    if (email && email.includes('@')) {
      const result = await login(email);
      if (result.success) {
        alert('Connexion réussie!');
      } else {
        alert('Erreur de connexion: ' + result.error);
      }
    }
  };

  // Vue déconnectée
  if (!isAuthenticated) {
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
          <h2 className="text-xs sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 text-center leading-tight mb-4 px-1 whitespace-nowrap max-w-[95vw]" style={{fontSize: 'clamp(0.75rem, 4.5vw, 2.25rem)'}}>
            Découvrez tous les nouveaux outils IA
          </h2>
          
          {/* Bouton Se Connecter avec Google */}
          <button
            onClick={handleGoogleLogin}
            className="btn-3d-effect mt-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold px-8 py-4 rounded-full transition flex items-center space-x-3 shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continuer avec Google</span>
          </button>
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
          
          {isPremium ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-lg font-medium text-white">Plan Premium</span>
                </div>
                <span className="badge-new-3d text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Actif
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Prix mensuel</span>
                  <p className="text-white font-medium">29,99€/mois</p>
                </div>
                <div>
                  <span className="text-gray-400">Depuis le</span>
                  <p className="text-white font-medium">{userProfile.subscriptionDate}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-lg font-medium text-white">Essai gratuit</span>
                </div>
                <span className="bg-orange-500/20 border border-orange-400/50 text-orange-200 px-4 py-2 rounded-full text-sm font-semibold">
                  {userProfile.trialEndDate}
                </span>
              </div>
              <div className="bg-orange-500/10 border border-orange-400/20 rounded-xl p-4">
                <p className="text-orange-200 text-sm">
                  Votre essai gratuit se termine le {userProfile.trialEndDate}. 
                  Passez au plan premium pour continuer à utiliser tous nos outils IA.
                </p>
              </div>
            </div>
          )}

          {/* Actions d'abonnement */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {isPremium ? (
              <>
                <button className="btn-3d-effect bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl transition flex items-center justify-center space-x-2">
                  <LogOut className="w-4 h-4" />
                  <span>Se désabonner</span>
                </button>
                <button className="btn-3d-effect bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-xl transition flex items-center justify-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Gérer l'abonnement</span>
                </button>
              </>
            ) : (
              <button className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-xl transition flex items-center justify-center space-x-2">
                <CreditCard className="w-4 h-4" />
                <span>Passer au Premium</span>
              </button>
            )}
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