from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
import jwt
import os
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from google.oauth2 import id_token
from google.auth.transport import requests
import uuid

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collection pour les utilisateurs
users_collection = db['users']

# Secret pour JWT
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 30

# Router
auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

# Import credits config
from credits_config import CREDITS_CONFIG

# Models
class GoogleAuthRequest(BaseModel):
    token: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    credits: float
    creditsUsed: float

# Helper functions
def create_token(user_id: str) -> str:
    """Créer un JWT token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> Optional[str]:
    """Vérifier un JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@auth_router.post("/google")
async def google_auth(request: GoogleAuthRequest):
    """
    Authentification avec Google OAuth
    Vérifie si l'utilisateur a un abonnement PayPal actif
    """
    try:
        # Vérifier le token Google (à implémenter avec votre client ID Google)
        # Pour l'instant, on simule l'extraction de l'email
        # idinfo = id_token.verify_oauth2_token(request.token, requests.Request(), GOOGLE_CLIENT_ID)
        # google_email = idinfo['email']
        # google_name = idinfo.get('name', '')
        
        # Simulation pour le développement - À REMPLACER
        # En production, décommenter les lignes ci-dessus
        google_email = request.token  # Temporaire: le token contient directement l'email
        google_name = google_email.split('@')[0]
        
        # Chercher l'utilisateur par email Google OU email PayPal
        user = await users_collection.find_one({
            "$or": [
                {"google_email": google_email},
                {"paypal_email": google_email}
            ]
        })
        
        if not user:
            # Créer un nouvel utilisateur non premium
            user_id = str(uuid.uuid4())
            user = {
                "_id": user_id,
                "google_email": google_email,
                "name": google_name,
                "is_premium": False,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await users_collection.insert_one(user)
        else:
            # Mettre à jour avec l'email Google si ce n'est pas déjà fait
            if "google_email" not in user or user["google_email"] != google_email:
                await users_collection.update_one(
                    {"_id": user["_id"]},
                    {
                        "$set": {
                            "google_email": google_email,
                            "name": google_name,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                user["google_email"] = google_email
                user["name"] = google_name
        
        # Créer un token JWT
        token = create_token(str(user["_id"]))
        
        # Retourner les infos utilisateur
        return {
            "success": True,
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "email": user.get("google_email", user.get("paypal_email", "")),
                "name": user.get("name", ""),
                "isPremium": user.get("is_premium", False),
                "subscriptionId": user.get("subscription_id")
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur authentification: {str(e)}")

@auth_router.get("/verify")
async def verify_auth(authorization: Optional[str] = Header(None)):
    """
    Vérifier si l'utilisateur est authentifié
    """
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    token = authorization.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    # Récupérer l'utilisateur
    user = await users_collection.find_one({"_id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return {
        "success": True,
        "user": {
            "id": str(user["_id"]),
            "email": user.get("google_email", user.get("paypal_email", "")),
            "name": user.get("name", ""),
            "isPremium": user.get("is_premium", False),
            "subscriptionId": user.get("subscription_id")
        }
    }

@auth_router.post("/logout")
async def logout():
    """
    Déconnexion (côté client seulement, suppression du token)
    """
    return {"success": True, "message": "Déconnecté"}
