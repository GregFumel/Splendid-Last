import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, Settings, Zap, LogOut, Edit, Mail, Phone } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4">
          Tableau de bord
        </h1>
        <p className="text-gray-300 text-lg">
          Gérez votre compte et accédez à vos outils IA
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Bouton Studio centré */}
        <div className="flex justify-center">
          <button
            onClick={handleGoToStudio}
            className="btn-3d-effect bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-full transition flex items-center space-x-2 shadow-lg"
          >
            <span>Accéder au Studio</span>
          </button>
        </div>

        {/* Statut d'abonnement avec crédits intégrés - largeur complète */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Statut d'abonnement</h2>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{userProfile.credits}</div>
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
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-green-400" />
              <h2 className="text-xl font-semibold text-white">Informations personnelles</h2>
            </div>
            <button
              onClick={() => setShowEditProfile(!showEditProfile)}
              className="btn-3d-effect bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Modifier</span>
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
      </div>
    </div>
  );
};

export default Dashboard;