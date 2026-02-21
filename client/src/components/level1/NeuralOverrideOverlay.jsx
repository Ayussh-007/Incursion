/**
 * NeuralOverrideOverlay — Strategist Neural Override (E key)
 *
 * When active:
 *  - Electric-blue grid overlays the entire environment
 *  - Glass inspection panel slides in with the full decode chain:
 *      Morse encoded on walls → morsecode.world → "1B37" → hex → decimal → 6967
 *  - Link to morsecode.world displayed in a classified-reference style
 *  - Auto-dismisses when user closes or after 12 seconds (player needs time to read)
 *  - Timer is paused while active
 *
 * Morse for 1B37 (split across left/right wall panels):
 *   LEFT  (1B): .---- -...
 *   RIGHT (37): ...-- --...
 *   Combined on morsecode.world → "1B37"
 *   0x1B37 = 6967 (decimal) → keypad
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Classified reference link — opens morsecode.world in new tab without affecting routing
const MORSE_DECODER_URL = 'https://morsecode.world/international/translator.html';

const PHASE_1_HINTS = [
    { delay: 0.4, text: 'ANOMALOUS SIGNAL DETECTED — ALLOY SURFACE, UV STRATUM' },
    { delay: 0.85, text: 'PATTERN CLASS: ENCODED TRANSMISSION' },
    { delay: 1.25, text: 'TRANSMISSION FORMAT DETECTED' },
    { delay: 1.65, text: 'INTERNATIONAL MORSE STANDARD IDENTIFIED' },
];

const PHASE_2_HINTS = [
    { delay: 2.1, text: 'SURFACE SPLIT: TWO PARTIAL SEGMENTS DETECTED' },
    { delay: 2.5, text: 'LEFT SEGMENT — DIGITS 1-2  →  .---- -...' },
    { delay: 2.9, text: 'RIGHT SEGMENT — DIGITS 3-4  →  ...-- --...' },
    { delay: 3.35, text: 'CONCATENATE BOTH SEGMENTS INTO SINGLE DECODE STRING' },
];

const PHASE_3_HINTS = [
    { delay: 4.0, text: 'DECODE RELAY — USE EXTERNAL CLASSIFIER' },
    { delay: 4.5, text: 'OUTPUT FORMAT: HEXADECIMAL LAYER' },
    { delay: 4.95, text: 'HEX LAYER UNSTABLE — REDUCE TO NUMERIC CORE' },
    { delay: 5.4, text: 'STRIP NON-DECIMAL ARTIFACTS' },
    { delay: 5.9, text: 'CONVERT SIGNAL LAYER TO DECIMAL — ENTRY CODE' },
];

function HintLine({ text, delay, dimmed }) {
    return (
        <motion.div
            className={`neural-clue-line ${dimmed ? 'neural-clue-dim' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: dimmed ? 0.35 : 1, x: 0 }}
            transition={{ duration: 0.35, delay }}
        >
            <span className="neural-clue-bullet">›</span>
            {text}
        </motion.div>
    );
}

export default function NeuralOverrideOverlay({ onDismiss }) {
    const [countdown, setCountdown] = useState(12);
    const [phase, setPhase] = useState(0); // 0,1,2 — controls which sections are lit

    const dismiss = useCallback(() => {
        onDismiss?.();
    }, [onDismiss]);

    useEffect(() => {
        // Phase transitions for hint reveal rhythm
        const p1 = setTimeout(() => setPhase(1), 2400);
        const p2 = setTimeout(() => setPhase(2), 3700);
        const p3 = setTimeout(() => setPhase(3), 5100);
        return () => { clearTimeout(p1); clearTimeout(p2); clearTimeout(p3); };
    }, []);

    // Countdown + auto-dismiss at 0
    useEffect(() => {
        const tick = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) {
                    clearInterval(tick);
                    dismiss();
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(tick);
    }, [dismiss]);

    const openDecoder = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(MORSE_DECODER_URL, '_blank', 'noopener,noreferrer');
    }, []);

    return (
        <>
            {/* Hidden in source, discoverable via DevTools — part of the puzzle */}
            {/* INCURSION AEGIS // MORSE DECODE RELAY :: https://morsecode.world/international/translator.html */}
            {/* COMBINED SEQUENCE: .---- -... ...-- --... */}

            <motion.div
                className="neural-override-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={dismiss}
            >
                {/* Electric-blue tactical grid */}
                <div className="neural-grid" />

                {/* Edge glow */}
                <div className="neural-edge-glow" />

                {/* Vignette corners */}
                <div className="neural-corner neural-tl" />
                <div className="neural-corner neural-tr" />
                <div className="neural-corner neural-bl" />
                <div className="neural-corner neural-br" />

                {/* ── Top HUD bar ── */}
                <motion.div
                    className="neural-hud-bar"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    onClick={e => e.stopPropagation()}
                >
                    <span className="neural-hud-label">NEURAL OVERRIDE ACTIVE</span>
                    <span className="neural-hud-op">OPERATIVE: STRATEGIST</span>
                    <span className="neural-hud-dismiss">DISMISS [{countdown}s]</span>
                </motion.div>

                {/* ── Glass inspection panel ── */}
                <motion.div
                    className="neural-glass-panel"
                    initial={{ opacity: 0, scale: 0.93, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Panel header */}
                    <div className="neural-panel-header">
                        <div className="neural-panel-dot" />
                        <span>ENVIRONMENTAL SCAN — SECTOR 7-ALPHA</span>
                        <div className="neural-panel-dot" />
                    </div>

                    {/* Sweep animation */}
                    <div className="neural-scan-sweep" />

                    {/* Anomaly block */}
                    <div className="neural-anomaly-block">
                        <div className="neural-anomaly-label">⬡ ANOMALY DETECTED</div>
                        <div className="neural-anomaly-sub">UV-REACTIVE ENCODING PRESENT — SURFACE ALLOY — BOTH WALLS</div>
                    </div>

                    {/* ── Phase 1: Detection hints ── */}
                    <div className="neural-clues neural-clues-phase1">
                        {PHASE_1_HINTS.map(({ delay, text }, i) => (
                            <HintLine key={i} text={text} delay={delay} dimmed={phase > 1} />
                        ))}
                    </div>

                    {/* ── Phase 2: Wall segments (revealed after P1) ── */}
                    <AnimatePresence>
                        {phase >= 1 && (
                            <motion.div
                                className="neural-segment-block"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="neural-segment-divider" />
                                <div className="neural-clues">
                                    {PHASE_2_HINTS.map(({ delay, text }, i) => (
                                        <HintLine key={i} text={text} delay={0} dimmed={phase > 2} />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Phase 3: Decode chain + link (revealed after P2) ── */}
                    <AnimatePresence>
                        {phase >= 2 && (
                            <motion.div
                                className="neural-decode-section"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="neural-segment-divider" />
                                <div className="neural-clues">
                                    {PHASE_3_HINTS.map(({ delay, text }, i) => (
                                        <HintLine key={i} text={text} delay={0} dimmed={false} />
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Classified reference link (shown after phase 2) ── */}
                    <AnimatePresence>
                        {phase >= 2 && (
                            <motion.div
                                className="neural-decode-relay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <div className="neural-relay-label">CLASSIFIED DECODE RELAY — EXTERNAL ACCESS</div>

                                {/* The actual link to morsecode.world — classified-reference styled */}
                                <button
                                    className="neural-relay-link-btn"
                                    onClick={openDecoder}
                                    title="Open Morse Code Translator"
                                    type="button"
                                >
                                    <span className="neural-relay-protocol">https://</span>
                                    <span className="neural-relay-domain">morsecode.world</span>
                                    <span className="neural-relay-path">/international/translator.html</span>
                                    <span className="neural-relay-action">↗ OPEN IN NEW TAB</span>
                                </button>

                                <div className="neural-relay-note">
                                    [ PASTE FULL MORSE STRING — READ OUTPUT AS HEX — CONVERT TO DECIMAL FOR ENTRY CODE ]
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Hex decode indicator — flickers showing the obfuscated output */}
                    <div className="neural-hex-row">
                        {['??', '??', '??', '??'].map((h, i) => (
                            <motion.div
                                key={i}
                                className="neural-hex-cell"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.45, 0.08, 0.55, 0.12] }}
                                transition={{ duration: 1.8, delay: 1.2 + i * 0.18, repeat: Infinity, repeatType: 'reverse' }}
                            >
                                {h}
                            </motion.div>
                        ))}
                    </div>

                    {/* Panel footer */}
                    <div className="neural-panel-footer">
                        <span>TRANSMISSION LAYER ACTIVE</span>
                        <span className="neural-footer-code">ALPHA-7 CLEARANCE REQUIRED</span>
                    </div>
                </motion.div>

                {/* L/R wall node indicators — point player toward the walls */}
                <motion.div
                    className="neural-wall-node neural-node-left"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                >
                    <div className="neural-node-ring" />
                    <span className="neural-node-label">ENCODED</span>
                    <span className="neural-node-morse">.---- -...</span>
                </motion.div>
                <motion.div
                    className="neural-wall-node neural-node-right"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity, delay: 0.55 }}
                >
                    <div className="neural-node-ring" />
                    <span className="neural-node-label">ENCODED</span>
                    <span className="neural-node-morse">...-- --...</span>
                </motion.div>
            </motion.div>
        </>
    );
}
