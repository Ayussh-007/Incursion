/**
 * Level1Scene — Orchestrator for Level 1: ACT II – SILENT BREACH
 * Phase flow: ACT_INTRO → GAMEPLAY → UNLOCKING → SUCCESS | FAILURE
 * Features: 3-min countdown timer, UV scanner (L), Neural Override (E), Failure screen
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameState';
import ActIntro from '../components/level1/ActIntro';
import KeypadLock from '../components/level1/KeypadLock';
import UnlockSequence from '../components/level1/UnlockSequence';
import SuccessOverlay from '../components/level1/SuccessOverlay';
import NeuralOverrideOverlay from '../components/level1/NeuralOverrideOverlay';
import FailureScreen from '../components/level1/FailureScreen';
import { resumeAudio, playUVActivate, playNeuralOverride, playTensionDrone } from '../utils/soundEngine';
import '../styles/Level1Scene.css';

const TIMER_SECONDS = 120; // 2 minutes
const NEURAL_COOLDOWN = 15; // seconds

// ── Morse code panels — embedded in corridor walls ─────────────────────────────
// Puzzle chain:
//   UV mode (L) illuminates Morse on both walls
//   Left  panel: .---- --...  (Morse for digits 1 and 7)
//   Right panel: ..--- ----.  (Morse for digits 2 and 9)
//   Decode at: https://morsecode.world/international/translator.html → output is 1729
//   Enter 1729 on the keypad → access granted
function MorsePanel({ side, uvMode, cursorPos }) {
    const panelRef = useRef(null);
    const [uvReveal, setUvReveal] = useState(0);

    // Correct Morse for 1729:
    //   1 = .----   7 = --...  →  left panel
    //   2 = ..---   9 = ----.  →  right panel
    // Password 1729: 1=.---- 7=--... 2=..--- 9=----.
    const morseCode = side === 'left' ? '.---- --...' : '..--- ----.';
    const morseHint = side === 'left' ? 'KEYPAD 1·7' : 'KEYPAD 2·9';
    // data-morse attribute is readable via DevTools as an extra hint
    // INCURSION :: Morse on this surface. Decode at: https://morsecode.world/international/translator.html

    useEffect(() => {
        if (!uvMode || !panelRef.current) {
            setUvReveal(0);
            return;
        }
        const rect = panelRef.current.getBoundingClientRect();
        const panelCx = rect.left + rect.width / 2;
        const panelCy = rect.top + rect.height / 2;
        const dist = Math.sqrt(
            Math.pow(cursorPos.x - panelCx, 2) + Math.pow(cursorPos.y - panelCy, 2)
        );
        // Realistic torch cone: full reveal within 160px, soft falloff to 300px
        const reveal = Math.max(0, 1 - dist / 300) * (dist < 160 ? 1 : 1 - (dist - 160) / 140);
        setUvReveal(Math.max(0, Math.min(1, reveal)));
    }, [uvMode, cursorPos]);

    return (
        <div
            ref={panelRef}
            className={`morse-panel morse-panel-${side}`}
            data-morse={morseCode}
            data-hint={morseHint}
            data-decode="https://morsecode.world/international/translator.html"
        >
            {/* Alien scratch texture base — always faint, organic-looking */}
            <div className="morse-scratch-bg" />

            {/* Morse text — revealed progressively by UV proximity */}
            <div
                className="morse-text-wrapper"
                style={{ '--uv-reveal': uvReveal }}
            >
                <div className="morse-side-label">{morseHint}</div>

                {/* Organic glyph row — dots and dashes styled as alien engravings */}
                <div className="morse-glyph-row">
                    {morseCode.split('').map((char, i) => {
                        if (char === '.') return <span key={i} className="morse-glyph morse-dot" aria-hidden="true" />;
                        if (char === '-') return <span key={i} className="morse-glyph morse-dash" aria-hidden="true" />;
                        return <span key={i} className="morse-glyph morse-space" aria-hidden="true" />;
                    })}
                </div>

                {/* Raw text form — screen-reader hidden, useful via DevTools */}
                <div className="morse-text" aria-hidden="true" style={{ display: 'none' }}>{morseCode}</div>
            </div>

            {/* UV reactive scratch marks — secondary alien texture layer */}
            <div className="morse-scratches" style={{ opacity: uvReveal * 0.7 }} />

            {/* UV proximity glow halo around panel */}
            <div className="morse-uv-halo" style={{ opacity: uvReveal * 0.5 }} />
        </div>
    );
}

