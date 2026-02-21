/**
 * NeuralOverrideOverlay — Strategist Neural Override (E key)
 *
 * Scans the environment and flags UV-reactive anomalies on both walls.
 * Does NOT reveal the morse code — just tells the player something is there.
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NeuralOverrideOverlay({ onDismiss }) {
    const [countdown, setCountdown] = useState(10);

    const dismiss = useCallback(() => onDismiss?.(), [onDismiss]);

    useEffect(() => {
        const tick = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) { clearInterval(tick); dismiss(); return 0; }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(tick);
    }, [dismiss]);

    return (
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
            <div className="neural-edge-glow" />
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

            {/* ── Left wall anomaly marker ── */}
            <motion.div
                className="neural-wall-node neural-node-left"
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.12, 1] }}
                transition={{ duration: 1.0, repeat: Infinity }}
                onClick={e => e.stopPropagation()}
            >
                <div className="neural-node-ring" />
                <motion.span
                    className="neural-anomaly-tag"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    ⚠ ANOMALY
                </motion.span>
                <span className="neural-node-label">UV-REACTIVE SURFACE</span>
            </motion.div>

            {/* ── Right wall anomaly marker ── */}
            <motion.div
                className="neural-wall-node neural-node-right"
                animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.12, 1] }}
                transition={{ duration: 1.0, repeat: Infinity, delay: 0.5 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="neural-node-ring" />
                <motion.span
                    className="neural-anomaly-tag"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    ⚠ ANOMALY
                </motion.span>
                <span className="neural-node-label">UV-REACTIVE SURFACE</span>
            </motion.div>

            {/* ── Scan line sweeping left→right across the screen ── */}
            <motion.div
                className="neural-full-scan-line"
                initial={{ x: '-100vw' }}
                animate={{ x: '100vw' }}
                transition={{ duration: 1.6, ease: 'linear', delay: 0.2 }}
            />
        </motion.div>
    );
}
