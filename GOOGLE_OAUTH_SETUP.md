# Configuration de l'authentification Google OAuth

## Étape 1: Obtenir votre Google Client ID

1. Allez sur https://console.cloud.google.com/
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Dans le menu, allez dans **"APIs & Services"** > **"Credentials"**
4. Cliquez sur **"+ CREATE CREDENTIALS"** > **"OAuth 2.0 Client ID"**
5. Si demandé, configurez l'écran de consentement OAuth:
   - Type: External
   - Nom de l'application: Splendid
   - Email de support: votre email
   - Domaines autorisés: votre domaine
   - Informations développeur: votre email

6. Créez les identifiants OAuth 2.0:
   - **Type d'application**: Application Web
   - **Nom**: Splendid Web Client
   - **Origines JavaScript autorisées**:
     - http://localhost:3000 (pour le développement)
     - https://votre-domaine.com (pour la production)
   - **URI de redirection autorisées**:
     - http://localhost:3000 (pour le développement)
     - https://votre-domaine.com (pour la production)

7. Cliquez sur **"CREATE"**
8. **COPIEZ le Client ID** qui apparaît (format: xxxxx.apps.googleusercontent.com)

## Étape 2: Configurer le Client ID dans votre application

### Frontend (.env)
Ouvrez `/app/frontend/.env` et remplacez:
```
REACT_APP_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```
par:
```
REACT_APP_GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
```

### Backend (.env)
Ouvrez `/app/backend/.env` et remplacez:
```
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```
par:
```
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
```

## Étape 3: Redémarrer les services

Après avoir configuré les Client IDs:
```bash
sudo supervisorctl restart all
```

## Étape 4: Tester

1. Allez sur votre application
2. Cliquez sur "Compte"
3. Vous devriez voir le vrai bouton Google "Continuer avec Google"
4. Cliquez dessus et connectez-vous avec votre compte Google
5. Vous recevrez automatiquement 500 crédits!

## Important

- **Gardez votre Client ID secret** (ne le partagez pas publiquement)
- **Ne committez pas** les fichiers .env avec de vraies valeurs dans Git
- En production, ajoutez votre vrai domaine dans les origines autorisées

## Dépannage

### Le bouton Google n'apparaît pas
- Vérifiez que le Client ID est bien configuré dans les deux .env
- Redémarrez les services: `sudo supervisorctl restart all`
- Vérifiez la console du navigateur pour des erreurs

### Erreur "Invalid Client ID"
- Vérifiez que vous avez bien copié le Client ID complet
- Vérifiez que votre domaine est dans les origines autorisées

### Erreur "Token invalide"
- Vérifiez que le Client ID backend correspond au Client ID frontend
- Vérifiez que le token n'a pas expiré

## Mode développement (sans Client ID)

Si vous n'avez pas encore de Client ID, l'application fonctionnera en mode simulation:
- À la place du bouton Google, un prompt demandera votre email
- Entrez n'importe quel email valide pour tester
- **Ce mode ne doit PAS être utilisé en production**