// ── UV Light Cone — follows cursor ────────────────────────────────────────────
function UVCone({ cursorPos }) {
    return (
        <div
            className="uv-cone"
            style={{
                left: cursorPos.x,
                top: cursorPos.y,
            }}
        />
    );
}

// ── Timer Display ─────────────────────────────────────────────────────────────
function TimerDisplay({ timeLeft, started }) {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const isUrgent = timeLeft <= 30;
    const isCritical = timeLeft <= 10;

    return (
        <motion.div
            className={`timer-display ${isUrgent ? 'timer-urgent' : ''} ${isCritical ? 'timer-critical' : ''}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: started ? 1 : 0, x: started ? 0 : 20 }}
            transition={{ duration: 0.4 }}
        >
            <div className="timer-label">TIME REMAINING</div>
            <div className="timer-value">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
            {isUrgent && (
                <motion.div
                    className="timer-warning"
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                >
                    ▸ DETECTION IMMINENT
                </motion.div>
            )}
        </motion.div>
    );
}

// ── Strategist HUD Badges ─────────────────────────────────────────────────────
function StrategistBadges({ uvMode, neuralReady, neuralCooldownPct }) {
    return (
        <div className="strategist-badges">
            <div className={`strat-badge ${uvMode ? 'strat-badge-active' : ''}`}>
                <span className="strat-badge-key">[L]</span>
                <span className="strat-badge-label">UV</span>
                {uvMode && <div className="strat-badge-glow" />}
            </div>
            <div className={`strat-badge ${neuralReady ? 'strat-badge-ready' : 'strat-badge-cooldown'}`}>
                <span className="strat-badge-key">[E]</span>
                <span className="strat-badge-label">OVERRIDE</span>
                {!neuralReady && (
                    <div
                        className="strat-badge-cd-bar"
                        style={{ width: `${neuralCooldownPct * 100}%` }}
                    />
                )}
            </div>
        </div>
    );
}

// ── Corridor Environment ──────────────────────────────────────────────────────
function CorridorEnvironment({ flickering, failure, uvMode, cursorPos }) {
    return (
        <div className={`corridor-env ${flickering ? 'corridor-flicker' : ''} ${failure ? 'corridor-failure' : ''}`}>
            {/* Ceiling */}
            <div className="corridor-ceiling">
                <div className="corridor-ceiling-panel corridor-ceiling-panel-1" />
                <div className="corridor-ceiling-panel corridor-ceiling-panel-2" />
                <div className="corridor-ceiling-panel corridor-ceiling-panel-3" />
                <div className="ceiling-light-strip ceiling-light-left" />
                <div className="ceiling-light-strip ceiling-light-right" />
            </div>

            {/* Left wall */}
            <div className="corridor-wall corridor-wall-left">
                <div className="wall-panel-lines" />
                <div className="wall-rivet wall-rivet-1" />
                <div className="wall-rivet wall-rivet-2" />
                <div className="wall-rivet wall-rivet-3" />
                <div className="wall-spark wall-spark-1" />
                <div className="wall-spark wall-spark-2" />
                <div className="wall-light-strip" />
                {/* Morse code panel — left */}
                <MorsePanel side="left" uvMode={uvMode} cursorPos={cursorPos} />
            </div>

            {/* Right wall */}
            <div className="corridor-wall corridor-wall-right">
                <div className="wall-panel-lines" />
                <div className="wall-rivet wall-rivet-1" />
                <div className="wall-rivet wall-rivet-2" />
                <div className="wall-rivet wall-rivet-3" />
                <div className="wall-light-strip" />
                {/* Morse code panel — right */}
                <MorsePanel side="right" uvMode={uvMode} cursorPos={cursorPos} />
            </div>

            {/* Floor */}
            <div className="corridor-floor">
                <div className="floor-reflection" />
                <div className="floor-grid" />
                <div className="floor-center-line" />
            </div>

            {/* Volumetric fog */}
            <div className="corridor-fog corridor-fog-1" />
            <div className="corridor-fog corridor-fog-2" />
            <div className="corridor-fog corridor-fog-3" />

            {/* The reinforced door */}
            <div className="corridor-door">
                <div className="door-frame">
                    <div className="door-frame-lights">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className={`door-frame-light ${failure ? 'door-frame-light--red' : 'door-frame-light--blue'}`} />
                        ))}
                    </div>
                    <div className="door-surface">
                        <div className="door-panel door-panel-top" />
                        <div className="door-center-seam" />
                        <div className="door-panel door-panel-bottom" />
                        <div className="door-bolt door-bolt-tl" />
                        <div className="door-bolt door-bolt-tr" />
                        <div className="door-bolt door-bolt-bl" />
                        <div className="door-bolt door-bolt-br" />
                        <div className="door-warning-stripe door-warning-top" />
                        <div className="door-warning-stripe door-warning-bottom" />
                    </div>
                </div>
            </div>

            {/* Keypad mount */}
            <div className="keypad-mount" />

            {/* UV Cone — only visible in UV mode */}
            {uvMode && <UVCone cursorPos={cursorPos} />}

            {/* UV darkening overlay */}
            {uvMode && <div className="uv-darkness-overlay" />}
        </div>
    );
}

// ── Main Scene ────────────────────────────────────────────────────────────────
export default function Level1Scene() {
    const completeLevel = useGameStore((s) => s.completeLevel);
    const navigate = useNavigate();

    // Phase state machine
    const [phase, setPhase] = useState('ACT_INTRO');
    // ACT_INTRO | GAMEPLAY | UNLOCKING | SUCCESS | FAILURE

    // Environment
    const [flickering, setFlickering] = useState(false);

    // Timer — starts immediately when gameplay phase loads
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const timerRef = useRef(null);

    // UV mode
    const [uvMode, setUvMode] = useState(false);
    const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

    // Neural Override
    const [neuralActive, setNeuralActive] = useState(false);
    const [neuralReady, setNeuralReady] = useState(true);
    const [neuralCooldownPct, setNeuralCooldownPct] = useState(0);
    const neuralCdRef = useRef(null);

    // ── Timer management — starts automatically when GAMEPLAY loads ───────────
    useEffect(() => {
        if (phase !== 'GAMEPLAY') return;
        if (neuralActive) return; // paused during ability

        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timerRef.current);
                    setPhase('FAILURE');
                    return 0;
                }
                // Play periodic tension drone
                if ((TIMER_SECONDS - t + 1) % 6 === 0) {
                    const intensity = 1 - (t / TIMER_SECONDS);
                    playTensionDrone(intensity);
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [phase, neuralActive]);

    // ── Mouse tracking for UV cone ─────────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => setCursorPos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handler);
        return () => window.removeEventListener('mousemove', handler);
    }, []);

    // ── Key bindings — GAMEPLAY only ───────────────────────────────────────────
    useEffect(() => {
        if (phase !== 'GAMEPLAY') return;

        const handler = (e) => {
            // L — UV scanner toggle (skip if typing in keypad digit keys)
            if (e.key === 'l' || e.key === 'L') {
                resumeAudio();
                playUVActivate();
                setUvMode((prev) => !prev);
                return;
            }

            // E — Neural Override ability
            if (e.key === 'e' || e.key === 'E') {
                if (!neuralReady || neuralActive) return;
                resumeAudio();
                playNeuralOverride();
                setNeuralActive(true);

                // Start cooldown
                setNeuralReady(false);
                setNeuralCooldownPct(0);
                const totalMs = NEURAL_COOLDOWN * 1000;
                const tickMs = 100;
                let elapsed = 0;
                neuralCdRef.current = setInterval(() => {
                    elapsed += tickMs;
                    const pct = elapsed / totalMs;
                    setNeuralCooldownPct(pct);
                    if (pct >= 1) {
                        clearInterval(neuralCdRef.current);
                        setNeuralReady(true);
                        setNeuralCooldownPct(1);
                    }
                }, tickMs);
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [phase, neuralReady, neuralActive]);

    // Cleanup neural cooldown on unmount
    useEffect(() => () => {
        if (neuralCdRef.current) clearInterval(neuralCdRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    // ── Callbacks ──────────────────────────────────────────────────────────────
    const handleActDone = useCallback(() => setPhase('GAMEPLAY'), []);

    const handleUnlock = useCallback(() => {
        clearInterval(timerRef.current);
        setPhase('UNLOCKING');
    }, []);

    const handleUnlockDone = useCallback(() => setPhase('SUCCESS'), []);

    const handleSuccessDone = useCallback(async () => {
        await completeLevel();
        // Go to /mission — MissionPage will detect pendingUnlock and show CHAR_INTRO
        navigate('/mission', { replace: true });
    }, [completeLevel, navigate]);

    const handleFlicker = useCallback(() => {
        setFlickering(true);
        setTimeout(() => setFlickering(false), 1200);
    }, []);

    const handleNeuralDismiss = useCallback(() => {
        setNeuralActive(false);
    }, []);

    const handleRetry = useCallback(() => {
        // Full level state reset
        clearInterval(timerRef.current);
        clearInterval(neuralCdRef.current);
        setPhase('GAMEPLAY');
        setTimeLeft(TIMER_SECONDS);
        setUvMode(false);
        setNeuralActive(false);
        setNeuralReady(true);
        setNeuralCooldownPct(0);
        setFlickering(false);
    }, []);

    return (
        <div className="level1-scene">
            {/* ── ACT INTRO ── */}
            <AnimatePresence>
                {phase === 'ACT_INTRO' && (
                    <ActIntro onComplete={handleActDone} />
                )}
            </AnimatePresence>

            {/* ── GAMEPLAY + UNLOCKING ── */}
            <AnimatePresence>
                {(phase === 'GAMEPLAY' || phase === 'UNLOCKING') && (
                    <motion.div
                        className="level1-gameplay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <CorridorEnvironment
                            flickering={flickering}
                            failure={false}
                            uvMode={uvMode}
                            cursorPos={cursorPos}
                        />

                        {/* Keypad — only during GAMEPLAY, draggable */}
                        <AnimatePresence>
                            {phase === 'GAMEPLAY' && (
                                <motion.div
                                    className="level1-keypad-wrapper"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                    drag
                                    dragConstraints={{ left: -700, right: 200, top: -300, bottom: 300 }}
                                    dragElastic={0.12}
                                    dragMomentum={false}
                                    whileDrag={{ scale: 1.03, boxShadow: '0 0 40px rgba(30,144,255,0.25)' }}
                                    style={{ cursor: 'grab' }}
                                >
                                    <KeypadLock
                                        onUnlock={handleUnlock}
                                        onFlicker={handleFlicker}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Unlock sequence */}
                        <AnimatePresence>
                            {phase === 'UNLOCKING' && (
                                <UnlockSequence onComplete={handleUnlockDone} />
                            )}
                        </AnimatePresence>

                        {/* Neural Override overlay */}
                        <AnimatePresence>
                            {neuralActive && phase === 'GAMEPLAY' && (
                                <NeuralOverrideOverlay
                                    onDismiss={handleNeuralDismiss}
                                    cooldownSeconds={NEURAL_COOLDOWN}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── FAILURE ── */}
            <AnimatePresence>
                {phase === 'FAILURE' && (
                    <motion.div
                        className="level1-failure-wrapper"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <CorridorEnvironment
                            flickering={false}
                            failure={true}
                            uvMode={false}
                            cursorPos={cursorPos}
                        />
                        <FailureScreen onRetry={handleRetry} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── SUCCESS OVERLAY ── */}
            <AnimatePresence>
                {phase === 'SUCCESS' && (
                    <SuccessOverlay onComplete={handleSuccessDone} />
                )}
            </AnimatePresence>

            {/* ── HUD — top left level indicator ── */}
            {phase !== 'ACT_INTRO' && phase !== 'FAILURE' && (
                <div className="level1-hud">
                    <div className="hud-level-tag">
                        <span className="hud-label">LEVEL</span>
                        <span className="hud-value">01</span>
                    </div>
                    <div className="hud-mission-tag">
                        <span className="hud-label">ACT II</span>
                        <span className="hud-value hud-value-blue">SILENT BREACH</span>
                    </div>
                </div>
            )}

            {/* ── OPERATIVE HUD badges ── */}
            {phase === 'GAMEPLAY' && (
                <motion.div
                    style={{ position: 'fixed', bottom: 24, left: 24, zIndex: 50, cursor: 'grab' }}
                    drag
                    dragConstraints={{ left: -24, right: 800, top: -600, bottom: 24 }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    whileDrag={{ scale: 1.04 }}
                >
                    <StrategistBadges
                        uvMode={uvMode}
                        neuralReady={neuralReady}
                        neuralCooldownPct={neuralCooldownPct}
                    />
                </motion.div>
            )}

            {/* ── TIMER ── always started */}
            {phase === 'GAMEPLAY' && (
                <TimerDisplay timeLeft={timeLeft} started={true} />
            )}
        </div>
    );
}

