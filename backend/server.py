from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import base64
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# ChatGPT-5 Models
class ChatGPT5Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatGPT5Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    messages: List[ChatGPT5Message] = []

class ChatGPT5Request(BaseModel):
    session_id: str
    prompt: str
    image_data: Optional[str] = None  # Data URL de l'image
    image_name: Optional[str] = None  # Nom du fichier image

class ChatGPT5Response(BaseModel):
    session_id: str
    message_id: str
    prompt: str
    response_text: str

# NanoBanana Models
class NanoBananaMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    image_urls: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class NanoBananaSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    messages: List[NanoBananaMessage] = []

class GenerateImageRequest(BaseModel):
    session_id: str
    prompt: str
    edit_image_url: Optional[str] = None  # URL de l'image à modifier
    edit_message_id: Optional[str] = None  # ID du message contenant l'image à modifier

class GenerateImageResponse(BaseModel):
    session_id: str
    message_id: str
    prompt: str
    image_urls: List[str]
    response_text: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# NanoBanana endpoints

@api_router.post("/nanobanana/generate", response_model=GenerateImageResponse)
async def generate_image_with_nanobanana(request: GenerateImageRequest):
    """Génère une image avec NanoBanana (Google Gemini)"""
    try:
        # Créer ou récupérer la session
        session = await db.nanobanana_sessions.find_one({"id": request.session_id})
        if not session:
            # Créer une nouvelle session
            session_obj = NanoBananaSession(id=request.session_id)
            await db.nanobanana_sessions.insert_one(session_obj.dict())
            session = session_obj.dict()

        # Sauvegarder le message utilisateur
        user_message = NanoBananaMessage(
            session_id=request.session_id,
            role="user",
            content=request.prompt
        )
        await db.nanobanana_messages.insert_one(user_message.dict())

        # Générer l'image avec Gemini
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

        # Créer une nouvelle instance pour chaque requête
        if request.edit_image_url and request.edit_message_id:
            # Mode édition d'image existante - récupérer le contexte original
            original_message = await db.nanobanana_messages.find_one({"id": request.edit_message_id})
            original_prompt = original_message.get("content", "") if original_message else ""
            
            system_message = f"Tu es NanoBanana, un générateur d'images créatif utilisant Google Gemini. L'utilisateur veut modifier une image basée sur : '{original_prompt}'. Voici les modifications demandées : '{request.prompt}'. Crée une nouvelle image qui combine l'idée originale avec ces modifications."
        else:
            # Mode génération normale
            system_message = "Tu es NanoBanana, un générateur d'images créatif utilisant Google Gemini. Tu crées des images visuellement impressionnantes à partir des descriptions texte des utilisateurs."
            
        chat = LlmChat(
            api_key=api_key, 
            session_id=request.session_id,
            system_message=system_message
        )
        
        chat = chat.with_model("gemini", "gemini-2.5-flash-image-preview").with_params(modalities=["image", "text"])
        
        # Créer le message utilisateur - utiliser le prompt original
        msg = UserMessage(text=request.prompt)
        
        # Générer l'image
        response_text, images = await chat.send_message_multimodal_response(msg)
        
        # Traiter les images générées
        image_urls = []
        if images:
            for i, img in enumerate(images):
                if 'data' in img:
                    # Créer un nom de fichier unique
                    image_filename = f"nanobanana_{request.session_id}_{user_message.id}_{i}.png"
                    
                    # Pour cette démo, on va encoder en data URL
                    image_data_url = f"data:{img.get('mime_type', 'image/png')};base64,{img['data']}"
                    image_urls.append(image_data_url)

        # Sauvegarder la réponse de l'assistant
        if request.edit_image_url and request.edit_message_id:
            default_message = "Image modifiée avec succès !"
        else:
            default_message = "Image générée avec succès !"
            
        assistant_message = NanoBananaMessage(
            session_id=request.session_id,
            role="assistant", 
            content=response_text or default_message,
            image_urls=image_urls
        )
        await db.nanobanana_messages.insert_one(assistant_message.dict())

        # Mettre à jour la session
        await db.nanobanana_sessions.update_one(
            {"id": request.session_id},
            {"$set": {"last_updated": datetime.utcnow()}}
        )

        return GenerateImageResponse(
            session_id=request.session_id,
            message_id=assistant_message.id,
            prompt=request.prompt,
            image_urls=image_urls,
            response_text=response_text or "Image générée avec succès !"
        )

    except Exception as e:
        logger.error(f"Erreur lors de la génération d'image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")

