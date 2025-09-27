// HumGod Landing Page JavaScript
// Interactive elements, animations, and smooth functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initScrollEffects();
    initTestimonials();
    initFormTabs();
    initAnimations();
    initSmoothScrolling();
    initParallaxEffects();
    initMusicCreation();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        }
    });
}

// Scroll effects and animations
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for scroll animations
    const animatedElements = document.querySelectorAll('.step, .feature-card, .pricing-card, .testimonial');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

// Testimonials carousel
function initTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial');
    const dots = document.querySelectorAll('.dot');
    let currentTestimonial = 0;

    function showTestimonial(index) {
        // Hide all testimonials
        testimonials.forEach(testimonial => {
            testimonial.classList.remove('active');
        });

        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Show current testimonial
        if (testimonials[index]) {
            testimonials[index].classList.add('active');
        }

        // Add active class to current dot
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    }

    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            currentTestimonial = index;
            showTestimonial(currentTestimonial);
        });
    });

    // Auto-rotate testimonials
    setInterval(function() {
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
        showTestimonial(currentTestimonial);
    }, 5000);
}

// Form tabs functionality
function initFormTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.form');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            // Remove active class from all tabs and forms
            tabBtns.forEach(tab => tab.classList.remove('active'));
            forms.forEach(form => form.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');

            // Show corresponding form
            const targetForm = document.getElementById(targetTab + 'Form');
            if (targetForm) {
                targetForm.classList.add('active');
            }
        });
    });

    // Form submission handlers
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission('signup');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleFormSubmission('login');
        });
    }
}

// Form submission handler
function handleFormSubmission(type) {
    const form = document.getElementById(type + 'Form');
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    // Basic validation
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ff4444';
            setTimeout(() => {
                input.style.borderColor = '';
            }, 3000);
        }
    });

    if (isValid) {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
            submitBtn.style.background = '#4CAF50';
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
                form.reset();
            }, 2000);
        }, 2000);
    }
}

// General animations
function initAnimations() {
    // Button hover effects
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.02)';
        });

        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Card hover effects
    const cards = document.querySelectorAll('.feature-card, .pricing-card, .step');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Floating notes animation
    const notes = document.querySelectorAll('.note');
    notes.forEach((note, index) => {
        note.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-30px) rotate(15deg) scale(1.2)';
            this.style.color = '#ff8c5a';
        });

        note.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.color = '';
        });
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Hero CTA buttons
    const heroButtons = document.querySelectorAll('.hero-buttons .btn');
    heroButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.textContent.includes('Start Creating')) {
                // Scroll to signup section
                const signupSection = document.querySelector('#signup');
                if (signupSection) {
                    signupSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (this.textContent.includes('Sign Up')) {
                // Scroll to signup section
                const signupSection = document.querySelector('#signup');
                if (signupSection) {
                    signupSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Parallax effects
function initParallaxEffects() {
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.wave, .note');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Loading animation for page
window.addEventListener('load', function() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in-out';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape') {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    }
});

// Intersection Observer for scroll-triggered animations
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
});

// Observe elements for animation
document.querySelectorAll('.step, .feature-card, .pricing-card').forEach(el => {
    scrollObserver.observe(el);
});

// Add CSS for animation classes
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Performance optimization: Throttle scroll events
const throttledScrollHandler = debounce(function() {
    // Handle scroll events here if needed
}, 16); // ~60fps

window.addEventListener('scroll', throttledScrollHandler);

// Add ripple effect to buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Initialize ripple effects
addRippleEffect();

// Add CSS for ripple effect
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Console welcome message
console.log(`
🎵 Welcome to HumGod! 🎵
Transform your musical ideas into reality with AI.
Built with ❤️ for musicians everywhere.
`);

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Service worker will be added in future updates
        console.log('Service Worker support detected');
    });
}

// ========================================
// MUSIC CREATION FUNCTIONALITY
// ========================================

class HumGodAudioProcessor {
    constructor() {
        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.recordedAudio = null;
        this.audioBuffer = null;
        this.detectedNotes = [];
        this.detectedPercussion = [];
        this.playbackEngine = null;
        this.visualizer = null;
        
        // Tone.js will be initialized when needed
        this.toneInitialized = false;
    }

    async initializeTone() {
        try {
            // Start Tone.js context only when needed
            if (Tone.context.state === 'suspended') {
                await Tone.start();
            }
            console.log('Tone.js initialized successfully');
            
            // Initialize playback engine
            this.playbackEngine = new PlaybackEngine();
            
            // Initialize visualizer
            try {
                this.visualizer = new AudioVisualizer('waveformCanvas');
            } catch (error) {
                console.warn('Visualizer initialization failed:', error);
                this.visualizer = null;
            }
            
        } catch (error) {
            console.error('Failed to initialize Tone.js:', error);
            this.showError('Failed to initialize audio engine. Please refresh the page.');
        }
    }

