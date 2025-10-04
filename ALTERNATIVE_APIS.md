# 🎵 MusicGen API Alternatives

## 1. **Hugging Face API** (Recommended - Free Tier)

### ✅ **Pros**
- **Free tier available** (1000 requests/month)
- Same MusicGen model as Replicate
- Easy setup - just API key
- Reliable and well-documented

### 🔧 **Setup**
```bash
# 1. Get API key from https://huggingface.co/settings/tokens
# 2. Set environment variable
export HUGGING_FACE_API_KEY="hf_your_token_here"

# 3. Update your server
node musicgen-server.js
```

### 💰 **Cost**
- **Free**: 1000 requests/month
- **Paid**: $0.001 per request after free tier

---

## 2. **Local MusicGen Deployment** (Completely Free)

### ✅ **Pros**
- **$0 ongoing cost** after setup
- No API limits
- Full control over the model
- Works offline

### 🔧 **Setup (Docker)**
```bash
# 1. Install Docker
# 2. Run MusicGen container
docker run -p 8000:8000 \
  -e CUDA_VISIBLE_DEVICES=0 \
  facebook/musicgen:latest

# 3. Update your server URL
# Change apiUrl to: http://localhost:8000/generate
```

### 🔧 **Setup (Python)**
```bash
# 1. Install dependencies
pip install musicgen transformers torch

# 2. Run local server
python -c "
from musicgen import MusicGen
import gradio as gr

model = MusicGen.get_model('melody')
def generate(prompt, duration):
    return model.generate([prompt], duration=duration)

gr.Interface(generate, 
    inputs=['text', 'number'], 
    outputs='audio').launch(server_port=8000)
"
```

### 💰 **Cost**
- **Free** (after initial setup)
- Requires GPU (8GB+ VRAM recommended)

---

## 3. **Suno AI** (Best for Full Songs)

### ✅ **Pros**
- Creates **full songs with vocals**
- High quality output
- User-friendly interface
- Good for commercial use

### 🔧 **Setup**
```bash
# 1. Sign up at https://suno.ai
# 2. Get API key (if available)
# 3. Set environment variable
export SUNO_API_KEY="your_suno_key_here"
```

### 💰 **Cost**
- **Free tier**: Limited generations
- **Paid plans**: $10-30/month for unlimited

---

## 4. **Udio** (Suno Competitor)

### ✅ **Pros**
- Similar to Suno
- Good quality
- Active development

### 🔧 **Setup**
```bash
# 1. Sign up at https://udio.com
# 2. Get API key
# 3. Set environment variable
export UDIO_API_KEY="your_udio_key_here"
```

### 💰 **Cost**
- **Free tier**: Limited generations
- **Paid plans**: Similar to Suno

---

## 5. **Google Magenta** (Open Source)

### ✅ **Pros**
- **Completely free**
- Multiple models available
- Good for experimentation
- Well-documented

### 🔧 **Setup**
```bash
# 1. Install Magenta
pip install magenta

# 2. Use in your code
from magenta.models.music_vae import configs
from magenta.models.music_vae.trained_model import TrainedModel

# 3. Generate music
model = TrainedModel(configs.CONFIG_MAP['hierdec-trio_16bar'])
```

### 💰 **Cost**
- **Free** (open source)

---

## 🚀 **Quick Implementation**

### Update your `musicgen-server.js`:

```javascript
// Add at the top
const MusicGenAlternatives = require('./musicgen-alternatives');
const alternatives = new MusicGenAlternatives();

// Replace your current generation logic with:
app.post('/generate-music', upload.single('audio'), async (req, res) => {
    try {
        const { instrument = 'piano', duration = '10' } = req.body;
        const audioData = req.file.buffer.toString('base64');
        
        // Try all providers automatically
        const result = await alternatives.generateMusic(audioData, instrument, duration);
        
        res.json({
            success: true,
            audioData: result.audioData,
            provider: result.provider,
            cost: result.cost,
            isMock: result.isMock || false
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

---

## 🎯 **Recommendation**

**For immediate use**: **Hugging Face API** (free tier)
**For long-term**: **Local deployment** (if you have a GPU)
**For full songs**: **Suno AI** (if you need vocals)

---

## 🔄 **Easy Switching**

Your app can automatically try multiple providers in order:
1. Hugging Face (if API key available)
2. Local MusicGen (if running)
3. Suno AI (if API key available)
4. Mock audio (fallback)

This gives you the best of all worlds! 🎵

