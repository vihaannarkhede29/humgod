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
        const { audioData, instrument = 'piano', duration = '10', style = 'classical' } = req.body;
        
        if (!audioData) {
            return res.status(400).json({ error: 'No audio data provided' });
        }
        
        console.log(`Generating ${instrument} music from base64 audio data`);
        
        // Generate realistic mock audio with proper instrument sounds
        const mockAudio = generateMockAudio(instrument, duration);
        
        return res.json({
            success: true,
            audioData: mockAudio,
            isMock: true,
            message: 'Using realistic mock audio (To use real MusicGen: get API key from https://replicate.com/account/api-tokens)'
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
        
        // Generate multiple frequencies with harmonics
        for (let j = 0; j < config.frequencies.length; j++) {
            const freq = config.frequencies[j];
            const harmonic = config.harmonics[j];
            
            // Add some vibrato for realism
            const vibrato = 1 + 0.05 * Math.sin(2 * Math.PI * 5 * time);
            const wave = Math.sin(2 * Math.PI * freq * time * vibrato) * harmonic;
            
            // Add some harmonic content
            if (j === 0) {
                sample += wave;
                sample += Math.sin(2 * Math.PI * freq * 2 * time) * harmonic * 0.3; // Octave
                sample += Math.sin(2 * Math.PI * freq * 3 * time) * harmonic * 0.1; // Fifth
            } else {
                sample += wave;
            }
        }
        
        // Apply ADSR envelope
        let envelope = 1.0;
        if (time < config.attack) {
            envelope = time / config.attack;
        } else if (time < config.attack + config.decay) {
            envelope = 1 - (time - config.attack) / config.decay * (1 - config.sustain);
        } else if (time < duration - config.release) {
            envelope = config.sustain;
        } else {
            envelope = config.sustain * (duration - time) / config.release;
        }
        
        // Apply instrument-specific envelope
        if (config.envelope === 'piano') {
            envelope *= Math.exp(-time * 2) * (1 - Math.exp(-time * 20));
        } else if (config.envelope === 'guitar') {
            envelope *= Math.exp(-time * 1.5) * (1 - Math.exp(-time * 15));
        } else if (config.envelope === 'violin') {
            envelope *= Math.exp(-time * 0.8) * (1 - Math.exp(-time * 10));
        } else if (config.envelope === 'synth') {
            envelope *= 0.8 + 0.2 * Math.sin(2 * Math.PI * 0.5 * time);
        } else if (config.envelope === 'drums') {
            envelope *= Math.exp(-time * 8) * (1 - Math.exp(-time * 50));
        } else if (config.envelope === 'bass') {
            envelope *= Math.exp(-time * 1.2) * (1 - Math.exp(-time * 12));
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
