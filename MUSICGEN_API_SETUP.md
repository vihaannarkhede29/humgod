# MusicGen API Setup Guide

## Current Status
The app is currently using **realistic mock audio** that sounds like different instruments. This provides a great demo experience while we set up the real MusicGen API.

## To Use Real MusicGen API

### Option 1: Replicate API (Recommended)
1. **Get API Key**: Visit [https://replicate.com/account/api-tokens](https://replicate.com/account/api-tokens)
2. **Create Account**: Sign up for a Replicate account
3. **Generate Token**: Create a new API token
4. **Set Environment Variable**: In Vercel dashboard:
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add `REPLICATE_API_TOKEN` with your token value
   - Redeploy the application

### Option 2: Hugging Face API
1. **Get API Key**: Visit [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. **Create Token**: Generate a new access token
3. **Set Environment Variable**: In Vercel dashboard:
   - Add `HUGGING_FACE_API_KEY` with your token value
   - Redeploy the application

### Option 3: Local MusicGen Deployment
1. **Install MusicGen**: Follow the official MusicGen installation guide
2. **Run Local Server**: Start a local MusicGen server
3. **Update API URL**: Modify the server URL in the code

## What Happens After Setup
Once you add a real API key:
- The app will automatically detect the API key
- Mock audio will be replaced with real AI-generated music
- You'll get actual MusicGen output based on your recordings
- The quality will be significantly better than the current mock audio

## Current Mock Audio Features
Even without the real API, the current system provides:
- ✅ **Realistic instrument sounds** (piano, guitar, violin, synth, drums, bass)
- ✅ **Proper audio envelopes** (attack, decay, sustain, release)
- ✅ **Harmonic content** and vibrato effects
- ✅ **Different frequencies** for each instrument
- ✅ **Reverb effects** for realism

## Testing
1. Visit: `https://humgod.vercel.app/try-it-now.html`
2. Record some audio
3. Select different instruments
4. Listen to the realistic mock audio
5. Once you add an API key, you'll get real AI-generated music!

## Support
If you need help setting up the API:
- Check the console logs for detailed error messages
- Ensure your API key has the correct permissions
- Verify the environment variable is set correctly in Vercel
