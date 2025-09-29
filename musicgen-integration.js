// MusicGen Integration for HumGod
// Complete audio recording, processing, and MusicGen generation system

class MusicGenIntegration {
    constructor() {
        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recordedAudio = null;
        this.generatedAudio = null;
        this.isRecording = false;
        this.isPlaying = false;
        this.currentInstrument = 'piano';
        this.audioVisualizer = null;
        this.animationId = null;
        
        // MusicGen API configuration
        this.musicGenConfig = {
            serverUrl: '/api', // Vercel API endpoint
            apiUrl: 'https://api-inference.huggingface.co/models/facebook/musicgen-stereo-melody-large',
            apiKey: 'YOUR_HUGGING_FACE_API_KEY', // Replace with your actual API key
            model: 'facebook/musicgen-stereo-melody-large'
        };
        
        this.init();
    }

    async init() {
        try {
            // Initialize Web Audio API
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Initialize audio visualizer
            this.initAudioVisualizer();
            
            // Bind event listeners
            this.bindEventListeners();
            
            // Add user interaction handler to enable audio
            this.addUserInteractionHandler();
            
            console.log('MusicGen Integration initialized successfully');
        } catch (error) {
            console.error('Failed to initialize MusicGen Integration:', error);
            this.showError('Failed to initialize audio system. Please refresh the page.');
        }
    }

