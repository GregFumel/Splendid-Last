import { useState, useEffect } from 'react';

export const useHistory = (toolId, toolName) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = async () => {
    try {
      console.log('🔄 Chargement historique pour tool:', toolId, toolName);
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('⚠️ Pas de token, utilisateur non connecté');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/history/tool/${toolId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('📡 Réponse historique:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Historique chargé:', data.history?.length || 0, 'entrées');
        setHistory(data.history || []);
      } else {
        console.error('❌ Erreur historique:', response.status);
      }
    } catch (error) {
      console.error('❌ Erreur chargement historique:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger l'historique au montage et quand toolId change
  useEffect(() => {
    if (toolId) {
      console.log('📍 useEffect déclenché - toolId:', toolId);
      loadHistory();
    }
  }, [toolId]);

  // Recharger l'historique quand la fenêtre redevient visible (retour sur la page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && toolId) {
        console.log('👁️ Page redevenue visible - rechargement historique');
        loadHistory();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [toolId]);

  const saveToHistory = async (prompt, result, metadata = {}) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/history/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            tool_id: toolId,
            tool_name: toolName,
            prompt: prompt,
            result: result,
            metadata: metadata
          })
        }
      );

      if (response.ok) {
        console.log('✅ Sauvegarde réussie dans l\'historique');
        // Recharger l'historique après sauvegarde
        await loadHistory();
        return true;
      } else {
        console.error('❌ Échec sauvegarde:', response.status);
      }
      return false;
    } catch (error) {
      console.error('Erreur sauvegarde historique:', error);
      return false;
    }
  };

  const deleteFromHistory = async (historyId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/history/${historyId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        // Retirer l'entrée de l'état local
        setHistory(prev => prev.filter(entry => entry.id !== historyId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur suppression historique:', error);
      return false;
    }
  };

  return {
    history,
    loading,
    saveToHistory,
    deleteFromHistory,
    reloadHistory: loadHistory
  };
};
