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
        }
      }
    } catch (error) {
      console.error('Erreur refresh credits:', error);
    }
  };

  const value = {
    user,
    isPremium,
    loading,
    login,
    logout,
    checkAuth,
    updateSubscription
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
