// Test script to verify NanoBanana frontend-backend integration
const backendUrl = 'http://localhost:8001';

async function testNanoBananaIntegration() {
    console.log('=== TEST INTÉGRATION NANOBANANA ===');
    
    try {
        // 1. Test session creation
        console.log('1. Test création de session...');
        const sessionResponse = await fetch(`${backendUrl}/api/nanobanana/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!sessionResponse.ok) {
            throw new Error(`Session creation failed: ${sessionResponse.status}`);
        }
        
        const session = await sessionResponse.json();
        console.log('✅ Session créée:', session.id);
        
        // 2. Test image generation
        console.log('2. Test génération d\'image...');
        const generateResponse = await fetch(`${backendUrl}/api/nanobanana/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                session_id: session.id,
                prompt: 'Un chat orange mignon'
            }),
        });
        
        if (!generateResponse.ok) {
            throw new Error(`Generation failed: ${generateResponse.status}`);
        }
        
        const result = await generateResponse.json();
        console.log('✅ Image générée:', result.response_text);
        
        // 3. Test history retrieval
        console.log('3. Test récupération historique...');
        const historyResponse = await fetch(`${backendUrl}/api/nanobanana/session/${session.id}`);
        
        if (!historyResponse.ok) {
            throw new Error(`History retrieval failed: ${historyResponse.status}`);
        }
        
        const history = await historyResponse.json();
        console.log('✅ Historique récupéré:', history.length, 'messages');
        
        // 4. Verify image data
        if (history.length >= 2) {
            const assistantMessage = history.find(msg => msg.role === 'assistant');
            if (assistantMessage && assistantMessage.image_urls && assistantMessage.image_urls.length > 0) {
                console.log('✅ Image URL trouvée dans l\'historique');
                console.log('📊 Taille de l\'image (approximative):', assistantMessage.image_urls[0].length, 'caractères');
            } else {
                console.log('❌ Aucune image trouvée dans l\'historique');
            }
        }
        
        console.log('=== TEST RÉUSSI ===');
        return true;
        
    } catch (error) {
        console.error('❌ ERREUR:', error.message);
        return false;
    }
}

// Run the test
testNanoBananaIntegration();