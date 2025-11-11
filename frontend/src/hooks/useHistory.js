import { useState, useEffect } from 'react';

export const useHistory = (toolId, toolName) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger l'historique au montage
  useEffect(() => {
    loadHistory();
  }, [toolId]);

  const loadHistory = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
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

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Erreur chargement historique:', error);
    } finally {
      setLoading(false);
    }
  };

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
        // Recharger l'historique après sauvegarde
        await loadHistory();
        return true;
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
