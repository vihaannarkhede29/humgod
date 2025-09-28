// MusicGen Server Integration
// Handles server-side MusicGen API calls for better security and performance

const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// MusicGen API configuration
const MUSICGEN_CONFIG = {
    apiUrl: 'https://api-inference.huggingface.co/models/facebook/musicgen-stereo-melody-large',
    apiKey: process.env.HUGGING_FACE_API_KEY || 'YOUR_HUGGING_FACE_API_KEY',
    timeout: 30000 // 30 seconds timeout
};

// Instrument-specific prompts for better results
const INSTRUMENT_PROMPTS = {
    piano: 'Generate a beautiful piano melody based on the provided audio input. Focus on the melody and harmony with classical piano sound.',
    guitar: 'Create an acoustic guitar arrangement that follows the melody and rhythm of the input audio. Use fingerpicking style.',
    violin: 'Generate a violin melody that captures the emotional essence of the input audio. Use classical violin sound.',
    synth: 'Create a modern synthesizer track with electronic sounds based on the input audio. Use analog synth sounds.',
    drums: 'Generate a drum track with kick, snare, hi-hats, and cymbals based on the beatboxing rhythm. Focus only on percussion instruments.',
    bass: 'Create a bass line that follows the rhythm and complements the melody of the input audio. Use electric bass sound.'
};

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Generate music endpoint
app.post('/generate-music', upload.single('audio'), async (req, res) => {
    try {
        const { instrument = 'piano', duration = '10', style = 'classical' } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'No audio file provided' });
        }

        if (!MUSICGEN_CONFIG.apiKey || MUSICGEN_CONFIG.apiKey === 'YOUR_HUGGING_FACE_API_KEY') {
            return res.status(500).json({ 
                error: 'MusicGen API key not configured. Please set HUGGING_FACE_API_KEY environment variable.' 
            });
        }

        console.log(`Generating ${instrument} music for ${req.file.originalname || 'audio'}`);

        // Create form data for MusicGen API
        const formData = new FormData();
        formData.append('audio', req.file.buffer, {
            filename: req.file.originalname || 'audio.wav',
            contentType: 'audio/wav'
        });
        
        // Create enhanced prompt based on instrument and style
        const prompt = createEnhancedPrompt(instrument, style);
        formData.append('prompt', prompt);
        formData.append('duration', duration);
        formData.append('continuation', 'true');
        formData.append('output_format', 'wav');
        formData.append('top_k', '250');
        formData.append('top_p', '0.0');
        formData.append('temperature', '1.0');
        formData.append('cfg_coef', '3.5');

        // Make request to MusicGen API
        const response = await fetch(MUSICGEN_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MUSICGEN_CONFIG.apiKey}`,
                ...formData.getHeaders()
            },
            body: formData,
            timeout: MUSICGEN_CONFIG.timeout
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('MusicGen API error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `MusicGen API error: ${response.status} ${response.statusText}`,
                details: errorText
            });
        }

        // Get the generated audio
        const audioBuffer = await response.buffer();
        
        // Set appropriate headers for audio response
        res.set({
            'Content-Type': 'audio/wav',
            'Content-Length': audioBuffer.length,
            'Content-Disposition': `attachment; filename="generated_${instrument}_music.wav"`
        });

        res.send(audioBuffer);
        console.log(`Successfully generated ${instrument} music (${audioBuffer.length} bytes)`);

    } catch (error) {
        console.error('Error generating music:', error);
        res.status(500).json({ 
            error: 'Failed to generate music',
            details: error.message 
        });
    }
});

// Generate music with base64 audio data (alternative endpoint)
app.post('/generate-music-base64', async (req, res) => {
    try {
        const { audioData, instrument = 'piano', duration = '10', style = 'classical' } = req.body;
        
        if (!audioData) {
            return res.status(400).json({ error: 'No audio data provided' });
        }

        if (!MUSICGEN_CONFIG.apiKey || MUSICGEN_CONFIG.apiKey === 'YOUR_HUGGING_FACE_API_KEY') {
            return res.status(500).json({ 
                error: 'MusicGen API key not configured. Please set HUGGING_FACE_API_KEY environment variable.' 
            });
        }

        // Convert base64 to buffer
        const audioBuffer = Buffer.from(audioData, 'base64');
        
        console.log(`Generating ${instrument} music from base64 audio data`);

        // Create form data for MusicGen API
        const formData = new FormData();
        formData.append('audio', audioBuffer, {
            filename: 'audio.wav',
            contentType: 'audio/wav'
        });
        
        // Create enhanced prompt
        const prompt = createEnhancedPrompt(instrument, style);
        formData.append('prompt', prompt);
        formData.append('duration', duration);
        formData.append('continuation', 'true');
        formData.append('output_format', 'wav');
        formData.append('top_k', '250');
        formData.append('top_p', '0.0');
        formData.append('temperature', '1.0');
        formData.append('cfg_coef', '3.5');

        // Make request to MusicGen API
        const response = await fetch(MUSICGEN_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MUSICGEN_CONFIG.apiKey}`,
                ...formData.getHeaders()
            },
            body: formData,
            timeout: MUSICGEN_CONFIG.timeout
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('MusicGen API error:', response.status, errorText);
            return res.status(response.status).json({ 
                error: `MusicGen API error: ${response.status} ${response.statusText}`,
                details: errorText
            });
        }

        // Get the generated audio
        const generatedAudioBuffer = await response.buffer();
        
        // Return as base64 for easier handling in frontend
        const base64Audio = generatedAudioBuffer.toString('base64');
        
        res.json({
            success: true,
            audioData: base64Audio,
            instrument: instrument,
            duration: duration,
            size: generatedAudioBuffer.length
        });

        console.log(`Successfully generated ${instrument} music (${generatedAudioBuffer.length} bytes)`);

    } catch (error) {
        console.error('Error generating music:', error);
        res.status(500).json({ 
            error: 'Failed to generate music',
            details: error.message 
        });
    }
});

