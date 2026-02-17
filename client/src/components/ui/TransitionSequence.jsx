import { useEffect, useState, useRef, useCallback } from 'react';
import useGameStore from '../../store/gameState';
import audioManager from '../../utils/AudioManager';
import '../../styles/TransitionSequence.css';

/**
 * TransitionSequence - Cinematic atmospheric descent with enhanced HUD
 * Features: accelerating starfield, re-entry glow, HUD data stream, auto-transition
 */

const DATA_LINES = [
    { text: 'SIGNAL ORIGIN: DEEP SPACE RELAY #7429', delay: 0 },
    { text: 'DECRYPTING QUANTUM TRANSMISSION...', delay: 300 },
    { text: '> COORDINATES LOCKED: 46.2341°N, 7.4012°E', delay: 700, type: 'success' },
    { text: '> TRAJECTORY COMPUTED — ORBITAL INSERTION', delay: 1000, type: 'success' },
    { text: 'VELOCITY: 28,400 KM/H', delay: 1400 },
    { text: '⚠ THERMAL SHIELD: CRITICAL', delay: 1700, type: 'warning' },
    { text: 'RE-ENTRY ANGLE: 7.2° — NOMINAL', delay: 2000 },
    { text: '> SERN FACILITY BEACON ACQUIRED', delay: 2400, type: 'success' },
    { text: '> SECURE CHANNEL ESTABLISHED', delay: 2800, type: 'success' },
];

