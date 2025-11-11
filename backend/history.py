from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime
import os
from motor.motor_asyncio import AsyncIOMotorClient
import jwt

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Collection pour l'historique
history_collection = db['user_history']

# Secret pour JWT
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

# Router
history_router = APIRouter(prefix="/history", tags=["History"])

# Models
class SaveHistoryRequest(BaseModel):
    tool_id: str
    tool_name: str
    prompt: str
    result: Any  # Peut être une image URL, texte, vidéo URL, etc.
    metadata: Optional[dict] = None  # Options utilisées (résolution, durée, etc.)

class HistoryEntry(BaseModel):
    id: str
    tool_id: str
    tool_name: str
    prompt: str
    result: Any
    metadata: Optional[dict] = None
    created_at: str

def verify_token(token: str) -> Optional[str]:
    """Vérifier un JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get('user_id')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@history_router.post("/save")
async def save_history(request: SaveHistoryRequest, authorization: Optional[str] = Header(None)):
    """
    Sauvegarder une entrée dans l'historique de l'utilisateur
    """
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    token = authorization.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    try:
        # Créer l'entrée d'historique
        history_entry = {
            "user_id": user_id,
            "tool_id": request.tool_id,
            "tool_name": request.tool_name,
            "prompt": request.prompt,
            "result": request.result,
            "metadata": request.metadata or {},
            "created_at": datetime.utcnow()
        }
        
        # Insérer dans la collection
        result = await history_collection.insert_one(history_entry)
        
        return {
            "success": True,
            "history_id": str(result.inserted_id),
            "message": "Historique sauvegardé"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@history_router.get("/tool/{tool_id}")
async def get_tool_history(tool_id: str, authorization: Optional[str] = Header(None)):
    """
    Récupérer l'historique d'un outil spécifique pour l'utilisateur
    """
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    token = authorization.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    try:
        # Récupérer l'historique pour cet outil
        cursor = history_collection.find({
            "user_id": user_id,
            "tool_id": tool_id
        }).sort("created_at", -1)  # Plus récent en premier
        
        history = []
        async for entry in cursor:
            history.append({
                "id": str(entry["_id"]),
                "tool_id": entry["tool_id"],
                "tool_name": entry["tool_name"],
                "prompt": entry["prompt"],
                "result": entry["result"],
                "metadata": entry.get("metadata", {}),
                "created_at": entry["created_at"].isoformat()
            })
        
        return {
            "success": True,
            "history": history,
            "count": len(history)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@history_router.get("/all")
async def get_all_history(authorization: Optional[str] = Header(None)):
    """
    Récupérer tout l'historique de l'utilisateur (tous les outils)
    """
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    token = authorization.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    try:
        # Récupérer tout l'historique
        cursor = history_collection.find({
            "user_id": user_id
        }).sort("created_at", -1).limit(100)  # Limiter aux 100 dernières entrées
        
        history = []
        async for entry in cursor:
            history.append({
                "id": str(entry["_id"]),
                "tool_id": entry["tool_id"],
                "tool_name": entry["tool_name"],
                "prompt": entry["prompt"],
                "result": entry["result"],
                "metadata": entry.get("metadata", {}),
                "created_at": entry["created_at"].isoformat()
            })
        
        return {
            "success": True,
            "history": history,
            "count": len(history)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@history_router.delete("/{history_id}")
async def delete_history_entry(history_id: str, authorization: Optional[str] = Header(None)):
    """
    Supprimer une entrée de l'historique
    """
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Non authentifié")
    
    token = authorization.split(' ')[1]
    user_id = verify_token(token)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    try:
        # Supprimer l'entrée (seulement si elle appartient à l'utilisateur)
        result = await history_collection.delete_one({
            "_id": history_id,
            "user_id": user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Entrée non trouvée")
        
        return {
            "success": True,
            "message": "Entrée supprimée"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")