    bindEventListeners() {
        // Recording controls
        const recordBtn = document.getElementById('recordBtn');
        const stopBtn = document.getElementById('stopBtn');
        const playBtn = document.getElementById('playBtn');
        const demoBtn = document.getElementById('demoBtn');

        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.startRecording());
        }
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopRecording());
        }
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playGeneratedAudio());
        }
        if (demoBtn) {
            demoBtn.addEventListener('click', () => this.showDemoMode());
        }

        // Instrument selection
        this.bindInstrumentButtons();

        // Tempo control
        const tempoSlider = document.getElementById('tempoSlider');
        const tempoValue = document.getElementById('tempoValue');
        if (tempoSlider && tempoValue) {
            tempoSlider.addEventListener('input', (e) => {
                tempoValue.textContent = `${e.target.value} BPM`;
            });
        }
    }

    bindInstrumentButtons() {
        // Try to bind immediately
        this.attachInstrumentListeners();
        
        // Also try after a delay in case DOM isn't ready
        setTimeout(() => {
            this.attachInstrumentListeners();
        }, 100);
    }

    attachInstrumentListeners() {
        const instrumentBtns = document.querySelectorAll('.instrument-btn');
        console.log(`Found ${instrumentBtns.length} instrument buttons`);
        
        instrumentBtns.forEach((btn, index) => {
            // Remove existing listeners to avoid duplicates
            btn.removeEventListener('click', this.handleInstrumentClick);
            
            console.log(`Button ${index}:`, btn.dataset.instrument, btn);
            btn.addEventListener('click', this.handleInstrumentClick.bind(this));
        });
    }

    handleInstrumentClick(e) {
        e.preventDefault();
        const instrument = e.target.closest('.instrument-btn').dataset.instrument;
        console.log(`Clicked instrument: ${instrument}`);
        this.selectInstrument(instrument);
    }

    addUserInteractionHandler() {
        // Enable audio context on first user interaction
        const enableAudio = async () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                console.log('🎵 Enabling audio context on user interaction...');
                await this.audioContext.resume();
                console.log('✅ Audio context enabled');
            }
        };

        // Add click listeners to enable audio
        document.addEventListener('click', enableAudio, { once: true });
        document.addEventListener('touchstart', enableAudio, { once: true });
        document.addEventListener('keydown', enableAudio, { once: true });
    }

    async startRecording() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                } 
            });

            // Create MediaRecorder
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.audioChunks = [];
            this.isRecording = true;

            // Set up recording event handlers
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.processRecordedAudio();
            };

            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms

            // Update UI
            this.updateRecordingUI(true);
            this.showRecordingStatus('Recording... Speak or hum into your microphone', 'recording');
            this.startAudioVisualization(stream);

            console.log('Recording started');
        } catch (error) {
            console.error('Failed to start recording:', error);
            this.showError('Failed to access microphone. Please check permissions.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.updateRecordingUI(false);
            this.stopAudioVisualization();
            
            // Stop all tracks to release microphone
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            console.log('Recording stopped');
        }
    }

    async processRecordedAudio() {
        try {
            // Create blob from recorded chunks
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.recordedAudio = audioBlob;

            // Convert to WAV for better compatibility
            const wavBlob = await this.convertToWav(audioBlob);
            
            // Update UI
            this.updateProcessingUI(true);
            this.showRecordingStatus('Processing your recording...', 'processing');

            // Generate music with MusicGen
            await this.generateMusicWithMusicGen(wavBlob);

        } catch (error) {
            console.error('Failed to process recorded audio:', error);
            this.showError('Failed to process your recording. Please try again.');
        }
    }

    async convertToWav(audioBlob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const arrayBuffer = reader.result;
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                    
                    // Convert to WAV format
                    const wavBlob = this.audioBufferToWav(audioBuffer);
                    resolve(wavBlob);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsArrayBuffer(audioBlob);
        });
    }

    audioBufferToWav(buffer) {
        const length = buffer.length;
        const sampleRate = buffer.sampleRate;
        const numberOfChannels = buffer.numberOfChannels;
        const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
        const view = new DataView(arrayBuffer);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + length * numberOfChannels * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, length * numberOfChannels * 2, true);

        // Convert audio data
        let offset = 44;
        for (let i = 0; i < length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
                view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
                offset += 2;
            }
        }

        return new Blob([arrayBuffer], { type: 'audio/wav' });
    }

    async generateMusicWithMusicGen(audioBlob) {
        try {
            // Show progress
            this.updateProgress(0, 'Starting...');

            // Convert audio to base64 for server transmission
            const base64Audio = await this.audioBlobToBase64(audioBlob);
            
            this.updateProgress(30, 'Sending to MusicGen API...');

            // Create request payload
            const payload = {
                audioData: base64Audio,
                instrument: this.currentInstrument,
                duration: '10',
                style: 'classical'
            };

            // Make API request to our server
                const response = await fetch(`${this.musicGenConfig.serverUrl}/generate-music`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Server request failed: ${response.status}`);
            }

            this.updateProgress(70, 'Processing with MusicGen...');

            // Get the response
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to generate music');
            }

            this.updateProgress(90, 'Converting audio...');

            // Convert base64 back to blob
            const generatedBlob = this.base64ToBlob(result.audioData, 'audio/wav');
            this.generatedAudio = generatedBlob;
            
            // Debug: Log blob details
            console.log('Generated blob details:', {
                size: generatedBlob.size,
                type: generatedBlob.type,
                isMock: result.isMock
            });

            this.updateProgress(100, 'Complete!');
            
            // Update UI - give user time to see 100% completion
            setTimeout(async () => {
                this.updateProcessingUI(false);
                this.showRecordingStatus('Music generated successfully!', 'success');
                this.updatePlayButton(true);
                
                // Auto-play the generated audio
                console.log('🎵 Auto-playing generated audio...');
                try {
                    await this.playGeneratedAudio();
                } catch (error) {
                    console.warn('Auto-play failed, user can click play button:', error);
                    this.showMessage('Audio ready! Click the play button to listen.', 'info');
                }
                
                // Hide progress bar after a delay so user can see completion
                setTimeout(() => {
                    this.hideProgress();
                }, 2000);
            }, 1000);

            console.log('Music generated successfully');

        } catch (error) {
            console.error('Failed to generate music:', error);
            this.showError(`Failed to generate music: ${error.message}`);
            this.updateProcessingUI(false);
            this.hideProgress();
        }
    }

    // Helper function to convert audio blob to base64
    async audioBlobToBase64(audioBlob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]; // Remove data:audio/wav;base64, prefix
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(audioBlob);
        });
    }

    // Helper function to convert base64 to blob
    base64ToBlob(base64, mimeType) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mimeType });
    }

    // Test if an audio blob can be played
    testAudioBlob(blob) {
        try {
            const audio = new Audio();
            const url = URL.createObjectURL(blob);
            audio.src = url;
            
            // Check if the browser can handle this format
            const canPlay = audio.canPlayType(blob.type);
            URL.revokeObjectURL(url);
            
            return canPlay !== '';
        } catch (error) {
            console.warn('Error testing audio blob:', error);
            return false;
        }
    }

    // Fallback audio generation using Web Audio API
    tryFallbackAudio() {
        try {
            console.log('Creating fallback audio using Web Audio API...');
            
            // Create a simple sine wave using Web Audio API
            const sampleRate = 44100;
            const duration = 2; // 2 seconds
            const frequency = 440; // A4 note
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
            const data = buffer.getChannelData(0);
            
            // Generate sine wave
            for (let i = 0; i < data.length; i++) {
                data[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
            }
            
            // Create audio source
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            
            // Play the audio
            source.start();
            
            this.isPlaying = true;
            this.updatePlayButton(true);
            
            // Stop after duration
            setTimeout(() => {
                source.stop();
                this.isPlaying = false;
                this.updatePlayButton(false);
            }, duration * 1000);
            
            console.log('✅ Fallback audio playing successfully');
            
        } catch (error) {
            console.error('❌ Fallback audio failed:', error);
            this.showError('Failed to play generated audio. Please try again.');
            this.isPlaying = false;
            this.updatePlayButton(false);
        }
    }

    // Update progress bar
    updateProgress(percentage, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        const progressContainer = document.getElementById('progressContainer');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = text;
        }
        if (progressContainer) {
            progressContainer.style.display = 'block';
        }
    }

    // Hide progress bar
    hideProgress() {
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer) {
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 1000);
        }
    }

    createMusicGenPrompt() {
        const instrumentPrompts = {
            'piano': 'Generate a beautiful piano melody based on the provided audio input. Focus on the melody and harmony.',
            'guitar': 'Create an acoustic guitar arrangement that follows the melody and rhythm of the input audio.',
            'violin': 'Generate a violin melody that captures the emotional essence of the input audio.',
            'synth': 'Create a modern synthesizer track with electronic sounds based on the input audio.',
            'drums': 'Generate ONLY a drum track with kick, snare, hi-hats, and cymbals based on the beatboxing rhythm. NO other instruments.',
            'bass': 'Create a bass line that follows the rhythm and complements the melody of the input audio.'
        };

        return instrumentPrompts[this.currentInstrument] || instrumentPrompts['piano'];
    }

    async playGeneratedAudio() {
        if (!this.generatedAudio) {
            this.showError('No generated audio available. Please record and generate music first.');
            return;
        }

        try {
            if (this.isPlaying) {
                this.stopAudio();
                return;
            }

            console.log('🎵 Starting audio playback...');
            console.log('Generated audio blob:', this.generatedAudio);
            console.log('Audio blob size:', this.generatedAudio.size, 'bytes');
            console.log('Audio blob type:', this.generatedAudio.type);

            // Create audio element for playback
            const audioUrl = URL.createObjectURL(this.generatedAudio);
            const audio = new Audio();
            
            // Set audio properties
            audio.volume = 0.8;
            audio.preload = 'auto';
            
            // Add event listeners
            audio.addEventListener('loadstart', () => console.log('Audio load started'));
            audio.addEventListener('loadeddata', () => console.log('Audio data loaded'));
            audio.addEventListener('canplay', () => console.log('Audio can play'));
            audio.addEventListener('canplaythrough', () => console.log('Audio can play through'));
            
            audio.onended = () => {
                console.log('Audio playback ended');
                this.isPlaying = false;
                this.updatePlayButton(false);
                URL.revokeObjectURL(audioUrl);
            };

            audio.onerror = (error) => {
                console.error('Audio playback error:', error);
                console.error('Audio error details:', {
                    error: error,
                    src: audio.src,
                    networkState: audio.networkState,
                    readyState: audio.readyState,
                    errorCode: audio.error ? audio.error.code : 'no error code',
                    errorMessage: audio.error ? audio.error.message : 'no error message'
                });
                
                // Log the actual error object properties
                if (audio.error) {
                    console.error('Audio error object:', {
                        code: audio.error.code,
                        message: audio.error.message,
                        MEDIA_ERR_ABORTED: audio.error.MEDIA_ERR_ABORTED,
                        MEDIA_ERR_NETWORK: audio.error.MEDIA_ERR_NETWORK,
                        MEDIA_ERR_DECODE: audio.error.MEDIA_ERR_DECODE,
                        MEDIA_ERR_SRC_NOT_SUPPORTED: audio.error.MEDIA_ERR_SRC_NOT_SUPPORTED
                    });
                }
                
                // Try fallback: create a simple test audio
                console.log('Trying fallback audio generation...');
                this.tryFallbackAudio();
            };

            // Ensure audio context is resumed for user interaction
            if (this.audioContext && this.audioContext.state === 'suspended') {
                console.log('Resuming audio context...');
                await this.audioContext.resume();
            }
            
            // Set the source and wait for it to load
            audio.src = audioUrl;
            
            // Wait for audio to be ready
            console.log('Waiting for audio to load...');
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Audio load timeout'));
                }, 10000); // 10 second timeout
                
                audio.addEventListener('canplay', () => {
                    clearTimeout(timeout);
                    console.log('Audio is ready to play');
                    resolve();
                }, { once: true });
                
                audio.addEventListener('error', (error) => {
                    clearTimeout(timeout);
                    console.error('Audio load error:', error);
                    reject(error);
                }, { once: true });
            });
            
            // Try to play the audio
            console.log('Attempting to play audio...', audio);
            console.log('Audio ready state:', audio.readyState);
            console.log('Audio network state:', audio.networkState);
            
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                await playPromise;
            }
            
            this.isPlaying = true;
            this.updatePlayButton(true);

            console.log('✅ Playing generated audio successfully');

        } catch (error) {
            console.error('❌ Failed to play audio:', error);
            this.showError(`Failed to play generated audio: ${error.message}`);
        }
    }

    stopAudio() {
        // Stop any currently playing audio
        const audioElements = document.querySelectorAll('audio');
        audioElements.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        
        this.isPlaying = false;
        this.updatePlayButton(false);
    }

    selectInstrument(instrument) {
        console.log(`🎵 Selecting instrument: ${instrument} (was: ${this.currentInstrument})`);
        this.currentInstrument = instrument;
        
        // Update UI
        document.querySelectorAll('.instrument-btn').forEach(btn => {
            btn.classList.remove('active', 'drum-only');
        });
        
        const selectedBtn = document.querySelector(`[data-instrument="${instrument}"]`);
        selectedBtn.classList.add('active');
        
        // Add special styling for drums to emphasize drums-only output
        if (instrument === 'drums') {
            selectedBtn.classList.add('drum-only');
        }
        
        console.log(`Selected instrument: ${instrument}`);
        
        // Show special message for drums
        if (instrument === 'drums') {
            this.showMessage('Drum mode selected - Only percussion instruments will be generated!', 'info');
        }
    }

    initAudioVisualizer() {
        const canvas = document.getElementById('waveformCanvas');
        if (!canvas) return;

        this.audioVisualizer = {
            canvas: canvas,
            ctx: canvas.getContext('2d'),
            width: canvas.width,
            height: canvas.height
        };
    }

    startAudioVisualization(stream) {
        if (!this.audioVisualizer) return;

        const analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!this.isRecording) return;

            this.animationId = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            const ctx = this.audioVisualizer.ctx;
            const width = this.audioVisualizer.width;
            const height = this.audioVisualizer.height;

            // Clear canvas
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, width, height);

            // Draw waveform
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ff6b35';
            ctx.beginPath();

            const sliceWidth = width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 255.0;
                const y = (v * height) / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }

                x += sliceWidth;
            }

            ctx.lineTo(width, height / 2);
            ctx.stroke();
        };

        draw();
    }

    stopAudioVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Clear canvas
        if (this.audioVisualizer) {
            const ctx = this.audioVisualizer.ctx;
            const width = this.audioVisualizer.width;
            const height = this.audioVisualizer.height;
            
            ctx.clearRect(0, 0, width, height);
        }
    }

    updateRecordingUI(isRecording) {
        const recordBtn = document.getElementById('recordBtn');
        const stopBtn = document.getElementById('stopBtn');
        const playBtn = document.getElementById('playBtn');

        if (recordBtn) {
            recordBtn.disabled = isRecording;
            recordBtn.classList.toggle('recording', isRecording);
        }
        if (stopBtn) {
            stopBtn.disabled = !isRecording;
        }
        if (playBtn) {
            playBtn.disabled = true;
        }
    }

    updateProcessingUI(isProcessing) {
        const recordBtn = document.getElementById('recordBtn');
        const stopBtn = document.getElementById('stopBtn');
        const playBtn = document.getElementById('playBtn');

        if (recordBtn) {
            recordBtn.disabled = isProcessing;
        }
        if (stopBtn) {
            stopBtn.disabled = isProcessing;
        }
        if (playBtn) {
            playBtn.disabled = isProcessing;
        }
    }

    updatePlayButton(isPlaying) {
        const playBtn = document.getElementById('playBtn');
        if (!playBtn) return;

        const icon = playBtn.querySelector('i');
        const text = playBtn.querySelector('span');

        if (isPlaying) {
            icon.className = 'fas fa-stop';
            text.textContent = 'Stop Playing';
        } else {
            icon.className = 'fas fa-play';
            text.textContent = 'Play Converted';
        }
    }

    showRecordingStatus(message, type = 'default') {
        const statusElement = document.getElementById('recordingStatus');
        if (!statusElement) return;

        const statusText = statusElement.querySelector('span');
        const statusIndicator = statusElement.querySelector('.status-indicator');

        if (statusText) {
            statusText.textContent = message;
        }

        if (statusIndicator) {
            statusIndicator.className = `status-indicator ${type}`;
        }
    }

    showProgress(percentage) {
        // Create or update progress bar
        let progressBar = document.getElementById('progressBar');
        if (!progressBar) {
            progressBar = document.createElement('div');
            progressBar.id = 'progressBar';
            progressBar.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 10000;
                text-align: center;
            `;
            document.body.appendChild(progressBar);
        }

        progressBar.innerHTML = `
            <div style="margin-bottom: 10px;">Generating music... ${Math.round(percentage)}%</div>
            <div style="width: 200px; height: 4px; background: #333; border-radius: 2px; overflow: hidden;">
                <div style="width: ${percentage}%; height: 100%; background: #ff6b35; transition: width 0.3s ease;"></div>
            </div>
        `;

        if (percentage >= 100) {
            setTimeout(() => {
                if (progressBar.parentNode) {
                    progressBar.parentNode.removeChild(progressBar);
                }
            }, 1000);
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        // Create message container if it doesn't exist
        let messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'messageContainer';
            messageContainer.className = 'message-container';
            document.body.appendChild(messageContainer);
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Add to container
        messageContainer.appendChild(messageDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    showDemoMode() {
        // Show demo with sample audio
        this.showRecordingStatus('Demo mode - Click record to try the system!', 'demo');
        
        // You can add demo functionality here
        console.log('Demo mode activated');
    }
}

// Initialize MusicGen Integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.musicGenIntegration = new MusicGenIntegration();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MusicGenIntegration;
}
