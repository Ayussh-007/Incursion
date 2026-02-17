import { useEffect, useState, useRef } from 'react';
import useGameStore from '../../store/gameState';
import audioManager from '../../utils/AudioManager';
import '../../styles/CutsceneSequence.css';

/**
 * CutsceneSequence - Post-login signal transmission into deep space
 * Features: waveform pulses, cosmic darkness, alien response, rising tension
 */

const NARRATIVE_LINES = [
    { text: 'UPLINK ESTABLISHED', delay: 500, type: 'system' },
    { text: 'TRANSMITTING SIGNAL TO DEEP SPACE RELAY #7429...', delay: 1500, type: 'system' },
    { text: '> SIGNAL STRENGTH: NOMINAL', delay: 2500, type: 'success' },
    { text: '> FREQUENCY: 1.420 GHz — HYDROGEN LINE', delay: 3200, type: 'data' },
    { text: '', delay: 3800 },
    { text: 'AWAITING RESPONSE...', delay: 4500, type: 'system' },
    { text: '', delay: 5500 },
    { text: '⚠ ANOMALOUS SIGNAL DETECTED', delay: 7000, type: 'warning' },
    { text: '⚠ ORIGIN: UNKNOWN — OUTSIDE MAPPED SPACE', delay: 7800, type: 'warning' },
    { text: '', delay: 8500 },
    { text: '> DECODING RESPONSE...', delay: 9200, type: 'success' },
    { text: '> PATTERN MATCH: 0.0% — NON-HUMAN ORIGIN', delay: 10200, type: 'error' },
    { text: '', delay: 11000 },
    { text: 'THE INCURSION HAS BEGUN.', delay: 12500, type: 'final' },
];

