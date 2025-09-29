const fetch = require('node-fetch');

// Simple in-memory usage tracking (in production, use a real database)
const usageDB = new Map();

// Track user usage
function trackUsage(userId, generationLength) {
    const today = new Date().toDateString();
    const key = `${userId}-${today}`;
    
    if (!usageDB.has(key)) {
        usageDB.set(key, {
            userId,
            date: today,
            generations: 0,
            totalSeconds: 0,
            isPremium: false
        });
    }
    
    const usage = usageDB.get(key);
    usage.generations++;
    usage.totalSeconds += generationLength;
    
    return usage;
}

// Check if user can generate (free tier limits)
function canGenerate(userId, generationLength) {
    const usage = trackUsage(userId, generationLength);
    
    // Free tier limits
    if (!usage.isPremium) {
        if (usage.generations >= 3) {
            return { allowed: false, reason: 'Daily limit reached (3 generations)' };
        }
        if (generationLength > 15) {
            return { allowed: false, reason: 'Free tier limited to 15 seconds' };
        }
    }
    
    return { allowed: true };
}

// Get user's current usage
function getUserUsage(userId) {
    const today = new Date().toDateString();
    const key = `${userId}-${today}`;
    return usageDB.get(key) || { generations: 0, totalSeconds: 0, isPremium: false };
}

// Real MusicGen API call using Replicate (actually works!)
async function callRealMusicGen(audioData, instrument, duration) {
    try {
        console.log('🎵 Attempting real MusicGen conversion with Replicate...');
        
        if (!process.env.REPLICATE_API_TOKEN) {
            console.log('❌ No Replicate API token found');
            return { success: false, error: 'Replicate API token not configured' };
        }
        
        const prompt = createMusicPrompt(instrument, audioData);
        
        // Create prediction
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: '7a76a8258b3f54f6731a567f2e2cde7e5b9e5a5f', // MusicGen model version
                input: {
                    prompt: prompt,
                    melody: audioData, // Base64 audio input
                    duration: parseInt(duration) || 8,
                    continuation: false,
                    model_version: 'stereo-melody-large',
                    output_format: 'wav',
                    continuation_start: 0,
                    multi_band_diffusion: false,
                    normalization_strategy: 'peak',
                    classifier_free_guidance: 3
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.log(`❌ Replicate API failed: ${response.status} - ${errorText}`);
            return { success: false, error: `Replicate API error: ${response.status}` };
        }

        const prediction = await response.json();
        console.log('🎵 Replicate prediction created:', prediction.id);
        
        // Poll for completion
        let result = prediction;
        let attempts = 0;
        const maxAttempts = 30; // 5 minutes max
        
        while (result.status === 'starting' || result.status === 'processing') {
            if (attempts >= maxAttempts) {
                return { success: false, error: 'Timeout waiting for MusicGen result' };
            }
            
            console.log(`🎵 Polling attempt ${attempts + 1}, status: ${result.status}`);
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
            
            const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
                headers: {
                    'Authorization': `Token ${process.env.REPLICATE_API_TOKEN}`
                }
            });
            
            result = await pollResponse.json();
            attempts++;
        }
        
        if (result.status === 'succeeded' && result.output) {
            console.log('🎵 MusicGen generation succeeded!');
            
            // Convert the output URL to base64
            const audioResponse = await fetch(result.output);
            const audioBuffer = await audioResponse.arrayBuffer();
            const audioBase64 = Buffer.from(audioBuffer).toString('base64');
            
            return {
                success: true,
                audioData: audioBase64,
                source: 'Replicate MusicGen'
            };
        } else {
            console.log('❌ MusicGen generation failed:', result);
            return { success: false, error: result.error || 'MusicGen generation failed' };
        }
        
    } catch (error) {
        console.error('Real MusicGen error:', error);
        return { success: false, error: error.message };
    }
}

// Create music prompt based on instrument and audio input
function createMusicPrompt(instrument, audioData = null) {
    const basePrompts = {
        piano: 'Generate a beautiful piano melody with classical harmony and emotional depth',
        guitar: 'Create an acoustic guitar arrangement with fingerpicking style and warm tones',
        violin: 'Generate a violin melody with expressive vibrato and classical phrasing',
        synth: 'Create a modern synthesizer track with electronic sounds and analog warmth',
        drums: 'Generate a drum track with kick, snare, hi-hats, and cymbals in a rhythmic pattern',
        bass: 'Create a bass line with deep, sustained notes and rhythmic groove'
    };
    
    let prompt = basePrompts[instrument] || basePrompts.piano;
    
    // If we have audio data, modify the prompt to reference it
    if (audioData) {
        prompt = `Based on the provided audio input (humming/beatboxing/whistling), generate a ${instrument} arrangement that follows the melody, rhythm, and style of the input. ${prompt}`;
    }
    
    return prompt;
}