@api_router.get("/nanobanana/session/{session_id}", response_model=List[NanoBananaMessage])
async def get_nanobanana_session(session_id: str):
    """Récupère l'historique d'une session NanoBanana"""
    try:
        messages = await db.nanobanana_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).to_list(1000)
        
        return [NanoBananaMessage(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.post("/nanobanana/session", response_model=NanoBananaSession)
async def create_nanobanana_session():
    """Crée une nouvelle session NanoBanana"""
    try:
        session = NanoBananaSession()
        await db.nanobanana_sessions.insert_one(session.dict())
        return session
    except Exception as e:
        logger.error(f"Erreur lors de la création de session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.get("/nanobanana/sessions", response_model=List[NanoBananaSession])
async def get_nanobanana_sessions():
    """Récupère toutes les sessions NanoBanana"""
    try:
        sessions = await db.nanobanana_sessions.find().sort("last_updated", -1).to_list(100)
        return [NanoBananaSession(**session) for session in sessions]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

# ChatGPT-5 endpoints

@api_router.post("/chatgpt5/generate", response_model=ChatGPT5Response)
async def chat_with_gpt5(request: ChatGPT5Request):
    """Chat avec ChatGPT-5 (OpenAI GPT-5)"""
    try:
        # Créer ou récupérer la session
        session = await db.chatgpt5_sessions.find_one({"id": request.session_id})
        if not session:
            # Créer une nouvelle session
            session_obj = ChatGPT5Session(id=request.session_id)
            await db.chatgpt5_sessions.insert_one(session_obj.dict())
            session = session_obj.dict()

        # Sauvegarder le message utilisateur
        user_message = ChatGPT5Message(
            session_id=request.session_id,
            role="user",
            content=request.prompt
        )
        await db.chatgpt5_messages.insert_one(user_message.dict())

        # Générer la réponse avec ChatGPT-5
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

        # Créer une nouvelle instance pour chaque requête
        chat = LlmChat(
            api_key=api_key, 
            session_id=request.session_id,
            system_message="Tu es ChatGPT-5, un assistant conversationnel avancé d'OpenAI. Tu réponds de manière utile, claire et engageante aux questions des utilisateurs."
        )
        
        chat = chat.with_model("openai", "gpt-5")
        
        # Créer le message utilisateur
        msg = UserMessage(text=request.prompt)
        
        # Générer la réponse
        response_text = await chat.send_message(msg)
        
        # Sauvegarder la réponse de l'assistant
        assistant_message = ChatGPT5Message(
            session_id=request.session_id,
            role="assistant", 
            content=response_text
        )
        await db.chatgpt5_messages.insert_one(assistant_message.dict())

        # Mettre à jour la session
        await db.chatgpt5_sessions.update_one(
            {"id": request.session_id},
            {"$set": {"last_updated": datetime.utcnow()}}
        )

        return ChatGPT5Response(
            session_id=request.session_id,
            message_id=assistant_message.id,
            prompt=request.prompt,
            response_text=response_text
        )

    except Exception as e:
        logger.error(f"Erreur lors du chat ChatGPT-5: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors du chat: {str(e)}")

@api_router.get("/chatgpt5/session/{session_id}", response_model=List[ChatGPT5Message])
async def get_chatgpt5_session(session_id: str):
    """Récupère l'historique d'une session ChatGPT-5"""
    try:
        messages = await db.chatgpt5_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).to_list(1000)
        
        return [ChatGPT5Message(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.post("/chatgpt5/session", response_model=ChatGPT5Session)
async def create_chatgpt5_session():
    """Crée une nouvelle session ChatGPT-5"""
    try:
        session = ChatGPT5Session()
        await db.chatgpt5_sessions.insert_one(session.dict())
        return session
    except Exception as e:
        logger.error(f"Erreur lors de la création de session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.get("/chatgpt5/sessions", response_model=List[ChatGPT5Session])
async def get_chatgpt5_sessions():
    """Récupère toutes les sessions ChatGPT-5"""
    try:
        sessions = await db.chatgpt5_sessions.find().sort("last_updated", -1).to_list(100)
        return [ChatGPT5Session(**session) for session in sessions]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération des sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
