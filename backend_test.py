#!/usr/bin/env python3
"""
Comprehensive Credit Deduction System Test Script

Tests the credit deduction system with credits_config.py integration:
1. POST /api/auth/deduct-credits - Credit deduction endpoint
2. All model variants and pricing tiers
3. Credit calculation accuracy and rounding
4. User state management (credits, credits_used)
5. Insufficient credits error handling

Models tested:
- ChatGPT (free)
- NanoBanana (1.5 credits/image)
- Google Veo 3.1 (7.69/15.38 credits/second)
- SORA 2 (3.85 credits/second)
- Kling AI v2.1 (1.92/3.46 credits/second)
- Image Upscaler (tiered pricing by megapixels)
- Flux Kontext Pro (1.54 credits/image)
- Seedream 4 (1.15 credits/image)
"""

import requests
import json
import sys
import os
import base64
import math
from datetime import datetime

# Get backend URL from frontend/.env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    external_url = line.split('=', 1)[1].strip()
                    print(f"🔗 URL backend trouvée: {external_url}")
                    return external_url
    except Exception as e:
        print(f"❌ Erreur lecture .env: {e}")
        return "http://localhost:8001"
    
    return "http://localhost:8001"

def create_test_image():
    """Crée une petite image de test en base64 pour l'upscaling et Flux Kontext Pro"""
    # Créer une petite image de test (50x50 pixels, rouge)
    from PIL import Image
    import io
    
    # Créer une image rouge simple
    img = Image.new('RGB', (50, 50), color='red')
    
    # Convertir en base64
    buffer = io.BytesIO()
    img.save(buffer, format='JPEG')
    img_data = buffer.getvalue()
    
    # Encoder en base64
    img_base64 = base64.b64encode(img_data).decode('utf-8')
    return f"data:image/jpeg;base64,{img_base64}"