// Vercel serverless function for MusicGen API
module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { audioData, instrument = 'piano', duration = '10', style = 'classical', userId = 'anonymous' } = req.body;
        
        if (!audioData) {
            return res.status(400).json({ error: 'No audio data provided' });
        }
        
        // Check usage limits
        const generationLength = parseInt(duration) || 10;
        const usageCheck = canGenerate(userId, generationLength);
        
        if (!usageCheck.allowed) {
            return res.status(429).json({ 
                error: 'Usage limit exceeded',
                reason: usageCheck.reason,
                upgrade: 'Upgrade to Premium for unlimited generations!'
            });
        }
        
        console.log(`Generating ${instrument} music from base64 audio data`);
        
        // Try real MusicGen API first (Replicate)
        try {
            const musicGenResult = await callRealMusicGen(audioData, instrument, duration);
            if (musicGenResult.success) {
                return res.json({
                    success: true,
                    audioData: musicGenResult.audioData,
                    isMock: false,
                    message: `🎵 Generated using REAL MusicGen AI! (${musicGenResult.source})`
                });
            } else {
                console.log('Real MusicGen failed:', musicGenResult.error);
            }
        } catch (error) {
            console.log('Real MusicGen failed, using mock audio:', error.message);
        }
        
        // Fallback to realistic mock audio
        const mockAudio = generateMockAudio(instrument, duration);
        
        // Track usage
        trackUsage(userId, generationLength);
        
        return res.json({
            success: true,
            audioData: mockAudio,
            isMock: true,
            message: 'Using realistic mock audio (Free MusicGen coming soon!)',
            usage: getUserUsage(userId)
        });
        
    } catch (error) {
        console.error('Error generating music:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error during music generation.',
            details: error.message 
        });
    }
};

