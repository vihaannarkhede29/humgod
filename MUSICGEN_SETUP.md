# HumGod MusicGen Integration Setup

This guide will help you set up the complete MusicGen integration for your HumGod web app.

## 🎵 What's New

Your HumGod app now includes:
- **Real-time audio recording** with Web Audio API
- **MusicGen AI integration** for generating realistic instrument tracks
- **Instrument selection** (Piano, Guitar, Violin, Synth, Bass, **Drums**)
- **Drum-only mode** - When you select drums, it generates ONLY percussion instruments
- **Progress indicators** and smooth user experience
- **Server-side API** for secure MusicGen integration

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Hugging Face API Key

Get your free API key from [Hugging Face](https://huggingface.co/settings/tokens):

```bash
export HUGGING_FACE_API_KEY="your_api_key_here"
```

Or create a `.env` file:
```
HUGGING_FACE_API_KEY=your_api_key_here
```

### 3. Start the Servers

**Terminal 1 - MusicGen API Server:**
```bash
npm start
```

**Terminal 2 - HTTPS Web Server:**
```bash
python3 https_server.py
```

### 4. Open Your App

Visit: `https://localhost:3000`

## 🥁 Drum-Only Functionality

When you select **Drums** as your instrument:
- The system generates **ONLY percussion instruments**
- No melody, harmony, or other instruments
- Perfect for beatboxing to drum tracks
- Special UI indicator shows "DRUMS ONLY"

## 🎛️ How It Works

1. **Record**: Click "Start Recording" and hum or beatbox
2. **Select Instrument**: Choose your desired instrument (drums for percussion-only)
3. **Generate**: The AI processes your audio and creates realistic music
4. **Play**: Listen to your generated track

## 🔧 Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript with Web Audio API
- **Backend**: Node.js/Express server for MusicGen API
- **AI Model**: Facebook's MusicGen via Hugging Face API
- **Audio Format**: WAV for best quality

### Key Features
- **Real-time visualization** during recording
- **Progress tracking** during generation
- **Error handling** with user-friendly messages
- **Responsive design** for all devices
- **Secure API key** handling on server-side

## 🎯 Instrument-Specific Prompts

Each instrument has optimized prompts:
- **Piano**: Classical melody and harmony
- **Guitar**: Acoustic fingerpicking style
- **Violin**: Emotional, classical sound
- **Synth**: Modern electronic sounds
- **Bass**: Rhythmic bass lines
- **Drums**: **ONLY percussion** - kick, snare, hi-hats, cymbals

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to generate music"**
   - Check your Hugging Face API key
   - Ensure the server is running on port 3001
   - Check browser console for detailed errors

2. **Microphone not working**
   - Use HTTPS (required for microphone access)
   - Check browser permissions
   - Try refreshing the page

3. **Server connection failed**
   - Make sure `npm start` is running
   - Check if port 3001 is available
   - Verify the server URL in `musicgen-integration.js`

### Debug Mode

Enable detailed logging by opening browser console (F12) and looking for:
- Recording status messages
- API request/response logs
- Error details

## 📱 Mobile Support

The app works on mobile devices with:
- HTTPS connection
- Modern browser (Chrome, Safari, Firefox)
- Microphone permissions

## 🔒 Security Notes

- API keys are stored server-side only
- Audio data is processed securely
- No audio data is permanently stored
- All communication uses HTTPS

## 🎨 Customization

### Adding New Instruments

1. Update `INSTRUMENT_PROMPTS` in `musicgen-server.js`
2. Add instrument button in `index.html`
3. Update CSS styles in `styles.css`

### Modifying Prompts

Edit the prompts in `musicgen-server.js` to change how each instrument sounds:
```javascript
const INSTRUMENT_PROMPTS = {
    drums: 'Generate ONLY a drum track with kick, snare, hi-hats, and cymbals...'
};
```

## 🚀 Production Deployment

For production deployment:

1. **Environment Variables**:
   ```bash
   export NODE_ENV=production
   export HUGGING_FACE_API_KEY=your_production_key
   export PORT=3001
   ```

2. **HTTPS Certificate**: Use a real SSL certificate instead of self-signed

3. **Domain**: Update server URL in `musicgen-integration.js`

4. **Monitoring**: Add logging and error tracking

## 📊 Performance Tips

- **Audio Length**: Keep recordings under 30 seconds for faster processing
- **Quality**: Higher quality audio = better results
- **Network**: Stable internet connection required for API calls

## 🎵 Example Usage

1. **For Melodies**: Select Piano/Guitar, hum a tune
2. **For Beats**: Select Drums, beatbox your rhythm
3. **For Full Tracks**: Select any instrument, hum + beatbox together

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all servers are running
3. Test with a simple hum or beatbox first
4. Check your Hugging Face API key

---

**Happy Music Making! 🎵**
