/**
 * ActIntro — Cinematic "ACT II / SILENT BREACH" text reveal
 * Strategist electric-blue accent, glitch ripple, dissolves into corridor
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Level1Scene.css';

function ActIntro({ onComplete }) {
    const [phase, setPhase] = useState('act'); // 'act' | 'title' | 'dissolve' | 'done'

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('title'), 900);
        const t2 = setTimeout(() => setPhase('dissolve'), 3200);
        const t3 = setTimeout(() => { setPhase('done'); onComplete?.(); }, 4200);
        return () => [t1, t2, t3].forEach(clearTimeout);
    }, [onComplete]);

    if (phase === 'done') return null;

    return (
        <div className="act-intro-scene act-intro-blue">
            {/* Atmospheric fog layers */}
            <div className="act-fog act-fog-1" />
            <div className="act-fog act-fog-2" />
            <div className="act-fog act-fog-3" />

            {/* Corridor lighting strips — blue strategist */}
            <div className="act-light-strip act-light-left act-light-blue" />
            <div className="act-light-strip act-light-right act-light-blue" />
            <div className="act-light-strip act-light-floor" />

            {/* Scanlines */}
            <div className="act-scanlines" />

            {/* Text content */}
            <div className={`act-text-container ${phase === 'dissolve' ? 'dissolving' : ''}`}>
                <AnimatePresence>
                    {(phase === 'act' || phase === 'title' || phase === 'dissolve') && (
                        <motion.div
                            className="act-label act-label-blue"
                            initial={{ opacity: 0, letterSpacing: '0.5em', filter: 'blur(8px)' }}
                            animate={{ opacity: 1, letterSpacing: '0.35em', filter: 'blur(0px)' }}
                            exit={{ opacity: 0, filter: 'blur(12px)', scale: 1.04 }}
                            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <span className="act-label-glitch-blue" data-text="ACT II">ACT II</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {(phase === 'title' || phase === 'dissolve') && (
                        <motion.div
                            className="act-title act-title-blue"
                            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: -8, filter: 'blur(10px)' }}
                            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
                        >
                            <span className="act-title-glitch-blue" data-text="SILENT BREACH">SILENT BREACH</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Separator line */}
                <AnimatePresence>
                    {(phase === 'title' || phase === 'dissolve') && (
                        <motion.div
                            className="act-separator act-separator-blue"
                            initial={{ scaleX: 0, opacity: 0 }}
                            animate={{ scaleX: 1, opacity: 1 }}
                            exit={{ scaleX: 0, opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                    )}
                </AnimatePresence>

                {/* Sub-label */}
                <AnimatePresence>
                    {(phase === 'title' || phase === 'dissolve') && (
                        <motion.div
                            className="act-sublabel"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                        >
                            OPERATIVE: VYRON · CLEARANCE: ALPHA-7
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Particle dissolve overlay */}
            {phase === 'dissolve' && (
                <motion.div
                    className="act-dissolve-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.0, ease: 'easeIn' }}
                />
            )}
        </div>
    );
}

export default ActIntro;
