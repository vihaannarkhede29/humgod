#!/usr/bin/env python3
"""
Local MusicGen Setup Script
Run this to set up MusicGen locally for free music generation
"""

import subprocess
import sys
import os
import gradio as gr
from pathlib import Path

def install_dependencies():
    """Install required Python packages"""
    print("🔧 Installing dependencies...")
    
    packages = [
        "torch",
        "torchaudio", 
        "transformers",
        "musicgen",
        "gradio",
        "numpy",
        "scipy"
    ]
    
    for package in packages:
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")
            return False
    
    return True

def create_musicgen_server():
    """Create a local MusicGen server"""
    server_code = '''
import gradio as gr
import torch
from musicgen import MusicGen
import tempfile
import base64
import io

# Load the model
print("🎵 Loading MusicGen model...")
model = MusicGen.get_model('melody')
print("✅ Model loaded successfully!")

def generate_music(prompt, duration, melody_audio=None):
    """Generate music based on prompt and optional melody"""
    try:
        # Set generation parameters
        model.set_generation_params(duration=duration)
        
        if melody_audio is not None:
            # Generate with melody conditioning
            audio_values = model.generate_with_chroma([prompt], melody_audio, sample_rate=32000)
        else:
            # Generate without melody
            audio_values = model.generate([prompt], sample_rate=32000)
        
        # Convert to WAV format
        import scipy.io.wavfile as wavfile
        import numpy as np
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            wavfile.write(tmp_file.name, 32000, audio_values[0].cpu().numpy())
            
            # Read and convert to base64
            with open(tmp_file.name, 'rb') as f:
                audio_data = f.read()
                base64_audio = base64.b64encode(audio_data).decode('utf-8')
            
            # Clean up
            os.unlink(tmp_file.name)
            
        return base64_audio
        
    except Exception as e:
        print(f"Error generating music: {e}")
        return None

def create_interface():
    """Create Gradio interface"""
    with gr.Blocks(title="Local MusicGen Server") as interface:
        gr.Markdown("# 🎵 Local MusicGen Server")
        gr.Markdown("Generate music using Facebook's MusicGen model locally!")
        
        with gr.Row():
            with gr.Column():
                prompt = gr.Textbox(
                    label="Music Prompt", 
                    placeholder="A beautiful piano melody in C major",
                    value="A beautiful piano melody with classical harmony"
                )
                duration = gr.Slider(
                    minimum=5, 
                    maximum=30, 
                    value=10, 
                    step=1,
                    label="Duration (seconds)"
                )
                melody_audio = gr.Audio(
                    label="Melody Audio (optional)",
                    type="numpy"
                )
                generate_btn = gr.Button("🎵 Generate Music", variant="primary")
            
            with gr.Column():
                output_audio = gr.Audio(label="Generated Music")
                download_btn = gr.DownloadButton("📥 Download", visible=False)
        
        def process_generation(prompt, duration, melody):
            if not prompt.strip():
                return None, gr.DownloadButton(visible=False)
            
            print(f"Generating music: '{prompt}' for {duration} seconds")
            base64_audio = generate_music(prompt, duration, melody)
            
            if base64_audio:
                # Convert base64 back to audio for Gradio
                audio_bytes = base64.b64decode(base64_audio)
                with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
                    tmp_file.write(audio_bytes)
                    return tmp_file.name, gr.DownloadButton(visible=True)
            else:
                return None, gr.DownloadButton(visible=False)
        
        generate_btn.click(
            process_generation,
            inputs=[prompt, duration, melody_audio],
            outputs=[output_audio, download_btn]
        )
    
    return interface

if __name__ == "__main__":
    print("🚀 Starting Local MusicGen Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("🛑 Press Ctrl+C to stop the server")
    
    interface = create_interface()
    interface.launch(
        server_name="0.0.0.0",
        server_port=8000,
        share=False,
        show_error=True
    )
'''
    
    with open("local_musicgen_server.py", "w") as f:
        f.write(server_code)
    
    print("✅ Created local_musicgen_server.py")

def create_docker_setup():
    """Create Docker setup for easier deployment"""
    dockerfile = '''
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    ffmpeg \\
    libsndfile1 \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code
COPY local_musicgen_server.py .

# Expose port
EXPOSE 8000

# Run the server
CMD ["python", "local_musicgen_server.py"]
'''
    
    requirements = '''
torch>=2.0.0
torchaudio>=2.0.0
transformers>=4.30.0
musicgen>=0.1.0
gradio>=3.40.0
numpy>=1.24.0
scipy>=1.10.0
'''
    
    with open("Dockerfile", "w") as f:
        f.write(dockerfile)
    
    with open("requirements.txt", "w") as f:
        f.write(requirements)
    
    print("✅ Created Dockerfile and requirements.txt")

def main():
    """Main setup function"""
    print("🎵 Setting up Local MusicGen Server")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Create server files
    create_musicgen_server()
    create_docker_setup()
    
    print("\n🎉 Setup complete!")
    print("\n📋 Next steps:")
    print("1. Run: python local_musicgen_server.py")
    print("2. Open: http://localhost:8000")
    print("3. Update your HumGod server to use: http://localhost:8000")
    
    print("\n🐳 Or use Docker:")
    print("1. docker build -t local-musicgen .")
    print("2. docker run -p 8000:8000 local-musicgen")
    
    print("\n💡 This gives you FREE music generation with no API limits!")

if __name__ == "__main__":
    main()