function TransitionSequence() {
    const completeTransition = useGameStore((state) => state.completeTransition);
    const [mainText, setMainText] = useState('');
    const [showData, setShowData] = useState(false);
    const [visibleLines, setVisibleLines] = useState([]);
    const [glitchActive, setGlitchActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState(0); // 0=entry, 1=descent, 2=approach
    const canvasRef = useRef(null);
    const progressRef = useRef(0);

    const fullText = "ATMOSPHERIC ENTRY DETECTED";

    // Starfield canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const stars = Array.from({ length: 300 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.3,
            speed: Math.random() * 2 + 0.5,
            brightness: Math.random() * 0.8 + 0.2,
        }));

        const nebulae = Array.from({ length: 3 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 80 + Math.random() * 180,
            r: Math.random() * 20,
            g: Math.random() * 40 + 60,
            b: Math.random() * 80 + 120,
            alpha: 0.015 + Math.random() * 0.02,
        }));

        let frameCount = 0;
        let animId;

        const draw = () => {
            frameCount++;
            const acceleration = 1 + progressRef.current * 0.1; // Accelerate with progress

            ctx.fillStyle = `rgba(4, 8, 16, ${0.12 + progressRef.current * 0.003})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Nebulae
            nebulae.forEach(n => {
                const gradient = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
                gradient.addColorStop(0, `rgba(${n.r}, ${n.g}, ${n.b}, ${n.alpha})`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2);
            });

            // Stars with acceleration
            stars.forEach(star => {
                star.y += star.speed * acceleration;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }

                // Streak length increases with progress
                const streakLen = star.speed * acceleration * (3 + progressRef.current * 0.15);
                ctx.beginPath();
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(star.x, star.y - streakLen);
                ctx.strokeStyle = `rgba(120, 200, 255, ${star.brightness * 0.4})`;
                ctx.lineWidth = star.size * 0.4;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size * (1 - progressRef.current * 0.005), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(200, 230, 255, ${star.brightness})`;
                ctx.fill();
            });

            animId = requestAnimationFrame(draw);
        };

        ctx.fillStyle = '#040810';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    // Typing + progress + auto-transition
    useEffect(() => {
        // Audio: Impact on entry + resume hum
        audioManager.playImpact();
        audioManager.startAmbientHum();

        let charIdx = 0;
        const typeInterval = setInterval(() => {
            if (charIdx <= fullText.length) {
                setMainText(fullText.slice(0, charIdx));
                charIdx++;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => setShowData(true), 200);
            }
        }, 50);

        const glitchInterval = setInterval(() => {
            setGlitchActive(true);
            audioManager.playGlitchBurst(); // Audio glitch
            setTimeout(() => setGlitchActive(false), 60 + Math.random() * 60);
        }, 1500 + Math.random() * 1000);

        const progressInterval = setInterval(() => {
            setProgress(p => {
                const next = Math.min(p + 0.65, 100);
                progressRef.current = next;
                // Phase transitions
                if (next > 33 && next < 34) setPhase(1);
                if (next > 66 && next < 67) setPhase(2);
                return next;
            });
        }, 40);

        // Auto-transition to LOGIN when complete
        const transitionTimer = setTimeout(() => {
            audioManager.fadeOutAll(1.5);
            completeTransition();
        }, 6500);

        return () => {
            clearInterval(typeInterval);
            clearInterval(glitchInterval);
            clearInterval(progressInterval);
            clearTimeout(transitionTimer);
        };
    }, [completeTransition]);

    // Staggered data lines
    useEffect(() => {
        if (!showData) return;
        DATA_LINES.forEach((_, i) => {
            setTimeout(() => setVisibleLines(prev => [...prev, i]), DATA_LINES[i].delay);
        });
    }, [showData]);

    const phaseLabels = ['RE-ENTRY', 'DESCENT', 'APPROACH'];

    return (
        <div className="transition-sequence">
            <canvas ref={canvasRef} className="starfield-canvas" />

            {/* Re-entry heat glow — intensifies with progress */}
            <div className="reentry-glow" style={{
                opacity: 0.6 + progress * 0.004,
                background: `
                    radial-gradient(ellipse at 50% 0%, rgba(255, ${Math.max(40, 80 - progress * 0.5)}, 20, ${0.1 + progress * 0.002}) 0%, transparent 50%),
                    radial-gradient(ellipse at 50% 100%, rgba(0, 100, 255, ${0.05 + progress * 0.001}) 0%, transparent 40%),
                    radial-gradient(ellipse at 30% 50%, rgba(0, 180, 255, 0.04) 0%, transparent 50%)
                `
            }} />

            {glitchActive && <div className="glitch-overlay" />}
            {glitchActive && <div className="glitch-tear" style={{ top: `${Math.random() * 100}%` }} />}

            <div className="transition-content">
                {/* Top HUD */}
                <div className="hud-top">
                    <div className="hud-label">SERN // ORBITAL DIVISION</div>
                    <div className="hud-label">
                        PHASE: <span style={{ color: '#00ffff' }}>{phaseLabels[phase]}</span>
                    </div>
                    <div className="hud-label blink-slow">● LIVE FEED</div>
                </div>

                {/* Main title */}
                <div className={`transition-title ${glitchActive ? 'glitch' : ''}`}>
                    <span className="title-text" data-text={mainText}>{mainText}</span>
                    <span className="cursor-blink">█</span>
                </div>

                {/* Data stream */}
                {showData && (
                    <div className="data-stream">
                        {DATA_LINES.map((line, i) => (
                            visibleLines.includes(i) && (
                                <div key={i} className={`data-line fade-slide-in ${line.type || ''}`}>
                                    <span className="data-prefix">
                                        {line.type === 'success' ? '✓' : line.type === 'warning' ? '⚠' : '›'}
                                    </span>
                                    {line.text}
                                </div>
                            )
                        ))}
                    </div>
                )}

                {/* Coordinates */}
                {showData && (
                    <div className="coordinates-hud fade-slide-in" style={{ animationDelay: '0.8s' }}>
                        <div className="coord-group">
                            <span className="coord-label">LAT</span>
                            <span className="coord-value">46.2341°N</span>
                        </div>
                        <div className="coord-divider" />
                        <div className="coord-group">
                            <span className="coord-label">LON</span>
                            <span className="coord-value">7.4012°E</span>
                        </div>
                        <div className="coord-divider" />
                        <div className="coord-group">
                            <span className="coord-label">ALT</span>
                            <span className="coord-value counting">
                                {Math.max(0, Math.floor(120000 - progress * 1200))} FT
                            </span>
                        </div>
                        <div className="coord-divider" />
                        <div className="coord-group">
                            <span className="coord-label">STATUS</span>
                            <span className="coord-value" style={{ color: progress > 66 ? '#00ff88' : '#ffaa00', fontSize: '0.85rem' }}>
                                {progress > 66 ? 'LOCKED' : progress > 33 ? 'TRACKING' : 'ACQUIRING'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Progress bar */}
                {showData && (
                    <div className="progress-section fade-slide-in" style={{ animationDelay: '1s' }}>
                        <div className="progress-header">
                            <span>DESTINATION: SERN RESEARCH FACILITY</span>
                            <span className="progress-percent">{Math.floor(progress)}%</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                            <div className="progress-glow" style={{ left: `${progress}%` }} />
                        </div>
                        <div className="progress-footer">
                            <span className="blink-slow">● {progress > 80 ? 'FACILITY APPROACH' : 'ESTABLISHING SECURE LINK'}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="scan-line" />

            {/* Corner brackets */}
            <div className="bracket top-left" />
            <div className="bracket top-right" />
            <div className="bracket bottom-left" />
            <div className="bracket bottom-right" />

            {/* Side data strips */}
            <div className="side-strip left">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="strip-line" style={{ animationDelay: `${i * 0.3}s` }}>
                        {Math.random().toString(36).substring(2, 8).toUpperCase()}
                    </div>
                ))}
            </div>
            <div className="side-strip right">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="strip-line" style={{ animationDelay: `${i * 0.25}s` }}>
                        {`0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TransitionSequence;