    async startRecording() {
        try {
            // Initialize Tone.js if not already done
            if (!this.toneInitialized) {
                await this.initializeTone();
                this.toneInitialized = true;
            }
            
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                } 
            });

        // Create audio context (will be resumed after user gesture)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Resume audio context after user gesture
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
            
            // Create media recorder
            this.mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.processRecording();
            };

            // Start recording
            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            
            // Start visualizer
            if (this.visualizer) {
                this.visualizer.startVisualization(stream);
            }
            
            this.updateUI('recording');
            
        } catch (error) {
            console.error('Error starting recording:', error);
            this.showError('Failed to access microphone. Please check permissions.');
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            
        // Stop visualizer
        if (this.visualizer) {
            this.visualizer.stopVisualization();
        }
            
            this.updateUI('processing');
        }
    }

    async processRecording() {
        try {
            // Create audio blob
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.recordedAudio = audioBlob;
            
            // Convert to AudioBuffer
            const arrayBuffer = await audioBlob.arrayBuffer();
            this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            // Process audio for pitch and rhythm detection
            await this.analyzeAudio();
            
            this.updateUI('completed');
            
        } catch (error) {
            console.error('Error processing recording:', error);
            this.showError('Failed to process audio. Please try again.');
        }
    }

    async analyzeAudio() {
        try {
            // Extract audio data
            const audioData = this.audioBuffer.getChannelData(0);
            const sampleRate = this.audioBuffer.sampleRate;
            const duration = this.audioBuffer.duration;
            
            // Detect pitch (melody)
            this.detectedNotes = await this.detectPitch(audioData, sampleRate, duration);
            
            // Detect percussion
            this.detectedPercussion = await this.detectPercussion(audioData, sampleRate, duration);
            
            // Display results
            this.displayResults();
            
            // Enable playback
            document.getElementById('playBtn').disabled = false;
            document.getElementById('instrumentControls').style.display = 'block';
            
        } catch (error) {
            console.error('Error analyzing audio:', error);
            this.showError('Failed to analyze audio. Please try again.');
        }
    }

    async detectPitch(audioData, sampleRate, duration) {
        const notes = [];
        const windowSize = 2048;
        const hopSize = 512;
        const threshold = 0.01;
        
        // Use Web Workers for heavy computation if available
        if (window.Worker && audioData.length > 100000) {
            return this.detectPitchWithWorker(audioData, sampleRate, duration);
        }
        
        // Process in chunks to avoid blocking the main thread
        const chunkSize = 10000;
        for (let chunkStart = 0; chunkStart < audioData.length - windowSize; chunkStart += chunkSize) {
            const chunkEnd = Math.min(chunkStart + chunkSize, audioData.length - windowSize);
            
            for (let i = chunkStart; i < chunkEnd; i += hopSize) {
                const window = audioData.slice(i, i + windowSize);
                const rms = this.calculateRMS(window);
                
                if (rms > threshold) {
                    const frequency = this.detectFrequency(window, sampleRate);
                    if (frequency > 80 && frequency < 2000) { // Human voice range
                        const midiNote = this.frequencyToMidi(frequency);
                        const startTime = i / sampleRate;
                        const noteDuration = this.estimateNoteDuration(audioData, i, sampleRate);
                        
                        notes.push({
                            midi: midiNote,
                            frequency: frequency,
                            startTime: startTime,
                            duration: noteDuration,
                            velocity: Math.min(rms * 10, 1)
                        });
                    }
                }
            }
            
            // Yield control to prevent blocking
            if (chunkStart % (chunkSize * 5) === 0) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }
        
        // Smooth and merge overlapping notes
        return this.smoothNotes(notes);
    }

    async detectPercussion(audioData, sampleRate, duration) {
        const percussion = [];
        const windowSize = 1024;
        const hopSize = 256;
        const threshold = 0.05;
        
        for (let i = 0; i < audioData.length - windowSize; i += hopSize) {
            const window = audioData.slice(i, i + windowSize);
            const energy = this.calculateEnergy(window);
            
            if (energy > threshold) {
                const startTime = i / sampleRate;
                const type = this.classifyPercussion(window, sampleRate);
                
                percussion.push({
                    type: type,
                    startTime: startTime,
                    velocity: Math.min(energy * 5, 1)
                });
            }
        }
        
        return this.filterPercussion(percussion);
    }

    detectFrequency(window, sampleRate) {
        // YIN pitch detection algorithm
        const yinThreshold = 0.1;
        const bufferSize = window.length;
        const yinBuffer = new Float32Array(Math.floor(bufferSize / 2));
        
        // Calculate difference function
        for (let tau = 0; tau < yinBuffer.length; tau++) {
            yinBuffer[tau] = 0;
            for (let i = 0; i < bufferSize - tau; i++) {
                const delta = window[i] - window[i + tau];
                yinBuffer[tau] += delta * delta;
            }
        }
        
        // Calculate cumulative mean normalized difference function
        yinBuffer[0] = 1;
        let runningSum = 0;
        for (let tau = 1; tau < yinBuffer.length; tau++) {
            runningSum += yinBuffer[tau];
            yinBuffer[tau] *= tau / runningSum;
        }
        
        // Find first minimum below threshold
        let tau = 2;
        while (tau < yinBuffer.length) {
            if (yinBuffer[tau] < yinThreshold) {
                while (tau + 1 < yinBuffer.length && yinBuffer[tau + 1] < yinBuffer[tau]) {
                    tau++;
                }
                return sampleRate / tau;
            }
            tau++;
        }
        
        return 0;
    }

    classifyPercussion(window, sampleRate) {
        const energy = this.calculateEnergy(window);
        const spectralCentroid = this.calculateSpectralCentroid(window, sampleRate);
        
        // Simple classification based on energy and spectral characteristics
        if (energy > 0.1 && spectralCentroid < 1000) {
            return 'kick';
        } else if (energy > 0.05 && spectralCentroid > 2000) {
            return 'hihat';
        } else if (energy > 0.08) {
            return 'snare';
        }
        
        return 'unknown';
    }

    calculateRMS(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    calculateEnergy(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += Math.abs(buffer[i]);
        }
        return sum / buffer.length;
    }

    calculateSpectralCentroid(buffer, sampleRate) {
        const fft = this.fft(buffer);
        let weightedSum = 0;
        let magnitudeSum = 0;
        
        for (let i = 0; i < fft.length / 2; i++) {
            const frequency = (i * sampleRate) / fft.length;
            const magnitude = Math.sqrt(fft[i * 2] * fft[i * 2] + fft[i * 2 + 1] * fft[i * 2 + 1]);
            weightedSum += frequency * magnitude;
            magnitudeSum += magnitude;
        }
        
        return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    }

    fft(buffer) {
        // Simple FFT implementation
        const N = buffer.length;
        const result = new Float32Array(N * 2);
        
        for (let i = 0; i < N; i++) {
            result[i * 2] = buffer[i];
            result[i * 2 + 1] = 0;
        }
        
        // Cooley-Tukey FFT
        this.fftRecursive(result, N);
        return result;
    }

    fftRecursive(buffer, N) {
        if (N <= 1) return;
        
        const even = new Float32Array(N / 2 * 2);
        const odd = new Float32Array(N / 2 * 2);
        
        for (let i = 0; i < N / 2; i++) {
            even[i * 2] = buffer[i * 2];
            even[i * 2 + 1] = buffer[i * 2 + 1];
            odd[i * 2] = buffer[(i + N / 2) * 2];
            odd[i * 2 + 1] = buffer[(i + N / 2) * 2 + 1];
        }
        
        this.fftRecursive(even, N / 2);
        this.fftRecursive(odd, N / 2);
        
        for (let k = 0; k < N / 2; k++) {
            const angle = -2 * Math.PI * k / N;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            
            const tReal = cos * odd[k * 2] - sin * odd[k * 2 + 1];
            const tImag = cos * odd[k * 2 + 1] + sin * odd[k * 2];
            
            buffer[k * 2] = even[k * 2] + tReal;
            buffer[k * 2 + 1] = even[k * 2 + 1] + tImag;
            buffer[(k + N / 2) * 2] = even[k * 2] - tReal;
            buffer[(k + N / 2) * 2 + 1] = even[k * 2 + 1] - tImag;
        }
    }

    frequencyToMidi(frequency) {
        return 12 * Math.log2(frequency / 440) + 69;
    }

    midiToFrequency(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    estimateNoteDuration(audioData, startIndex, sampleRate) {
        const threshold = 0.01;
        let duration = 0;
        
        for (let i = startIndex; i < audioData.length; i += 256) {
            const window = audioData.slice(i, i + 256);
            const rms = this.calculateRMS(window);
            
            if (rms < threshold) {
                duration = (i - startIndex) / sampleRate;
                break;
            }
        }
        
        return Math.max(duration, 0.1); // Minimum duration
    }

    smoothNotes(notes) {
        // Merge overlapping notes and smooth pitch variations
        const smoothed = [];
        let currentNote = null;
        
        for (const note of notes) {
            if (!currentNote || note.startTime > currentNote.startTime + currentNote.duration) {
                if (currentNote) smoothed.push(currentNote);
                currentNote = { ...note };
            } else {
                // Merge with current note
                currentNote.duration = Math.max(currentNote.duration, 
                    note.startTime + note.duration - currentNote.startTime);
                currentNote.velocity = Math.max(currentNote.velocity, note.velocity);
            }
        }
        
        if (currentNote) smoothed.push(currentNote);
        return smoothed;
    }

    filterPercussion(percussion) {
        // Remove duplicate hits that are too close together
        const filtered = [];
        const minInterval = 0.1; // 100ms minimum between hits
        
        for (const hit of percussion) {
            const lastHit = filtered[filtered.length - 1];
            if (!lastHit || hit.startTime - lastHit.startTime > minInterval) {
                filtered.push(hit);
            }
        }
        
        return filtered;
    }

    displayResults() {
        const notesList = document.getElementById('notesList');
        const percussionList = document.getElementById('percussionList');
        
        // Clear previous results
        notesList.innerHTML = '';
        percussionList.innerHTML = '';
        
        // Display notes
        this.detectedNotes.forEach((note, index) => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item';
            noteElement.innerHTML = `
                <div class="note-info">
                    <strong>Note ${index + 1}</strong><br>
                    MIDI: ${Math.round(note.midi)} (${Math.round(note.frequency)}Hz)
                </div>
                <div class="note-timing">
                    ${note.startTime.toFixed(2)}s<br>
                    ${note.duration.toFixed(2)}s
                </div>
            `;
            notesList.appendChild(noteElement);
        });
        
        // Display percussion
        this.detectedPercussion.forEach((hit, index) => {
            const hitElement = document.createElement('div');
            hitElement.className = 'percussion-item';
            hitElement.innerHTML = `
                <div class="percussion-info">
                    <strong>${hit.type.toUpperCase()}</strong><br>
                    Hit ${index + 1}
                </div>
                <div class="percussion-timing">
                    ${hit.startTime.toFixed(2)}s
                </div>
            `;
            percussionList.appendChild(hitElement);
        });
        
        // Show results section
        document.getElementById('detectionResults').style.display = 'block';
    }

    async playConverted() {
        try {
            if (!this.detectedNotes.length && !this.detectedPercussion.length) {
                this.showError('No musical elements detected. Please try recording again.');
                return;
            }
            
            const melodyInstrument = document.getElementById('melodyInstrument').value;
            const drumKit = document.getElementById('drumKit').value;
            const tempo = parseInt(document.getElementById('tempoSlider').value);
            
            await this.playbackEngine.play({
                notes: this.detectedNotes,
                percussion: this.detectedPercussion,
                melodyInstrument: melodyInstrument,
                drumKit: drumKit,
                tempo: tempo
            });
            
        } catch (error) {
            console.error('Error playing converted audio:', error);
            this.showError('Failed to play converted audio. Please try again.');
        }
    }

    updateUI(state) {
        const recordBtn = document.getElementById('recordBtn');
        const stopBtn = document.getElementById('stopBtn');
        const playBtn = document.getElementById('playBtn');
        const statusElement = document.getElementById('recordingStatus');
        
        switch (state) {
            case 'ready':
                recordBtn.disabled = false;
                recordBtn.classList.remove('recording');
                stopBtn.disabled = true;
                playBtn.disabled = true;
                statusElement.querySelector('span').textContent = 'Ready to record your hum or beatbox';
                break;
                
            case 'recording':
                recordBtn.disabled = true;
                recordBtn.classList.add('recording');
                stopBtn.disabled = false;
                playBtn.disabled = true;
                statusElement.querySelector('span').textContent = 'Recording... Hum or beatbox now!';
                break;
                
            case 'processing':
                recordBtn.disabled = true;
                recordBtn.classList.remove('recording');
                stopBtn.disabled = true;
                playBtn.disabled = true;
                statusElement.querySelector('span').textContent = 'Processing your audio...';
                break;
                
            case 'completed':
                recordBtn.disabled = false;
                recordBtn.classList.remove('recording');
                stopBtn.disabled = true;
                playBtn.disabled = false;
                statusElement.querySelector('span').textContent = 'Analysis complete! Ready to play.';
                break;
        }
    }

    showError(message) {
        const statusElement = document.getElementById('recordingStatus');
        statusElement.querySelector('span').textContent = message;
        statusElement.style.borderColor = '#ff4444';
        
        setTimeout(() => {
            statusElement.style.borderColor = '';
            this.updateUI('ready');
        }, 3000);
    }

    // Performance optimization: Web Worker for heavy pitch detection
    async detectPitchWithWorker(audioData, sampleRate, duration) {
        return new Promise((resolve, reject) => {
            const worker = new Worker('data:text/javascript,' + encodeURIComponent(`
                self.onmessage = function(e) {
                    const { audioData, sampleRate, duration } = e.data;
                    const notes = [];
                    const windowSize = 2048;
                    const hopSize = 512;
                    const threshold = 0.01;
                    
                    function calculateRMS(buffer) {
                        let sum = 0;
                        for (let i = 0; i < buffer.length; i++) {
                            sum += buffer[i] * buffer[i];
                        }
                        return Math.sqrt(sum / buffer.length);
                    }
                    
                    function detectFrequency(window, sampleRate) {
                        const yinThreshold = 0.1;
                        const bufferSize = window.length;
                        const yinBuffer = new Float32Array(Math.floor(bufferSize / 2));
                        
                        for (let tau = 0; tau < yinBuffer.length; tau++) {
                            yinBuffer[tau] = 0;
                            for (let i = 0; i < bufferSize - tau; i++) {
                                const delta = window[i] - window[i + tau];
                                yinBuffer[tau] += delta * delta;
                            }
                        }
                        
                        yinBuffer[0] = 1;
                        let runningSum = 0;
                        for (let tau = 1; tau < yinBuffer.length; tau++) {
                            runningSum += yinBuffer[tau];
                            yinBuffer[tau] *= tau / runningSum;
                        }
                        
                        let tau = 2;
                        while (tau < yinBuffer.length) {
                            if (yinBuffer[tau] < yinThreshold) {
                                while (tau + 1 < yinBuffer.length && yinBuffer[tau + 1] < yinBuffer[tau]) {
                                    tau++;
                                }
                                return sampleRate / tau;
                            }
                            tau++;
                        }
                        return 0;
                    }
                    
                    function frequencyToMidi(frequency) {
                        return 12 * Math.log2(frequency / 440) + 69;
                    }
                    
                    for (let i = 0; i < audioData.length - windowSize; i += hopSize) {
                        const window = audioData.slice(i, i + windowSize);
                        const rms = calculateRMS(window);
                        
                        if (rms > threshold) {
                            const frequency = detectFrequency(window, sampleRate);
                            if (frequency > 80 && frequency < 2000) {
                                const midiNote = frequencyToMidi(frequency);
                                const startTime = i / sampleRate;
                                
                                notes.push({
                                    midi: midiNote,
                                    frequency: frequency,
                                    startTime: startTime,
                                    duration: 0.5, // Default duration
                                    velocity: Math.min(rms * 10, 1)
                                });
                            }
                        }
                    }
                    
                    self.postMessage(notes);
                };
            `));
            
            worker.postMessage({ audioData, sampleRate, duration });
            worker.onmessage = (e) => {
                worker.terminate();
                resolve(this.smoothNotes(e.data));
            };
            worker.onerror = (error) => {
                worker.terminate();
                reject(error);
            };
        });
    }

    // Memory management and cleanup
    cleanup() {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
        }
        
        if (this.playbackEngine) {
            this.playbackEngine.stop();
        }
        
        if (this.visualizer) {
            this.visualizer.stopVisualization();
        }
        
        // Clear arrays to free memory
        this.audioChunks = [];
        this.detectedNotes = [];
        this.detectedPercussion = [];
    }
}

