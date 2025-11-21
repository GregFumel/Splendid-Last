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
    Création automatique du compte avec 500 crédits gratuits
    """
    try:
        # Vérifier le token Google avec la bibliothèque google-auth
        GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
        
        if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID != "YOUR_GOOGLE_CLIENT_ID_HERE":
            try:
                # Vérification du vrai token Google
                idinfo = id_token.verify_oauth2_token(
                    request.token, 
                    requests.Request(), 
                    GOOGLE_CLIENT_ID
                )
                
                # Vérifier que le token vient bien de Google
                if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                    raise HTTPException(status_code=401, detail="Token invalide")
                
                google_email = idinfo['email']
                google_name = idinfo.get('name', google_email.split('@')[0])
                
            except ValueError as e:
                # Token invalide
                raise HTTPException(status_code=401, detail=f"Token Google invalide: {str(e)}")
        else:
            # Mode développement: simulation (si pas de GOOGLE_CLIENT_ID configuré)
            # ATTENTION: À RETIRER EN PRODUCTION
            google_email = request.token
            google_name = google_email.split('@')[0] if '@' in google_email else google_email
        
        # Chercher l'utilisateur par email Google
        user = await users_collection.find_one({"email": google_email})
        
        initial_credits = CREDITS_CONFIG["meta"]["initial_credits"]
        
        if not user:
            # Créer un nouvel utilisateur avec 500 crédits gratuits
            user_id = str(uuid.uuid4())
            user = {
                "_id": user_id,
                "email": google_email,
                "name": google_name,
                "credits": initial_credits,
                "credits_used": 0,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await users_collection.insert_one(user)
        else:
            # Mettre à jour le nom si nécessaire
            if user.get("name") != google_name:
                await users_collection.update_one(
                    {"_id": user["_id"]},
                    {
                        "$set": {
                            "name": google_name,
                            "updated_at": datetime.utcnow()
                        }
                    }
                )
                user["name"] = google_name
        
        # Créer un token JWT
        token = create_token(str(user["_id"]))
        
        # Retourner les infos utilisateur
        return {
            "success": True,
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "email": user.get("email", ""),
                "name": user.get("name", ""),
                "credits": user.get("credits", initial_credits),
                "creditsUsed": user.get("credits_used", 0)
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
            "email": user.get("email", ""),
            "name": user.get("name", ""),
            "credits": user.get("credits", CREDITS_CONFIG["meta"]["initial_credits"]),
            "creditsUsed": user.get("credits_used", 0)
        }
    }

@auth_router.post("/logout")
async def logout():
    """
    Déconnexion (côté client seulement, suppression du token)
    """
    return {"success": True, "message": "Déconnecté"}


@auth_router.post("/deduct-credits")
async def deduct_credits(
    model_key: str,
    units: float = 1.0,
    variant: Optional[str] = None,
    megapixels: Optional[float] = None,
    authorization: Optional[str] = Header(None)
):
    """
    Déduire des crédits du compte utilisateur
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
    
    # Calculer le coût
    from credits_config import get_credits_cost, is_model_free
    
    if is_model_free(model_key):
        return {"success": True, "credits_deducted": 0, "credits_remaining": user.get("credits", 0)}
    
    cost_per_unit = get_credits_cost(model_key, variant, megapixels)
    total_cost = cost_per_unit * units
    
    # Arrondir selon le barème
    import math
    total_cost = math.ceil(total_cost * 2) / 2  # Arrondir à 0.5 près
    
    # Vérifier si l'utilisateur a assez de crédits
    current_credits = user.get("credits", 0)
    if current_credits < total_cost:
        raise HTTPException(status_code=402, detail="Crédits insuffisants")
    
    # Déduire les crédits
    new_credits = current_credits - total_cost
    new_credits_used = user.get("credits_used", 0) + total_cost
    
    await users_collection.update_one(
        {"_id": user_id},
        {
            "$set": {
                "credits": new_credits,
                "credits_used": new_credits_used,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "success": True,
        "credits_deducted": total_cost,
        "credits_remaining": new_credits
    }

async def deduct_credits_for_tokens(
    model_key: str,
    input_tokens: int,
    output_tokens: int,
    authorization: Optional[str] = Header(None)
):
    """
    Déduire des crédits du compte utilisateur pour les modèles basés sur les tokens
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
    
    # Calculer le coût basé sur les tokens
    from credits_config import calculate_token_based_credits
    
    total_cost = calculate_token_based_credits(model_key, input_tokens, output_tokens)
    
    # Arrondir selon le barème
    import math
    total_cost = math.ceil(total_cost * 2) / 2  # Arrondir à 0.5 près
    
    # Vérifier si l'utilisateur a assez de crédits
    current_credits = user.get("credits", 0)
    if current_credits < total_cost:
        raise HTTPException(status_code=402, detail="Crédits insuffisants")
    
    # Déduire les crédits
    new_credits = current_credits - total_cost
    new_credits_used = user.get("credits_used", 0) + total_cost
    
    await users_collection.update_one(
        {"_id": user_id},
        {
            "$set": {
                "credits": new_credits,
                "credits_used": new_credits_used,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "success": True,
        "credits_deducted": total_cost,
        "credits_remaining": new_credits,
        "tokens_used": {"input": input_tokens, "output": output_tokens}
    }

@auth_router.get("/credits")
async def get_credits(authorization: Optional[str] = Header(None)):
    """
    Récupérer le solde de crédits de l'utilisateur
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
        "credits": user.get("credits", 0),
        "creditsUsed": user.get("credits_used", 0)
    }

