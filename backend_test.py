#!/usr/bin/env python3
"""
Test script for AI Image Upscaler API endpoints
Tests AI Image Upscaler integration with Replicate API:
1. POST /api/image-upscaler/session - Create AI Image Upscaler session
2. POST /api/image-upscaler/upscale - Upscale image with X2, X4, X8 factors
3. GET /api/image-upscaler/session/{session_id} - Get session history
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

def main():
    print("🚀 DÉBUT DES TESTS API VIDÉO - GOOGLE VEO 3.1 ET SORA 2")
    print(f"⏰ Heure: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("🔧 Test après correction du bug 'litellm' manquant")
    print("=" * 80)
    
    # Test Google Veo 3.1
    print("\n🎬 TESTS GOOGLE VEO 3.1")
    print("=" * 80)
    google_veo_success = test_google_veo_api()
    
    # Test SORA 2
    print("\n🎬 TESTS SORA 2")
    print("=" * 80)
    sora2_success = test_sora2_api()
    
    # Résultats finaux
    print("\n" + "=" * 80)
    print("📊 RÉSULTATS FINAUX:")
    print(f"   Google Veo 3.1: {'✅ RÉUSSI' if google_veo_success else '❌ ÉCHEC'}")
    print(f"   SORA 2: {'✅ RÉUSSI' if sora2_success else '❌ ÉCHEC'}")
    
    if google_veo_success and sora2_success:
        print("\n🎉 RÉSULTAT GLOBAL: TOUS LES TESTS RÉUSSIS")
        print("✅ Les vidéos sont générées et stockées correctement")
        sys.exit(0)
    else:
        print("\n❌ RÉSULTAT GLOBAL: ÉCHEC DE CERTAINS TESTS")
        if not google_veo_success:
            print("⚠️  Google Veo 3.1: Problème de génération de vidéo")
        if not sora2_success:
            print("⚠️  SORA 2: Problème de génération de vidéo")
        sys.exit(1)

if __name__ == "__main__":
    main()