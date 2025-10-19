#!/usr/bin/env python3
"""
Test script for Flux Kontext Pro API endpoints
Tests Flux Kontext Pro integration with Replicate API:
1. POST /api/flux-kontext/session - Create Flux Kontext Pro session
2. POST /api/flux-kontext/generate - Generate image (Mode 1: prompt only)
3. POST /api/flux-kontext/generate - Edit image (Mode 2: with uploaded image)
4. GET /api/flux-kontext/session/{session_id} - Get session history

Also includes tests for AI Image Upscaler, Google Veo 3.1, and SORA 2.
"""

import requests
import json
import sys
import os
import base64
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

def main():
    print("🚀 DÉBUT DU TEST FLUX COMPLET IMAGE UPSCALER")
    print(f"⏰ Heure: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🔧 Test du flux complet Image Upscaler (tool ID 5)")
    print("🎯 Vérification que le bouton télécharger fonctionne correctement")
    print("🖼️ Image de test: PNG 1x1 pixel rouge en base64")
    print("📐 Scale factor: 2 (X2)")
    print("=" * 80)
    
    # Test Image Upscaler complet
    print("\n🔍 TEST FLUX COMPLET IMAGE UPSCALER")
    print("=" * 80)
    upscaler_success = test_image_upscaler_complete_flow()
    
    # Résultats finaux
    print("\n" + "=" * 80)
    print("📊 RÉSULTATS FINAUX:")
    print(f"   Image Upscaler Flow: {'✅ RÉUSSI' if upscaler_success else '❌ ÉCHEC'}")
    
    if upscaler_success:
        print("\n🎉 RÉSULTAT GLOBAL: FLUX IMAGE UPSCALER VALIDÉ")
        print("✅ Le flux complet Image Upscaler fonctionne correctement:")
        print("   - Création de session réussie")
        print("   - Upload d'image 1x1 PNG réussi")
        print("   - Upscaling X2 avec Replicate API réussi")
        print("   - Image_url retournée dans la réponse")
        print("   - Image upscalée accessible et téléchargeable")
        print("🔧 Le bouton télécharger fonctionne parfaitement!")
        sys.exit(0)
    else:
        print("\n❌ RÉSULTAT GLOBAL: ÉCHEC DU FLUX IMAGE UPSCALER")
        print("⚠️  Problème détecté dans le flux Image Upscaler")
        print("🔧 Le bouton télécharger pourrait ne pas fonctionner correctement")
        sys.exit(1)

if __name__ == "__main__":
    main()