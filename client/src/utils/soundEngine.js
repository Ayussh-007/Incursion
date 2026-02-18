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

// Ascending chime — correct digit
export function playCorrectChime() {
    const ctx = getCtx();
    const t = ctx.currentTime;
    [220, 330, 440].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.07);
        gain.gain.setValueAtTime(0.0, t + i * 0.07);
        gain.gain.linearRampToValueAtTime(0.12, t + i * 0.07 + 0.02);
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
