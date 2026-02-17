/**
 * AudioManager - Web Audio API ambient sound generation
 * Generates all sounds programmatically — no external files needed
 * Features: atmospheric hum, radio static, cinematic impacts
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.initialized = false;
        this.nodes = {};
    }

    /**
     * Initialize audio context (must be called from user interaction)
     */
    init() {
        if (this.initialized) return;

        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3;
            this.masterGain.connect(this.ctx.destination);
            this.initialized = true;
        } catch (e) {
            console.warn('AudioManager: Web Audio API not available', e);
        }
    }

    /**
     * Low-frequency atmospheric hum
     */
    startAmbientHum() {
        if (!this.initialized || this.nodes.hum) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = 55; // Deep hum
        gain.gain.value = 0;

        filter.type = 'lowpass';
        filter.frequency.value = 120;
        filter.Q.value = 1;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start();

        // Fade in
        gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 3);

        // Add subtle modulation
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.1; // Very slow
        lfoGain.gain.value = 5;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        this.nodes.hum = { osc, gain, filter, lfo, lfoGain };
    }

    /**
     * Radio static noise
     */
    startStaticNoise() {
        if (!this.initialized || this.nodes.static) return;

        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.5;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 0.5;

        const gain = this.ctx.createGain();
        gain.gain.value = 0;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        source.start();

        // Fade in softly
        gain.gain.linearRampToValueAtTime(0.03, this.ctx.currentTime + 2);

        this.nodes.static = { source, filter, gain };
    }

    /**
     * Cinematic impact sound (for transitions)
     */
    playImpact() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 80;
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.5);

        gain.gain.value = 0.4;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 1.5);

        // Add noise burst
        const bufferSize = this.ctx.sampleRate;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.value = 0.15;
        noiseGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
        noise.connect(noiseGain);
        noiseGain.connect(this.masterGain);
        noise.start();
    }

    /* ===== NEW PROCEDURAL SOUNDS ===== */

    /**
     * Deep sub-bass drone (40–60 Hz)
     */
    startAmbientDrone() {
        if (!this.initialized || this.nodes.drone) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.value = 45; // Sub-bass

        filter.type = 'lowpass';
        filter.frequency.value = 120;
        filter.Q.value = 2;

        gain.gain.value = 0;

        // LFO for filter movement
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.05; // Extremely slow
        lfoGain.gain.value = 40; // Modulate filter by 40Hz

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        lfo.start();

        // Slow fade in
        gain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 4);

        this.nodes.drone = { osc, gain, filter, lfo };
    }

    /**
     * Glitch burst noise
     */
    playGlitchBurst() {
        if (!this.initialized) return;

        const bufferSize = this.ctx.sampleRate * 0.1; // 100ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * 0.8;
        }

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000 + Math.random() * 2000;
        filter.Q.value = 5;

        const gain = this.ctx.createGain();
        gain.gain.value = 0.2;

        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        source.start();
        source.stop(this.ctx.currentTime + 0.1);
    }

    /**
     * Keyboard click trigger
     */
    playKeystroke() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.value = 800 + Math.random() * 200;

        gain.gain.value = 0.05;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    /**
     * High-frequency boot beep
     */
    playBootBeep() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 1200;

        gain.gain.value = 0.05;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }

    /**
     * Transmission wave pulse
     */
    playTransmissionPulse() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.3);

        gain.gain.value = 0.1;
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    }

    /**
     * Alien signal response (distorted)
     */
    playAlienResponse() {
        if (!this.initialized) return;

        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const distortion = this.ctx.createWaveShaper();

        // Distortion curve
        const curve = new Float32Array(44100);
        for (let i = 0; i < 44100; i++) {
            const x = (i * 2) / 44100 - 1;
            curve[i] = (Math.PI + 50) * x / (Math.PI + 50 * Math.abs(x));
        }
        distortion.curve = curve;
        distortion.oversample = '4x';

        osc.type = 'sawtooth';
        osc.frequency.value = 60;
        osc2.type = 'sine';
        osc2.frequency.value = 85;

        gain.gain.value = 0.15;

        osc.connect(distortion);
        osc2.connect(distortion);
        distortion.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc2.start();

        gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.5);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 4);

        osc.stop(this.ctx.currentTime + 4);
        osc2.stop(this.ctx.currentTime + 4);
    }

    /**
     * Success chime (tri-tone)
     */
    playSuccessChime() {
        if (!this.initialized) return;

        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, i) => { // C5, E5, G5
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.value = freq;

            gain.gain.value = 0;
            gain.gain.linearRampToValueAtTime(0.1, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.6);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.6);
        });
    }

    /**
     * Fade out all active sounds
     */
    fadeOutAll(duration = 1.5) {
        Object.values(this.nodes).forEach(node => {
            if (node.gain) {
                try {
                    node.gain.gain.cancelScheduledValues(this.ctx.currentTime);
                    node.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);
                    setTimeout(() => {
                        if (node.osc) node.osc.stop();
                        if (node.source) node.source.stop();
                    }, duration * 1000 + 100);
                } catch (e) { /* ignore */ }
            }
        });
        this.nodes = {};
    }

    /**
     * Set master volume
     */
    setVolume(value) {
        if (this.masterGain) {
            this.masterGain.gain.linearRampToValueAtTime(
                Math.max(0, Math.min(1, value)),
                this.ctx.currentTime + 0.1
            );
        }
    }

    /**
     * Mute/unmute
     */
    setMuted(muted) {
        this.setVolume(muted ? 0 : 0.3);
    }

    /**
     * Stop all sounds
     */
    stopAll() {
        Object.values(this.nodes).forEach(node => {
            try {
                if (node.osc) node.osc.stop();
                if (node.lfo) node.lfo.stop();
                if (node.source) node.source.stop();
            } catch (e) { /* already stopped */ }
        });
        this.nodes = {};
    }

    /**
     * Cleanup
     */
    dispose() {
        this.stopAll();
        if (this.ctx && this.ctx.state !== 'closed') {
            this.ctx.close();
        }
        this.initialized = false;
    }
}

// Singleton instance
const audioManager = new AudioManager();
export default audioManager;
