/**
 * NeuralOverrideOverlay — VYRON's Neural Override ability UI
 * Blue grid overlay + glass inspection panel with Morse decode clues
 * Timer is paused while this is visible. Auto-dismisses after 6s.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Hidden decoder URL comment injected into the DOM (not visible in UI)
// <!-- INCURSION DECODE RELAY :: https://decode.incursion-aegis.net :: TRANSMISSION LAYER ACTIVE -->

const CLUE_LINES = [
    { delay: 0.3, text: 'SIGNAL ENCODED.' },
    { delay: 0.6, text: 'CONVERT TRANSMISSION LAYER.' },
    { delay: 0.9, text: 'EXTERNAL DECODE REQUIRED.' },
];

function NeuralOverrideOverlay({ onDismiss, cooldownSeconds = 45 }) {
    const [phase, setPhase] = useState('in'); // 'in' | 'active' | 'out'
    const [countdown, setCountdown] = useState(6);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(interval);
                    setPhase('out');
                    setTimeout(() => onDismiss?.(), 500);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);

        const phaseTimer = setTimeout(() => setPhase('active'), 400);
        return () => {
            clearInterval(interval);
            clearTimeout(phaseTimer);
        };
    }, [onDismiss]);

    return (
        /* Hidden decode relay comment — discoverable via DevTools page source */
        <>
            {/* INCURSION DECODE RELAY :: https://decode.incursion-aegis.net :: TRANSMISSION LAYER ACTIVE */}
            <motion.div
                className="neural-override-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
            >
                {/* Blue grid lines */}
                <div className="neural-grid" />

                {/* Edge glow */}
                <div className="neural-edge-glow" />

                {/* Corner brackets */}
                <div className="neural-corner neural-tl" />
                <div className="neural-corner neural-tr" />
                <div className="neural-corner neural-bl" />
                <div className="neural-corner neural-br" />

                {/* Top HUD bar */}
                <motion.div
                    className="neural-hud-bar"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <span className="neural-hud-label">NEURAL OVERRIDE ACTIVE</span>
                    <span className="neural-hud-op">OPERATIVE: VYRON</span>
                    <span className="neural-hud-dismiss">AUTO-DISMISS IN {countdown}s</span>
                </motion.div>

                {/* Glass inspection panel */}
                <motion.div
                    className="neural-glass-panel"
                    initial={{ opacity: 0, scale: 0.92, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    {/* Panel header */}
                    <div className="neural-panel-header">
                        <div className="neural-panel-dot" />
                        <span>ENVIRONMENTAL SCAN — SECTOR 7-ALPHA</span>
                        <div className="neural-panel-dot" />
                    </div>

                    {/* Scan lines across panel */}
                    <div className="neural-scan-sweep" />

                    {/* Anomaly detected block */}
                    <div className="neural-anomaly-block">
                        <div className="neural-anomaly-label">⬡ ANOMALY DETECTED</div>
                        <div className="neural-anomaly-sub">ENCODED PATTERN ON SURFACE ALLOY — UV STRATUM</div>
                    </div>

                    {/* Clue lines */}
                    <div className="neural-clues">
                        {CLUE_LINES.map(({ delay, text }, i) => (
                            <motion.div
                                key={i}
                                className="neural-clue-line"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay }}
                            >
                                <span className="neural-clue-bullet">›</span>
                                {text}
                            </motion.div>
                        ))}
                    </div>

                    {/* Decoder relay - styled as redacted URL hint, not copyable */}
                    <motion.div
                        className="neural-decode-relay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                    >
                        <div className="neural-relay-label">RELAY ENDPOINT DETECTED</div>
                        <div className="neural-relay-url" aria-hidden="true">
                            <span className="neural-relay-protocol">https://</span>
                            <span className="neural-relay-domain">decode.incursion&#8288;-aegis.net</span>
                        </div>
                        <div className="neural-relay-note">[ CHECK PAGE SOURCE FOR DIRECT RELAY LINK ]</div>
                    </motion.div>

                    {/* Hex line decorations */}
                    <div className="neural-hex-row">
                        {['36', '39', '36', '37'].map((h, i) => (
                            <motion.div
                                key={i}
                                className="neural-hex-cell"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 0.4, 0.1, 0.5, 0.15] }}
                                transition={{ duration: 1.5, delay: 1.4 + i * 0.15, repeat: Infinity, repeatType: 'reverse' }}
                            >
                                ??
                            </motion.div>
                        ))}
                    </div>

                    {/* Panel footer */}
                    <div className="neural-panel-footer">
                        <span>TRANSMISSION LAYER ACTIVE</span>
                        <span className="neural-footer-code">ALPHA-7 CLEARANCE REQUIRED</span>
                    </div>
                </motion.div>

                {/* Floating node highlights on wall sides */}
                <motion.div
                    className="neural-wall-node neural-node-left"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                >
                    <div className="neural-node-ring" />
                    <span className="neural-node-label">ENCODED</span>
                </motion.div>
                <motion.div
                    className="neural-wall-node neural-node-right"
                    animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
                >
                    <div className="neural-node-ring" />
                    <span className="neural-node-label">ENCODED</span>
                </motion.div>
            </motion.div>
        </>
    );
}

export default NeuralOverrideOverlay;
