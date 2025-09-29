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

// Mock audio generation function for testing
function generateMockAudio(instrument, duration) {
    // Create a simple WAV file header for a 1-second audio clip
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const numSamples = sampleRate * (parseFloat(duration) || 5);
    const dataSize = numSamples * numChannels * (bitsPerSample / 8);
    const fileSize = 44 + dataSize;
    
    // WAV file header
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(fileSize - 8, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // PCM format
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28);
    header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32);
    header.writeUInt16LE(bitsPerSample, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);
    
    // Generate more realistic audio data with multiple frequencies and harmonics
    const audioData = Buffer.alloc(dataSize);
    const instrumentConfigs = {
        piano: { 
            frequencies: [440, 880, 1320], // A4, A5, E6
            harmonics: [0.8, 0.4, 0.2],
            envelope: 'piano'
        },
        guitar: { 
            frequencies: [330, 440, 660], // E4, A4, E5
            harmonics: [0.9, 0.6, 0.3],
            envelope: 'guitar'
        },
        violin: { 
            frequencies: [880, 1320, 1760], // A5, E6, A6
            harmonics: [1.0, 0.7, 0.4],
            envelope: 'violin'
        },
        synth: { 
            frequencies: [220, 440, 880], // A3, A4, A5
            harmonics: [0.6, 0.8, 0.4],
            envelope: 'synth'
        },
        drums: { 
            frequencies: [60, 120, 240], // Low frequencies for drums
            harmonics: [1.0, 0.5, 0.2],
            envelope: 'drums'
        },
        bass: { 
            frequencies: [110, 220, 330], // A2, A3, E4
            harmonics: [1.0, 0.6, 0.3],
            envelope: 'bass'
        }
    };
    
    const config = instrumentConfigs[instrument] || instrumentConfigs.piano;
    
    for (let i = 0; i < numSamples; i++) {
        let sample = 0;
        const time = i / sampleRate;
        
        // Generate multiple frequencies with harmonics
        for (let j = 0; j < config.frequencies.length; j++) {
            const freq = config.frequencies[j];
            const harmonic = config.harmonics[j];
            const wave = Math.sin(2 * Math.PI * freq * time) * harmonic;
            
            // Apply envelope based on instrument
            let envelope = 1.0;
            if (config.envelope === 'piano') {
                envelope = Math.exp(-time * 2) * (1 - Math.exp(-time * 20));
            } else if (config.envelope === 'guitar') {
                envelope = Math.exp(-time * 1.5) * (1 - Math.exp(-time * 15));
            } else if (config.envelope === 'violin') {
                envelope = Math.exp(-time * 0.8) * (1 - Math.exp(-time * 10));
            } else if (config.envelope === 'synth') {
                envelope = 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.5 * time);
            } else if (config.envelope === 'drums') {
                envelope = Math.exp(-time * 8) * (1 - Math.exp(-time * 50));
            } else if (config.envelope === 'bass') {
                envelope = Math.exp(-time * 1.2) * (1 - Math.exp(-time * 12));
            }
            
            sample += wave * envelope;
        }
        
        // Add some noise for realism
        if (config.envelope === 'drums') {
            sample += (Math.random() - 0.5) * 0.1;
        }
        
        // Normalize and convert to 16-bit integer
        sample = Math.max(-1, Math.min(1, sample * 0.3));
        const intSample = Math.round(sample * 32767);
        audioData.writeInt16LE(intSample, i * 2);
    }
    
    // Combine header and audio data
    const wavBuffer = Buffer.concat([header, audioData]);
    return wavBuffer.toString('base64');
}

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

        // Create enhanced prompt based on instrument and style
        const prompt = createEnhancedPrompt(instrument, style);
        
        // Convert audio buffer to base64 for JSON payload
        const audioBase64 = req.file.buffer.toString('base64');
        
        // Create JSON payload for MusicGen API
        const payload = {
            inputs: prompt,
            parameters: {
                max_new_tokens: 256,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true
            }
        };

        // Make request to MusicGen API
        console.log('🎵 Making request to MusicGen API:', MUSICGEN_CONFIG.apiUrl);
        console.log('🎵 Payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(MUSICGEN_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MUSICGEN_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            timeout: MUSICGEN_CONFIG.timeout
        });
        
        console.log('🎵 Response status:', response.status);
        console.log('🎵 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('MusicGen API error:', response.status, errorText);
            console.log('Note: MusicGen models may not be available through Hugging Face Inference API');
            console.log('Consider using alternative services like Suno, Udio, or local MusicGen deployment');
            
            // Fallback: Generate mock audio for testing
            console.log('Using fallback mock audio generation...');
            const mockAudio = generateMockAudio(instrument, duration);
            return res.json({ 
                success: true, 
                audioData: mockAudio,
                isMock: true,
                message: 'Using mock audio (MusicGen API unavailable - consider using Suno, Udio, or local deployment)'
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

        // Create enhanced prompt
        const prompt = createEnhancedPrompt(instrument, style);
        
        // Create JSON payload for MusicGen API
        const payload = {
            inputs: prompt,
            parameters: {
                max_new_tokens: 256,
                temperature: 0.7,
                top_p: 0.9,
                do_sample: true
            }
        };

        // Make request to MusicGen API
        console.log('🎵 Making request to MusicGen API:', MUSICGEN_CONFIG.apiUrl);
        console.log('🎵 Payload:', JSON.stringify(payload, null, 2));
        
        const response = await fetch(MUSICGEN_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MUSICGEN_CONFIG.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            timeout: MUSICGEN_CONFIG.timeout
        });
        
        console.log('🎵 Response status:', response.status);
        console.log('🎵 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('MusicGen API error:', response.status, errorText);
            console.log('Note: MusicGen models may not be available through Hugging Face Inference API');
            console.log('Consider using alternative services like Suno, Udio, or local MusicGen deployment');
            
            // Fallback: Generate mock audio for testing
            console.log('Using fallback mock audio generation...');
            const mockAudio = generateMockAudio(instrument, duration);
            return res.json({ 
                success: true, 
                audioData: mockAudio,
                isMock: true,
                message: 'Using mock audio (MusicGen API unavailable - consider using Suno, Udio, or local deployment)'
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
