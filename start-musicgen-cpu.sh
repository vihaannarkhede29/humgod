#!/bin/bash

# MusicGen CPU-Only Setup Script
echo "🎵 Setting up MusicGen for CPU (no GPU required)..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   macOS: brew install docker"
    echo "   Or download from https://docker.com"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is installed and running"

# Create output directory
mkdir -p output models

# Pull the latest image
echo "📥 Pulling MusicGen Docker image..."
docker pull facebookresearch/audiocraft:latest

# Start the CPU-only container
echo "🚀 Starting MusicGen server (CPU mode)..."
echo "⚠️  Note: Generation will take 2-5 minutes per track without GPU"
docker-compose -f docker-compose-cpu.yml up -d

# Wait for the server to start
echo "⏳ Waiting for server to start (this may take a few minutes)..."
echo "💡 The model needs to download and load first time"

# Check if server is running (with longer timeout)
for i in {1..30}; do
    if curl -s http://localhost:8000 > /dev/null 2>&1; then
        echo "✅ MusicGen server is running!"
        echo "🌐 Open http://localhost:8000 in your browser"
        echo "🎵 Your HumGod app can now use local MusicGen!"
        echo ""
        echo "💡 Tips for CPU usage:"
        echo "   - Keep durations short (5-10 seconds)"
        echo "   - Generation takes 2-5 minutes per track"
        echo "   - Close other apps to free up CPU"
        break
    else
        echo "⏳ Still starting... ($i/30)"
        sleep 10
    fi
done

if ! curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "❌ Server failed to start. Check logs with:"
    echo "   docker-compose -f docker-compose-cpu.yml logs"
    echo ""
    echo "💡 Common issues:"
    echo "   - Not enough RAM (need 8GB+)"
    echo "   - Model download taking too long"
    echo "   - Port 8000 already in use"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Wait for the model to fully load (check http://localhost:8000)"
echo "2. Update your musicgen-server.js to use http://localhost:8000"
echo "3. Test with short durations first (5-8 seconds)"
echo "4. Stop the server with: docker-compose -f docker-compose-cpu.yml down"