class PlaybackEngine {
    constructor() {
        this.synth = null;
        this.drums = null;
        this.isPlaying = false;
        this.currentSequence = null;
    }

    async play(data) {
        try {
            if (this.isPlaying) {
                this.stop();
            }
            
            this.isPlaying = true;
            
            // Create instruments
            this.synth = this.createMelodyInstrument(data.melodyInstrument);
            this.drums = this.createDrumKit(data.drumKit);
            
            // Set tempo
            Tone.Transport.bpm.value = data.tempo;
            
            // Create sequences
            this.createMelodySequence(data.notes);
            this.createDrumSequence(data.percussion);
            
            // Start playback
            Tone.Transport.start();
            
            // Update UI
            this.updatePlayButton(true);
            
        } catch (error) {
            console.error('Error in playback:', error);
            throw error;
        }
    }

    createMelodyInstrument(type) {
        switch (type) {
            case 'piano':
                return new Tone.Sampler({
                    urls: {
                        C4: "https://tonejs.github.io/audio/casio/C4.mp3",
                        "C#4": "https://tonejs.github.io/audio/casio/Cs4.mp3",
                        D4: "https://tonejs.github.io/audio/casio/D4.mp3",
                        "D#4": "https://tonejs.github.io/audio/casio/Ds4.mp3",
                        E4: "https://tonejs.github.io/audio/casio/E4.mp3",
                        F4: "https://tonejs.github.io/audio/casio/F4.mp3",
                        "F#4": "https://tonejs.github.io/audio/casio/Fs4.mp3",
                        G4: "https://tonejs.github.io/audio/casio/G4.mp3",
                        "G#4": "https://tonejs.github.io/audio/casio/Gs4.mp3",
                        A4: "https://tonejs.github.io/audio/casio/A4.mp3",
                        "A#4": "https://tonejs.github.io/audio/casio/As4.mp3",
                        B4: "https://tonejs.github.io/audio/casio/B4.mp3"
                    },
                    release: 1,
                    baseUrl: "https://tonejs.github.io/audio/casio/"
                }).toDestination();
                
            case 'synth':
                return new Tone.Synth({
                    oscillator: {
                        type: "sawtooth"
                    },
                    envelope: {
                        attack: 0.1,
                        decay: 0.2,
                        sustain: 0.3,
                        release: 1
                    }
                }).toDestination();
                
            case 'guitar':
                return new Tone.Synth({
                    oscillator: {
                        type: "triangle"
                    },
                    envelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.5,
                        release: 0.8
                    }
                }).toDestination();
                
            case 'violin':
                return new Tone.Synth({
                    oscillator: {
                        type: "sine"
                    },
                    envelope: {
                        attack: 0.3,
                        decay: 0.1,
                        sustain: 0.7,
                        release: 1.5
                    }
                }).toDestination();
                
            default:
                return new Tone.Synth().toDestination();
        }
    }

    createDrumKit(type) {
        const drums = {};
        
        switch (type) {
            case 'acoustic':
                drums.kick = new Tone.Player("https://tonejs.github.io/audio/drum-samples/kick.mp3").toDestination();
                drums.snare = new Tone.Player("https://tonejs.github.io/audio/drum-samples/snare.mp3").toDestination();
                drums.hihat = new Tone.Player("https://tonejs.github.io/audio/drum-samples/hihat.mp3").toDestination();
                break;
                
            case 'electronic':
                drums.kick = new Tone.MembraneSynth().toDestination();
                drums.snare = new Tone.NoiseSynth({
                    noise: {
                        type: "white"
                    },
                    envelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.1,
                        release: 0.1
                    }
                }).toDestination();
                drums.hihat = new Tone.NoiseSynth({
                    noise: {
                        type: "white"
                    },
                    envelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.01,
                        release: 0.1
                    }
                }).toDestination();
                break;
                
            case 'hip-hop':
                drums.kick = new Tone.MembraneSynth({
                    pitchDecay: 0.05,
                    octaves: 10,
                    oscillator: {
                        type: "triangle"
                    },
                    envelope: {
                        attack: 0.001,
                        decay: 0.4,
                        sustain: 0.01,
                        release: 1.4,
                        attackCurve: "exponential"
                    }
                }).toDestination();
                
                drums.snare = new Tone.NoiseSynth({
                    noise: {
                        type: "pink"
                    },
                    envelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.1,
                        release: 0.1
                    }
                }).toDestination();
                
                drums.hihat = new Tone.NoiseSynth({
                    noise: {
                        type: "white"
                    },
                    envelope: {
                        attack: 0.01,
                        decay: 0.1,
                        sustain: 0.01,
                        release: 0.1
                    }
                }).toDestination();
                break;
        }
        
        return drums;
    }

    createMelodySequence(notes) {
        if (!notes.length) return;
        
        const sequence = new Tone.Sequence((time, note) => {
            if (note && this.synth) {
                const frequency = this.midiToFrequency(note.midi);
                this.synth.triggerAttackRelease(frequency, note.duration, time, note.velocity);
            }
        }, notes, "4n");
        
        sequence.start(0);
        this.currentSequence = sequence;
    }

    createDrumSequence(percussion) {
        if (!percussion.length) return;
        
        const sequence = new Tone.Sequence((time, hit) => {
            if (hit && this.drums && this.drums[hit.type]) {
                if (hit.type === 'kick') {
                    this.drums.kick.triggerAttackRelease("C1", "8n", time, hit.velocity);
                } else if (hit.type === 'snare') {
                    this.drums.snare.triggerAttackRelease("8n", time, hit.velocity);
                } else if (hit.type === 'hihat') {
                    this.drums.hihat.triggerAttackRelease("8n", time, hit.velocity);
                }
            }
        }, percussion, "4n");
        
        sequence.start(0);
    }

    midiToFrequency(midi) {
        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    stop() {
        if (this.isPlaying) {
            Tone.Transport.stop();
            Tone.Transport.cancel();
            
            if (this.currentSequence) {
                this.currentSequence.dispose();
                this.currentSequence = null;
            }
            
            this.isPlaying = false;
            this.updatePlayButton(false);
        }
    }

    updatePlayButton(isPlaying) {
        const playBtn = document.getElementById('playBtn');
        const icon = playBtn.querySelector('i');
        const text = playBtn.querySelector('span');
        
        if (isPlaying) {
            icon.className = 'fas fa-stop';
            text.textContent = 'Stop Playback';
        } else {
            icon.className = 'fas fa-play';
            text.textContent = 'Play Converted';
        }
    }
}

class AudioVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.analyser = null;
        this.dataArray = null;
        this.animationId = null;
    }

    startVisualization(stream) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        
        this.analyser = audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        
        source.connect(this.analyser);
        
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.draw();
    }

    stopVisualization() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        if (!this.analyser) return;
        
        this.animationId = requestAnimationFrame(() => this.draw());
        
        this.analyser.getByteFrequencyData(this.dataArray);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const barWidth = (this.canvas.width / this.dataArray.length) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < this.dataArray.length; i++) {
            barHeight = (this.dataArray[i] / 255) * this.canvas.height;
            
            const gradient = this.ctx.createLinearGradient(0, this.canvas.height, 0, this.canvas.height - barHeight);
            gradient.addColorStop(0, '#ff6b35');
            gradient.addColorStop(1, '#ff8c5a');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x, this.canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
}

// Initialize music creation functionality
function initMusicCreation() {
    const audioProcessor = new HumGodAudioProcessor();
    
    // Get UI elements
    const startCreatingBtn = document.getElementById('startCreatingBtn');
    const musicInterface = document.getElementById('musicInterface');
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playBtn = document.getElementById('playBtn');
    const tempoSlider = document.getElementById('tempoSlider');
    const tempoValue = document.getElementById('tempoValue');
    
    // Hide the "Start Creating" button since interface is now always visible
    if (startCreatingBtn) {
        startCreatingBtn.style.display = 'none';
    }
    
    // Ensure the music interface is visible
    if (musicInterface) {
        musicInterface.style.display = 'block';
    }
    
    // Recording controls
    recordBtn.addEventListener('click', () => {
        // Try to start recording, but if microphone fails, show demo mode
        audioProcessor.startRecording().catch(() => {
            showDemoMode();
        });
    });
    
    // Check if we're on localhost and automatically show demo mode
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        // Small delay to ensure UI is ready
        setTimeout(() => {
            showDemoMode();
        }, 500);
    } else {
        // On production (Vercel), try real microphone access
        console.log('Production environment detected - microphone should work');
        
        // Add demo button for testing
        const demoBtn = document.getElementById('demoBtn');
        if (demoBtn) {
            demoBtn.style.display = 'inline-block';
        }
    }
    
    stopBtn.addEventListener('click', () => {
        audioProcessor.stopRecording();
    });
    
    playBtn.addEventListener('click', () => {
        if (audioProcessor.playbackEngine.isPlaying) {
            audioProcessor.playbackEngine.stop();
        } else {
            audioProcessor.playConverted();
        }
    });
    
    // Tempo control
    tempoSlider.addEventListener('input', (e) => {
        tempoValue.textContent = `${e.target.value} BPM`;
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        audioProcessor.cleanup();
    });
    
    // Cleanup on visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Pause playback when tab is hidden
            if (audioProcessor.playbackEngine && audioProcessor.playbackEngine.isPlaying) {
                audioProcessor.playbackEngine.stop();
            }
        }
    });
    
    // Initialize UI
    audioProcessor.updateUI('ready');
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Space bar to start/stop recording
        if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
            e.preventDefault();
            if (audioProcessor.isRecording) {
                audioProcessor.stopRecording();
            } else {
                audioProcessor.startRecording();
            }
        }
        
        // Enter to play/stop converted audio
        if (e.code === 'Enter' && !e.target.matches('input, textarea, select')) {
            e.preventDefault();
            if (audioProcessor.playbackEngine && audioProcessor.playbackEngine.isPlaying) {
                audioProcessor.playbackEngine.stop();
            } else if (!playBtn.disabled) {
                audioProcessor.playConverted();
            }
        }
    });
}

