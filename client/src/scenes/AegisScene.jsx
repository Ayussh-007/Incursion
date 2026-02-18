/**
 * AegisScene — Root scene for Project AEGIS operative selection
 * Orchestrates: cinematic intro, tactical map, character cards, ability system, keyboard nav
 */
import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameState';
import CHARACTERS from '../data/characters';
import ThemeProvider from '../components/aegis/ThemeProvider';
import TacticalMap from '../components/aegis/TacticalMap';
import CharacterGrid from '../components/aegis/CharacterGrid';
import AbilityHUD from '../components/aegis/AbilityHUD';
import AbilityEffect from '../components/aegis/AbilityEffect';
import '../styles/AegisScene.css';

// Particle system component
function ParticleField() {
    const canvasRef = useRef(null);
    const selectedCharacter = useGameStore((s) => s.selectedCharacter);
    const character = CHARACTERS[selectedCharacter];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Parse accent color to RGB
        const hex = character.avatarAccent.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        const particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: 0.5 + Math.random() * 1.5,
            opacity: 0.1 + Math.random() * 0.4,
            pulse: Math.random() * Math.PI * 2,
        }));

        let animId;
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                p.pulse += 0.02;

                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                const alpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                ctx.fill();
            });

            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, [character]);

    return <canvas ref={canvasRef} className="aegis-particles" />;
}

function AegisScene() {
    const setSelectedCharacter = useGameStore((s) => s.setSelectedCharacter);
    const activateAbility = useGameStore((s) => s.activateAbility);
    const selectedCharacter = useGameStore((s) => s.selectedCharacter);
    const abilityCooldownProgress = useGameStore((s) => s.abilityCooldownProgress);
    const completeAegis = useGameStore((s) => s.completeAegis);
    const aegisPhase = useGameStore((s) => s.aegisPhase);
    const setAegisPhase = useGameStore((s) => s.setAegisPhase);

    const character = CHARACTERS[selectedCharacter];

    // Cinematic intro sequence
    useEffect(() => {
        setAegisPhase('MAP_INTRO');
        const t1 = setTimeout(() => setAegisPhase('CARDS_RISE'), 1800);
        const t2 = setTimeout(() => setAegisPhase('READY'), 3200);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [setAegisPhase]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        const key = e.key;

        // Character selection: 1–5
        if (['1', '2', '3', '4', '5'].includes(key)) {
            setSelectedCharacter(parseInt(key) - 1);
            return;
        }

        // Ability activation: E
        if (key.toLowerCase() === 'e') {
            if (abilityCooldownProgress >= 1.0) {
                activateAbility(character.cooldown);
            }
            return;
        }

        // Proceed to game: Enter
        if (key === 'Enter') {
            completeAegis();
            return;
        }
    }, [setSelectedCharacter, activateAbility, abilityCooldownProgress, character.cooldown, completeAegis]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleAbilityActivate = useCallback(() => {
        if (abilityCooldownProgress >= 1.0) {
            activateAbility(character.cooldown);
        }
    }, [activateAbility, abilityCooldownProgress, character.cooldown]);

    return (
        <div className="aegis-scene">
            <ThemeProvider>
                {/* Particle field */}
                <ParticleField />

                {/* Top HUD bar */}
                <motion.div
                    className="aegis-top-bar"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    <div className="top-bar-left">
                        <span className="top-bar-label">PROJECT AEGIS</span>
                        <span className="top-bar-sep">|</span>
                        <span className="top-bar-sub">OPERATIVE SELECTION PROTOCOL</span>
                    </div>
                    <div className="top-bar-center">
                        <motion.span
                            className="top-bar-status"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            ● CLASSIFIED — LEVEL 5 CLEARANCE
                        </motion.span>
                    </div>
                    <div className="top-bar-right">
                        <span className="top-bar-key">[1-5]</span> SELECT
                        <span className="top-bar-sep"> | </span>
                        <span className="top-bar-key">[E]</span> ABILITY
                        <span className="top-bar-sep"> | </span>
                        <span className="top-bar-key">[↵]</span> DEPLOY
                    </div>
                </motion.div>

                {/* Main content area */}
                <div className="aegis-main">
                    {/* Tactical map (left/background) */}
                    <AnimatePresence>
                        {(aegisPhase === 'MAP_INTRO' || aegisPhase === 'CARDS_RISE' || aegisPhase === 'READY') && (
                            <motion.div
                                className="aegis-map-panel"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                            >
                                <div className="map-panel-header">
                                    <span className="map-panel-title">TACTICAL OVERVIEW — VESSEL SCHEMATIC</span>
                                    <motion.span
                                        className="map-panel-ping"
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        ◉ LIVE
                                    </motion.span>
                                </div>
                                <TacticalMap onZoneClick={setSelectedCharacter} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Character cards (right panel) */}
                    <AnimatePresence>
                        {(aegisPhase === 'CARDS_RISE' || aegisPhase === 'READY') && (
                            <motion.div
                                className="aegis-cards-panel"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6 }}
                            >
                                <div className="cards-panel-header">
                                    <span className="cards-panel-title">OPERATIVES</span>
                                    <span className="cards-panel-count">05 ASSIGNED</span>
                                </div>
                                <CharacterGrid />

                                {/* Deploy button */}
                                <motion.button
                                    className="deploy-button"
                                    style={{ '--char-color': character.avatarAccent }}
                                    onClick={completeAegis}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 0.5 }}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <span className="deploy-icon">▶</span>
                                    DEPLOY {character.codename}
                                    <span className="deploy-key">[ENTER]</span>
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Ability HUD */}
                <AbilityHUD onActivate={handleAbilityActivate} />

                {/* Ability effect overlay */}
                <AbilityEffect />

                {/* Corner brackets (full screen) */}
                <div className="aegis-bracket aegis-tl" />
                <div className="aegis-bracket aegis-tr" />
                <div className="aegis-bracket aegis-bl" />
                <div className="aegis-bracket aegis-br" />
            </ThemeProvider>
        </div>
    );
}

export default AegisScene;