// Get available instruments
app.get('/instruments', (req, res) => {
    res.json({
        instruments: Object.keys(INSTRUMENT_PROMPTS).map(key => ({
            id: key,
            name: key.charAt(0).toUpperCase() + key.slice(1),
            description: INSTRUMENT_PROMPTS[key].split('.')[0]
        }))
    });
});

// Get instrument-specific settings
app.get('/instruments/:instrument/settings', (req, res) => {
    const { instrument } = req.params;
    
    if (!INSTRUMENT_PROMPTS[instrument]) {
        return res.status(404).json({ error: 'Instrument not found' });
    }

    const settings = {
        piano: { minDuration: 5, maxDuration: 30, defaultDuration: 10, styles: ['classical', 'jazz', 'pop'] },
        guitar: { minDuration: 5, maxDuration: 30, defaultDuration: 10, styles: ['acoustic', 'electric', 'classical'] },
        violin: { minDuration: 5, maxDuration: 30, defaultDuration: 10, styles: ['classical', 'folk', 'modern'] },
        synth: { minDuration: 5, maxDuration: 30, defaultDuration: 10, styles: ['analog', 'digital', 'ambient'] },
        drums: { minDuration: 5, maxDuration: 30, defaultDuration: 10, styles: ['acoustic', 'electronic', 'hip-hop'] },
        bass: { minDuration: 5, maxDuration: 30, defaultDuration: 10, styles: ['electric', 'acoustic', 'funk'] }
    };

    res.json({
        instrument: instrument,
        settings: settings[instrument] || settings.piano,
        prompt: INSTRUMENT_PROMPTS[instrument]
    });
});

// Helper function to create enhanced prompts
function createEnhancedPrompt(instrument, style) {
    const basePrompt = INSTRUMENT_PROMPTS[instrument] || INSTRUMENT_PROMPTS.piano;
    
    const styleModifiers = {
        classical: 'in a classical style with traditional instrumentation',
        jazz: 'in a jazz style with improvisational elements',
        pop: 'in a modern pop style with contemporary production',
        acoustic: 'with acoustic, natural sound',
        electric: 'with electric, amplified sound',
        folk: 'in a folk style with traditional elements',
        modern: 'in a modern, contemporary style',
        analog: 'using analog synthesizer sounds',
        digital: 'using digital synthesizer sounds',
        ambient: 'in an ambient, atmospheric style',
        electronic: 'with electronic, synthesized sounds',
        'hip-hop': 'in a hip-hop style with urban beats',
        funk: 'in a funk style with groovy bass lines'
    };

    const styleModifier = styleModifiers[style] || '';
    
    return `${basePrompt} ${styleModifier}. Ensure the output matches the rhythm and timing of the input audio.`;
}

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🎵 MusicGen Server running on port ${PORT}`);
    console.log(`🔑 API Key configured: ${MUSICGEN_CONFIG.apiKey !== 'YOUR_HUGGING_FACE_API_KEY' ? 'Yes' : 'No'}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
