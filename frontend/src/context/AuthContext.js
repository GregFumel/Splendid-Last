import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [creditsUsed, setCreditsUsed] = useState(0);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setCredits(data.user.credits || 0);
          setCreditsUsed(data.user.creditsUsed || 0);
        } else {
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (googleToken) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: googleToken })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        setCredits(data.user.credits || 0);
        setCreditsUsed(data.user.creditsUsed || 0);
        return { success: true, user: data.user };
      } else {
        const error = await response.json();
        return { success: false, error: error.message };
      }
    } catch (error) {
      console.error('Erreur login:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setCredits(0);
    setCreditsUsed(0);
  };

  const refreshCredits = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/credits`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCredits(data.credits);
          setCreditsUsed(data.creditsUsed);
          console.log('💰 Crédits mis à jour:', data.credits, 'restants,', data.creditsUsed, 'utilisés');
        }
      }
    } catch (error) {
      console.error('Erreur refresh credits:', error);
    }
  };

  const deductCredits = async (modelKey, units = 1.0, variant = null, megapixels = null) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('⚠️ Pas de token, impossible de déduire les crédits');
        return { success: false, error: 'Non authentifié' };
      }

      const params = new URLSearchParams({
        model_key: modelKey,
        units: units.toString()
      });
      
      if (variant) params.append('variant', variant);
      if (megapixels) params.append('megapixels', megapixels.toString());

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/deduct-credits?${params}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('💳 Crédits déduits:', data.credits_deducted, '→ Restants:', data.credits_remaining);
        
        // Mettre à jour l'état local
        setCredits(data.credits_remaining);
        setCreditsUsed(prev => prev + data.credits_deducted);
        
        return { 
          success: true, 
          creditsDeducted: data.credits_deducted,
          creditsRemaining: data.credits_remaining 
        };
      } else if (response.status === 402) {
        // Crédits insuffisants
        console.error('❌ Crédits insuffisants');
        return { success: false, error: 'Crédits insuffisants' };
      } else {
        console.error('❌ Erreur déduction:', response.status);
        return { success: false, error: 'Erreur de déduction' };
      }
    } catch (error) {
      console.error('❌ Erreur deductCredits:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    credits,
    creditsUsed,
    loading,
    login,
    logout,
    checkAuth,
    refreshCredits,
    deductCredits
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
