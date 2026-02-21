/**
 * soundEngine — Web Audio API synthesized sounds for Level 1
 * No external files required — all sounds generated procedurally
 */

let _ctx = null;

function getCtx() {
    if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
    return _ctx;
}

// Resume context on first user interaction (browser autoplay policy)
export function resumeAudio() {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
}

// Short mechanical tick — digit input click
export function playDigitClick() {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
}

// Ascending chime — correct digit (blue strategist tone)
export function playCorrectChime() {
    const ctx = getCtx();
    const t = ctx.currentTime;
    [330, 495, 660].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.07);
        gain.gain.setValueAtTime(0.0, t + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.11, t + i * 0.07 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.3);
        osc.start(t + i * 0.07);
        osc.stop(t + i * 0.07 + 0.35);
    });
}

// Low sawtooth buzz — wrong digit
export function playWrongTone() {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, ctx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
}

// Rising harmonic resonance — unlock success
export function playUnlockHarmonic() {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const freqs = [110, 165, 220, 330, 440, 660];
    freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * 0.5, t + i * 0.12);
        osc.frequency.exponentialRampToValueAtTime(freq, t + i * 0.12 + 0.4);
        gain.gain.setValueAtTime(0.0, t + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.08, t + i * 0.12 + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 1.2);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 1.4);
    });
}

// Low frequency rumble — door slide
export function playDoorSlide() {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
    source.stop(ctx.currentTime + 1.5);
}

// ── NEW SOUNDS ────────────────────────────────────────────────────────────────

// UV scanner activation — violet hum
export function playUVActivate() {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.18);
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.09, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.start(t);
    osc.stop(t + 0.25);
}

// Neural Override ability — electric swoosh
export function playNeuralOverride() {
    const ctx = getCtx();
    const t = ctx.currentTime;
    // High sweep
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.connect(g1);
    g1.connect(ctx.destination);
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(200, t);
    osc1.frequency.exponentialRampToValueAtTime(2200, t + 0.35);
    g1.gain.setValueAtTime(0.0, t);
    g1.gain.linearRampToValueAtTime(0.12, t + 0.05);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc1.start(t);
    osc1.stop(t + 0.5);

    // Sub harmonic body
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    const f2 = ctx.createBiquadFilter();
    osc2.connect(f2);
    f2.connect(g2);
    g2.connect(ctx.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(80, t);
    f2.type = 'bandpass';
    f2.frequency.setValueAtTime(200, t);
    g2.gain.setValueAtTime(0.0, t);
    g2.gain.linearRampToValueAtTime(0.18, t + 0.1);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    osc2.start(t);
    osc2.stop(t + 0.65);
}

// Alien scan beam — ascending whine for failure sweep
export function playAlarmSweep() {
    const ctx = getCtx();
    const t = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t + i * 0.5);
        osc.frequency.exponentialRampToValueAtTime(900, t + i * 0.5 + 0.4);
        gain.gain.setValueAtTime(0.0, t + i * 0.5);
        gain.gain.linearRampToValueAtTime(0.2, t + i * 0.5 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.5 + 0.45);
        osc.start(t + i * 0.5);
        osc.stop(t + i * 0.5 + 0.5);
    }
}

// Heavy metallic impact — capture boom
export function playCaptureBoom() {
    const ctx = getCtx();
    const t = ctx.currentTime;

    // Low impact thud
    const bufferSize = Math.floor(ctx.sampleRate * 0.6);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, t);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(t);
    source.stop(t + 0.6);

    // Metallic ring
    const osc = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc.connect(g2);
    g2.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(55, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.5);
    g2.gain.setValueAtTime(0.3, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.start(t);
    osc.stop(t + 0.8);
}

// Low tension drone — plays while timer is active; intensity 0–1
export function playTensionDrone(intensity = 0.3) {
    const ctx = getCtx();
    const t = ctx.currentTime;
    const freq = 40 + intensity * 20;
    const vol = 0.04 + intensity * 0.08;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120 + intensity * 80, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    osc.start(t);
    osc.stop(t + 1.5);
}
