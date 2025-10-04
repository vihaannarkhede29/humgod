# 🆓 Open Source MusicGen Setup

## ✅ **Why Use Open Source MusicGen?**

- **💰 Completely FREE** - No API costs ever
- **🎛️ Full Control** - Customize everything
- **🚀 No Rate Limits** - Generate as much as you want
- **🔒 Privacy** - Your data stays on your machine
- **⚡ Fast** - No network delays

## 🚀 **Quick Setup (Docker - Easiest)**

### 1. **Install Docker**
```bash
# macOS
brew install docker

# Or download from https://docker.com
```

### 2. **Run MusicGen Container**
```bash
# Pull and run MusicGen
docker run -p 8000:8000 \
  -e CUDA_VISIBLE_DEVICES=0 \
  --gpus all \
  facebookresearch/audiocraft:latest
```

### 3. **Test It**
```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful piano melody", "duration": 10}'
```

---

## 🛠️ **Manual Setup (More Control)**

### 1. **Clone the Repository**
```bash
git clone https://github.com/facebookresearch/audiocraft.git
cd audiocraft
```

### 2. **Install Dependencies**
```bash
# Create virtual environment
python -m venv musicgen_env
source musicgen_env/bin/activate  # On Windows: musicgen_env\Scripts\activate

# Install requirements
pip install -e .
```

### 3. **Create Local Server**
```python
# Create musicgen_server.py
from audiocraft.models import MusicGen
import gradio as gr
import torch

# Load model
model = MusicGen.get_model('melody')

def generate_music(prompt, duration):
    model.set_generation_params(duration=duration)
    audio = model.generate([prompt])
    return audio[0].cpu().numpy()

# Create Gradio interface
interface = gr.Interface(
    fn=generate_music,
    inputs=[gr.Textbox(label="Prompt"), gr.Slider(5, 30, value=10)],
    outputs=gr.Audio(label="Generated Music"),
    title="MusicGen Server"
)

interface.launch(server_port=8000, share=False)
```

### 4. **Run the Server**
```bash
python musicgen_server.py
```

---

## 🔧 **Integration with Your App**

### Update Your `musicgen-server.js`:

```javascript
// Add this to your musicgen-server.js
const LOCAL_MUSICGEN_URL = 'http://localhost:8000/generate';

async function generateWithLocalMusicGen(audioData, instrument, duration) {
    try {
        const prompt = createEnhancedPrompt(instrument, style);
        
        const response = await fetch(LOCAL_MUSICGEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                duration: parseInt(duration) || 10,
                melody: audioData  // Your recorded audio
            })
        });
        
        if (response.ok) {
            const audioBuffer = await response.buffer();
            return {
                success: true,
                audioData: audioBuffer.toString('base64'),
                source: 'Local MusicGen'
            };
        }
        
        throw new Error(`Local MusicGen error: ${response.status}`);
        
    } catch (error) {
        console.error('Local MusicGen failed:', error);
        return { success: false, error: error.message };
    }
}
```

---

## 🐳 **Docker Compose Setup (Recommended)**

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  musicgen:
    image: facebookresearch/audiocraft:latest
    ports:
      - "8000:8000"
    environment:
      - CUDA_VISIBLE_DEVICES=0
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    volumes:
      - ./output:/app/output
```

Run with:
```bash
docker-compose up -d
```

---

## 🎯 **Hardware Requirements**

### **Minimum:**
- **CPU**: 8 cores
- **RAM**: 16GB
- **Storage**: 10GB free space

### **Recommended:**
- **GPU**: RTX 3070/4070 or better (8GB+ VRAM)
- **RAM**: 32GB
- **Storage**: 50GB free space

### **Without GPU:**
- **CPU**: 16+ cores
- **RAM**: 32GB+
- **Time**: 2-5 minutes per generation

---

## 🚀 **Deployment Options**

### **Option 1: Local Development**
- Run on your machine
- Access via `http://localhost:8000`
- Perfect for development

### **Option 2: Cloud Server**
- Deploy to AWS/GCP/Azure
- Use GPU instances
- Access from anywhere

### **Option 3: VPS with GPU**
- Rent a GPU VPS
- Run 24/7
- Share with your app

---

## 💡 **Pro Tips**

1. **Start with Docker** - Easiest setup
2. **Use GPU** - Much faster generation
3. **Batch Processing** - Generate multiple tracks at once
4. **Model Caching** - Models download on first use
5. **Memory Management** - Restart if memory gets full

---

## 🎵 **Ready to Rock!**

Once set up, you'll have:
- ✅ **Free music generation** forever
- ✅ **No API limits** or costs
- ✅ **Full control** over the model
- ✅ **Custom prompts** and parameters
- ✅ **Privacy** - everything stays local

This is the **best long-term solution** for your MusicGen app! 🎉