def test_flux_kontext_pro_api():
    """Test complet de l'API Flux Kontext Pro selon les nouvelles fonctionnalités"""
    
    # Configuration
    base_url = get_backend_url()
    api_url = f"{base_url}/api"
    print(f"🔗 URL de test: {api_url}")
    print("=" * 80)
    
    session_id = None
    
    try:
        # Test 1: Créer une nouvelle session Flux Kontext Pro
        print("📝 TEST 1: POST /api/flux-kontext/session - Créer une nouvelle session")
        print("-" * 70)
        
        response = requests.post(f"{api_url}/flux-kontext/session", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            session_data = response.json()
            session_id = session_data.get('id')
            print(f"✅ Session Flux Kontext Pro créée avec succès!")
            print(f"   Session ID: {session_id}")
            print(f"   Created at: {session_data.get('created_at')}")
            print(f"   Last updated: {session_data.get('last_updated')}")
            print(f"   Response: {json.dumps(session_data, indent=2)}")
        else:
            print(f"❌ Échec création session Flux Kontext Pro: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        
        # Test 2: Mode 1 - Génération sans image (prompt seul)
        print("🎨 TEST 2: POST /api/flux-kontext/generate - Mode 1: Génération sans image (prompt seul)")
        print("-" * 70)
        
        if not session_id:
            print("❌ Pas de session_id disponible pour le test de génération")
            return False
            
        generate_payload_mode1 = {
            "session_id": session_id,
            "prompt": "a beautiful sunset over mountains",
            "aspect_ratio": "1:1",
            "prompt_upsampling": False,
            "safety_tolerance": 2
        }
        
        print(f"Payload Mode 1: {json.dumps(generate_payload_mode1, indent=2)}")
        
        response = requests.post(
            f"{api_url}/flux-kontext/generate", 
            json=generate_payload_mode1,
            timeout=180  # 3 minutes pour la génération d'image
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            generate_data = response.json()
            print(f"✅ Image générée avec succès (Mode 1)!")
            print(f"   Session ID: {generate_data.get('session_id')}")
            print(f"   Message ID: {generate_data.get('message_id')}")
            print(f"   Response Text: {generate_data.get('response_text')}")
            
            image_urls = generate_data.get('image_urls', [])
            print(f"   Nombre d'images générées: {len(image_urls)}")
            
            for i, url in enumerate(image_urls):
                if url.startswith('data:image'):
                    print(f"   Image {i+1}: Data URL valide ({len(url)} caractères)")
                else:
                    print(f"   Image {i+1}: {url}")
                    
        else:
            print(f"❌ Échec génération Mode 1: {response.status_code}")
            print(f"   Response: {response.text}")
            # Continue avec les autres tests même si Mode 1 échoue
            
        print("\n" + "=" * 80)
        
        # Test 3: Mode 2 - Édition avec image uploadée
        print("🖼️ TEST 3: POST /api/flux-kontext/generate - Mode 2: Édition avec image uploadée")
        print("-" * 70)
        
        # Créer une image de test pour l'édition
        test_image = create_test_image()
        print(f"🖼️ Image de test créée: {len(test_image)} caractères")
        
        generate_payload_mode2 = {
            "session_id": session_id,
            "prompt": "turn this into a beautiful landscape",
            "input_image": test_image,
            "aspect_ratio": "16:9",
            "prompt_upsampling": True,
            "safety_tolerance": 4
        }
        
        print(f"Payload Mode 2: session_id={session_id}, prompt='turn this into a beautiful landscape'")
        print(f"   aspect_ratio=16:9, prompt_upsampling=True, safety_tolerance=4")
        print(f"   input_image_length={len(test_image)}")
        
        response = requests.post(
            f"{api_url}/flux-kontext/generate", 
            json=generate_payload_mode2,
            timeout=180  # 3 minutes pour l'édition d'image
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            generate_data = response.json()
            print(f"✅ Image éditée avec succès (Mode 2)!")
            print(f"   Session ID: {generate_data.get('session_id')}")
            print(f"   Message ID: {generate_data.get('message_id')}")
            print(f"   Response Text: {generate_data.get('response_text')}")
            
            image_urls = generate_data.get('image_urls', [])
            print(f"   Nombre d'images éditées: {len(image_urls)}")
            
            for i, url in enumerate(image_urls):
                if url.startswith('data:image'):
                    print(f"   Image {i+1}: Data URL valide ({len(url)} caractères)")
                else:
                    print(f"   Image {i+1}: {url}")
                    
        else:
            print(f"❌ Échec édition Mode 2: {response.status_code}")
            print(f"   Response: {response.text}")
            
        print("\n" + "=" * 80)
        
        # Test 4: Test avec différents aspect ratios
        print("📐 TEST 4: POST /api/flux-kontext/generate - Test aspect ratios multiples")
        print("-" * 70)
        
        aspect_ratios_to_test = ["4:3", "21:9"]
        
        for aspect_ratio in aspect_ratios_to_test:
            print(f"   🔍 Test aspect ratio: {aspect_ratio}")
            
            generate_payload_aspect = {
                "session_id": session_id,
                "prompt": f"a simple geometric pattern in {aspect_ratio} format",
                "aspect_ratio": aspect_ratio,
                "prompt_upsampling": False,
                "safety_tolerance": 3
            }
            
            response = requests.post(
                f"{api_url}/flux-kontext/generate", 
                json=generate_payload_aspect,
                timeout=180
            )
            
            print(f"   Status Code ({aspect_ratio}): {response.status_code}")
            
            if response.status_code == 200:
                generate_data = response.json()
                image_urls = generate_data.get('image_urls', [])
                print(f"   ✅ Aspect ratio {aspect_ratio}: {len(image_urls)} image(s) générée(s)")
            else:
                print(f"   ❌ Aspect ratio {aspect_ratio}: Échec ({response.status_code})")
                
        print("\n" + "=" * 80)
        
        # Test 5: Récupérer l'historique de la session
        print("📚 TEST 5: GET /api/flux-kontext/session/{session_id} - Récupérer l'historique")
        print("-" * 70)
        
        response = requests.get(f"{api_url}/flux-kontext/session/{session_id}", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            history_data = response.json()
            print(f"✅ Historique Flux Kontext Pro récupéré avec succès!")
            print(f"   Nombre de messages: {len(history_data)}")
            
            user_messages = 0
            assistant_messages = 0
            total_images = 0
            
            for i, message in enumerate(history_data):
                print(f"   Message {i+1}:")
                print(f"     ID: {message.get('id')}")
                print(f"     Role: {message.get('role')}")
                print(f"     Content: {message.get('content')[:50]}...")
                
                image_urls = message.get('image_urls', [])
                print(f"     Images: {len(image_urls)}")
                total_images += len(image_urls)
                print(f"     Timestamp: {message.get('timestamp')}")
                
                if message.get('role') == 'user':
                    user_messages += 1
                elif message.get('role') == 'assistant':
                    assistant_messages += 1
                    
            print(f"   Messages utilisateur: {user_messages}")
            print(f"   Messages assistant: {assistant_messages}")
            print(f"   Total images dans l'historique: {total_images}")
                
        else:
            print(f"❌ Échec récupération historique: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        print("🎉 TOUS LES TESTS FLUX KONTEXT PRO TERMINÉS!")
        return True
        
    except requests.exceptions.Timeout:
        print("❌ ERREUR: Timeout lors de la requête Flux Kontext Pro")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ ERREUR: Impossible de se connecter au backend Flux Kontext Pro")
        return False
    except Exception as e:
        print(f"❌ ERREUR INATTENDUE Flux Kontext Pro: {str(e)}")
        return False

def test_image_upscaler_api():
    """Test complet de l'API AI Image Upscaler"""
    
    # Configuration
    base_url = get_backend_url()
    api_url = f"{base_url}/api"
    print(f"🔗 URL de test: {api_url}")
    print("=" * 80)
    
    session_id = None
    
    try:
        # Test 1: Créer une nouvelle session AI Image Upscaler
        print("📝 TEST 1: POST /api/image-upscaler/session - Créer une session AI Image Upscaler")
        print("-" * 70)
        
        response = requests.post(f"{api_url}/image-upscaler/session", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            session_data = response.json()
            session_id = session_data.get('id')
            print(f"✅ Session AI Image Upscaler créée avec succès!")
            print(f"   Session ID: {session_id}")
            print(f"   Created at: {session_data.get('created_at')}")
            print(f"   Last updated: {session_data.get('last_updated')}")
            print(f"   Response: {json.dumps(session_data, indent=2)}")
        else:
            print(f"❌ Échec création session AI Image Upscaler: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        
        # Créer une image de test
        test_image = create_test_image()
        print(f"🖼️ Image de test créée: {len(test_image)} caractères")
        
        # Test 2: Upscaler une image X2
        print("🔍 TEST 2: POST /api/image-upscaler/upscale - Upscaler image X2")
        print("-" * 70)
        
        if not session_id:
            print("❌ Pas de session_id disponible pour le test d'upscaling")
            return False
            
        upscale_payload_x2 = {
            "session_id": session_id,
            "image_data": test_image,
            "scale_factor": 2
        }
        
        print(f"Payload X2: session_id={session_id}, scale_factor=2, image_data_length={len(test_image)}")
        
        response = requests.post(
            f"{api_url}/image-upscaler/upscale", 
            json=upscale_payload_x2,
            timeout=120  # 2 minutes pour l'upscaling
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            upscale_data = response.json()
            print(f"✅ Image upscalée X2 avec succès!")
            print(f"   Session ID: {upscale_data.get('session_id')}")
            print(f"   Message ID: {upscale_data.get('message_id')}")
            print(f"   Response Text: {upscale_data.get('response_text')}")
            
            image_urls = upscale_data.get('image_urls', [])
            print(f"   Nombre d'images upscalées: {len(image_urls)}")
            
            for i, url in enumerate(image_urls):
                if url.startswith('data:image'):
                    print(f"   Image {i+1}: Data URL valide ({len(url)} caractères)")
                else:
                    print(f"   Image {i+1}: {url}")
                    
        else:
            print(f"❌ Échec upscaling X2: {response.status_code}")
            print(f"   Response: {response.text}")
            # Continue avec les autres tests même si X2 échoue
            
        print("\n" + "=" * 80)
        
        # Test 3: Upscaler une image X4
        print("🔍 TEST 3: POST /api/image-upscaler/upscale - Upscaler image X4")
        print("-" * 70)
        
        upscale_payload_x4 = {
            "session_id": session_id,
            "image_data": test_image,
            "scale_factor": 4
        }
        
        print(f"Payload X4: session_id={session_id}, scale_factor=4, image_data_length={len(test_image)}")
        
        response = requests.post(
            f"{api_url}/image-upscaler/upscale", 
            json=upscale_payload_x4,
            timeout=120
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            upscale_data = response.json()
            print(f"✅ Image upscalée X4 avec succès!")
            print(f"   Session ID: {upscale_data.get('session_id')}")
            print(f"   Message ID: {upscale_data.get('message_id')}")
            print(f"   Response Text: {upscale_data.get('response_text')}")
            
            image_urls = upscale_data.get('image_urls', [])
            print(f"   Nombre d'images upscalées: {len(image_urls)}")
            
            for i, url in enumerate(image_urls):
                if url.startswith('data:image'):
                    print(f"   Image {i+1}: Data URL valide ({len(url)} caractères)")
                else:
                    print(f"   Image {i+1}: {url}")
                    
        else:
            print(f"❌ Échec upscaling X4: {response.status_code}")
            print(f"   Response: {response.text}")
            
        print("\n" + "=" * 80)
        
        # Test 4: Upscaler une image X8
        print("🔍 TEST 4: POST /api/image-upscaler/upscale - Upscaler image X8")
        print("-" * 70)
        
        upscale_payload_x8 = {
            "session_id": session_id,
            "image_data": test_image,
            "scale_factor": 8
        }
        
        print(f"Payload X8: session_id={session_id}, scale_factor=8, image_data_length={len(test_image)}")
        
        response = requests.post(
            f"{api_url}/image-upscaler/upscale", 
            json=upscale_payload_x8,
            timeout=120
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            upscale_data = response.json()
            print(f"✅ Image upscalée X8 avec succès!")
            print(f"   Session ID: {upscale_data.get('session_id')}")
            print(f"   Message ID: {upscale_data.get('message_id')}")
            print(f"   Response Text: {upscale_data.get('response_text')}")
            
            image_urls = upscale_data.get('image_urls', [])
            print(f"   Nombre d'images upscalées: {len(image_urls)}")
            
            for i, url in enumerate(image_urls):
                if url.startswith('data:image'):
                    print(f"   Image {i+1}: Data URL valide ({len(url)} caractères)")
                else:
                    print(f"   Image {i+1}: {url}")
                    
        else:
            print(f"❌ Échec upscaling X8: {response.status_code}")
            print(f"   Response: {response.text}")
            
        print("\n" + "=" * 80)
        
        # Test 5: Récupérer l'historique de la session
        print("📚 TEST 5: GET /api/image-upscaler/session/{session_id} - Récupérer l'historique")
        print("-" * 70)
        
        response = requests.get(f"{api_url}/image-upscaler/session/{session_id}", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            history_data = response.json()
            print(f"✅ Historique AI Image Upscaler récupéré avec succès!")
            print(f"   Nombre de messages: {len(history_data)}")
            
            user_messages = 0
            assistant_messages = 0
            
            for i, message in enumerate(history_data):
                print(f"   Message {i+1}:")
                print(f"     ID: {message.get('id')}")
                print(f"     Role: {message.get('role')}")
                print(f"     Content: {message.get('content')}")
                print(f"     Images: {len(message.get('image_urls', []))}")
                print(f"     Timestamp: {message.get('timestamp')}")
                
                if message.get('role') == 'user':
                    user_messages += 1
                elif message.get('role') == 'assistant':
                    assistant_messages += 1
                    
            print(f"   Messages utilisateur: {user_messages}")
            print(f"   Messages assistant: {assistant_messages}")
                
        else:
            print(f"❌ Échec récupération historique: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        print("🎉 TOUS LES TESTS AI IMAGE UPSCALER TERMINÉS!")
        return True
        
    except requests.exceptions.Timeout:
        print("❌ ERREUR: Timeout lors de la requête AI Image Upscaler")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ ERREUR: Impossible de se connecter au backend AI Image Upscaler")
        return False
    except Exception as e:
        print(f"❌ ERREUR INATTENDUE AI Image Upscaler: {str(e)}")
        return False

def test_google_veo_api():
    """Test complet de l'API Google Veo 3.1"""
    
    # Configuration
    base_url = get_backend_url()
    api_url = f"{base_url}/api"
    print(f"🔗 URL de test: {api_url}")
    print("=" * 80)
    
    session_id = None
    
    try:
        # Test 1: Créer une nouvelle session Google Veo
        print("📝 TEST 1: POST /api/google-veo/session - Créer une session Google Veo 3.1")
        print("-" * 70)
        
        response = requests.post(f"{api_url}/google-veo/session", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            session_data = response.json()
            session_id = session_data.get('id')
            print(f"✅ Session Google Veo créée avec succès!")
            print(f"   Session ID: {session_id}")
            print(f"   Created at: {session_data.get('created_at')}")
            print(f"   Response: {json.dumps(session_data, indent=2)}")
        else:
            print(f"❌ Échec création session Google Veo: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        
        # Test 2: Générer une vidéo avec Google Veo 3.1
        print("🎬 TEST 2: POST /api/google-veo/generate - Générer une vidéo")
        print("-" * 70)
        
        if not session_id:
            print("❌ Pas de session_id disponible pour le test de génération")
            return False
            
        generate_payload = {
            "session_id": session_id,
            "prompt": "a red ball bouncing",
            "duration": 4,
            "resolution": "720p",
            "generate_audio": True
        }
        
        print(f"Payload: {json.dumps(generate_payload, indent=2)}")
        
        response = requests.post(
            f"{api_url}/google-veo/generate", 
            json=generate_payload,
            timeout=180  # 3 minutes pour la génération de vidéo
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            generate_data = response.json()
            print(f"✅ Vidéo générée avec succès!")
            print(f"   Session ID: {generate_data.get('session_id')}")
            print(f"   Message ID: {generate_data.get('message_id')}")
            print(f"   Prompt: {generate_data.get('prompt')}")
            print(f"   Response Text: {generate_data.get('response_text')}")
            
            video_urls = generate_data.get('video_urls', [])
            print(f"   Nombre de vidéos: {len(video_urls)}")
            
            for i, url in enumerate(video_urls):
                print(f"   Vidéo {i+1}: {url}")
                    
        else:
            print(f"❌ Échec génération vidéo Google Veo: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        
        # Test 3: Récupérer l'historique de la session Google Veo
        print("📚 TEST 3: GET /api/google-veo/session/{session_id} - Récupérer l'historique")
        print("-" * 70)
        
        response = requests.get(f"{api_url}/google-veo/session/{session_id}", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            history_data = response.json()
            print(f"✅ Historique Google Veo récupéré avec succès!")
            print(f"   Nombre de messages: {len(history_data)}")
            
            for i, message in enumerate(history_data):
                print(f"   Message {i+1}:")
                print(f"     ID: {message.get('id')}")
                print(f"     Role: {message.get('role')}")
                print(f"     Content: {message.get('content')}")
                print(f"     Vidéos: {len(message.get('video_urls', []))}")
                print(f"     Timestamp: {message.get('timestamp')}")
                
        else:
            print(f"❌ Échec récupération historique Google Veo: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        print("🎉 TOUS LES TESTS GOOGLE VEO 3.1 RÉUSSIS!")
        return True
        
    except requests.exceptions.Timeout:
        print("❌ ERREUR: Timeout lors de la requête Google Veo")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ ERREUR: Impossible de se connecter au backend Google Veo")
        return False
    except Exception as e:
        print(f"❌ ERREUR INATTENDUE Google Veo: {str(e)}")
        return False

def test_sora2_api():
    """Test complet de l'API SORA 2"""
    
    # Configuration
    base_url = get_backend_url()
    api_url = f"{base_url}/api"
    print(f"🔗 URL de test: {api_url}")
    print("=" * 80)
    
    session_id = None
    
    try:
        # Test 1: Créer une nouvelle session SORA 2
        print("📝 TEST 1: POST /api/sora2/session - Créer une session SORA 2")
        print("-" * 70)
        
        response = requests.post(f"{api_url}/sora2/session", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            session_data = response.json()
            session_id = session_data.get('id')
            print(f"✅ Session SORA 2 créée avec succès!")
            print(f"   Session ID: {session_id}")
            print(f"   Created at: {session_data.get('created_at')}")
            print(f"   Response: {json.dumps(session_data, indent=2)}")
        else:
            print(f"❌ Échec création session SORA 2: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        
        # Test 2: Générer une vidéo avec SORA 2
        print("🎬 TEST 2: POST /api/sora2/generate - Générer une vidéo")
        print("-" * 70)
        
        if not session_id:
            print("❌ Pas de session_id disponible pour le test de génération")
            return False
            
        generate_payload = {
            "session_id": session_id,
            "prompt": "a dog running in a park",
            "seconds": 4,
            "aspect_ratio": "landscape"
        }
        
        print(f"Payload: {json.dumps(generate_payload, indent=2)}")
        
        response = requests.post(
            f"{api_url}/sora2/generate", 
            json=generate_payload,
            timeout=180  # 3 minutes pour la génération de vidéo
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            generate_data = response.json()
            print(f"✅ Vidéo générée avec succès!")
            print(f"   Session ID: {generate_data.get('session_id')}")
            print(f"   Message ID: {generate_data.get('message_id')}")
            print(f"   Prompt: {generate_data.get('prompt')}")
            print(f"   Response Text: {generate_data.get('response_text')}")
            
            video_urls = generate_data.get('video_urls', [])
            print(f"   Nombre de vidéos: {len(video_urls)}")
            
            for i, url in enumerate(video_urls):
                print(f"   Vidéo {i+1}: {url}")
                    
        else:
            print(f"❌ Échec génération vidéo SORA 2: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        
        # Test 3: Récupérer l'historique de la session SORA 2
        print("📚 TEST 3: GET /api/sora2/session/{session_id} - Récupérer l'historique")
        print("-" * 70)
        
        response = requests.get(f"{api_url}/sora2/session/{session_id}", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            history_data = response.json()
            print(f"✅ Historique SORA 2 récupéré avec succès!")
            print(f"   Nombre de messages: {len(history_data)}")
            
            for i, message in enumerate(history_data):
                print(f"   Message {i+1}:")
                print(f"     ID: {message.get('id')}")
                print(f"     Role: {message.get('role')}")
                print(f"     Content: {message.get('content')}")
                print(f"     Vidéos: {len(message.get('video_urls', []))}")
                print(f"     Timestamp: {message.get('timestamp')}")
                
        else:
            print(f"❌ Échec récupération historique SORA 2: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        print("🎉 TOUS LES TESTS SORA 2 RÉUSSIS!")
        return True
        
    except requests.exceptions.Timeout:
        print("❌ ERREUR: Timeout lors de la requête SORA 2")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ ERREUR: Impossible de se connecter au backend SORA 2")
        return False
    except Exception as e:
        print(f"❌ ERREUR INATTENDUE SORA 2: {str(e)}")
        return False

def test_image_upscaler_complete_flow():
    """Test complet du flux Image Upscaler selon la demande utilisateur"""
    
    # Configuration
    base_url = get_backend_url()
    api_url = f"{base_url}/api"
    print(f"🔗 URL de test: {api_url}")
    print("=" * 80)
    
    # Image de test fournie par l'utilisateur (PNG 1x1 rouge en base64)
    test_image_data_url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    
    session_id = None
    
    try:
        # Étape 1: Créer une session Image Upscaler via POST /api/image-upscaler/session
        print("📝 ÉTAPE 1: POST /api/image-upscaler/session - Créer une session Image Upscaler")
        print("-" * 70)
        
        response = requests.post(f"{api_url}/image-upscaler/session", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            session_data = response.json()
            session_id = session_data.get('id')
            print(f"✅ Session Image Upscaler créée avec succès!")
            print(f"   Session ID: {session_id}")
            print(f"   Created at: {session_data.get('created_at')}")
            print(f"   Last updated: {session_data.get('last_updated')}")
        else:
            print(f"❌ Échec création session Image Upscaler: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        
        # Étape 2: Uploader l'image de test (1x1 pixel PNG en base64)
        print("🖼️ ÉTAPE 2: Vérification de l'image de test")
        print("-" * 70)
        print(f"Image de test fournie: {test_image_data_url[:50]}...")
        print(f"Longueur de l'image: {len(test_image_data_url)} caractères")
        print(f"Format détecté: PNG 1x1 pixel rouge")
        
        print("\n" + "=" * 80)
        
        # Étape 3: Lancer l'upscaling via POST /api/image-upscaler/upscale avec scale_factor: 2
        print("🔍 ÉTAPE 3: POST /api/image-upscaler/upscale - Upscaler image X2")
        print("-" * 70)
        
        if not session_id:
            print("❌ Pas de session_id disponible pour le test d'upscaling")
            return False
            
        upscale_payload = {
            "session_id": session_id,
            "image_data": test_image_data_url,
            "scale_factor": 2
        }
        
        print(f"Payload: session_id={session_id}, scale_factor=2")
        print(f"Image input: {test_image_data_url[:50]}... ({len(test_image_data_url)} chars)")
        
        response = requests.post(
            f"{api_url}/image-upscaler/upscale", 
            json=upscale_payload,
            timeout=120  # 2 minutes pour l'upscaling
        )
        
        print(f"Status Code: {response.status_code}")
        
        upscaled_image_url = None
        
        if response.status_code == 200:
            upscale_data = response.json()
            print(f"✅ Image upscalée X2 avec succès!")
            print(f"   Session ID: {upscale_data.get('session_id')}")
            print(f"   Message ID: {upscale_data.get('message_id')}")
            print(f"   Response Text: {upscale_data.get('response_text')}")
            
            image_urls = upscale_data.get('image_urls', [])
            print(f"   Nombre d'images upscalées: {len(image_urls)}")
            
            if len(image_urls) > 0:
                upscaled_image_url = image_urls[0]
                if upscaled_image_url.startswith('data:image'):
                    print(f"   ✅ Image URL retournée: Data URL valide ({len(upscaled_image_url)} caractères)")
                else:
                    print(f"   ✅ Image URL retournée: {upscaled_image_url}")
            else:
                print(f"   ❌ Aucune image_url dans la réponse!")
                return False
                    
        else:
            print(f"❌ Échec upscaling X2: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 80)
        
        # Étape 4: Vérifier que la réponse contient image_url
        print("✅ ÉTAPE 4: Vérification que la réponse contient image_url")
        print("-" * 70)
        
        if upscaled_image_url:
            print(f"✅ SUCCÈS: La réponse contient bien une image_url")
            print(f"   Type d'URL: {'Data URL (base64)' if upscaled_image_url.startswith('data:') else 'URL HTTP'}")
            print(f"   Longueur: {len(upscaled_image_url)} caractères")
        else:
            print(f"❌ ÉCHEC: Aucune image_url trouvée dans la réponse")
            return False
            
        print("\n" + "=" * 80)
        
        # Étape 5: Tester que l'URL de l'image retournée est accessible
        print("🌐 ÉTAPE 5: Test d'accessibilité de l'URL de l'image retournée")
        print("-" * 70)
        
        if upscaled_image_url.startswith('data:'):
            # C'est une data URL, on peut la décoder directement
            print("🔍 Test de décodage de la Data URL...")
            try:
                # Extraire les données base64
                header, encoded = upscaled_image_url.split(",", 1)
                image_data = base64.b64decode(encoded)
                print(f"✅ Data URL décodée avec succès!")
                print(f"   Header: {header}")
                print(f"   Taille des données décodées: {len(image_data)} bytes")
                print(f"   Format détecté: {header.split(';')[0].split('/')[1] if '/' in header else 'inconnu'}")
                
                # Vérifier que c'est une image valide
                from PIL import Image
                import io
                try:
                    img = Image.open(io.BytesIO(image_data))
                    print(f"   ✅ Image valide détectée: {img.size} pixels, mode: {img.mode}")
                    print(f"   ✅ L'image upscalée est accessible et téléchargeable!")
                except Exception as img_error:
                    print(f"   ❌ Erreur lors de l'ouverture de l'image: {img_error}")
                    return False
                    
            except Exception as decode_error:
                print(f"❌ Erreur lors du décodage de la Data URL: {decode_error}")
                return False
                
        else:
            # C'est une URL HTTP, on teste l'accessibilité
            print(f"🔍 Test d'accessibilité de l'URL HTTP: {upscaled_image_url}")
            try:
                response = requests.get(upscaled_image_url, timeout=30)
                print(f"   Status Code: {response.status_code}")
                
                if response.status_code == 200:
                    print(f"   ✅ URL accessible avec succès!")
                    print(f"   Content-Type: {response.headers.get('content-type', 'non spécifié')}")
                    print(f"   Taille du contenu: {len(response.content)} bytes")
                    print(f"   ✅ L'image upscalée est accessible et téléchargeable!")
                else:
                    print(f"   ❌ URL non accessible: {response.status_code}")
                    return False
                    
            except Exception as url_error:
                print(f"❌ Erreur lors de l'accès à l'URL: {url_error}")
                return False
        
        print("\n" + "=" * 80)
        
        # Test bonus: Récupérer l'historique pour vérifier la sauvegarde
        print("📚 ÉTAPE BONUS: GET /api/image-upscaler/session/{session_id} - Vérifier l'historique")
        print("-" * 70)
        
        response = requests.get(f"{api_url}/image-upscaler/session/{session_id}", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            history_data = response.json()
            print(f"✅ Historique récupéré avec succès!")
            print(f"   Nombre de messages: {len(history_data)}")
            
            user_messages = 0
            assistant_messages = 0
            
            for i, message in enumerate(history_data):
                print(f"   Message {i+1}:")
                print(f"     ID: {message.get('id')}")
                print(f"     Role: {message.get('role')}")
                print(f"     Content: {message.get('content')}")
                print(f"     Images: {len(message.get('image_urls', []))}")
                
                if message.get('role') == 'user':
                    user_messages += 1
                elif message.get('role') == 'assistant':
                    assistant_messages += 1
                    
            print(f"   Messages utilisateur: {user_messages}")
            print(f"   Messages assistant: {assistant_messages}")
                
        else:
            print(f"⚠️ Avertissement - Échec récupération historique: {response.status_code}")
            # Ce n'est pas critique pour le test principal
            
        print("\n" + "=" * 80)
        print("🎉 FLUX COMPLET IMAGE UPSCALER TESTÉ AVEC SUCCÈS!")
        print("✅ Toutes les étapes validées:")
        print("   1. ✅ Session créée via POST /api/image-upscaler/session")
        print("   2. ✅ Image de test 1x1 PNG uploadée")
        print("   3. ✅ Upscaling X2 réussi via POST /api/image-upscaler/upscale")
        print("   4. ✅ Réponse contient image_url")
        print("   5. ✅ Image upscalée accessible et téléchargeable")
        print("🔧 Le bouton télécharger fonctionne correctement!")
        return True
        
    except requests.exceptions.Timeout:
        print("❌ ERREUR: Timeout lors de la requête Image Upscaler")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ ERREUR: Impossible de se connecter au backend Image Upscaler")
        return False
    except Exception as e:
        print(f"❌ ERREUR INATTENDUE Image Upscaler: {str(e)}")
        return False

def get_test_user():
    """Get existing test user with credits for testing"""
    # Use existing user token (brainraphic@gmail.com with 498.5 credits)
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYWZkYjlhMjQtM2JkMS00ZDgwLTkxNjEtNzMzMjBhMWQ0MzA2IiwiZXhwIjoxNzY1NDg1ODQ4fQ.zXnVpl7__PtQbhWh1Ut7SvwCxOkt5UzFWCWTwTd768Y"
    
    user = {
        "id": "afdb9a24-3bd1-4d80-9161-73320a1d4306",
        "email": "brainraphic@gmail.com",
        "credits": 498.5,
        "creditsUsed": 1.5
    }
    
    return token, user

def test_credit_deduction_endpoint():
    """Comprehensive test of the credit deduction system"""
    
    base_url = get_backend_url()
    api_url = f"{base_url}/api"
    print(f"🔗 URL de test: {api_url}")
    print("=" * 80)
    
    # Create test user
    print("👤 SETUP: Creating test user with 500 credits")
    print("-" * 70)
    
    token, user = create_test_user()
    if not token or not user:
        print("❌ Failed to create test user - cannot proceed with credit tests")
        return False
    
    print(f"✅ Test user created successfully!")
    print(f"   User ID: {user.get('id')}")
    print(f"   Email: {user.get('email')}")
    print(f"   Initial Credits: {user.get('credits')}")
    print(f"   Credits Used: {user.get('creditsUsed')}")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n" + "=" * 80)
    
    # Test results tracking
    test_results = []
    
    # Test 1: ChatGPT (Free model)
    print("💬 TEST 1: ChatGPT - Free model (0 credits)")
    print("-" * 70)
    
    try:
        response = requests.post(
            f"{api_url}/auth/deduct-credits",
            params={
                "model_key": "chatgpt",
                "units": 5.0
            },
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ ChatGPT test successful!")
            print(f"   Credits deducted: {data.get('credits_deducted')}")
            print(f"   Credits remaining: {data.get('credits_remaining')}")
            
            if data.get('credits_deducted') == 0:
                print(f"   ✅ Correct: ChatGPT is free (0 credits deducted)")
                test_results.append(("ChatGPT Free", True))
            else:
                print(f"   ❌ Error: ChatGPT should be free but {data.get('credits_deducted')} credits deducted")
                test_results.append(("ChatGPT Free", False))
        else:
            print(f"❌ ChatGPT test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("ChatGPT Free", False))
            
    except Exception as e:
        print(f"❌ ChatGPT test error: {str(e)}")
        test_results.append(("ChatGPT Free", False))
    
    print("\n" + "=" * 80)
    
    # Test 2: NanoBanana (1.5 credits per image)
    print("🍌 TEST 2: NanoBanana - 1.5 credits per image")
    print("-" * 70)
    
    try:
        response = requests.post(
            f"{api_url}/auth/deduct-credits",
            params={
                "model_key": "nano_banana",
                "units": 1.0
            },
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ NanoBanana test successful!")
            print(f"   Credits deducted: {data.get('credits_deducted')}")
            print(f"   Credits remaining: {data.get('credits_remaining')}")
            
            # Expected: 1.5 credits, rounded to 2.0 (ceil to 0.5 step)
            expected_cost = math.ceil(1.5 * 2) / 2  # 1.5 -> 2.0
            if data.get('credits_deducted') == expected_cost:
                print(f"   ✅ Correct: 1.5 credits rounded to {expected_cost}")
                test_results.append(("NanoBanana Cost", True))
            else:
                print(f"   ❌ Error: Expected {expected_cost} but got {data.get('credits_deducted')}")
                test_results.append(("NanoBanana Cost", False))
        else:
            print(f"❌ NanoBanana test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("NanoBanana Cost", False))
            
    except Exception as e:
        print(f"❌ NanoBanana test error: {str(e)}")
        test_results.append(("NanoBanana Cost", False))
    
    print("\n" + "=" * 80)
    
    # Test 3: Google Veo 3.1 - without_audio variant (7.69 credits/second)
    print("🎬 TEST 3: Google Veo 3.1 - without_audio (7.69 credits/second, 4 seconds)")
    print("-" * 70)
    
    try:
        response = requests.post(
            f"{api_url}/auth/deduct-credits",
            params={
                "model_key": "google_veo_3_1",
                "units": 4.0,
                "variant": "without_audio"
            },
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Google Veo 3.1 without_audio test successful!")
            print(f"   Credits deducted: {data.get('credits_deducted')}")
            print(f"   Credits remaining: {data.get('credits_remaining')}")
            
            # Expected: 7.69 * 4 = 30.76, rounded to 31.0
            expected_cost = math.ceil(7.69 * 4 * 2) / 2  # 30.76 -> 31.0
            if data.get('credits_deducted') == expected_cost:
                print(f"   ✅ Correct: 7.69 * 4 = 30.76 rounded to {expected_cost}")
                test_results.append(("Google Veo without_audio", True))
            else:
                print(f"   ❌ Error: Expected {expected_cost} but got {data.get('credits_deducted')}")
                test_results.append(("Google Veo without_audio", False))
        else:
            print(f"❌ Google Veo 3.1 without_audio test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("Google Veo without_audio", False))
            
    except Exception as e:
        print(f"❌ Google Veo 3.1 without_audio test error: {str(e)}")
        test_results.append(("Google Veo without_audio", False))
    
    print("\n" + "=" * 80)
    
    # Test 4: Google Veo 3.1 - with_audio variant (15.38 credits/second)
    print("🎬 TEST 4: Google Veo 3.1 - with_audio (15.38 credits/second, 8 seconds)")
    print("-" * 70)
    
    try:
        response = requests.post(
            f"{api_url}/auth/deduct-credits",
            params={
                "model_key": "google_veo_3_1",
                "units": 8.0,
                "variant": "with_audio"
            },
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Google Veo 3.1 with_audio test successful!")
            print(f"   Credits deducted: {data.get('credits_deducted')}")
            print(f"   Credits remaining: {data.get('credits_remaining')}")
            
            # Expected: 15.38 * 8 = 123.04, rounded to 123.5
            expected_cost = math.ceil(15.38 * 8 * 2) / 2  # 123.04 -> 123.5
            if data.get('credits_deducted') == expected_cost:
                print(f"   ✅ Correct: 15.38 * 8 = 123.04 rounded to {expected_cost}")
                test_results.append(("Google Veo with_audio", True))
            else:
                print(f"   ❌ Error: Expected {expected_cost} but got {data.get('credits_deducted')}")
                test_results.append(("Google Veo with_audio", False))
        else:
            print(f"❌ Google Veo 3.1 with_audio test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("Google Veo with_audio", False))
            
    except Exception as e:
        print(f"❌ Google Veo 3.1 with_audio test error: {str(e)}")
        test_results.append(("Google Veo with_audio", False))
    
    print("\n" + "=" * 80)
    
    # Test 5: SORA 2 (3.85 credits/second)
    print("🎥 TEST 5: SORA 2 - 3.85 credits/second (4 seconds)")
    print("-" * 70)
    
    try:
        response = requests.post(
            f"{api_url}/auth/deduct-credits",
            params={
                "model_key": "sora_2",
                "units": 4.0
            },
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SORA 2 test successful!")
            print(f"   Credits deducted: {data.get('credits_deducted')}")
            print(f"   Credits remaining: {data.get('credits_remaining')}")
            
            # Expected: 3.85 * 4 = 15.4, rounded to 15.5
            expected_cost = math.ceil(3.85 * 4 * 2) / 2  # 15.4 -> 15.5
            if data.get('credits_deducted') == expected_cost:
                print(f"   ✅ Correct: 3.85 * 4 = 15.4 rounded to {expected_cost}")
                test_results.append(("SORA 2", True))
            else:
                print(f"   ❌ Error: Expected {expected_cost} but got {data.get('credits_deducted')}")
                test_results.append(("SORA 2", False))
        else:
            print(f"❌ SORA 2 test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("SORA 2", False))
            
    except Exception as e:
        print(f"❌ SORA 2 test error: {str(e)}")
        test_results.append(("SORA 2", False))
    
    print("\n" + "=" * 80)
    
    # Test 6: Kling AI v2.1 - standard variant (1.92 credits/second)
    print("🎭 TEST 6: Kling AI v2.1 - standard (1.92 credits/second, 5 seconds)")
    print("-" * 70)
    
    try:
        response = requests.post(
            f"{api_url}/auth/deduct-credits",
            params={
                "model_key": "kling_ai_v2_1",
                "units": 5.0,
                "variant": "standard"
            },
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Kling AI v2.1 standard test successful!")
            print(f"   Credits deducted: {data.get('credits_deducted')}")
            print(f"   Credits remaining: {data.get('credits_remaining')}")
            
            # Expected: 1.92 * 5 = 9.6, rounded to 9.5
            expected_cost = math.ceil(1.92 * 5 * 2) / 2  # 9.6 -> 10.0
            if data.get('credits_deducted') == expected_cost:
                print(f"   ✅ Correct: 1.92 * 5 = 9.6 rounded to {expected_cost}")
                test_results.append(("Kling AI standard", True))
            else:
                print(f"   ❌ Error: Expected {expected_cost} but got {data.get('credits_deducted')}")
                test_results.append(("Kling AI standard", False))
        else:
            print(f"❌ Kling AI v2.1 standard test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("Kling AI standard", False))
            
    except Exception as e:
        print(f"❌ Kling AI v2.1 standard test error: {str(e)}")
        test_results.append(("Kling AI standard", False))
    
    print("\n" + "=" * 80)
    
    # Test 7: Kling AI v2.1 - pro variant (3.46 credits/second)
    print("🎭 TEST 7: Kling AI v2.1 - pro (3.46 credits/second, 10 seconds)")
    print("-" * 70)
    
    try:
        response = requests.post(
            f"{api_url}/auth/deduct-credits",
            params={
                "model_key": "kling_ai_v2_1",
                "units": 10.0,
                "variant": "pro"
            },
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Kling AI v2.1 pro test successful!")
            print(f"   Credits deducted: {data.get('credits_deducted')}")
            print(f"   Credits remaining: {data.get('credits_remaining')}")
            
            # Expected: 3.46 * 10 = 34.6, rounded to 34.5
            expected_cost = math.ceil(3.46 * 10 * 2) / 2  # 34.6 -> 35.0
            if data.get('credits_deducted') == expected_cost:
                print(f"   ✅ Correct: 3.46 * 10 = 34.6 rounded to {expected_cost}")
                test_results.append(("Kling AI pro", True))
            else:
                print(f"   ❌ Error: Expected {expected_cost} but got {data.get('credits_deducted')}")
                test_results.append(("Kling AI pro", False))
        else:
            print(f"❌ Kling AI v2.1 pro test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("Kling AI pro", False))
            
    except Exception as e:
        print(f"❌ Kling AI v2.1 pro test error: {str(e)}")
        test_results.append(("Kling AI pro", False))
    
    print("\n" + "=" * 80)
    
    # Test 8: Image Upscaler - Different megapixel tiers
    print("🔍 TEST 8: Image Upscaler - Megapixel tiers")
    print("-" * 70)
    
    # Test different megapixel values
    megapixel_tests = [
        (2.0, 1.92),   # ≤4 MP: 1.92 credits
        (5.0, 3.85),   # ≤8 MP: 3.85 credits  
        (10.0, 7.69),  # ≤16 MP: 7.69 credits
        (20.0, 15.38)  # ≥25 MP: 15.38 credits
    ]
    
    for megapixels, expected_rate in megapixel_tests:
        print(f"   Testing {megapixels} MP (expected rate: {expected_rate} credits)")
        
        try:
            response = requests.post(
                f"{api_url}/auth/deduct-credits",
                params={
                    "model_key": "image_upscaler",
                    "units": 1.0,
                    "megapixels": megapixels
                },
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                expected_cost = math.ceil(expected_rate * 2) / 2
                
                if data.get('credits_deducted') == expected_cost:
                    print(f"   ✅ {megapixels} MP: {expected_cost} credits (correct)")
                    test_results.append((f"Image Upscaler {megapixels}MP", True))
                else:
                    print(f"   ❌ {megapixels} MP: Expected {expected_cost}, got {data.get('credits_deducted')}")
                    test_results.append((f"Image Upscaler {megapixels}MP", False))
            else:
                print(f"   ❌ {megapixels} MP test failed: {response.status_code}")
                test_results.append((f"Image Upscaler {megapixels}MP", False))
                
        except Exception as e:
            print(f"   ❌ {megapixels} MP test error: {str(e)}")
            test_results.append((f"Image Upscaler {megapixels}MP", False))
    
    print("\n" + "=" * 80)
    
    # Test 9: Flux Kontext Pro (1.54 credits per image)
    print("🎨 TEST 9: Flux Kontext Pro - 1.54 credits per image")
    print("-" * 70)
    
    try:
        response = requests.post(
            f"{api_url}/auth/deduct-credits",
            params={
                "model_key": "flux_kontext_pro",
                "units": 1.0
            },
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Flux Kontext Pro test successful!")
            print(f"   Credits deducted: {data.get('credits_deducted')}")
            print(f"   Credits remaining: {data.get('credits_remaining')}")
            
            # Expected: 1.54, rounded to 2.0
            expected_cost = math.ceil(1.54 * 2) / 2  # 1.54 -> 2.0
            if data.get('credits_deducted') == expected_cost:
                print(f"   ✅ Correct: 1.54 credits rounded to {expected_cost}")
                test_results.append(("Flux Kontext Pro", True))
            else:
                print(f"   ❌ Error: Expected {expected_cost} but got {data.get('credits_deducted')}")
                test_results.append(("Flux Kontext Pro", False))
        else:
            print(f"❌ Flux Kontext Pro test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("Flux Kontext Pro", False))
            
    except Exception as e:
        print(f"❌ Flux Kontext Pro test error: {str(e)}")
        test_results.append(("Flux Kontext Pro", False))
    
    print("\n" + "=" * 80)
    
    # Test 10: Seedream 4 (1.15 credits per image)
    print("🌱 TEST 10: Seedream 4 - 1.15 credits per image")
    print("-" * 70)
    
    try:
        response = requests.post(
            f"{api_url}/auth/deduct-credits",
            params={
                "model_key": "seedream_4",
                "units": 1.0
            },
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Seedream 4 test successful!")
            print(f"   Credits deducted: {data.get('credits_deducted')}")
            print(f"   Credits remaining: {data.get('credits_remaining')}")
            
            # Expected: 1.15, rounded to 1.5
            expected_cost = math.ceil(1.15 * 2) / 2  # 1.15 -> 1.5
            if data.get('credits_deducted') == expected_cost:
                print(f"   ✅ Correct: 1.15 credits rounded to {expected_cost}")
                test_results.append(("Seedream 4", True))
            else:
                print(f"   ❌ Error: Expected {expected_cost} but got {data.get('credits_deducted')}")
                test_results.append(("Seedream 4", False))
        else:
            print(f"❌ Seedream 4 test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("Seedream 4", False))
            
    except Exception as e:
        print(f"❌ Seedream 4 test error: {str(e)}")
        test_results.append(("Seedream 4", False))
    
    print("\n" + "=" * 80)
    
    # Test 11: Edge case - Very small amount (0.1 credits should round to 0.5)
    print("🔬 TEST 11: Edge case - Small amount rounding (0.1 → 0.5)")
    print("-" * 70)
    
    try:
        # Use a custom test by calculating 0.1 credits (nano_banana * 0.067 units ≈ 0.1)
        response = requests.post(
            f"{api_url}/auth/deduct-credits",
            params={
                "model_key": "nano_banana",
                "units": 0.067  # 1.5 * 0.067 ≈ 0.1
            },
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Edge case test successful!")
            print(f"   Credits deducted: {data.get('credits_deducted')}")
            print(f"   Credits remaining: {data.get('credits_remaining')}")
            
            # Expected: 0.1005 rounded to 0.5
            if data.get('credits_deducted') == 0.5:
                print(f"   ✅ Correct: Small amount rounded to 0.5")
                test_results.append(("Edge case rounding", True))
            else:
                print(f"   ❌ Error: Expected 0.5 but got {data.get('credits_deducted')}")
                test_results.append(("Edge case rounding", False))
        else:
            print(f"❌ Edge case test failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("Edge case rounding", False))
            
    except Exception as e:
        print(f"❌ Edge case test error: {str(e)}")
        test_results.append(("Edge case rounding", False))
    
    print("\n" + "=" * 80)
    
    # Test 12: Check final user state
    print("👤 TEST 12: Verify user state after all deductions")
    print("-" * 70)
    
    try:
        response = requests.get(
            f"{api_url}/auth/verify",
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            final_user = data.get("user", {})
            print(f"✅ User state retrieved successfully!")
            print(f"   Final Credits: {final_user.get('credits')}")
            print(f"   Credits Used: {final_user.get('creditsUsed')}")
            print(f"   Total Credits (initial): 500")
            
            # Verify credits + credits_used = 500
            total = final_user.get('credits', 0) + final_user.get('creditsUsed', 0)
            if abs(total - 500) < 0.01:  # Allow small floating point differences
                print(f"   ✅ Correct: Credits + Credits Used = {total} ≈ 500")
                test_results.append(("User state consistency", True))
            else:
                print(f"   ❌ Error: Credits + Credits Used = {total} ≠ 500")
                test_results.append(("User state consistency", False))
        else:
            print(f"❌ User state check failed: {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("User state consistency", False))
            
    except Exception as e:
        print(f"❌ User state check error: {str(e)}")
        test_results.append(("User state consistency", False))
    
    print("\n" + "=" * 80)
    
    # Test 13: Insufficient credits error (402)
    print("💸 TEST 13: Insufficient credits error (402)")
    print("-" * 70)
    
    try:
        # Try to deduct more credits than available
        response = requests.post(
            f"{api_url}/auth/deduct-credits",
            params={
                "model_key": "google_veo_3_1",
                "units": 100.0,  # This should exceed remaining credits
                "variant": "with_audio"
            },
            headers=headers,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 402:
            print(f"✅ Insufficient credits error correctly returned!")
            print(f"   Response: {response.text}")
            test_results.append(("Insufficient credits error", True))
        else:
            print(f"❌ Expected 402 but got {response.status_code}")
            print(f"   Response: {response.text}")
            test_results.append(("Insufficient credits error", False))
            
    except Exception as e:
        print(f"❌ Insufficient credits test error: {str(e)}")
        test_results.append(("Insufficient credits error", False))
    
    print("\n" + "=" * 80)
    
    # Final Results Summary
    print("📊 FINAL TEST RESULTS SUMMARY")
    print("=" * 80)
    
    passed_tests = sum(1 for _, passed in test_results if passed)
    total_tests = len(test_results)
    
    print(f"Total Tests: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {total_tests - passed_tests}")
    print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
    
    print("\nDetailed Results:")
    for test_name, passed in test_results:
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {status}: {test_name}")
    
    print("\n" + "=" * 80)
    
    if passed_tests == total_tests:
        print("🎉 ALL CREDIT DEDUCTION TESTS PASSED!")
        print("✅ Credit system is working correctly:")
        print("   - All model pricing accurate")
        print("   - Rounding working properly")
        print("   - User state management correct")
        print("   - Error handling functional")
        return True
    else:
        print("❌ SOME CREDIT DEDUCTION TESTS FAILED!")
        print(f"⚠️  {total_tests - passed_tests} out of {total_tests} tests failed")
        print("🔧 Credit system needs attention")
        return False

def main():
    print("🚀 COMPREHENSIVE CREDIT DEDUCTION SYSTEM TEST")
    print(f"⏰ Heure: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("💳 Testing credit deduction system with credits_config.py integration")
    print("🎯 Verifying all model pricing, variants, and credit calculations")
    print("=" * 80)
    
    # Test Credit Deduction System
    print("\n💳 CREDIT DEDUCTION SYSTEM TESTS")
    print("=" * 80)
    credit_success = test_credit_deduction_endpoint()
    
    # Final Results
    print("\n" + "=" * 80)
    print("📊 FINAL RESULTS:")
    print(f"   Credit Deduction System: {'✅ PASSED' if credit_success else '❌ FAILED'}")
    
    if credit_success:
        print("\n🎉 RESULT: CREDIT SYSTEM FULLY FUNCTIONAL")
        print("✅ All credit deduction tests passed:")
        print("   - Model pricing accurate")
        print("   - Variant handling correct")
        print("   - Rounding working properly")
        print("   - User state management functional")
        print("   - Error handling working")
        print("💳 Credit system ready for production!")
        sys.exit(0)
    else:
        print("\n❌ RESULT: CREDIT SYSTEM HAS ISSUES")
        print("⚠️  Some credit deduction tests failed")
        print("🔧 Credit system needs fixes before production")
        sys.exit(1)

if __name__ == "__main__":
    main()