// Demo mode function for when microphone access fails
function showDemoMode() {
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playBtn = document.getElementById('playBtn');
    const demoBtn = document.getElementById('demoBtn');
    const statusElement = document.querySelector('.recording-status');
    const notesList = document.getElementById('notesList');
    const percussionList = document.getElementById('percussionList');
    
    // Hide the demo button since we're now in demo mode
    if (demoBtn) {
        demoBtn.style.display = 'none';
    }
    
    // Remove original event listeners to prevent conflicts
    recordBtn.replaceWith(recordBtn.cloneNode(true));
    playBtn.replaceWith(playBtn.cloneNode(true));
    
    // Get fresh references after cloning
    const newRecordBtn = document.getElementById('recordBtn');
    const newPlayBtn = document.getElementById('playBtn');
    
    // Update UI to show demo mode
    newRecordBtn.innerHTML = '<i class="fas fa-play"></i><span>Try Demo</span>';
    newRecordBtn.style.backgroundColor = '#4CAF50';
    newRecordBtn.disabled = false;
    
    // Add demo data
    const demoNotes = [
        { note: 'C4', frequency: 261.63, time: 0.0, duration: 0.5 },
        { note: 'E4', frequency: 329.63, time: 0.5, duration: 0.5 },
        { note: 'G4', frequency: 392.00, time: 1.0, duration: 0.5 },
        { note: 'C5', frequency: 523.25, time: 1.5, duration: 1.0 }
    ];
    
    const demoPercussion = [
        { type: 'Kick', time: 0.0, intensity: 0.8 },
        { type: 'Snare', time: 0.5, intensity: 0.6 },
        { type: 'Kick', time: 1.0, intensity: 0.8 },
        { type: 'Snare', time: 1.5, intensity: 0.6 }
    ];
    
    // Display demo results
    notesList.innerHTML = demoNotes.map(note => 
        `<div class="note-item">
            <span class="note-name">${note.note}</span>
            <span class="note-time">${note.time.toFixed(1)}s</span>
        </div>`
    ).join('');
    
    percussionList.innerHTML = demoPercussion.map(perc => 
        `<div class="percussion-item">
            <span class="percussion-type">${perc.type}</span>
            <span class="percussion-time">${perc.time.toFixed(1)}s</span>
        </div>`
    ).join('');
    
    // Update status
    statusElement.innerHTML = `
        <div class="status-indicator demo">
            <i class="fas fa-info-circle"></i>
            <span>Demo Mode - Microphone access blocked</span>
        </div>
    `;
    
    // Enable play button for demo
    playBtn.disabled = false;
    
    // Add click handler for demo
    newRecordBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Simulate processing
        statusElement.innerHTML = `
            <div class="status-indicator processing">
                <i class="fas fa-cog fa-spin"></i>
                <span>Processing demo audio...</span>
            </div>
        `;
        
        setTimeout(() => {
            statusElement.innerHTML = `
                <div class="status-indicator success">
                    <i class="fas fa-check-circle"></i>
                    <span>Demo conversion complete!</span>
                </div>
            `;
            newPlayBtn.disabled = false;
        }, 2000);
    };
    
    // Add demo play functionality
    newPlayBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (newPlayBtn.innerHTML.includes('Stop')) {
            // Stop playback
            newPlayBtn.innerHTML = '<i class="fas fa-play"></i><span>Play Converted</span>';
            newPlayBtn.style.backgroundColor = '#4CAF50';
            statusElement.innerHTML = `
                <div class="status-indicator success">
                    <i class="fas fa-check-circle"></i>
                    <span>Demo conversion complete!</span>
                </div>
            `;
        } else {
            // Start playback
            newPlayBtn.innerHTML = '<i class="fas fa-stop"></i><span>Stop</span>';
            newPlayBtn.style.backgroundColor = '#f44336';
            
            // Update status to show playing
            statusElement.innerHTML = `
                <div class="status-indicator processing">
                    <i class="fas fa-volume-up"></i>
                    <span>Playing converted audio...</span>
                </div>
            `;
            
            // Simulate playing demo audio with visual feedback
            let timeElapsed = 0;
            const canvas = document.getElementById('waveformCanvas');
            const ctx = canvas.getContext('2d');
            
            const playInterval = setInterval(() => {
                timeElapsed += 0.5;
                statusElement.innerHTML = `
                    <div class="status-indicator processing">
                        <i class="fas fa-volume-up"></i>
                        <span>Playing converted audio... (${timeElapsed.toFixed(1)}s)</span>
                    </div>
                `;
                
                // Animate the visualizer
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.strokeStyle = '#ff6b35';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    
                    // Draw animated waveform
                    for (let x = 0; x < canvas.width; x += 4) {
                        const y = canvas.height / 2 + Math.sin((x + timeElapsed * 20) * 0.1) * 20 + 
                                 Math.sin((x + timeElapsed * 15) * 0.05) * 10;
                        if (x === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    }
                    ctx.stroke();
                }
                
                if (timeElapsed >= 4.0) {
                    clearInterval(playInterval);
                    newPlayBtn.innerHTML = '<i class="fas fa-play"></i><span>Play Converted</span>';
                    newPlayBtn.style.backgroundColor = '#4CAF50';
                    statusElement.innerHTML = `
                        <div class="status-indicator success">
                            <i class="fas fa-check-circle"></i>
                            <span>Demo playback complete!</span>
                        </div>
                    `;
                    
                    // Clear the visualizer
                    if (ctx) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }
            }, 500);
        }
    };
}
