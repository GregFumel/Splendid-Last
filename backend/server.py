from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
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
import litellm
import replicate
import requests
from PIL import Image, ImageDraw, ImageFont
import io
import tempfile
import shutil


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Create temp directory for storing images
TEMP_IMAGES_DIR = Path("/tmp/kling_images")
TEMP_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# Helper function to convert data URL to public URL
def data_url_to_public_url(data_url: str, backend_url: str) -> str:
    """Convert a data URL to a public HTTP URL by saving the image temporarily"""
    try:
        # Extract the base64 data
        if not data_url.startswith("data:"):
            # Already a URL
            return data_url
        
        # Parse data URL: data:image/png;base64,xxxxx or data:image/jpeg;base64,xxxxx
        header, encoded = data_url.split(",", 1)
        
        # Decode base64
        image_data = base64.b64decode(encoded)
        
        # Open image with PIL to ensure it's valid
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary (for PNG with transparency)
        if image.mode in ('RGBA', 'LA', 'P'):
            # Create white background
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}.jpg"
        filepath = TEMP_IMAGES_DIR / filename
        
        # Save as JPEG (better compatibility with Replicate)
        image.save(filepath, 'JPEG', quality=95)
        
        # Return public URL (under /api prefix for Kubernetes ingress routing)
        public_url = f"{backend_url}/api/temp-images/{filename}"
        logging.info(f"Image saved successfully: {filepath} -> {public_url}")
        return public_url
    except Exception as e:
        logging.error(f"Error converting data URL to public URL: {str(e)}")
        raise


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
    image_urls: List[str] = []  # Pour stocker les images uploadées par l'utilisateur
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

# AI Image Upscaler Models
class ImageUpscalerMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    image_urls: List[str] = []  # URLs des images (input pour user, output pour assistant)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ImageUpscalerSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    messages: List[ImageUpscalerMessage] = []

class UpscaleImageRequest(BaseModel):
    session_id: str
    image_data: str  # Data URL de l'image à upscaler
    scale_factor: int  # 2, 4 ou 8

class UpscaleImageResponse(BaseModel):
    session_id: str
    message_id: str
    image_urls: List[str]  # URLs des images upscalées
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

# Flux Kontext Pro Models
class FluxKontextMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    image_urls: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class FluxKontextSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    messages: List[FluxKontextMessage] = []

class GenerateFluxKontextRequest(BaseModel):
    session_id: str
    prompt: str
    input_image: Optional[str] = None  # Data URL de l'image de référence (optionnelle)
    aspect_ratio: str = "16:9"  # Default aspect ratio
    prompt_upsampling: bool = False
    safety_tolerance: int = 2

class GenerateFluxKontextResponse(BaseModel):
    session_id: str
    message_id: str
    image_urls: List[str]
    response_text: str

# Kling AI v2.1 Models (Image-to-Video Generation)
class KlingMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    video_urls: List[str] = []
    image_urls: List[str] = []  # Pour stocker start_image et end_image
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class KlingSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    messages: List[KlingMessage] = []

class GenerateKlingRequest(BaseModel):
    session_id: str
    prompt: str
    start_image: str  # Data URL de l'image de départ (OBLIGATOIRE)
    end_image: Optional[str] = None  # Data URL de l'image de fin (optionnelle, nécessite mode pro)
    mode: str = "standard"  # "standard" (720p) ou "pro" (1080p)
    duration: int = 5  # 5 ou 10 secondes
    negative_prompt: Optional[str] = ""

class GenerateKlingResponse(BaseModel):
    session_id: str
    message_id: str
    video_urls: List[str]
    response_text: str

# Seedream 4 Models (Text-to-Image and Image-to-Image Generation)
class SeedreamMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    image_urls: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SeedreamSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    messages: List[SeedreamMessage] = []

class GenerateSeedreamRequest(BaseModel):
    session_id: str
    prompt: str
    image_input: Optional[str] = None  # Data URL de l'image input (optionnelle)
    size: str = "2K"  # "1K", "2K", ou "4K"
    aspect_ratio: str = "1:1"  # "1:1", "4:3", "3:4", "16:9", "9:16", "3:2", "2:3", "21:9"

class GenerateSeedreamResponse(BaseModel):
    session_id: str
    message_id: str
    image_urls: List[str]
    response_text: str

# Grok Models (Text-to-Image Generation)
class GrokMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    image_urls: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class GrokSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    messages: List[GrokMessage] = []

class GenerateGrokRequest(BaseModel):
    session_id: str
    prompt: str

class GenerateGrokResponse(BaseModel):
    session_id: str
    message_id: str
    image_urls: List[str]
    response_text: str

# Alibaba Wan 2.5 Models (Text-to-Video Generation)
class AlibabaWanMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    video_urls: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AlibabaWanSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    messages: List[AlibabaWanMessage] = []

class GenerateAlibabaWanRequest(BaseModel):
    session_id: str
    prompt: str
    duration: int = 5  # 5 ou 10 secondes
    size: str = "1280*720"  # "832*480", "480*832", "1280*720", "720*1280", "1920*1080", "1080*1920"

class GenerateAlibabaWanResponse(BaseModel):
    session_id: str
    message_id: str
    video_urls: List[str]
    response_text: str

# Video Upscale AI Models (Video Upscaling)
class VideoUpscaleMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    video_urls: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class VideoUpscaleSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    messages: List[VideoUpscaleMessage] = []

class GenerateVideoUpscaleRequest(BaseModel):
    session_id: str
    video_input: str  # Data URL de la vidéo (obligatoire)
    target_resolution: str = "1080p"  # "720p", "1080p", "4k"
    target_fps: int = 30  # 25, 30, 40, 50, 60

class GenerateVideoUpscaleResponse(BaseModel):
    session_id: str
    message_id: str
    video_urls: List[str]
    response_text: str

