// Test script to verify WAV file generation
const fs = require('fs');

// Mock audio generation function (same as in api/generate-music.js)
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
    
    // Generate simple sine wave
    const audioData = Buffer.alloc(dataSize);
    for (let i = 0; i < numSamples; i++) {
        const time = i / sampleRate;
        const sample = Math.sin(2 * Math.PI * 440 * time) * 0.3; // 440Hz sine wave
        const intSample = Math.round(sample * 32767);
        audioData.writeInt16LE(intSample, i * 2);
    }
    
    // Combine header and audio data
    const wavBuffer = Buffer.concat([header, audioData]);
    return wavBuffer;
}

// Generate test WAV file
const wavBuffer = generateMockAudio('piano', 2);
fs.writeFileSync('test-output.wav', wavBuffer);

console.log('Generated test WAV file: test-output.wav');
console.log('File size:', wavBuffer.length, 'bytes');
console.log('First 44 bytes (header):', wavBuffer.slice(0, 44).toString('hex'));
console.log('Header as text:', wavBuffer.slice(0, 12).toString());
