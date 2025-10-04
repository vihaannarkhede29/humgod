#!/usr/bin/env node
/**
 * Test Hugging Face API Key
 * Run this to verify your Hugging Face API key works
 */

const fetch = require('node-fetch');

async function testHuggingFaceAPI() {
    const apiKey = process.env.HUGGING_FACE_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_HUGGING_FACE_API_KEY') {
        console.log('❌ HUGGING_FACE_API_KEY not set');
        console.log('Set it with: export HUGGING_FACE_API_KEY="hf_your_token_here"');
        process.exit(1);
    }
    
    console.log('🔑 Testing Hugging Face API key...');
    console.log(`Key: ${apiKey.substring(0, 10)}...`);
    
    try {
        const response = await fetch('https://api-inference.huggingface.co/models/facebook/musicgen-stereo-melody-large', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                inputs: 'A beautiful piano melody in C major',
                parameters: {
                    max_length: 10,
                    temperature: 0.7,
                    do_sample: true
                }
            })
        });
        
        console.log(`📡 Response status: ${response.status}`);
        console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const audioBuffer = await response.buffer();
            console.log(`✅ SUCCESS! Generated ${audioBuffer.length} bytes of audio`);
            console.log('🎵 Your Hugging Face API key is working!');
            
            // Save a sample file
            const fs = require('fs');
            fs.writeFileSync('test-output.wav', audioBuffer);
            console.log('💾 Saved test audio as test-output.wav');
            
        } else {
            const errorText = await response.text();
            console.log(`❌ FAILED: ${response.status} - ${errorText}`);
            
            if (response.status === 401) {
                console.log('🔑 Invalid API key - check your token');
            } else if (response.status === 429) {
                console.log('⏰ Rate limited - try again later');
            } else if (response.status === 503) {
                console.log('🚧 Model loading - try again in a few minutes');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the test
testHuggingFaceAPI();

