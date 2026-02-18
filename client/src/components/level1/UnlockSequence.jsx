/**
 * UnlockSequence — Door open animation with status lights and light bloom
 * Plays harmonic + door slide sounds, calls onComplete when done
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { playUnlockHarmonic, playDoorSlide } from '../../utils/soundEngine';

function UnlockSequence({ onComplete }) {
    const [phase, setPhase] = useState('lights'); // 'lights' | 'door' | 'bloom' | 'done'

    useEffect(() => {
        // Phase 1: lights turn green + harmonic
        playUnlockHarmonic();
        const t1 = setTimeout(() => {
            setPhase('door');
            playDoorSlide();
        }, 900);
        const t2 = setTimeout(() => setPhase('bloom'), 1800);
        const t3 = setTimeout(() => {
            setPhase('done');
            onComplete?.();
        }, 3000);
        return () => [t1, t2, t3].forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className="unlock-sequence">
            {/* Status lights — red → green */}
            <div className="unlock-status-lights">
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="unlock-status-light"
                        initial={{ background: '#dc143c', boxShadow: '0 0 8px #dc143c88' }}
                        animate={phase !== 'lights'
                            ? { background: '#00c8a0', boxShadow: '0 0 14px #00c8a0aa' }
                            : {}}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                    />
                ))}
            </div>

            {/* Door — splits open left/right */}
            <div className="unlock-door-container">
                {/* Left panel */}
                <motion.div
                    className="unlock-door-panel unlock-door-left"
                    initial={{ x: 0 }}
                    animate={phase === 'door' || phase === 'bloom' || phase === 'done'
                        ? { x: '-100%' }
                        : { x: 0 }}
                    transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                />
                {/* Right panel */}
                <motion.div
                    className="unlock-door-panel unlock-door-right"
                    initial={{ x: 0 }}
                    animate={phase === 'door' || phase === 'bloom' || phase === 'done'
                        ? { x: '100%' }
                        : { x: 0 }}
                    transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
                />

                {/* Internal corridor light bloom */}
                <motion.div
                    className="unlock-light-bloom"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={phase === 'bloom' || phase === 'done'
                        ? { opacity: 1, scale: 1.2 }
                        : { opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>

            {/* Door frame glow */}
            <motion.div
                className="unlock-door-glow"
                initial={{ opacity: 0 }}
                animate={phase !== 'lights' ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.5 }}
            />
        </div>
    );
}

export default UnlockSequence;