# Google Veo 3.1 Models (Video Generation)
class GoogleVeoMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    video_urls: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class GoogleVeoSession(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    messages: List[GoogleVeoMessage] = []

class GenerateVideoRequest(BaseModel):
    session_id: str
    prompt: str
    aspect_ratio: Optional[str] = "16:9"  # 16:9, 9:16, etc.
    duration: Optional[int] = 8  # Duration in seconds
    resolution: Optional[str] = "1080p"  # 720p, 1080p
    generate_audio: Optional[bool] = True
    image: Optional[str] = None  # Input image URL
    reference_images: Optional[List[str]] = None  # Reference images for R2V

class GenerateVideoResponse(BaseModel):
    session_id: str
    message_id: str
    prompt: str
    video_urls: List[str]
    response_text: str


# SORA 2 Models (Video Generation)
class Sora2Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # "user" or "assistant"
    content: str
    video_urls: List[str] = []
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Sora2Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    messages: List[Sora2Message] = []

class GenerateVideoSora2Request(BaseModel):
    session_id: str
    prompt: str
    seconds: Optional[int] = 8  # Duration 4 or 8 seconds
    aspect_ratio: Optional[str] = "landscape"  # landscape or portrait
    input_reference: Optional[str] = None  # Reference image URL

class GenerateVideoSora2Response(BaseModel):
    session_id: str
    message_id: str
    prompt: str
    video_urls: List[str]
    response_text: str



class GenerateImageRequest(BaseModel):
    session_id: str
    prompt: str
    edit_image_url: Optional[str] = None  # URL de l'image à modifier
    edit_message_id: Optional[str] = None  # ID du message contenant l'image à modifier
    image_data: Optional[str] = None  # Data URL de l'image uploadée
    image_name: Optional[str] = None  # Nom du fichier image
    image_data: Optional[str] = None  # Data URL de l'image uploadée
    image_name: Optional[str] = None  # Nom du fichier image

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

        # Sauvegarder le message utilisateur avec l'image si présente
        user_image_urls = []
        if request.image_data and request.image_name:
            # Stocker l'image uploadée dans la base de données
            user_image_urls = [request.image_data]
        
        user_message = NanoBananaMessage(
            session_id=request.session_id,
            role="user",
            content=request.prompt,
            image_urls=user_image_urls
        )
        await db.nanobanana_messages.insert_one(user_message.dict())

        # Générer l'image avec Gemini
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

        # Utiliser l'API Replicate avec le modèle google/nano-banana
        replicate_token = os.environ.get('REPLICATE_API_TOKEN')
        if not replicate_token:
            raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN not configured")
        
        image_urls = []
        response_text = ""
        error_occurred = False
        
        try:
            # Préparer les inputs pour le modèle google/nano-banana
            inputs = {
                "prompt": request.prompt,
                "output_format": "jpg"
            }
            
            # Ajouter l'image uploadée si présente
            if request.image_data and request.image_name:
                # Le modèle nano-banana accepte des images en input
                inputs["image_input"] = [request.image_data]
            
            # Générer l'image avec Replicate
            logging.info(f"Génération d'image avec Replicate - modèle: google/nano-banana, prompt: {request.prompt}")
            
            output = replicate.run(
                "google/nano-banana",
                input=inputs
            )
            
            # Le output est une URL d'image
            image_url = str(output) if output else None
            
            if not image_url:
                raise Exception("Aucune image générée par Replicate")
            
            # Télécharger l'image depuis l'URL
            logging.info(f"Téléchargement de l'image depuis: {image_url}")
            response = requests.get(image_url, timeout=30)
            response.raise_for_status()
            
            # Convertir en base64
            image_base64 = base64.b64encode(response.content).decode('utf-8')
            image_data_url = f"data:image/jpeg;base64,{image_base64}"
            
            image_urls = [image_data_url]
            response_text = f"Image générée avec succès avec Google Nano Banana pour : {request.prompt}"
            
        except Exception as e:
            error_occurred = True
            error_message = str(e)
            logging.error(f"Erreur lors de la génération avec Replicate: {error_message}")
            
            # Analyser le type d'erreur pour donner un message plus précis
            if "402" in error_message or "Insufficient credit" in error_message:
                response_text = "❌ **Erreur de génération d'image**\n\nNous n'avons pas pu générer votre image car notre compte Replicate API n'a plus de crédit suffisant. Veuillez réessayer plus tard ou contactez l'administrateur pour recharger le compte."
            elif "NSFW" in error_message or "content policy" in error_message.lower() or "inappropriate" in error_message.lower() or "sensitive" in error_message.lower() or "safety" in error_message.lower():
                response_text = f"❌ **Contenu inapproprié détecté**\n\nVotre demande '{request.prompt}' a été refusée car elle pourrait contenir du contenu sensible ou inapproprié selon les politiques de Google Nano Banana. Veuillez reformuler votre prompt avec un contenu approprié."
            elif "timeout" in error_message.lower() or "timed out" in error_message.lower():
                response_text = "❌ **Délai d'attente dépassé**\n\nLa génération de votre image a pris trop de temps et a été interrompue. Veuillez réessayer avec un prompt plus simple."
            elif "rate limit" in error_message.lower():
                response_text = "❌ **Limite de requêtes atteinte**\n\nNous avons atteint la limite de requêtes autorisées par l'API. Veuillez attendre quelques instants avant de réessayer."
            else:
                response_text = f"❌ **Erreur de génération d'image**\n\nNous n'avons pas pu générer votre image pour la raison suivante :\n{error_message}\n\nVeuillez réessayer avec un prompt différent."

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


# Flux Kontext Pro endpoints

@api_router.post("/flux-kontext/session", response_model=FluxKontextSession)
async def create_flux_kontext_session():
    """Crée une nouvelle session Flux Kontext Pro"""
    try:
        session = FluxKontextSession()
        await db.flux_kontext_sessions.insert_one(session.dict())
        return session
    except Exception as e:
        logger.error(f"Erreur lors de la création de session Flux Kontext: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.post("/flux-kontext/generate", response_model=GenerateFluxKontextResponse)
async def generate_image_with_flux_kontext(request: GenerateFluxKontextRequest):
    """Génère ou édite une image avec Flux Kontext Pro"""
    try:
        # Créer ou récupérer la session
        session = await db.flux_kontext_sessions.find_one({"id": request.session_id})
        if not session:
            session_obj = FluxKontextSession(id=request.session_id)
            await db.flux_kontext_sessions.insert_one(session_obj.dict())
            session = session_obj.dict()

        # Sauvegarder le message utilisateur avec l'image de référence si présente
        user_content = request.prompt
        user_image_urls = []
        if request.input_image:
            user_image_urls = [request.input_image]
            user_content = f"Édition d'image: {request.prompt}"
        
        user_message = FluxKontextMessage(
            session_id=request.session_id,
            role="user",
            content=user_content,
            image_urls=user_image_urls
        )
        await db.flux_kontext_messages.insert_one(user_message.dict())

        # Vérifier le token Replicate
        replicate_token = os.environ.get('REPLICATE_API_TOKEN')
        if not replicate_token:
            raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN not configured")
        
        image_urls = []
        response_text = ""
        error_occurred = False
        
        try:
            # Préparer les inputs pour le modèle black-forest-labs/flux-kontext-pro
            inputs = {
                "prompt": request.prompt,
                "aspect_ratio": request.aspect_ratio,
                "prompt_upsampling": request.prompt_upsampling,
                "safety_tolerance": request.safety_tolerance,
                "output_format": "jpg"
            }
            
            # Ajouter l'image de référence si présente
            if request.input_image:
                # Convertir data URL en URL accessible si nécessaire
                inputs["input_image"] = request.input_image
            
            # Générer l'image avec Replicate
            logging.info(f"Génération d'image avec Replicate - modèle: black-forest-labs/flux-kontext-pro, prompt: {request.prompt}")
            
            output = replicate.run(
                "black-forest-labs/flux-kontext-pro",
                input=inputs
            )
            
            # Le output est une URL d'image
            image_url = str(output) if output else None
            
            if not image_url:
                raise Exception("Aucune image générée par Replicate")
            
            # Stocker directement l'URL Replicate (pas de téléchargement ni conversion base64)
            # Cela évite les problèmes de taille de document MongoDB (limite 16MB)
            logging.info(f"Image générée disponible à: {image_url}")
            
            image_urls = [image_url]
            if request.input_image:
                response_text = f"✅ Image éditée avec succès avec Flux Kontext Pro!"
            else:
                response_text = f"✅ Image générée avec succès avec Flux Kontext Pro!"
            
        except Exception as e:
            error_occurred = True
            error_message = str(e)
            logging.error(f"Erreur lors de la génération avec Replicate: {error_message}")
            
            # Analyser le type d'erreur pour donner un message plus précis
            if "402" in error_message or "Insufficient credit" in error_message:
                response_text = "❌ **Erreur de génération d'image**\n\nNous n'avons pas pu générer votre image car notre compte Replicate API n'a plus de crédit suffisant. Veuillez réessayer plus tard ou contactez l'administrateur pour recharger le compte."
            elif "NSFW" in error_message or "content policy" in error_message.lower() or "inappropriate" in error_message.lower() or "sensitive" in error_message.lower() or "safety" in error_message.lower():
                response_text = f"❌ **Contenu inapproprié détecté**\n\nVotre demande '{request.prompt}' a été refusée car elle pourrait contenir du contenu sensible ou inapproprié selon les politiques de Flux Kontext Pro. Veuillez reformuler votre prompt avec un contenu approprié."
            elif "timeout" in error_message.lower() or "timed out" in error_message.lower():
                response_text = "❌ **Délai d'attente dépassé**\n\nLa génération de votre image a pris trop de temps et a été interrompue. Veuillez réessayer avec un prompt plus simple."
            elif "rate limit" in error_message.lower():
                response_text = "❌ **Limite de requêtes atteinte**\n\nNous avons atteint la limite de requêtes autorisées par l'API. Veuillez attendre quelques instants avant de réessayer."
            elif "BSON document too large" in error_message:
                # Extraire la taille du document si disponible
                import re
                size_match = re.search(r'(\d+)\s*bytes', error_message)
                size_mb = ""
                if size_match:
                    size_bytes = int(size_match.group(1))
                    size_mb = f" ({size_bytes // (1024*1024)}MB > 16MB limite)"
                response_text = f"❌ **Image trop volumineuse**\n\nL'image générée est trop grande pour être stockée{size_mb}. Cette limitation technique de MongoDB empêche la sauvegarde. Veuillez réessayer avec un aspect ratio plus petit ou contactez l'administrateur."
            else:
                response_text = f"❌ **Erreur de génération d'image**\n\nNous n'avons pas pu générer votre image pour la raison suivante :\n{error_message}\n\nVeuillez réessayer avec un prompt différent."

        # Sauvegarder la réponse de l'assistant
        try:
            assistant_message = FluxKontextMessage(
                session_id=request.session_id,
                role="assistant",
                content=response_text,
                image_urls=image_urls
            )
            await db.flux_kontext_messages.insert_one(assistant_message.dict())
        except Exception as save_error:
            # Gérer les erreurs de sauvegarde MongoDB (notamment BSON document too large)
            save_error_message = str(save_error)
            logging.error(f"Erreur lors de la sauvegarde du message: {save_error_message}")
            
            if "BSON document too large" in save_error_message:
                # Extraire la taille du document
                import re
                size_match = re.search(r'(\d+)\s*bytes', save_error_message)
                size_mb = ""
                if size_match:
                    size_bytes = int(size_match.group(1))
                    size_mb = f" ({size_bytes // (1024*1024)}MB > 16MB limite)"
                
                # Créer un message d'erreur explicite
                error_assistant_message = FluxKontextMessage(
                    session_id=request.session_id,
                    role="assistant",
                    content=f"❌ **Image trop volumineuse**\n\nL'image générée est trop grande pour être stockée{size_mb}. Cette limitation technique de MongoDB empêche la sauvegarde. L'image a bien été générée par l'IA mais ne peut pas être affichée. Veuillez réessayer avec un aspect ratio plus petit.",
                    image_urls=[]  # Pas d'image car trop volumineuse
                )
                await db.flux_kontext_messages.insert_one(error_assistant_message.dict())
            else:
                # Autre erreur de sauvegarde
                raise save_error

        # Mettre à jour la session
        await db.flux_kontext_sessions.update_one(
            {"id": request.session_id},
            {"$set": {"last_updated": datetime.utcnow()}}
        )

        return GenerateFluxKontextResponse(
            session_id=request.session_id,
            message_id=assistant_message.id,
            image_urls=image_urls,
            response_text=response_text
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la génération: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")

@api_router.get("/flux-kontext/session/{session_id}", response_model=List[FluxKontextMessage])
async def get_flux_kontext_session(session_id: str):
    """Récupère l'historique d'une session Flux Kontext Pro"""
    try:
        messages = await db.flux_kontext_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).to_list(1000)
        
        return [FluxKontextMessage(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")



# Kling AI v2.1 endpoints (Image-to-Video Generation)

@api_router.post("/kling/session", response_model=KlingSession)
async def create_kling_session():
    """Crée une nouvelle session Kling AI"""
    try:
        session = KlingSession()
        await db.kling_sessions.insert_one(session.dict())
        return session
    except Exception as e:
        logger.error(f"Erreur lors de la création de session Kling: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.post("/kling/generate", response_model=GenerateKlingResponse)
async def generate_video_with_kling(request: GenerateKlingRequest):
    """Génère une vidéo avec Kling AI v2.1 (image-to-video)"""
    try:
        # Créer ou récupérer la session
        session = await db.kling_sessions.find_one({"id": request.session_id})
        if not session:
            session_obj = KlingSession(id=request.session_id)
            await db.kling_sessions.insert_one(session_obj.dict())
            session = session_obj.dict()

        # Sauvegarder le message utilisateur avec les images
        user_image_urls = [request.start_image]
        if request.end_image:
            user_image_urls.append(request.end_image)
        
        user_content = f"Vidéo avec image de départ{' et image de fin' if request.end_image else ''}: {request.prompt}"
        
        user_message = KlingMessage(
            session_id=request.session_id,
            role="user",
            content=user_content,
            image_urls=user_image_urls
        )
        await db.kling_messages.insert_one(user_message.dict())

        # Vérifier le token Replicate
        replicate_token = os.environ.get('REPLICATE_API_TOKEN')
        if not replicate_token:
            raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN not configured")
        
        video_urls = []
        response_text = ""
        error_occurred = False
        
        try:
            # Convert data URLs to public URLs for Replicate
            backend_url = os.environ.get('BACKEND_URL', 'http://localhost:8001')
            start_image_url = data_url_to_public_url(request.start_image, backend_url)
            logging.info(f"Start image converted to: {start_image_url}")
            
            # Préparer les inputs pour le modèle kwaivgi/kling-v2.1
            inputs = {
                "prompt": request.prompt,
                "start_image": start_image_url,
                "mode": request.mode,
                "duration": request.duration,
                "negative_prompt": request.negative_prompt or ""
            }
            
            # Ajouter l'image de fin si présente (nécessite mode pro)
            if request.end_image:
                if request.mode != "pro":
                    raise Exception("L'image de fin (end_image) nécessite le mode 'pro' (1080p)")
                end_image_url = data_url_to_public_url(request.end_image, backend_url)
                logging.info(f"End image converted to: {end_image_url}")
                inputs["end_image"] = end_image_url
            
            # Générer la vidéo avec Replicate en mode asynchrone (peut prendre 2-3 minutes)
            logging.info(f"Génération de vidéo avec Replicate - modèle: kwaivgi/kling-v2.1, prompt: {request.prompt}, durée: {request.duration}s, mode: {request.mode}")
            logging.info(f"⏳ La génération peut prendre 2-3 minutes, veuillez patienter...")
            
            # Créer une prediction asynchrone
            import replicate.prediction
            client = replicate.Client(api_token=os.environ.get('REPLICATE_API_TOKEN'))
            
            prediction = client.predictions.create(
                model="kwaivgi/kling-v2.1",
                input=inputs
            )
            
            logging.info(f"Prediction créée: {prediction.id}, status: {prediction.status}")
            
            # Attendre que la génération soit terminée (avec timeout de 5 minutes)
            max_wait_seconds = 300  # 5 minutes
            poll_interval = 3  # Vérifier toutes les 3 secondes
            elapsed = 0
            
            while prediction.status not in ["succeeded", "failed", "canceled"]:
                if elapsed >= max_wait_seconds:
                    raise Exception(f"Timeout: La génération a dépassé {max_wait_seconds//60} minutes")
                
                await asyncio.sleep(poll_interval)
                elapsed += poll_interval
                
                # Rafraîchir le statut
                prediction.reload()
                logging.info(f"Status après {elapsed}s: {prediction.status}")
            
            if prediction.status == "failed":
                error_msg = prediction.error or "Erreur inconnue"
                raise Exception(f"La génération a échoué: {error_msg}")
            
            if prediction.status == "canceled":
                raise Exception("La génération a été annulée")
            
            # Récupérer l'URL de la vidéo
            video_url = str(prediction.output) if prediction.output else None
            
            if not video_url:
                raise Exception("Aucune vidéo générée par Replicate")
            
            # Stocker directement l'URL Replicate (pas de téléchargement)
            logging.info(f"✅ Vidéo générée avec succès en {elapsed}s, disponible à: {video_url}")
            
            video_urls = [video_url]
            response_text = f"✅ Vidéo générée avec succès avec Kling AI v2.1!\n\n⏱️ Temps de génération: {elapsed}s\nDurée: {request.duration}s\nRésolution: {request.mode} ({'720p' if request.mode == 'standard' else '1080p'})\n{'Avec image de fin' if request.end_image else 'Avec image de départ uniquement'}"
            
        except Exception as e:
            error_occurred = True
            error_message = str(e)
            logging.error(f"Erreur lors de la génération avec Replicate: {error_message}")
            
            # Analyser le type d'erreur pour donner un message plus précis
            if "402" in error_message or "Insufficient credit" in error_message:
                response_text = "❌ **Erreur de génération de vidéo**\n\nNous n'avons pas pu générer votre vidéo car notre compte Replicate API n'a plus de crédit suffisant. Veuillez réessayer plus tard ou contactez l'administrateur pour recharger le compte."
            elif "NSFW" in error_message or "content policy" in error_message.lower() or "inappropriate" in error_message.lower() or "sensitive" in error_message.lower() or "safety" in error_message.lower():
                response_text = f"❌ **Contenu inapproprié détecté**\n\nVotre demande a été refusée car elle pourrait contenir du contenu sensible ou inapproprié selon les politiques de Kling AI. Veuillez reformuler votre prompt avec un contenu approprié."
            elif "timeout" in error_message.lower() or "timed out" in error_message.lower():
                response_text = "❌ **Délai d'attente dépassé**\n\nLa génération de votre vidéo a pris trop de temps et a été interrompue. Veuillez réessayer avec un prompt plus simple."
            elif "rate limit" in error_message.lower():
                response_text = "❌ **Limite de requêtes atteinte**\n\nNous avons atteint la limite de requêtes autorisées par l'API. Veuillez attendre quelques instants avant de réessayer."
            elif "end_image" in error_message.lower() and "pro" in error_message.lower():
                response_text = "❌ **Configuration invalide**\n\nL'utilisation d'une image de fin (end_image) nécessite le mode 'pro' (1080p). Veuillez activer le mode pro ou retirer l'image de fin."
            else:
                response_text = f"❌ **Erreur de génération de vidéo**\n\nNous n'avons pas pu générer votre vidéo pour la raison suivante :\n{error_message}\n\nVeuillez réessayer avec un prompt différent."

        # Sauvegarder la réponse de l'assistant
        try:
            assistant_message = KlingMessage(
                session_id=request.session_id,
                role="assistant",
                content=response_text,
                video_urls=video_urls
            )
            await db.kling_messages.insert_one(assistant_message.dict())
        except Exception as save_error:
            save_error_message = str(save_error)
            logging.error(f"Erreur lors de la sauvegarde du message: {save_error_message}")
            
            if "BSON document too large" in save_error_message:
                # Extraire la taille du document
                import re
                size_match = re.search(r'(\d+)\s*bytes', save_error_message)
                size_mb = ""
                if size_match:
                    size_bytes = int(size_match.group(1))
                    size_mb = f" ({size_bytes // (1024*1024)}MB > 16MB limite)"
                
                error_assistant_message = KlingMessage(
                    session_id=request.session_id,
                    role="assistant",
                    content=f"❌ **Vidéo trop volumineuse**\n\nLa vidéo générée est trop grande pour être stockée{size_mb}. Cette limitation technique de MongoDB empêche la sauvegarde. La vidéo a bien été générée par l'IA mais ne peut pas être affichée.",
                    video_urls=[]
                )
                await db.kling_messages.insert_one(error_assistant_message.dict())
            else:
                raise save_error

        # Mettre à jour la session
        await db.kling_sessions.update_one(
            {"id": request.session_id},
            {"$set": {"last_updated": datetime.utcnow()}}
        )

        return GenerateKlingResponse(
            session_id=request.session_id,
            message_id=assistant_message.id if not error_occurred else "error",
            video_urls=video_urls,
            response_text=response_text
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la génération: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération: {str(e)}")

@api_router.get("/kling/session/{session_id}", response_model=List[KlingMessage])
async def get_kling_session(session_id: str):
    """Récupère l'historique d'une session Kling AI"""
    try:
        messages = await db.kling_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).to_list(1000)
        
        return [KlingMessage(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

# Seedream 4 endpoints (Text-to-Image and Image-to-Image Generation)

@api_router.post("/seedream/session", response_model=SeedreamSession)
async def create_seedream_session():
    """Crée une nouvelle session Seedream 4"""
    try:
        session = SeedreamSession()
        await db.seedream_sessions.insert_one(session.dict())
        return session
    except Exception as e:
        logger.error(f"Erreur lors de la création de session Seedream: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.post("/seedream/generate", response_model=GenerateSeedreamResponse)
async def generate_image_with_seedream(request: GenerateSeedreamRequest):
    """Génère une image avec Seedream 4 (text-to-image ou image-to-image)"""
    try:
        # Créer ou récupérer la session
        session = await db.seedream_sessions.find_one({"id": request.session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session non trouvée")
        
        # Message utilisateur
        user_message_id = str(uuid.uuid4())
        user_images = []
        
        # Si une image input est fournie, la convertir en URL publique
        if request.image_input:
            backend_url = "https://ai-portal-splendid.preview.emergentagent.com"
            image_url = data_url_to_public_url(request.image_input, backend_url)
            logging.info(f"Input image converted to: {image_url}")
            user_images.append(image_url)
        
        user_content = f"Prompt: {request.prompt}\nSize: {request.size}\nAspect Ratio: {request.aspect_ratio}"
        if request.image_input:
            user_content += f"\nImage input fournie"
        
        user_message = SeedreamMessage(
            id=user_message_id,
            session_id=request.session_id,
            role="user",
            content=user_content,
            image_urls=user_images
        )
        await db.seedream_messages.insert_one(user_message.dict())
        
        # Générer l'image avec Replicate en mode asynchrone
        try:
            logging.info(f"Génération d'image avec Replicate - modèle: bytedance/seedream-4, prompt: {request.prompt}, size: {request.size}, aspect_ratio: {request.aspect_ratio}")
            
            # Préparer les inputs pour le modèle
            inputs = {
                "prompt": request.prompt,
                "size": request.size,
                "aspect_ratio": request.aspect_ratio,
                "sequential_image_generation": "disabled"
            }
            
            # Ajouter l'image input si présente
            if request.image_input:
                inputs["image_input"] = [image_url]
            
            # Créer une prediction asynchrone
            client = replicate.Client(api_token=os.environ.get('REPLICATE_API_TOKEN'))
            
            prediction = client.predictions.create(
                model="bytedance/seedream-4",
                input=inputs
            )
            
            logging.info(f"Prediction créée: {prediction.id}, status: {prediction.status}")
            
            # Attendre que la génération soit terminée (avec timeout de 3 minutes)
            max_wait_seconds = 180  # 3 minutes
            poll_interval = 3
            elapsed = 0
            
            while prediction.status not in ["succeeded", "failed", "canceled"]:
                if elapsed >= max_wait_seconds:
                    raise Exception(f"Timeout: La génération a dépassé {max_wait_seconds//60} minutes")
                
                await asyncio.sleep(poll_interval)
                elapsed += poll_interval
                
                prediction.reload()
                logging.info(f"Status après {elapsed}s: {prediction.status}")
            
            if prediction.status == "failed":
                error_msg = prediction.error or "Erreur inconnue"
                raise Exception(f"La génération a échoué: {error_msg}")
            
            if prediction.status == "canceled":
                raise Exception("La génération a été annulée")
            
            # Récupérer les URLs des images (output est un array)
            image_urls = prediction.output if prediction.output else []
            
            if not image_urls or len(image_urls) == 0:
                raise Exception("Aucune image générée par Replicate")
            
            logging.info(f"✅ {len(image_urls)} image(s) générée(s) en {elapsed}s")
            
            response_text = f"✅ Image générée avec succès avec Seedream 4!\n\n⏱️ Temps de génération: {elapsed}s\nRésolution: {request.size}\nRatio: {request.aspect_ratio}\n{len(image_urls)} image(s) générée(s)"
            
        except Exception as e:
            # Message d'erreur
            error_message_id = str(uuid.uuid4())
            error_assistant_message = SeedreamMessage(
                id=error_message_id,
                session_id=request.session_id,
                role="assistant",
                content=f"❌ **Erreur de génération d'image**\n\nNous n'avons pas pu générer votre image pour la raison suivante :\n{str(e)}\n\nVeuillez réessayer avec un prompt différent.",
                image_urls=[]
            )
            
            await db.seedream_sessions.update_one(
                {"id": request.session_id},
                {"$set": {"last_updated": datetime.utcnow()}}
            )
            
            await db.seedream_messages.insert_one(error_assistant_message.dict())
            
            return GenerateSeedreamResponse(
                session_id=request.session_id,
                message_id=error_message_id,
                image_urls=[],
                response_text=error_assistant_message.content
            )
        
        # Message assistant avec les images
        assistant_message_id = str(uuid.uuid4())
        assistant_message = SeedreamMessage(
            id=assistant_message_id,
            session_id=request.session_id,
            role="assistant",
            content=response_text,
            image_urls=image_urls
        )
        
        # Mettre à jour la session
        await db.seedream_sessions.update_one(
            {"id": request.session_id},
            {"$set": {"last_updated": datetime.utcnow()}}
        )
        
        # Insérer le message assistant
        await db.seedream_messages.insert_one(assistant_message.dict())
        
        return GenerateSeedreamResponse(
            session_id=request.session_id,
            message_id=assistant_message_id,
            image_urls=image_urls,
            response_text=response_text
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Erreur lors de la génération avec Seedream: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.get("/seedream/session/{session_id}", response_model=List[SeedreamMessage])
async def get_seedream_conversation(session_id: str):
    """Récupère l'historique de conversation d'une session Seedream"""
    try:
        messages = await db.seedream_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(None)
        return [SeedreamMessage(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'historique Seedream: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


# Grok endpoints (Text-to-Image Generation)

@api_router.post("/grok/session", response_model=GrokSession)
async def create_grok_session():
    """Crée une nouvelle session Grok"""
    try:
        session = GrokSession()
        await db.grok_sessions.insert_one(session.dict())
        return session
    except Exception as e:
        logger.error(f"Erreur lors de la création de session Grok: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.post("/grok/generate", response_model=GenerateGrokResponse)
async def generate_image_with_grok(request: GenerateGrokRequest):
    """Génère une image avec Grok (text-to-image)"""
    try:
        # Créer ou récupérer la session
        session = await db.grok_sessions.find_one({"id": request.session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session non trouvée")
        
        # Message utilisateur
        user_message_id = str(uuid.uuid4())
        user_content = f"Prompt: {request.prompt}"
        
        user_message = GrokMessage(
            id=user_message_id,
            session_id=request.session_id,
            role="user",
            content=user_content,
            image_urls=[]
        )
        await db.grok_messages.insert_one(user_message.dict())
        
        # Générer l'image avec Replicate en mode asynchrone
        try:
            logging.info(f"Génération d'image avec Replicate - modèle: xai/grok-2-image, prompt: {request.prompt}")
            
            # Préparer les inputs pour le modèle
            inputs = {
                "prompt": request.prompt
            }
            
            # Créer une prediction asynchrone
            client = replicate.Client(api_token=os.environ.get('REPLICATE_API_TOKEN'))
            
            prediction = client.predictions.create(
                model="xai/grok-2-image",
                input=inputs
            )
            
            logging.info(f"Prediction créée: {prediction.id}, status: {prediction.status}")
            
            # Attendre que la génération soit terminée (avec timeout de 3 minutes)
            max_wait_seconds = 180  # 3 minutes
            poll_interval = 3
            elapsed = 0
            
            while prediction.status not in ["succeeded", "failed", "canceled"]:
                if elapsed >= max_wait_seconds:
                    raise Exception(f"Timeout: La génération a dépassé {max_wait_seconds//60} minutes")
                
                await asyncio.sleep(poll_interval)
                elapsed += poll_interval
                
                prediction.reload()
                logging.info(f"Status après {elapsed}s: {prediction.status}")
            
            if prediction.status == "failed":
                error_msg = prediction.error or "Erreur inconnue"
                raise Exception(f"La génération a échoué: {error_msg}")
            
            if prediction.status == "canceled":
                raise Exception("La génération a été annulée")
            
            # Récupérer l'URL de l'image (output est une string)
            image_url = str(prediction.output) if prediction.output else None
            
            if not image_url:
                raise Exception("Aucune image générée par Replicate")
            
            logging.info(f"✅ Image générée en {elapsed}s: {image_url}")
            
            image_urls = [image_url]
            response_text = f"✅ Image générée avec succès avec Grok!\n\n⏱️ Temps de génération: {elapsed}s"
            
        except Exception as e:
            # Message d'erreur
            error_message_id = str(uuid.uuid4())
            error_assistant_message = GrokMessage(
                id=error_message_id,
                session_id=request.session_id,
                role="assistant",
                content=f"❌ **Erreur de génération d'image**\n\nNous n'avons pas pu générer votre image pour la raison suivante :\n{str(e)}\n\nVeuillez réessayer avec un prompt différent.",
                image_urls=[]
            )
            
            await db.grok_sessions.update_one(
                {"id": request.session_id},
                {"$set": {"last_updated": datetime.utcnow()}}
            )
            
            await db.grok_messages.insert_one(error_assistant_message.dict())
            
            return GenerateGrokResponse(
                session_id=request.session_id,
                message_id=error_message_id,
                image_urls=[],
                response_text=error_assistant_message.content
            )
        
        # Message assistant avec l'image
        assistant_message_id = str(uuid.uuid4())
        assistant_message = GrokMessage(
            id=assistant_message_id,
            session_id=request.session_id,
            role="assistant",
            content=response_text,
            image_urls=image_urls
        )
        
        # Mettre à jour la session
        await db.grok_sessions.update_one(
            {"id": request.session_id},
            {"$set": {"last_updated": datetime.utcnow()}}
        )
        
        # Insérer le message assistant
        await db.grok_messages.insert_one(assistant_message.dict())
        
        return GenerateGrokResponse(
            session_id=request.session_id,
            message_id=assistant_message_id,
            image_urls=image_urls,
            response_text=response_text
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Erreur lors de la génération avec Grok: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.get("/grok/session/{session_id}", response_model=List[GrokMessage])
async def get_grok_conversation(session_id: str):
    """Récupère l'historique de conversation d'une session Grok"""
    try:
        messages = await db.grok_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(None)
        return [GrokMessage(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'historique Grok: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


# Alibaba Wan 2.5 endpoints (Text-to-Video Generation)

@api_router.post("/alibaba-wan/session", response_model=AlibabaWanSession)
async def create_alibaba_wan_session():
    """Crée une nouvelle session Alibaba Wan 2.5"""
    try:
        session = AlibabaWanSession()
        await db.alibaba_wan_sessions.insert_one(session.dict())
        return session
    except Exception as e:
        logger.error(f"Erreur lors de la création de session Alibaba Wan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.post("/alibaba-wan/generate", response_model=GenerateAlibabaWanResponse)
async def generate_video_with_alibaba_wan(request: GenerateAlibabaWanRequest):
    """Génère une vidéo avec Alibaba Wan 2.5 (text-to-video)"""
    try:
        # Créer ou récupérer la session
        session = await db.alibaba_wan_sessions.find_one({"id": request.session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session non trouvée")
        
        # Message utilisateur
        user_message_id = str(uuid.uuid4())
        user_content = f"Prompt: {request.prompt}\nDurée: {request.duration}s\nRésolution: {request.size}"
        
        user_message = AlibabaWanMessage(
            id=user_message_id,
            session_id=request.session_id,
            role="user",
            content=user_content,
            video_urls=[]
        )
        await db.alibaba_wan_messages.insert_one(user_message.dict())
        
        # Générer la vidéo avec Replicate en mode asynchrone
        try:
            logging.info(f"Génération de vidéo avec Replicate - modèle: wan-video/wan-2.5-t2v, prompt: {request.prompt}, durée: {request.duration}s, size: {request.size}")
            logging.info(f"⏳ La génération peut prendre 2-3 minutes, veuillez patienter...")
            
            # Préparer les inputs pour le modèle
            inputs = {
                "prompt": request.prompt,
                "duration": request.duration,
                "size": request.size,
                "negative_prompt": "",
                "enable_prompt_expansion": True
            }
            
            # Créer une prediction asynchrone
            client = replicate.Client(api_token=os.environ.get('REPLICATE_API_TOKEN'))
            
            prediction = client.predictions.create(
                model="wan-video/wan-2.5-t2v",
                input=inputs
            )
            
            logging.info(f"Prediction créée: {prediction.id}, status: {prediction.status}")
            
            # Attendre que la génération soit terminée (avec timeout de 5 minutes)
            max_wait_seconds = 300  # 5 minutes
            poll_interval = 3
            elapsed = 0
            
            while prediction.status not in ["succeeded", "failed", "canceled"]:
                if elapsed >= max_wait_seconds:
                    raise Exception(f"Timeout: La génération a dépassé {max_wait_seconds//60} minutes")
                
                await asyncio.sleep(poll_interval)
                elapsed += poll_interval
                
                prediction.reload()
                logging.info(f"Status après {elapsed}s: {prediction.status}")
            
            if prediction.status == "failed":
                error_msg = prediction.error or "Erreur inconnue"
                raise Exception(f"La génération a échoué: {error_msg}")
            
            if prediction.status == "canceled":
                raise Exception("La génération a été annulée")
            
            # Récupérer l'URL de la vidéo (output est une string)
            video_url = str(prediction.output) if prediction.output else None
            
            if not video_url:
                raise Exception("Aucune vidéo générée par Replicate")
            
            logging.info(f"✅ Vidéo générée avec succès en {elapsed}s, disponible à: {video_url}")
            
            video_urls = [video_url]
            response_text = f"✅ Vidéo générée avec succès avec Alibaba Wan 2.5!\n\n⏱️ Temps de génération: {elapsed}s\nDurée: {request.duration}s\nRésolution: {request.size}"
            
        except Exception as e:
            # Message d'erreur
            error_message_id = str(uuid.uuid4())
            error_assistant_message = AlibabaWanMessage(
                id=error_message_id,
                session_id=request.session_id,
                role="assistant",
                content=f"❌ **Erreur de génération de vidéo**\n\nNous n'avons pas pu générer votre vidéo pour la raison suivante :\n{str(e)}\n\nVeuillez réessayer avec un prompt différent.",
                video_urls=[]
            )
            
            await db.alibaba_wan_sessions.update_one(
                {"id": request.session_id},
                {"$set": {"last_updated": datetime.utcnow()}}
            )
            
            await db.alibaba_wan_messages.insert_one(error_assistant_message.dict())
            
            return GenerateAlibabaWanResponse(
                session_id=request.session_id,
                message_id=error_message_id,
                video_urls=[],
                response_text=error_assistant_message.content
            )
        
        # Message assistant avec la vidéo
        assistant_message_id = str(uuid.uuid4())
        assistant_message = AlibabaWanMessage(
            id=assistant_message_id,
            session_id=request.session_id,
            role="assistant",
            content=response_text,
            video_urls=video_urls
        )
        
        # Mettre à jour la session
        await db.alibaba_wan_sessions.update_one(
            {"id": request.session_id},
            {"$set": {"last_updated": datetime.utcnow()}}
        )
        
        # Insérer le message assistant
        await db.alibaba_wan_messages.insert_one(assistant_message.dict())
        
        return GenerateAlibabaWanResponse(
            session_id=request.session_id,
            message_id=assistant_message_id,
            video_urls=video_urls,
            response_text=response_text
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Erreur lors de la génération avec Alibaba Wan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.get("/alibaba-wan/session/{session_id}", response_model=List[AlibabaWanMessage])
async def get_alibaba_wan_conversation(session_id: str):
    """Récupère l'historique de conversation d'une session Alibaba Wan"""
    try:
        messages = await db.alibaba_wan_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(None)
        return [AlibabaWanMessage(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'historique Alibaba Wan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


# Video Upscale AI endpoints (Video Upscaling)

@api_router.post("/video-upscale/session", response_model=VideoUpscaleSession)
async def create_video_upscale_session():
    """Crée une nouvelle session Video Upscale AI"""
    try:
        session = VideoUpscaleSession()
        await db.video_upscale_sessions.insert_one(session.dict())
        return session
    except Exception as e:
        logger.error(f"Erreur lors de la création de session Video Upscale: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.post("/video-upscale/generate", response_model=GenerateVideoUpscaleResponse)
async def upscale_video(request: GenerateVideoUpscaleRequest):
    """Upscale une vidéo avec Topaz Video Upscale AI"""
    try:
        # Créer ou récupérer la session
        session = await db.video_upscale_sessions.find_one({"id": request.session_id})
        if not session:
            raise HTTPException(status_code=404, detail="Session non trouvée")
        
        # Convertir la vidéo data URL en URL publique
        backend_url = "https://ai-portal-splendid.preview.emergentagent.com"
        
        # Pour une vidéo, on peut sauvegarder comme fichier temporaire avec extension .mp4
        try:
            # Extract base64 data
            if not request.video_input.startswith("data:"):
                raise Exception("Format de vidéo invalide, data URL requis")
            
            header, encoded = request.video_input.split(",", 1)
            video_data = base64.b64decode(encoded)
            
            # Generate unique filename
            filename = f"{uuid.uuid4()}.mp4"
            filepath = TEMP_IMAGES_DIR / filename
            
            # Save video
            with open(filepath, "wb") as f:
                f.write(video_data)
            
            # Return public URL
            video_input_url = f"{backend_url}/api/temp-images/{filename}"
            logging.info(f"Video input saved: {filepath} -> {video_input_url}")
        except Exception as e:
            logging.error(f"Error converting video data URL: {str(e)}")
            raise Exception(f"Erreur lors de la conversion de la vidéo: {str(e)}")
        
        # Message utilisateur
        user_message_id = str(uuid.uuid4())
        user_content = f"Upscale vidéo\nRésolution: {request.target_resolution}\nFPS: {request.target_fps}"
        
        user_message = VideoUpscaleMessage(
            id=user_message_id,
            session_id=request.session_id,
            role="user",
            content=user_content,
            video_urls=[video_input_url]
        )
        await db.video_upscale_messages.insert_one(user_message.dict())
        
        # Upscaler la vidéo avec Replicate en mode asynchrone
        try:
            logging.info(f"Upscaling vidéo avec Replicate - modèle: topazlabs/video-upscale, résolution: {request.target_resolution}, FPS: {request.target_fps}")
            logging.info(f"⏳ L'upscaling peut prendre 3-5 minutes ou plus selon la taille de la vidéo...")
            
            # Préparer les inputs pour le modèle
            inputs = {
                "video": video_input_url,
                "target_resolution": request.target_resolution,
                "target_fps": request.target_fps
            }
            
            # Créer une prediction asynchrone
            client = replicate.Client(api_token=os.environ.get('REPLICATE_API_TOKEN'))
            
            prediction = client.predictions.create(
                model="topazlabs/video-upscale",
                input=inputs
            )
            
            logging.info(f"Prediction créée: {prediction.id}, status: {prediction.status}")
            
            # Attendre que l'upscaling soit terminé (avec timeout de 10 minutes)
            max_wait_seconds = 600  # 10 minutes
            poll_interval = 5
            elapsed = 0
            
            while prediction.status not in ["succeeded", "failed", "canceled"]:
                if elapsed >= max_wait_seconds:
                    raise Exception(f"Timeout: L'upscaling a dépassé {max_wait_seconds//60} minutes")
                
                await asyncio.sleep(poll_interval)
                elapsed += poll_interval
                
                prediction.reload()
                logging.info(f"Status après {elapsed}s: {prediction.status}")
            
            if prediction.status == "failed":
                error_msg = prediction.error or "Erreur inconnue"
                raise Exception(f"L'upscaling a échoué: {error_msg}")
            
            if prediction.status == "canceled":
                raise Exception("L'upscaling a été annulé")
            
            # Récupérer l'URL de la vidéo upscalée (output est une string)
            video_url = str(prediction.output) if prediction.output else None
            
            if not video_url:
                raise Exception("Aucune vidéo upscalée générée par Replicate")
            
            logging.info(f"✅ Vidéo upscalée avec succès en {elapsed}s, disponible à: {video_url}")
            
            video_urls = [video_url]
            response_text = f"✅ Vidéo upscalée avec succès avec Topaz Video Upscale AI!\n\n⏱️ Temps de traitement: {elapsed}s\nRésolution: {request.target_resolution}\nFPS: {request.target_fps}"
            
        except Exception as e:
            # Message d'erreur
            error_message_id = str(uuid.uuid4())
            error_assistant_message = VideoUpscaleMessage(
                id=error_message_id,
                session_id=request.session_id,
                role="assistant",
                content=f"❌ **Erreur d'upscaling vidéo**\n\nNous n'avons pas pu upscaler votre vidéo pour la raison suivante :\n{str(e)}\n\nVeuillez réessayer avec une autre vidéo.",
                video_urls=[]
            )
            
            await db.video_upscale_sessions.update_one(
                {"id": request.session_id},
                {"$set": {"last_updated": datetime.utcnow()}}
            )
            
            await db.video_upscale_messages.insert_one(error_assistant_message.dict())
            
            return GenerateVideoUpscaleResponse(
                session_id=request.session_id,
                message_id=error_message_id,
                video_urls=[],
                response_text=error_assistant_message.content
            )
        
        # Message assistant avec la vidéo upscalée
        assistant_message_id = str(uuid.uuid4())
        assistant_message = VideoUpscaleMessage(
            id=assistant_message_id,
            session_id=request.session_id,
            role="assistant",
            content=response_text,
            video_urls=video_urls
        )
        
        # Mettre à jour la session
        await db.video_upscale_sessions.update_one(
            {"id": request.session_id},
            {"$set": {"last_updated": datetime.utcnow()}}
        )
        
        # Insérer le message assistant
        await db.video_upscale_messages.insert_one(assistant_message.dict())
        
        return GenerateVideoUpscaleResponse(
            session_id=request.session_id,
            message_id=assistant_message_id,
            video_urls=video_urls,
            response_text=response_text
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Erreur lors de l'upscaling vidéo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.get("/video-upscale/session/{session_id}", response_model=List[VideoUpscaleMessage])
async def get_video_upscale_conversation(session_id: str):
    """Récupère l'historique de conversation d'une session Video Upscale"""
    try:
        messages = await db.video_upscale_messages.find({"session_id": session_id}).sort("timestamp", 1).to_list(None)
        return [VideoUpscaleMessage(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'historique Video Upscale: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")


# Google Veo 3.1 endpoints (Video Generation)

@api_router.post("/google-veo/session", response_model=GoogleVeoSession)
async def create_google_veo_session():
    """Crée une nouvelle session Google Veo 3.1"""
    try:
        session = GoogleVeoSession()
        await db.google_veo_sessions.insert_one(session.dict())
        return session
    except Exception as e:
        logger.error(f"Erreur lors de la création de session Google Veo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.post("/google-veo/generate", response_model=GenerateVideoResponse)
async def generate_video_with_veo(request: GenerateVideoRequest):
    """Génère une vidéo avec Google Veo 3.1"""
    try:
        # Créer ou récupérer la session
        session = await db.google_veo_sessions.find_one({"id": request.session_id})
        if not session:
            session_obj = GoogleVeoSession(id=request.session_id)
            await db.google_veo_sessions.insert_one(session_obj.dict())
            session = session_obj.dict()

        # Sauvegarder le message utilisateur
        user_message = GoogleVeoMessage(
            session_id=request.session_id,
            role="user",
            content=request.prompt
        )
        await db.google_veo_messages.insert_one(user_message.dict())

        # Utiliser l'API Replicate avec le modèle google/veo-3.1
        replicate_token = os.environ.get('REPLICATE_API_TOKEN')
        if not replicate_token:
            raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN not configured")
        
        video_urls = []
        response_text = ""
        error_occurred = False
        
        try:
            # Préparer les inputs pour le modèle google/veo-3.1
            inputs = {
                "prompt": request.prompt,
                "aspect_ratio": request.aspect_ratio or "16:9",
                "duration": request.duration or 8,
                "resolution": request.resolution or "1080p",
                "generate_audio": request.generate_audio if request.generate_audio is not None else True
            }
            
            # Ajouter l'image si présente
            if request.image:
                inputs["image"] = request.image
            
            # Ajouter les reference images si présentes
            if request.reference_images and len(request.reference_images) > 0:
                inputs["reference_images"] = request.reference_images
            
            # Générer la vidéo avec Replicate
            logging.info(f"Génération de vidéo avec Replicate - modèle: google/veo-3.1, prompt: {request.prompt}")
            
            output = replicate.run(
                "google/veo-3.1",
                input=inputs
            )
            
            # Le output est une URL de vidéo
            video_url = str(output) if output else None
            
            if not video_url:
                raise Exception("Aucune vidéo générée par Replicate")
            
            # Ne pas télécharger la vidéo - utiliser directement l'URL Replicate
            # Ceci évite de dépasser la limite MongoDB de 16MB
            logging.info(f"Vidéo générée avec succès: {video_url}")
            
            video_urls = [video_url]  # Stocker l'URL directement
            response_text = f"Vidéo générée avec succès avec Google Veo 3.1 pour : {request.prompt}"
            
        except Exception as e:
            error_occurred = True
            error_message = str(e)
            logging.error(f"Erreur lors de la génération avec Replicate: {error_message}")
            
            # Analyser le type d'erreur pour donner un message plus précis
            if "402" in error_message or "Insufficient credit" in error_message:
                response_text = "❌ **Erreur de génération vidéo**\n\nNous n'avons pas pu générer votre vidéo car notre compte Replicate API n'a plus de crédit suffisant. Veuillez réessayer plus tard ou contactez l'administrateur pour recharger le compte."
            elif "NSFW" in error_message or "content policy" in error_message.lower() or "inappropriate" in error_message.lower() or "sensitive" in error_message.lower():
                response_text = f"❌ **Contenu inapproprié détecté**\n\nVotre demande '{request.prompt}' a été refusée car elle pourrait contenir du contenu sensible ou inapproprié selon les politiques de Google Veo 3.1. Veuillez reformuler votre prompt avec un contenu approprié."
            elif "timeout" in error_message.lower() or "timed out" in error_message.lower():
                response_text = "❌ **Délai d'attente dépassé**\n\nLa génération de votre vidéo a pris trop de temps et a été interrompue. Veuillez réessayer avec un prompt plus simple ou une durée plus courte."
            elif "rate limit" in error_message.lower():
                response_text = "❌ **Limite de requêtes atteinte**\n\nNous avons atteint la limite de requêtes autorisées par l'API. Veuillez attendre quelques instants avant de réessayer."
            else:
                response_text = f"❌ **Erreur de génération vidéo**\n\nNous n'avons pas pu générer votre vidéo pour la raison suivante :\n{error_message}\n\nVeuillez réessayer avec un prompt différent ou vérifier les paramètres de génération."

        # Sauvegarder la réponse de l'assistant
        assistant_message = GoogleVeoMessage(
            session_id=request.session_id,
            role="assistant",
            content=response_text or "Vidéo générée avec succès !",
            video_urls=video_urls
        )
        await db.google_veo_messages.insert_one(assistant_message.dict())

        # Mettre à jour la session
        await db.google_veo_sessions.update_one(
            {"id": request.session_id},
            {"$set": {"last_updated": datetime.utcnow()}}
        )

        return GenerateVideoResponse(
            session_id=request.session_id,
            message_id=assistant_message.id,
            prompt=request.prompt,
            video_urls=video_urls,
            response_text=response_text or "Vidéo générée avec succès !"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la génération de vidéo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.get("/google-veo/session/{session_id}", response_model=List[GoogleVeoMessage])
async def get_google_veo_session(session_id: str):
    """Récupère l'historique d'une session Google Veo 3.1"""
    try:
        messages = await db.google_veo_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).to_list(1000)
        
        return [GoogleVeoMessage(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'historique: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")



# SORA 2 endpoints (Video Generation)

@api_router.post("/sora2/session", response_model=Sora2Session)
async def create_sora2_session():
    """Crée une nouvelle session SORA 2"""
    try:
        session = Sora2Session()
        await db.sora2_sessions.insert_one(session.dict())
        return session
    except Exception as e:
        logger.error(f"Erreur lors de la création de session SORA 2: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.post("/sora2/generate", response_model=GenerateVideoSora2Response)
async def generate_video_with_sora2(request: GenerateVideoSora2Request):
    """Génère une vidéo avec SORA 2"""
    try:
        # Créer ou récupérer la session
        session = await db.sora2_sessions.find_one({"id": request.session_id})
        if not session:
            session_obj = Sora2Session(id=request.session_id)
            await db.sora2_sessions.insert_one(session_obj.dict())
            session = session_obj.dict()

        # Sauvegarder le message utilisateur
        user_message = Sora2Message(
            session_id=request.session_id,
            role="user",
            content=request.prompt
        )
        await db.sora2_messages.insert_one(user_message.dict())

        # Utiliser l'API Replicate avec le modèle openai/sora-2
        replicate_token = os.environ.get('REPLICATE_API_TOKEN')
        openai_key = os.environ.get('OPENAI_API_KEY')  # Utiliser OPENAI_API_KEY
        
        if not replicate_token:
            raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN not configured")
        if not openai_key:
            raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured for SORA 2")
        
        video_urls = []
        response_text = ""
        error_occurred = False
        
        try:
            # Préparer les inputs pour le modèle openai/sora-2
            inputs = {
                "prompt": request.prompt,
                "seconds": request.seconds or 8,
                "aspect_ratio": request.aspect_ratio or "landscape",
                "openai_api_key": openai_key
            }
            
            # Ajouter l'image de référence si présente
            if request.input_reference:
                inputs["input_reference"] = request.input_reference
            
            # Générer la vidéo avec Replicate
            logging.info(f"Génération de vidéo avec Replicate - modèle: openai/sora-2, prompt: {request.prompt}")
            
            output = replicate.run(
                "openai/sora-2",
                input=inputs
            )
            
            # Le output est une URL de vidéo
            video_url = str(output) if output else None
            
            if not video_url:
                raise Exception("Aucune vidéo générée par Replicate")
            
            # Stocker l'URL directement (pas de téléchargement)
            logging.info(f"Vidéo générée avec succès: {video_url}")
            
            video_urls = [video_url]
            response_text = f"Vidéo générée avec succès avec SORA 2 pour : {request.prompt}"
            
        except Exception as e:
            error_occurred = True
            error_message = str(e)
            logging.error(f"Erreur lors de la génération avec Replicate: {error_message}")
            
            # Analyser le type d'erreur pour donner un message plus précis
            if "402" in error_message or "Insufficient credit" in error_message:
                response_text = "❌ **Erreur de génération vidéo**\n\nNous n'avons pas pu générer votre vidéo car notre compte Replicate API n'a plus de crédit suffisant. Veuillez réessayer plus tard ou contactez l'administrateur pour recharger le compte."
            elif "NSFW" in error_message or "content policy" in error_message.lower() or "inappropriate" in error_message.lower() or "sensitive" in error_message.lower():
                response_text = f"❌ **Contenu inapproprié détecté**\n\nVotre demande '{request.prompt}' a été refusée car elle pourrait contenir du contenu sensible ou inapproprié selon les politiques de SORA 2. Veuillez reformuler votre prompt avec un contenu approprié."
            elif "timeout" in error_message.lower() or "timed out" in error_message.lower():
                response_text = "❌ **Délai d'attente dépassé**\n\nLa génération de votre vidéo a pris trop de temps et a été interrompue. Veuillez réessayer avec un prompt plus simple ou une durée plus courte."
            elif "rate limit" in error_message.lower():
                response_text = "❌ **Limite de requêtes atteinte**\n\nNous avons atteint la limite de requêtes autorisées par l'API. Veuillez attendre quelques instants avant de réessayer."
            elif "api key" in error_message.lower() or "authentication" in error_message.lower():
                response_text = "❌ **Erreur d'authentification**\n\nProblème avec la clé API OpenAI. Veuillez vérifier la configuration ou contactez l'administrateur."
            else:
                response_text = f"❌ **Erreur de génération vidéo**\n\nNous n'avons pas pu générer votre vidéo pour la raison suivante :\n{error_message}\n\nVeuillez réessayer avec un prompt différent ou vérifier les paramètres de génération."

        # Sauvegarder la réponse de l'assistant
        assistant_message = Sora2Message(
            session_id=request.session_id,
            role="assistant",
            content=response_text or "Vidéo générée avec succès !",
            video_urls=video_urls
        )
        await db.sora2_messages.insert_one(assistant_message.dict())

        # Mettre à jour la session
        await db.sora2_sessions.update_one(
            {"id": request.session_id},
            {"$set": {"last_updated": datetime.utcnow()}}
        )

        return GenerateVideoSora2Response(
            session_id=request.session_id,
            message_id=assistant_message.id,
            prompt=request.prompt,
            video_urls=video_urls,
            response_text=response_text or "Vidéo générée avec succès !"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de la génération de vidéo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.get("/sora2/session/{session_id}", response_model=List[Sora2Message])
async def get_sora2_session(session_id: str):
    """Récupère l'historique d'une session SORA 2"""
    try:
        messages = await db.sora2_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).to_list(1000)
        
        return [Sora2Message(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de l'historique: {str(e)}")
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

        # Sauvegarder le message utilisateur avec l'image si présente
        user_image_urls = []
        if request.image_data and request.image_name:
            # Stocker l'image dans la base de données
            user_image_urls = [request.image_data]
        
        user_message = ChatGPT5Message(
            session_id=request.session_id,
            role="user",
            content=request.prompt,
            image_urls=user_image_urls
        )
        await db.chatgpt5_messages.insert_one(user_message.dict())

        # Générer la réponse avec ChatGPT-5
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

        response_text = ""
        error_occurred = False
        
        try:
            # Créer une nouvelle instance pour chaque requête
            chat = LlmChat(
                api_key=api_key, 
                session_id=request.session_id,
                system_message="Tu es ChatGPT-5, un assistant conversationnel avancé d'OpenAI. Tu réponds de manière utile, claire et engageante aux questions des utilisateurs. Tu peux aussi analyser les images qui te sont envoyées avec précision. Tu maintiens le contexte de la conversation et te souviens des éléments précédents pour donner des réponses cohérentes."
            )
            
            chat = chat.with_model("openai", "gpt-4o")  # Utiliser gpt-4o pour l'analyse d'images
            
            # Récupérer TOUT l'historique de la conversation pour le contexte
            all_messages = await db.chatgpt5_messages.find(
                {"session_id": request.session_id}
            ).sort("timestamp", 1).to_list(1000)
            
            # Construire l'historique complet pour le contexte
            conversation_context = []
            for msg in all_messages:
                if msg['role'] == 'user':
                    conversation_context.append(f"Utilisateur: {msg['content']}")
                else:
                    conversation_context.append(f"Assistant: {msg['content']}")
            
            # Créer le message utilisateur avec ou sans image
            if request.image_data and request.image_name:
                # Mode avec analyse d'image
                import base64
                import re
                from emergentintegrations.llm.chat import ImageContent
                
                # Extraire les données base64 de la data URL
                image_data_match = re.match(r'data:image/[^;]+;base64,(.+)', request.image_data)
                if image_data_match:
                    image_base64 = image_data_match.group(1)
                    
                    # Créer le contenu image
                    image_content = ImageContent(image_base64=image_base64)
                    
                    # Inclure le contexte de la conversation dans le prompt
                    context_prompt = ""
                    if conversation_context:
                        context_prompt = f"Contexte de notre conversation:\n" + "\n".join(conversation_context[-10:]) + f"\n\nNouvelle demande avec image: {request.prompt}"
                    else:
                        context_prompt = f"Nouvelle demande avec image: {request.prompt}"
                    
                    # Créer le message avec image et texte contextuel
                    msg = UserMessage(
                        text=context_prompt,
                        file_contents=[image_content]
                    )
                    
                    # Générer la réponse avec analyse d'image
                    response_text = await chat.send_message(msg)
                else:
                    # Fallback si l'image n'est pas au bon format
                    context_prompt = f"Contexte: {' '.join(conversation_context[-5:])} | Nouvelle demande: {request.prompt}"
                    msg = UserMessage(text=context_prompt)
                    response_text = await chat.send_message(msg)
            else:
                # Mode texte seulement avec contexte
                if conversation_context:
                    context_prompt = f"Contexte de notre conversation:\n" + "\n".join(conversation_context[-10:]) + f"\n\nNouvelle demande: {request.prompt}"
                else:
                    context_prompt = request.prompt
                
                msg = UserMessage(text=context_prompt)
                response_text = await chat.send_message(msg)
        
        except Exception as e:
            error_occurred = True
            error_message = str(e)
            logging.error(f"Erreur lors de la génération avec ChatGPT-5: {error_message}")
            
            # Analyser le type d'erreur pour donner un message plus précis
            if "429" in error_message or "rate limit" in error_message.lower():
                response_text = "❌ **Limite de requêtes atteinte**\n\nNous avons atteint la limite de requêtes autorisées par l'API OpenAI. Veuillez attendre quelques instants avant de réessayer."
            elif "401" in error_message or "authentication" in error_message.lower() or "api key" in error_message.lower():
                response_text = "❌ **Erreur d'authentification**\n\nProblème avec la clé API OpenAI. Veuillez vérifier la configuration ou contactez l'administrateur."
            elif "content policy" in error_message.lower() or "inappropriate" in error_message.lower() or "sensitive" in error_message.lower():
                response_text = f"❌ **Contenu inapproprié détecté**\n\nVotre demande a été refusée car elle pourrait contenir du contenu sensible ou inapproprié selon les politiques d'OpenAI. Veuillez reformuler votre message avec un contenu approprié."
            elif "timeout" in error_message.lower() or "timed out" in error_message.lower():
                response_text = "❌ **Délai d'attente dépassé**\n\nLa génération de votre réponse a pris trop de temps et a été interrompue. Veuillez réessayer."
            else:
                response_text = f"❌ **Erreur de génération**\n\nNous n'avons pas pu générer une réponse pour la raison suivante :\n{error_message}\n\nVeuillez réessayer."
        
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


# AI Image Upscaler endpoints

@api_router.post("/image-upscaler/session", response_model=ImageUpscalerSession)
async def create_image_upscaler_session():
    """Crée une nouvelle session AI Image Upscaler"""
    try:
        session = ImageUpscalerSession()
        await db.image_upscaler_sessions.insert_one(session.dict())
        return session
    except Exception as e:
        logger.error(f"Erreur lors de la création de session Image Upscaler: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.post("/image-upscaler/upscale", response_model=UpscaleImageResponse)
async def upscale_image(request: UpscaleImageRequest):
    """Upscale une image avec AI Image Upscaler"""
    try:
        # Créer ou récupérer la session
        session = await db.image_upscaler_sessions.find_one({"id": request.session_id})
        if not session:
            session_obj = ImageUpscalerSession(id=request.session_id)
            await db.image_upscaler_sessions.insert_one(session_obj.dict())
            session = session_obj.dict()

        # Sauvegarder le message utilisateur avec l'image originale
        user_message = ImageUpscalerMessage(
            session_id=request.session_id,
            role="user",
            content=f"Upscale de l'image avec facteur X{request.scale_factor}",
            image_urls=[request.image_data]
        )
        await db.image_upscaler_messages.insert_one(user_message.dict())

        # Vérifier le token Replicate
        replicate_token = os.environ.get('REPLICATE_API_TOKEN')
        if not replicate_token:
            raise HTTPException(status_code=500, detail="REPLICATE_API_TOKEN not configured")
        
        image_urls = []
        response_text = ""
        error_occurred = False
        
        try:
            # Uploader l'image sur un service temporaire ou utiliser directement la data URL
            # Le modèle Replicate accepte des URLs, donc on doit convertir la data URL
            
            # Pour l'instant, on va uploader l'image temporairement sur Replicate
            # ou utiliser une autre méthode
            
            # Préparer les inputs pour le modèle philz1337x/crystal-upscaler
            inputs = {
                "image": request.image_data,
                "scale_factor": request.scale_factor
            }
            
            # Upscaler l'image avec Replicate
            logging.info(f"Upscaling d'image avec Replicate - modèle: philz1337x/crystal-upscaler, scale: X{request.scale_factor}")
            
            output = replicate.run(
                "philz1337x/crystal-upscaler",
                input=inputs
            )
            
            # Le output est une liste d'URLs d'images
            if isinstance(output, list) and len(output) > 0:
                upscaled_url = str(output[0])
                
                # Télécharger l'image upscalée et la convertir en base64
                logging.info(f"Téléchargement de l'image upscalée depuis: {upscaled_url}")
                response_img = requests.get(upscaled_url, timeout=60)
                response_img.raise_for_status()
                
                # Convertir en base64
                image_base64 = base64.b64encode(response_img.content).decode('utf-8')
                image_data_url = f"data:image/png;base64,{image_base64}"
                
                image_urls = [image_data_url]
                response_text = f"✅ Image upscalée avec succès! Facteur d'agrandissement: X{request.scale_factor}"
            else:
                raise Exception("Aucune image upscalée générée par Replicate")
            
        except Exception as e:
            error_occurred = True
            error_message = str(e)
            logging.error(f"Erreur lors de l'upscaling avec Replicate: {error_message}")
            
            # Analyser le type d'erreur pour donner un message plus précis
            if "402" in error_message or "Insufficient credit" in error_message:
                response_text = "❌ **Erreur d'upscaling**\n\nNous n'avons pas pu upscaler votre image car notre compte Replicate API n'a plus de crédit suffisant. Veuillez réessayer plus tard ou contactez l'administrateur pour recharger le compte."
            elif "timeout" in error_message.lower() or "timed out" in error_message.lower():
                response_text = "❌ **Délai d'attente dépassé**\n\nL'upscaling de votre image a pris trop de temps et a été interrompu. Veuillez réessayer avec une image plus petite."
            elif "rate limit" in error_message.lower():
                response_text = "❌ **Limite de requêtes atteinte**\n\nNous avons atteint la limite de requêtes autorisées par l'API. Veuillez attendre quelques instants avant de réessayer."
            elif "invalid image" in error_message.lower() or "image format" in error_message.lower():
                response_text = "❌ **Format d'image invalide**\n\nLe format de votre image n'est pas supporté. Veuillez utiliser une image au format JPG, PNG ou WebP."
            else:
                response_text = f"❌ **Erreur d'upscaling**\n\nNous n'avons pas pu upscaler votre image pour la raison suivante :\n{error_message}\n\nVeuillez réessayer avec une image différente."

        # Sauvegarder la réponse de l'assistant
        assistant_message = ImageUpscalerMessage(
            session_id=request.session_id,
            role="assistant",
            content=response_text,
            image_urls=image_urls
        )
        await db.image_upscaler_messages.insert_one(assistant_message.dict())

        # Mettre à jour la session
        await db.image_upscaler_sessions.update_one(
            {"id": request.session_id},
            {"$set": {"last_updated": datetime.utcnow()}}
        )

        return UpscaleImageResponse(
            session_id=request.session_id,
            message_id=assistant_message.id,
            image_urls=image_urls,
            response_text=response_text
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur lors de l'upscaling: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

@api_router.get("/image-upscaler/session/{session_id}", response_model=List[ImageUpscalerMessage])
async def get_image_upscaler_session(session_id: str):
    """Récupère l'historique d'une session AI Image Upscaler"""
    try:
        messages = await db.image_upscaler_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).to_list(1000)
        
        return [ImageUpscalerMessage(**msg) for msg in messages]
    except Exception as e:
        logger.error(f"Erreur lors de la récupération de session: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")

# Endpoint to serve temporary images (under /api prefix)
@api_router.get("/temp-images/{filename}")
async def serve_temp_image(filename: str):
    """Serve temporary images for Replicate API"""
    filepath = TEMP_IMAGES_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath)

# Import auth and history routers
from auth import auth_router
from history import history_router

# Include the routers in the main app
api_router.include_router(auth_router)
api_router.include_router(history_router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
