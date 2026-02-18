/**
 * CharacterCard — Individual operative card with glassmorphism, avatar, stats, cooldown meter
 */
import { useRef } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/gameState';

// Radial cooldown SVG ring
function CooldownRing({ progress, color, size = 56 }) {
    const r = (size - 8) / 2;
    const circumference = 2 * Math.PI * r;
    const dashOffset = circumference * (1 - progress);

    return (
        <svg width={size} height={size} className="cooldown-ring-svg">
            {/* Track */}
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeOpacity="0.15"
            />
            {/* Progress arc */}
            <circle
                cx={size / 2} cy={size / 2} r={r}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeOpacity={progress > 0 ? 0.9 : 0}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}
            />
        </svg>
    );
}

// Avatar image map — matches card order (index 0–4)
const AVATAR_IMAGES = [
    '/avatars/char 1.jpeg',  // 0 — Strategist
    '/avatars/char 2.jpeg',  // 1 — Chrono Architect
    '/avatars/char 3.jpeg',  // 2 — Archivist
    '/avatars/char 4.jpeg',  // 3 — Bio-Defender
    '/avatars/char 5.jpeg',  // 4 — Engineer
];

function AvatarPlaceholder({ character }) {
    const imgSrc = AVATAR_IMAGES[character.index];
    return (
        <div
            className="avatar-placeholder"
            style={{
                background: character.avatarGradient,
                boxShadow: `0 0 30px ${character.avatarAccent}33`,
            }}
        >
            <img
                src={imgSrc}
                alt={character.title}
                className="avatar-image"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            {/* Ambient glow overlay */}
            <div className="avatar-glow" style={{ background: `radial-gradient(circle, ${character.avatarAccent}22 0%, transparent 70%)` }} />
            {/* Scan line effect */}
            <div className="avatar-scan" />
        </div>
    );
}

function CharacterCard({ character, isSelected, onSelect }) {
    const abilityCooldownProgress = useGameStore((s) => s.abilityCooldownProgress);
    const selectedCharacter = useGameStore((s) => s.selectedCharacter);
    const cardRef = useRef(null);

    const isThisSelected = isSelected;
    const showCooldown = isThisSelected;
    const cooldownProgress = showCooldown ? abilityCooldownProgress : 1.0;
    const isReady = cooldownProgress >= 1.0;

    return (
        <motion.div
            ref={cardRef}
            className={`character-card ${isThisSelected ? 'selected' : ''}`}
            onClick={() => onSelect(character.index)}
            style={{
                '--char-color': character.avatarAccent,
                '--char-color-dim': `${character.avatarAccent}44`,
                '--char-glow': `${character.avatarAccent}33`,
            }}
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{
                opacity: 1,
                y: 0,
                scale: isThisSelected ? 1.04 : 1,
                z: isThisSelected ? 20 : 0,
            }}
            whileHover={{
                scale: isThisSelected ? 1.06 : 1.03,
                y: -4,
                transition: { duration: 0.2 },
            }}
            transition={{
                duration: 0.5,
                delay: character.index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
        >
            {/* Emissive border glow */}
            <div className="card-glow-border" />

            {/* Card header — key binding */}
            <div className="card-keybind">
                <span className="keybind-bracket">[</span>
                <span className="keybind-key">{character.keybind}</span>
                <span className="keybind-bracket">]</span>
            </div>

            {/* Avatar section */}
            <div className="card-avatar-section">
                <AvatarPlaceholder character={character} />

                {/* Cooldown ring overlay on avatar */}
                {showCooldown && (
                    <div className="avatar-cooldown-overlay">
                        <CooldownRing
                            progress={cooldownProgress}
                            color={character.avatarAccent}
                            size={120}
                        />
                        {!isReady && (
                            <div className="cooldown-timer" style={{ color: character.avatarAccent }}>
                                {/* Timer text handled in HUD */}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Card body */}
            <div className="card-body">
                {/* Codename */}
                <div className="card-codename" style={{ color: character.avatarAccent }}>
                    {character.codename}
                </div>

                {/* Title */}
                <div className="card-title">{character.title}</div>

                {/* Division badge */}
                <div className="card-division">
                    <span className="division-dot" style={{ background: character.avatarAccent }} />
                    {character.division}
                </div>

                {/* Divider */}
                <div className="card-divider" style={{ background: `linear-gradient(90deg, transparent, ${character.avatarAccent}66, transparent)` }} />

                {/* Ability section */}
                <div className="card-ability">
                    <div className="ability-header">
                        <span className="ability-icon" style={{ color: character.avatarAccent }}>
                            {character.abilityIcon}
                        </span>
                        <span className="ability-name" style={{ color: character.avatarAccent }}>
                            {character.abilityName}
                        </span>
                    </div>
                    <div className="ability-description">{character.abilityDescription}</div>
                </div>

                {/* Cooldown info */}
                <div className="card-cooldown-info">
                    <span className="cooldown-label">COOLDOWN</span>
                    <span className="cooldown-value" style={{ color: character.avatarAccent }}>
                        {character.cooldown}s
                    </span>
                </div>

                {/* Ability key binding */}
                <div className="card-ability-key">
                    <span className="ability-key-label">ACTIVATE</span>
                    <span className="ability-key-badge" style={{ borderColor: character.avatarAccent, color: character.avatarAccent }}>
                        E
                    </span>
                </div>
            </div>

            {/* Selected indicator */}
            {isThisSelected && (
                <motion.div
                    className="card-selected-indicator"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    style={{ background: character.avatarAccent }}
                />
            )}

            {/* Corner brackets */}
            <div className="card-corner tl" />
            <div className="card-corner tr" />
            <div className="card-corner bl" />
            <div className="card-corner br" />
        </motion.div>
    );
}

export default CharacterCard;
