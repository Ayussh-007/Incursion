/**
 * AbilityHUD — Bottom HUD panel with ability icon, cooldown ring, and status
 */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameState';
import CHARACTERS from '../../data/characters';

function AbilityRing({ progress, color, size = 72 }) {
    const r = (size - 10) / 2;
    const circumference = 2 * Math.PI * r;
    const dashOffset = circumference * (1 - progress);

    return (
        <svg width={size} height={size} className="hud-ability-ring">
            {/* Outer track */}
            <circle cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.12" />
            {/* Glow track */}
            <circle cx={size / 2} cy={size / 2} r={r}
                fill="none" stroke={color} strokeWidth="4" strokeOpacity="0.05" />
            {/* Progress arc */}
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeOpacity={progress > 0 ? 0.95 : 0}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dashoffset 0.05s linear', filter: `drop-shadow(0 0 4px ${color})` }}
            />
        </svg>
    );
}

function AbilityHUD({ onActivate }) {
    const selectedCharacter = useGameStore((s) => s.selectedCharacter);
    const abilityCooldownProgress = useGameStore((s) => s.abilityCooldownProgress);
    const abilityActive = useGameStore((s) => s.abilityActive);
    const character = CHARACTERS[selectedCharacter];
    const isReady = abilityCooldownProgress >= 1.0;

    // Countdown display
    const [countdown, setCountdown] = useState(null);
    useEffect(() => {
        if (isReady) { setCountdown(null); return; }
        const remaining = Math.ceil(character.cooldown * (1 - abilityCooldownProgress));
        setCountdown(remaining);
    }, [abilityCooldownProgress, isReady, character.cooldown]);

    return (
        <motion.div
            className="ability-hud"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
        >
            {/* Left info panel */}
            <div className="hud-info-left">
                <div className="hud-operative-label">OPERATIVE</div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={character.id}
                        className="hud-codename"
                        style={{ color: character.avatarAccent }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.25 }}
                    >
                        {character.codename}
                    </motion.div>
                </AnimatePresence>
                <div className="hud-division">{character.division}</div>
            </div>

            {/* Center ability button */}
            <div className="hud-ability-center">
                <div
                    className={`hud-ability-button ${isReady ? 'ready' : 'cooldown'} ${abilityActive ? 'active' : ''}`}
                    onClick={isReady ? onActivate : undefined}
                    style={{ '--char-color': character.avatarAccent }}
                >
                    {/* Ring */}
                    <AbilityRing
                        progress={abilityCooldownProgress}
                        color={character.avatarAccent}
                        size={72}
                    />

                    {/* Icon */}
                    <div className="hud-ability-icon" style={{ color: character.avatarAccent }}>
                        {character.abilityIcon}
                    </div>

                    {/* Cooldown overlay */}
                    {!isReady && (
                        <div className="hud-cooldown-overlay">
                            <span className="hud-countdown" style={{ color: character.avatarAccent }}>
                                {countdown}
                            </span>
                        </div>
                    )}
                </div>

                {/* Key label */}
                <div className="hud-key-label">
                    {isReady ? (
                        <motion.span
                            animate={{ opacity: [0.6, 1, 0.6] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{ color: character.avatarAccent }}
                        >
                            [E] ACTIVATE
                        </motion.span>
                    ) : (
                        <span style={{ color: '#666' }}>RECHARGING...</span>
                    )}
                </div>
            </div>

            {/* Right ability info */}
            <div className="hud-info-right">
                <div className="hud-ability-label">SPECIAL ABILITY</div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={character.id}
                        className="hud-ability-name"
                        style={{ color: character.avatarAccent }}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        {character.abilityName}
                    </motion.div>
                </AnimatePresence>
                <div className="hud-cooldown-stat">
                    CD: <span style={{ color: character.avatarAccent }}>{character.cooldown}s</span>
                </div>
            </div>

            {/* HUD corner decorations */}
            <div className="hud-corner hud-tl" />
            <div className="hud-corner hud-tr" />
        </motion.div>
    );
}

export default AbilityHUD;
