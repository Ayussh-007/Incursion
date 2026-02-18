/**
 * SuccessOverlay — "ACCESS GRANTED / ENTRY SECURED" cinematic overlay
 * Blueprint lines background, progress bar, calls onComplete when bar fills
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function SuccessOverlay({ onComplete }) {
    const [barFilled, setBarFilled] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setBarFilled(true), 400);
        const t2 = setTimeout(() => onComplete?.(), 3800);
        return () => [t1, t2].forEach(clearTimeout);
    }, [onComplete]);

    return (
        <motion.div
            className="success-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {/* Blueprint SVG background lines */}
            <svg className="success-blueprint" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
                {/* Horizontal grid lines */}
                {[...Array(12)].map((_, i) => (
                    <motion.line
                        key={`h${i}`}
                        x1="0" y1={i * 50} x2="800" y2={i * 50}
                        stroke="rgba(0, 200, 160, 0.06)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.2, delay: i * 0.05 }}
                    />
                ))}
                {/* Vertical grid lines */}
                {[...Array(16)].map((_, i) => (
                    <motion.line
                        key={`v${i}`}
                        x1={i * 50} y1="0" x2={i * 50} y2="600"
                        stroke="rgba(0, 200, 160, 0.06)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.2, delay: i * 0.04 }}
                    />
                ))}
                {/* Decorative corner brackets */}
                <motion.path
                    d="M 60 60 L 60 100 M 60 60 L 100 60"
                    stroke="rgba(0, 200, 160, 0.25)" strokeWidth="1.5" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                />
                <motion.path
                    d="M 740 60 L 740 100 M 740 60 L 700 60"
                    stroke="rgba(0, 200, 160, 0.25)" strokeWidth="1.5" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                />
                <motion.path
                    d="M 60 540 L 60 500 M 60 540 L 100 540"
                    stroke="rgba(0, 200, 160, 0.25)" strokeWidth="1.5" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                />
                <motion.path
                    d="M 740 540 L 740 500 M 740 540 L 700 540"
                    stroke="rgba(0, 200, 160, 0.25)" strokeWidth="1.5" fill="none"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                />
                {/* Center reticle */}
                <motion.circle
                    cx="400" cy="260" r="80"
                    stroke="rgba(0, 200, 160, 0.08)" strokeWidth="1" fill="none"
                    initial={{ scale: 1.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                />
                <motion.circle
                    cx="400" cy="260" r="120"
                    stroke="rgba(0, 200, 160, 0.04)" strokeWidth="1" fill="none"
                    initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.3 }}
                />
            </svg>

            {/* Main text block */}
            <div className="success-text-block">
                {/* Top separator */}
                <motion.div
                    className="success-separator"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                />

                {/* ACCESS GRANTED */}
                <motion.h1
                    className="success-title"
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                    ACCESS GRANTED
                </motion.h1>

                {/* ENTRY SECURED */}
                <motion.p
                    className="success-subtitle"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                >
                    ENTRY SECURED
                </motion.p>

                {/* Bottom separator */}
                <motion.div
                    className="success-separator"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                />

                {/* Progress bar */}
                <motion.div
                    className="success-progress-wrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.9 }}
                >
                    <div className="success-progress-label">INITIAL INFILTRATION COMPLETE</div>
                    <div className="success-progress-track">
                        <motion.div
                            className="success-progress-fill"
                            initial={{ width: '0%' }}
                            animate={barFilled ? { width: '100%' } : { width: '0%' }}
                            transition={{ duration: 2.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
                        />
                        <motion.div
                            className="success-progress-glow"
                            initial={{ left: '0%' }}
                            animate={barFilled ? { left: '100%' } : { left: '0%' }}
                            transition={{ duration: 2.2, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.1 }}
                        />
                    </div>
                    <div className="success-progress-pct">
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.4 }}
                        >
                            100%
                        </motion.span>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

export default SuccessOverlay;
