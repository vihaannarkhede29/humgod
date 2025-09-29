// Vercel serverless function for MusicGen API
export default async function handler(req, res) {
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
        const { audioData, instrument = 'piano', duration = '10', style = 'classical' } = req.body;
        
        if (!audioData) {
            return res.status(400).json({ error: 'No audio data provided' });
        }
        
        console.log(`Generating ${instrument} music from base64 audio data`);
        
        // For now, return mock audio since we don't have a real MusicGen API key
        // In the future, this would call the actual MusicGen API
        const mockAudio = generateMockAudio(instrument, duration);
        
        return res.json({
            success: true,
            audioData: mockAudio,
            isMock: true,
            message: 'Using mock audio (Real MusicGen API integration coming soon)'
        });
        
    } catch (error) {
        console.error('Error generating music:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error during music generation.',
            details: error.message 
        });
    }
}

// Mock audio generation function
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
