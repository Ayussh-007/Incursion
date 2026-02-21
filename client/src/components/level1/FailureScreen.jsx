/**
 * FailureScreen — CAPTURED / INFILTRATION FAILED sequence
 * Red ambient, alien scan beam sweep, retry option
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playAlarmSweep, playCaptureBoom } from '../../utils/soundEngine';

function FailureScreen({ onRetry }) {
    const [phase, setPhase] = useState('scan'); // 'scan' | 'text' | 'retry'

    useEffect(() => {
        playAlarmSweep();
        const t1 = setTimeout(() => {
            playCaptureBoom();
            setPhase('text');
        }, 1200);
        const t2 = setTimeout(() => setPhase('retry'), 3000);
        return () => [t1, t2].forEach(clearTimeout);
    }, []);

    return (
        <motion.div
            className="failure-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Red ambient overlay */}
            <div className="failure-ambient" />

            {/* Scanlines */}
            <div className="failure-scanlines" />

            {/* Alien scan beam */}
            <motion.div
                className="failure-scan-beam"
                initial={{ x: '-100vw', opacity: 0 }}
                animate={{ x: '200vw', opacity: [0, 0.6, 0.6, 0] }}
                transition={{ duration: 1.8, ease: 'linear', delay: 0.2 }}
            />
            <motion.div
                className="failure-scan-beam failure-scan-beam-2"
                initial={{ x: '-100vw', opacity: 0 }}
                animate={{ x: '200vw', opacity: [0, 0.4, 0.4, 0] }}
                transition={{ duration: 2.2, ease: 'linear', delay: 0.5 }}
            />

            {/* Corridor red light pulses */}
            <motion.div
                className="failure-red-pulse"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity }}
            />

            {/* Text block */}
            <AnimatePresence>
                {phase !== 'scan' && (
                    <motion.div
                        className="failure-content"
                        initial={{ opacity: 0, scale: 1.08 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        {/* Corner brackets */}
                        <div className="failure-corner failure-tl" />
                        <div className="failure-corner failure-tr" />
                        <div className="failure-corner failure-bl" />
                        <div className="failure-corner failure-br" />

                        {/* Top separator */}
                        <motion.div
                            className="failure-separator"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />

                        {/* Status tag */}
                        <motion.div
                            className="failure-status-tag"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.15 }}
                        >
                            ▸ MISSION STATUS · CRITICAL
                        </motion.div>

                        {/* CAPTURED */}
                        <motion.h1
                            className="failure-title"
                            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            transition={{ duration: 0.7, delay: 0.3 }}
                        >
                            CAPTURED.
                        </motion.h1>

                        {/* INFILTRATION FAILED */}
                        <motion.p
                            className="failure-subtitle"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                        >
                            INFILTRATION FAILED.
                        </motion.p>

                        {/* Bottom separator */}
                        <motion.div
                            className="failure-separator"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        />

                        {/* Diagnostics */}
                        <motion.div
                            className="failure-diag"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.0 }}
                        >
                            <div className="failure-diag-row">
                                <span className="failure-diag-key">OPERATIVE</span>
                                <span className="failure-diag-val">VYRON · PHANTOM-1</span>
                            </div>
                            <div className="failure-diag-row">
                                <span className="failure-diag-key">BREACH POINT</span>
                                <span className="failure-diag-val">SECTOR 7-ALPHA HATCH</span>
                            </div>
                            <div className="failure-diag-row">
                                <span className="failure-diag-key">CAUSE</span>
                                <span className="failure-diag-val failure-diag-cause">TIME LIMIT EXCEEDED</span>
                            </div>
                        </motion.div>

                        {/* Retry button */}
                        <AnimatePresence>
                            {phase === 'retry' && (
                                <motion.button
                                    className="failure-retry-btn"
                                    onClick={onRetry}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.96 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <span className="failure-retry-icon">↺</span>
                                    RETRY INFILTRATION
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default FailureScreen;
