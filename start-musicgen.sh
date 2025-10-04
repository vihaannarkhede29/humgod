#!/bin/bash

# MusicGen Open Source Setup Script
echo "🎵 Setting up Open Source MusicGen..."

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

# Start the container
echo "🚀 Starting MusicGen server..."
docker-compose up -d

# Wait for the server to start
echo "⏳ Waiting for server to start..."
sleep 10

# Check if server is running
if curl -s http://localhost:8000 > /dev/null; then
    echo "✅ MusicGen server is running!"
    echo "🌐 Open http://localhost:8000 in your browser"
    echo "🎵 Your HumGod app can now use local MusicGen!"
else
    echo "❌ Server failed to start. Check logs with:"
    echo "   docker-compose logs"
fi

echo ""
echo "🎯 Next steps:"
echo "1. Update your musicgen-server.js to use http://localhost:8000"
echo "2. Test your app - it will now use free local MusicGen!"
echo "3. Stop the server with: docker-compose down"

