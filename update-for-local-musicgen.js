// Update your musicgen-server.js to use local MusicGen
// This replaces the API calls with local MusicGen server

const LOCAL_MUSICGEN_URL = 'http://localhost:8000/generate';

// Add this function to your musicgen-server.js
async function generateWithLocalMusicGen(audioData, instrument, duration, style) {
    try {
        console.log('🎵 Attempting local MusicGen generation...');
        
        const prompt = createEnhancedPrompt(instrument, style);
        
        const response = await fetch(LOCAL_MUSICGEN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                duration: parseInt(duration) || 10,
                melody: audioData  // Base64 audio input
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Local MusicGen error:', response.status, errorText);
            return { success: false, error: `Local MusicGen error: ${response.status}` };
        }
        
        console.log('✅ Local MusicGen generation successful!');
        
        // Convert response to base64
        const audioBuffer = await response.buffer();
        const base64Audio = audioBuffer.toString('base64');
        
        return {
            success: true,
            audioData: base64Audio,
            source: 'Local MusicGen (Open Source)'
        };
        
    } catch (error) {
        console.error('Local MusicGen failed:', error);
        return { success: false, error: error.message };
    }
}

// Update your main generation function
async function generateMusicWithFallback(audioData, instrument, duration, style) {
    // Try local MusicGen first
    const localResult = await generateWithLocalMusicGen(audioData, instrument, duration, style);
    
    if (localResult.success) {
        return localResult;
    }
    
    // Fallback to mock audio
    console.log('Local MusicGen failed, using mock audio:', localResult.error);
    const mockAudio = generateMockAudio(instrument, duration);
    
    return {
        success: true,
        audioData: mockAudio,
        isMock: true,
        source: 'Mock Audio (Local MusicGen unavailable)'
    };
}

// Example usage in your endpoint:
app.post('/generate-music-base64', async (req, res) => {
    try {
        const { audioData, instrument = 'piano', duration = '10', style = 'classical' } = req.body;
        
        if (!audioData) {
            return res.status(400).json({ error: 'No audio data provided' });
        }
        
        console.log(`Generating ${instrument} music from base64 audio data`);
        
        // Use the new function with fallback
        const result = await generateMusicWithFallback(audioData, instrument, duration, style);
        
        res.json({
            success: true,
            audioData: result.audioData,
            isMock: result.isMock || false,
            source: result.source,
            message: result.isMock ? 
                'Generated using mock audio (Local MusicGen unavailable)' : 
                'Generated using local MusicGen AI!'
        });
        
    } catch (error) {
        console.error('Error generating music:', error);
        res.status(500).json({ 
            error: 'Failed to generate music',
            details: error.message 
        });
    }
});

module.exports = {
    generateWithLocalMusicGen,
    generateMusicWithFallback
};