function CutsceneSequence() {
    const completeCutscene = useGameStore((state) => state.completeCutscene);
    const [visibleLines, setVisibleLines] = useState([]);
    const [wavePhase, setWavePhase] = useState(0); // 0=transmit, 1=waiting, 2=response
    const [signalIntensity, setSignalIntensity] = useState(0);
    const canvasRef = useRef(null);
    const phaseRef = useRef(0);

    // Waveform canvas animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let time = 0;
        let animId;
        let lastPulseTime = 0;

        const draw = () => {
            time += 0.016;
            ctx.fillStyle = 'rgba(2, 4, 8, 0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerY = canvas.height / 2;
            const centerX = canvas.width / 2;

            // Audio: Pulse sound every second during transmission
            if ((phaseRef.current === 0 || phaseRef.current === 1) && time - lastPulseTime > 1.0) {
                audioManager.playTransmissionPulse();
                lastPulseTime = time;
            }

            // Outgoing signal waveform (blue-cyan)
            if (phaseRef.current === 0 || phaseRef.current === 1) {
                const numWaves = 3;
                for (let w = 0; w < numWaves; w++) {
                    const radius = (time * 80 + w * 60) % (canvas.width * 0.8);
                    const opacity = Math.max(0, 1 - radius / (canvas.width * 0.6)) * 0.4;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(0, 200, 255, ${opacity})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }

                // Waveform line
                ctx.beginPath();
                for (let x = 0; x < canvas.width; x++) {
                    const distFromCenter = Math.abs(x - centerX) / centerX;
                    const amplitude = 30 * Math.exp(-distFromCenter * 3) * (phaseRef.current === 0 ? 1 : 0.2);
                    const y = centerY + Math.sin(x * 0.02 + time * 4) * amplitude * Math.sin(time * 2);
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // Alien response (red-crimson) — appears in phase 2
            if (phaseRef.current === 2) {
                // Incoming waves from edges
                const numWaves = 4;
                for (let w = 0; w < numWaves; w++) {
                    const maxR = canvas.width * 0.7;
                    const radius = maxR - ((time * 60 + w * 50) % maxR);
                    const opacity = Math.max(0, (1 - (maxR - radius) / maxR)) * 0.35;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(220, 20, 60, ${opacity})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }

                // Distorted waveform
                ctx.beginPath();
                for (let x = 0; x < canvas.width; x++) {
                    const distFromCenter = Math.abs(x - centerX) / centerX;
                    const amplitude = 50 * Math.exp(-distFromCenter * 2);
                    const noise = Math.sin(x * 0.05 + time * 8) + Math.sin(x * 0.13 + time * 3) * 0.5;
                    const y = centerY + noise * amplitude;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.strokeStyle = 'rgba(220, 20, 60, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                // Glitch lines
                if (Math.random() < 0.05) {
                    const gy = Math.random() * canvas.height;
                    ctx.fillStyle = `rgba(220, 20, 60, ${Math.random() * 0.1})`;
                    ctx.fillRect(0, gy, canvas.width, 2);
                }
            }

            // Central glow dot
            const glowRadius = 4 + Math.sin(time * 3) * 2;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius * 10);
            const glowColor = phaseRef.current < 2 ? '0, 255, 255' : '220, 20, 60';
            gradient.addColorStop(0, `rgba(${glowColor}, 0.6)`);
            gradient.addColorStop(0.5, `rgba(${glowColor}, 0.1)`);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(centerX - glowRadius * 10, centerY - glowRadius * 10, glowRadius * 20, glowRadius * 20);

            ctx.beginPath();
            ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = phaseRef.current < 2 ? 'rgba(0, 255, 255, 0.8)' : 'rgba(220, 20, 60, 0.9)';
            ctx.fill();

            animId = requestAnimationFrame(draw);
        };

        ctx.fillStyle = '#020408';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        draw();

        return () => cancelAnimationFrame(animId);
    }, []);

    // Narrative progression
    useEffect(() => {
        NARRATIVE_LINES.forEach(({ text, delay, type }, i) => {
            setTimeout(() => {
                if (text) {
                    setVisibleLines(prev => [...prev, { text, type }]);
                    audioManager.playKeystroke(); // Typing sound
                }
            }, delay);
        });

        // Phase transitions
        setTimeout(() => { setWavePhase(1); phaseRef.current = 1; }, 4500); // waiting

        setTimeout(() => {
            setWavePhase(2);
            phaseRef.current = 2;
            audioManager.playAlienResponse(); // Alien audio
            audioManager.startStaticNoise(); // Intensify static
        }, 7000); // response

        setTimeout(() => setSignalIntensity(1), 9000);

        // Transition to GAME
        setTimeout(() => {
            audioManager.playImpact();
            audioManager.fadeOutAll(2.0);
            completeCutscene();
        }, 15000);
    }, [completeCutscene]);

    return (
        <div className="cutscene-sequence">
            <canvas ref={canvasRef} className="cutscene-canvas" />

            {/* Narrative text overlay */}
            <div className="cutscene-narrative">
                {visibleLines.map((line, i) => (
                    <div key={i} className={`narrative-line ${line.type}`}>
                        {line.text}
                    </div>
                ))}
            </div>

            {/* Signal intensity indicator */}
            <div className="signal-indicator">
                <div className="signal-label">SIGNAL</div>
                <div className="signal-bars">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className={`signal-bar ${i < (wavePhase === 2 ? 8 : wavePhase === 1 ? 2 : 5) ? 'active' : ''}`}
                            style={{
                                backgroundColor: wavePhase === 2
                                    ? `rgba(220, 20, 60, ${0.4 + i * 0.08})`
                                    : `rgba(0, 255, 255, ${0.3 + i * 0.08})`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Corner brackets */}
            <div className="cs-bracket top-left" />
            <div className="cs-bracket top-right" />
            <div className="cs-bracket bottom-left" />
            <div className="cs-bracket bottom-right" />

            {/* Bottom status */}
            <div className="cutscene-status">
                {wavePhase === 0 && 'TRANSMITTING...'}
                {wavePhase === 1 && 'AWAITING RESPONSE...'}
                {wavePhase === 2 && '⚠ INCOMING SIGNAL DETECTED'}
            </div>
            {/* Alien contact flash */}
            {wavePhase === 2 && <div className="signal-flash" />}

            {/* Final impact flash */}
            <div className="final-distortion" style={{ opacity: visibleLines.length === NARRATIVE_LINES.length ? 1 : 0 }} />
        </div>
    );
}

export default CutsceneSequence;
