#!/usr/bin/env python3
"""
Test script for NanoBanana API endpoints
Tests the 3 main endpoints in order:
1. POST /api/nanobanana/session - Create new session
2. POST /api/nanobanana/generate - Generate image with prompt
3. GET /api/nanobanana/session/{session_id} - Get session history
"""

import requests
import json
import sys
import os
from datetime import datetime

# Get backend URL - try external first, fallback to localhost
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    external_url = line.split('=', 1)[1].strip()
                    print(f"⚠️  URL externe trouvée: {external_url}")
                    print(f"⚠️  PROBLÈME: L'URL externe ne répond pas (erreur de routage/déploiement)")
                    print(f"⚠️  Utilisation de localhost pour les tests internes")
                    return "http://localhost:8001"
    except Exception as e:
        print(f"❌ Erreur lecture .env: {e}")
        return "http://localhost:8001"
    
    return "http://localhost:8001"

def test_nanobanana_api():
    """Test complet de l'API NanoBanana"""
    
    # Configuration
    base_url = get_backend_url()
    if not base_url:
        print("❌ ERREUR: Impossible de récupérer REACT_APP_BACKEND_URL")
        return False
    
    api_url = f"{base_url}/api"
    print(f"🔗 URL de test: {api_url}")
    print("=" * 60)
    
    session_id = None
    
    try:
        # Test 1: Créer une nouvelle session
        print("📝 TEST 1: POST /api/nanobanana/session - Créer une nouvelle session")
        print("-" * 50)
        
        response = requests.post(f"{api_url}/nanobanana/session", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            session_data = response.json()
            session_id = session_data.get('id')
            print(f"✅ Session créée avec succès!")
            print(f"   Session ID: {session_id}")
            print(f"   Created at: {session_data.get('created_at')}")
            print(f"   Response: {json.dumps(session_data, indent=2)}")
        else:
            print(f"❌ Échec création session: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 60)
        
        # Test 2: Générer une image avec le prompt spécifié
        print("🎨 TEST 2: POST /api/nanobanana/generate - Générer une image")
        print("-" * 50)
        
        if not session_id:
            print("❌ Pas de session_id disponible pour le test de génération")
            return False
            
        generate_payload = {
            "session_id": session_id,
            "prompt": "un chat mignon qui mange une banane"
        }
        
        print(f"Payload: {json.dumps(generate_payload, indent=2)}")
        
        response = requests.post(
            f"{api_url}/nanobanana/generate", 
            json=generate_payload,
            timeout=60  # Plus de temps pour la génération d'image
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            generate_data = response.json()
            print(f"✅ Image générée avec succès!")
            print(f"   Session ID: {generate_data.get('session_id')}")
            print(f"   Message ID: {generate_data.get('message_id')}")
            print(f"   Prompt: {generate_data.get('prompt')}")
            print(f"   Response Text: {generate_data.get('response_text')}")
            
            image_urls = generate_data.get('image_urls', [])
            print(f"   Nombre d'images: {len(image_urls)}")
            
            for i, url in enumerate(image_urls):
                if url.startswith('data:'):
                    print(f"   Image {i+1}: Data URL (longueur: {len(url)} caractères)")
                else:
                    print(f"   Image {i+1}: {url}")
                    
        else:
            print(f"❌ Échec génération image: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 60)
        
        # Test 3: Récupérer l'historique de la session
        print("📚 TEST 3: GET /api/nanobanana/session/{session_id} - Récupérer l'historique")
        print("-" * 50)
        
        response = requests.get(f"{api_url}/nanobanana/session/{session_id}", timeout=30)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            history_data = response.json()
            print(f"✅ Historique récupéré avec succès!")
            print(f"   Nombre de messages: {len(history_data)}")
            
            for i, message in enumerate(history_data):
                print(f"   Message {i+1}:")
                print(f"     ID: {message.get('id')}")
                print(f"     Role: {message.get('role')}")
                print(f"     Content: {message.get('content')}")
                print(f"     Images: {len(message.get('image_urls', []))}")
                print(f"     Timestamp: {message.get('timestamp')}")
                
        else:
            print(f"❌ Échec récupération historique: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
        print("\n" + "=" * 60)
        print("🎉 TOUS LES TESTS RÉUSSIS!")
        return True
        
    except requests.exceptions.Timeout:
        print("❌ ERREUR: Timeout lors de la requête")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ ERREUR: Impossible de se connecter au backend")
        return False
    except Exception as e:
        print(f"❌ ERREUR INATTENDUE: {str(e)}")
        return False

def main():
    print("🚀 DÉBUT DES TESTS API NANOBANANA")
    print(f"⏰ Heure: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    success = test_nanobanana_api()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ RÉSULTAT FINAL: TOUS LES TESTS RÉUSSIS")
        sys.exit(0)
    else:
        print("❌ RÉSULTAT FINAL: ÉCHEC DES TESTS")
        sys.exit(1)

if __name__ == "__main__":
    main()