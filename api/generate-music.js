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
    
    // Generate simple audio data - start with basic sine wave for compatibility
    const audioData = Buffer.alloc(dataSize);
    
    // Simple instrument-specific frequencies
    const instrumentFreqs = {
        piano: 440,    // A4
        guitar: 330,   // E4
        violin: 880,   // A5
        synth: 220,    // A3
        drums: 100,    // Low frequency
        bass: 110      // A2
    };
    
    const frequency = instrumentFreqs[instrument] || 440;
    
    for (let i = 0; i < numSamples; i++) {
        const time = i / sampleRate;
        
        // Simple sine wave with envelope
        let sample = Math.sin(2 * Math.PI * frequency * time);
        
        // Apply simple envelope (fade in/out)
        const envelope = Math.exp(-time * 0.5) * (1 - Math.exp(-time * 10));
        sample *= envelope * 0.3; // Reduce volume
        
        // Convert to 16-bit integer
        const intSample = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
        audioData.writeInt16LE(intSample, i * 2);
    }
    
    // Combine header and audio data
    const wavBuffer = Buffer.concat([header, audioData]);
    return wavBuffer.toString('base64');
}
