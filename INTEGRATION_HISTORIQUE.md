# Guide d'intégration de l'historique dans Studio

## Système d'historique créé

Le système d'historique est maintenant opérationnel pour sauvegarder toutes les générations des utilisateurs.

### Backend - Endpoints disponibles

**1. Sauvegarder dans l'historique:**
```
POST /api/history/save
Headers: Authorization: Bearer {token}
Body: {
  "tool_id": "1",  // ID de l'outil (ex: "1" pour NanoBanana)
  "tool_name": "NanoBanana",
  "prompt": "un chat astronaute",
  "result": "https://url-de-l-image.jpg",  // Ou tableau d'URLs
  "metadata": {  // Optionnel
    "resolution": "1024x1024",
    "duration": 5,
    "variant": "standard"
  }
}
```

**2. Récupérer l'historique d'un outil:**
```
GET /api/history/tool/{tool_id}
Headers: Authorization: Bearer {token}
```

**3. Récupérer tout l'historique:**
```
GET /api/history/all
Headers: Authorization: Bearer {token}
```

**4. Supprimer une entrée:**
```
DELETE /api/history/{history_id}
Headers: Authorization: Bearer {token}
```

### Frontend - Hook React disponible

**Utilisation dans Studio.js:**

```javascript
import { useHistory } from '../hooks/useHistory';

const Studio = () => {
  // Dans votre composant, initialisez le hook
  const { history, loading, saveToHistory, deleteFromHistory } = useHistory(
    selectedTool.id,  // ID de l'outil actuel
    selectedTool.name  // Nom de l'outil
  );

  // Après une génération réussie:
  const handleGenerate = async () => {
    // ... votre code de génération ...
    
    // Une fois que vous avez le résultat:
    if (result) {
      await saveToHistory(
        prompt,  // Le prompt utilisé
        result,  // L'URL de l'image/vidéo ou le texte
        {  // Metadata optionnel
          resolution: upscalerOptions.targetResolution,
          duration: klingOptions.duration,
          // ... autres options utilisées
        }
      );
    }
  };

  // Afficher l'historique:
  return (
    <div>
      {/* Votre interface Studio */}
      
      {/* Section historique */}
      <div className="history-section">
        <h3>Historique</h3>
        {loading ? (
          <p>Chargement...</p>
        ) : (
          <div className="history-grid">
            {history.map(entry => (
              <div key={entry.id}>
                <img src={entry.result} alt={entry.prompt} />
                <p>{entry.prompt}</p>
                <button onClick={() => deleteFromHistory(entry.id)}>
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

### Intégration dans Studio.js

Pour chaque outil, après une génération réussie, appelez `saveToHistory`:

**Exemple pour NanoBanana:**
```javascript
// Après la génération réussie de NanoBanana
if (aiResponse.image_urls && aiResponse.image_urls.length > 0) {
  await saveToHistory(prompt, aiResponse.image_urls, {
    model: "NanoBanana",
    timestamp: new Date().toISOString()
  });
}
```

**Exemple pour SORA 2 (vidéo):**
```javascript
// Après la génération réussie de SORA 2
if (videoUrl) {
  await saveToHistory(prompt, videoUrl, {
    model: "SORA 2",
    duration: 5,
    timestamp: new Date().toISOString()
  });
}
```

### Structure de l'historique

Chaque entrée contient:
```javascript
{
  "id": "unique-id",
  "tool_id": "1",
  "tool_name": "NanoBanana",
  "prompt": "un chat astronaute",
  "result": "https://...",  // ou ["url1", "url2"] pour plusieurs images
  "metadata": {
    "resolution": "1024x1024"
  },
  "created_at": "2024-01-15T10:30:00.000Z"
}
```

### Avantages

1. **Persistance**: L'utilisateur retrouve son historique après déconnexion
2. **Par outil**: Chaque outil a son propre historique
3. **Recherche**: Historique trié par date (plus récent en premier)
4. **Suppression**: L'utilisateur peut supprimer des entrées
5. **Sécurité**: Chaque utilisateur voit uniquement son historique

### Migration des outils existants

Pour activer l'historique sur tous les outils du Studio:

1. Importer le hook en haut de Studio.js
2. Initialiser le hook avec l'ID de l'outil sélectionné
3. Appeler `saveToHistory` après chaque génération réussie
4. Afficher l'historique dans l'interface

### Tests

Pour tester:
1. Connectez-vous avec Google
2. Générez une image/vidéo
3. Rafraîchissez la page
4. L'historique doit être restauré automatiquement
