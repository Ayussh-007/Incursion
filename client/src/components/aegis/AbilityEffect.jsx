/**
 * AbilityEffect — Full-screen ability activation overlays per character
 * Each effect is physically grounded and auto-dismisses after 1.5s
 */
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameState';
import CHARACTERS from '../../data/characters';

// ── Individual effect components ──────────────────────────────────────────────

function ScanWave({ color }) {
    return (
        <motion.div className="effect-scan-wave" style={{ '--effect-color': color }}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="scan-line"
                    initial={{ scaleX: 0, opacity: 0.8 }}
                    animate={{ scaleX: 1, opacity: 0 }}
                    transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
                    style={{ background: `linear-gradient(90deg, transparent, ${color}88, ${color}, ${color}88, transparent)` }}
                />
            ))}
            {/* Grid overlay flash */}
            <motion.div
                className="scan-grid"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                style={{ backgroundImage: `linear-gradient(${color}22 1px, transparent 1px), linear-gradient(90deg, ${color}22 1px, transparent 1px)` }}
            />
        </motion.div>
    );
}

function TimeRipple({ color }) {
    return (
        <motion.div className="effect-time-ripple" style={{ '--effect-color': color }}>
            {[0, 1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    className="ripple-ring"
                    initial={{ scale: 0, opacity: 0.7 }}
                    animate={{ scale: 4 + i * 0.5, opacity: 0 }}
                    transition={{ duration: 1.2, delay: i * 0.18, ease: 'easeOut' }}
                    style={{ border: `2px solid ${color}`, boxShadow: `0 0 20px ${color}44` }}
                />
            ))}
            {/* Blur distortion */}
            <motion.div
                className="time-blur"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                style={{ backdropFilter: 'blur(3px)' }}
            />
        </motion.div>
    );
}

function DataSurge({ color }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const streams = Array.from({ length: 30 }, () => ({
            x: Math.random() * canvas.width,
            y: -Math.random() * canvas.height,
            speed: 3 + Math.random() * 5,
            chars: Array.from({ length: 20 }, () =>
                String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
            ),
            opacity: 0.3 + Math.random() * 0.6,
        }));

        let frame = 0;
        let animId;
        const draw = () => {
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = '14px monospace';

            streams.forEach((s) => {
                s.chars.forEach((ch, i) => {
                    const alpha = Math.max(0, s.opacity - i * 0.04);
                    ctx.fillStyle = `rgba(${color}, ${alpha})`;
                    ctx.fillText(ch, s.x, s.y + i * 18);
                });
                s.y += s.speed;
                if (s.y > canvas.height + 200) s.y = -200;
                // Randomize chars
                if (frame % 4 === 0) {
                    s.chars[Math.floor(Math.random() * s.chars.length)] =
                        String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
                }
            });

            frame++;
            animId = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(animId);
    }, [color]);

    return (
        <motion.div className="effect-data-surge">
            <canvas ref={canvasRef} className="data-surge-canvas" />
            <motion.div
                className="data-surge-flash"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                style={{ background: `radial-gradient(ellipse, rgba(${color}, 0.3) 0%, transparent 70%)` }}
            />
        </motion.div>
    );
}

function ShieldDome({ color }) {
    return (
        <motion.div className="effect-shield-dome" style={{ '--effect-color': color }}>
            {/* Dome rings */}
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    className="dome-ring"
                    initial={{ scale: 0, opacity: 0.8 }}
                    animate={{ scale: 1 + i * 0.3, opacity: 0 }}
                    transition={{ duration: 1.0, delay: i * 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{
                        border: `3px solid ${color}`,
                        boxShadow: `0 0 30px ${color}66, inset 0 0 60px ${color}22`,
                        borderRadius: '50%',
                    }}
                />
            ))}
            {/* Shield hex pattern */}
            <motion.div
                className="shield-hex"
                initial={{ opacity: 0.4 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                style={{ background: `radial-gradient(ellipse, ${color}15 0%, transparent 70%)` }}
            />
            {/* Ripple wave */}
            <motion.div
                className="shield-ripple"
                initial={{ scale: 0.3, opacity: 0.6 }}
                animate={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                style={{ border: `4px solid ${color}`, boxShadow: `0 0 40px ${color}` }}
            />
        </motion.div>
    );
}

function EnergySurge({ color }) {
    return (
        <motion.div className="effect-energy-surge" style={{ '--effect-color': color }}>
            {/* Edge lightning */}
            {['top', 'right', 'bottom', 'left'].map((side, i) => (
                <motion.div
                    key={side}
                    className={`surge-edge surge-${side}`}
                    initial={{ opacity: 0.9, scaleX: side === 'top' || side === 'bottom' ? 0 : 1, scaleY: side === 'left' || side === 'right' ? 0 : 1 }}
                    animate={{ opacity: 0, scaleX: 1, scaleY: 1 }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: 'easeOut' }}
                    style={{ background: `linear-gradient(${side === 'top' || side === 'bottom' ? '90deg' : '0deg'}, transparent, ${color}, transparent)` }}
                />
            ))}
            {/* Center burst */}
            <motion.div
                className="surge-burst"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ background: `radial-gradient(circle, ${color}88 0%, ${color}22 40%, transparent 70%)` }}
            />
            {/* Angular flash lines */}
            {[0, 45, 90, 135].map((angle, i) => (
                <motion.div
                    key={angle}
                    className="surge-line"
                    initial={{ scaleX: 0, opacity: 0.8 }}
                    animate={{ scaleX: 1, opacity: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    style={{
                        transform: `rotate(${angle}deg)`,
                        background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    }}
                />
            ))}
        </motion.div>
    );
}

// ── Effect dispatcher ─────────────────────────────────────────────────────────

const EFFECT_MAP = {
    scan_wave: ScanWave,
    time_ripple: TimeRipple,
    data_surge: DataSurge,
    shield_dome: ShieldDome,
    energy_surge: EnergySurge,
};

function AbilityEffect() {
    const abilityActive = useGameStore((s) => s.abilityActive);
    const selectedCharacter = useGameStore((s) => s.selectedCharacter);
    const character = CHARACTERS[selectedCharacter];
    const EffectComponent = EFFECT_MAP[character.abilityType];

    return (
        <AnimatePresence>
            {abilityActive && (
                <motion.div
                    className="ability-effect-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {EffectComponent && (
                        <EffectComponent color={character.avatarAccent} colorRgb={character.avatarAccent.replace('#', '')} />
                    )}

                    {/* Ability name flash */}
                    <motion.div
                        className="ability-name-flash"
                        style={{ color: character.avatarAccent, textShadow: `0 0 20px ${character.avatarAccent}` }}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: [0, 1, 1, 0], scale: [0.8, 1.05, 1, 0.95], y: [20, 0, 0, -10] }}
                        transition={{ duration: 1.2, times: [0, 0.2, 0.7, 1] }}
                    >
                        {character.abilityName.toUpperCase()}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default AbilityEffect;