// Mock audio generation function
function generateMockAudio(instrument, duration) {
    // Create a simple WAV file header for browser compatibility
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const numSamples = sampleRate * (parseFloat(duration) || 3); // Shorter duration for testing
    const dataSize = numSamples * numChannels * (bitsPerSample / 8);
    const fileSize = 44 + dataSize;
    
    // Create WAV file header - simplified for better browser compatibility
    const header = Buffer.alloc(44);
    
    // RIFF header
    header.write('RIFF', 0);
    header.writeUInt32LE(fileSize - 8, 4);
    header.write('WAVE', 8);
    
    // fmt chunk
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16); // fmt chunk size
    header.writeUInt16LE(1, 20);  // PCM format
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * (bitsPerSample / 8), 28); // byte rate
    header.writeUInt16LE(numChannels * (bitsPerSample / 8), 32); // block align
    header.writeUInt16LE(bitsPerSample, 34);
    
    // data chunk
    header.write('data', 36);
    header.writeUInt32LE(dataSize, 40);
    
    // Generate realistic instrument audio data
    const audioData = Buffer.alloc(dataSize);
    
    // Instrument-specific configurations
    const instrumentConfigs = {
        piano: { 
            frequencies: [440, 880, 1320], // A4, A5, E6
            harmonics: [0.8, 0.4, 0.2],
            envelope: 'piano',
            attack: 0.1,
            decay: 0.3,
            sustain: 0.5,
            release: 0.8
        },
        guitar: { 
            frequencies: [330, 440, 660], // E4, A4, E5
            harmonics: [0.9, 0.6, 0.3],
            envelope: 'guitar',
            attack: 0.05,
            decay: 0.2,
            sustain: 0.7,
            release: 0.6
        },
        violin: { 
            frequencies: [880, 1320, 1760], // A5, E6, A6
            harmonics: [1.0, 0.7, 0.4],
            envelope: 'violin',
            attack: 0.2,
            decay: 0.1,
            sustain: 0.8,
            release: 0.9
        },
        synth: { 
            frequencies: [220, 440, 880], // A3, A4, A5
            harmonics: [0.6, 0.8, 0.4],
            envelope: 'synth',
            attack: 0.01,
            decay: 0.1,
            sustain: 0.9,
            release: 0.3
        },
        drums: { 
            frequencies: [60, 120, 240], // Low frequencies for drums
            harmonics: [1.0, 0.5, 0.2],
            envelope: 'drums',
            attack: 0.001,
            decay: 0.1,
            sustain: 0.1,
            release: 0.2
        },
        bass: { 
            frequencies: [110, 220, 330], // A2, A3, E4
            harmonics: [1.0, 0.6, 0.3],
            envelope: 'bass',
            attack: 0.05,
            decay: 0.2,
            sustain: 0.8,
            release: 0.7
        }
    };
    
    const config = instrumentConfigs[instrument] || instrumentConfigs.piano;
    
            for (let i = 0; i < numSamples; i++) {
                const time = i / sampleRate;
                let sample = 0;
                
                // Create musical patterns instead of constant tones
                const beatTime = time * 2; // 2 beats per second
                const measureTime = time * 0.5; // 4 beats per measure
                
                // Generate multiple frequencies with harmonics and musical patterns
                for (let j = 0; j < config.frequencies.length; j++) {
                    const freq = config.frequencies[j];
                    const harmonic = config.harmonics[j];
                    
                    // Create rhythmic patterns
                    let rhythmPattern = 1;
                    if (config.envelope === 'drums') {
                        // Drum pattern: kick on 1 and 3, snare on 2 and 4
                        const beat = Math.floor(beatTime) % 4;
                        if (j === 0) { // Kick drum
                            rhythmPattern = (beat === 0 || beat === 2) ? 1 : 0;
                        } else if (j === 1) { // Snare
                            rhythmPattern = (beat === 1 || beat === 3) ? 1 : 0;
                        } else { // Hi-hat
                            rhythmPattern = 0.3 + 0.2 * Math.sin(beatTime * Math.PI * 2);
                        }
                    } else {
                        // Melodic instruments: create arpeggios and melodies
                        const noteTime = time * 0.5; // Slower note changes
                        const noteIndex = Math.floor(noteTime * 4) % 8; // 8-note pattern
                        const noteFreqs = [1, 1.25, 1.5, 1.25, 1, 0.75, 0.5, 0.75]; // Musical intervals
                        rhythmPattern = noteFreqs[noteIndex] * (0.7 + 0.3 * Math.sin(noteTime * Math.PI));
                    }
                    
                    // Add some vibrato for realism
                    const vibrato = 1 + 0.02 * Math.sin(2 * Math.PI * 3 * time);
                    const wave = Math.sin(2 * Math.PI * freq * time * vibrato) * harmonic * rhythmPattern;
                    
                    // Add some harmonic content
                    if (j === 0) {
                        sample += wave;
                        sample += Math.sin(2 * Math.PI * freq * 2 * time * vibrato) * harmonic * 0.3 * rhythmPattern; // Octave
                        sample += Math.sin(2 * Math.PI * freq * 3 * time * vibrato) * harmonic * 0.1 * rhythmPattern; // Fifth
                    } else {
                        sample += wave;
                    }
                }
        
                // Apply ADSR envelope with musical variation
                let envelope = 1.0;
                
                // Create note-based envelope (each note gets its own attack/decay)
                const noteTime = time * 0.5; // Slower note changes
                const noteIndex = Math.floor(noteTime * 4) % 8;
                const noteStart = noteIndex / 4; // When this note starts
                const noteEnd = (noteIndex + 1) / 4; // When this note ends
                const noteProgress = (time - noteStart) / (noteEnd - noteStart);
                
                if (noteProgress >= 0 && noteProgress <= 1) {
                    // Individual note envelope
                    if (noteProgress < 0.1) {
                        envelope = noteProgress / 0.1; // Quick attack
                    } else if (noteProgress < 0.8) {
                        envelope = 1 - (noteProgress - 0.1) * 0.3; // Slight decay
                    } else {
                        envelope = 0.7 * (1 - noteProgress) / 0.2; // Quick release
                    }
                } else {
                    envelope = 0; // Silence between notes
                }
                
                // Apply instrument-specific envelope
                if (config.envelope === 'piano') {
                    envelope *= Math.exp(-time * 0.5) * (1 - Math.exp(-time * 10));
                } else if (config.envelope === 'guitar') {
                    envelope *= Math.exp(-time * 0.3) * (1 - Math.exp(-time * 8));
                } else if (config.envelope === 'violin') {
                    envelope *= Math.exp(-time * 0.2) * (1 - Math.exp(-time * 6));
                } else if (config.envelope === 'synth') {
                    envelope *= 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.3 * time);
                } else if (config.envelope === 'drums') {
                    envelope *= Math.exp(-time * 4) * (1 - Math.exp(-time * 30));
                } else if (config.envelope === 'bass') {
                    envelope *= Math.exp(-time * 0.4) * (1 - Math.exp(-time * 8));
                }
        
        sample *= envelope;
        
        // Add some noise for realism
        if (config.envelope === 'drums') {
            sample += (Math.random() - 0.5) * 0.1;
        }
        
        // Add some reverb effect
        if (i > 1000) {
            sample += audioData.readInt16LE((i - 1000) * 2) * 0.1;
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
