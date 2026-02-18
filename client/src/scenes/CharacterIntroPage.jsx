/**
 * CharacterIntroPage — Full-screen cinematic operative briefing
 * Shown after AEGIS deck (first time) and after each character unlock
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameState';
import { CHARACTERS } from '../data/characters';
import '../styles/CharacterIntroPage.css';

// ── Avatar image map ──────────────────────────────────────────────────────────
const AVATAR_IMAGES = [
    '/avatars/char 1.jpeg',
    '/avatars/char 2.jpeg',
    '/avatars/char 3.jpeg',
    '/avatars/char 4.jpeg',
    '/avatars/char 5.jpeg',
];

// ── Particle canvas background ────────────────────────────────────────────────
function IntroParticles({ accentColor }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Parse accent color to RGB
        const hex = accentColor.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        const particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((p) => {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity})`;
                ctx.fill();
            });
            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
        };
    }, [accentColor]);

    return <canvas ref={canvasRef} className="intro-particles" />;
}

// ── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text, speed = 18, startDelay = 800) {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        setDisplayed('');
        setDone(false);
        let i = 0;
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                i++;
                setDisplayed(text.slice(0, i));
                if (i >= text.length) {
                    clearInterval(interval);
                    setDone(true);
                }
            }, speed);
            return () => clearInterval(interval);
        }, startDelay);
        return () => clearTimeout(timeout);
    }, [text, speed, startDelay]);

    return { displayed, done };
}

// ── Glitch text component ─────────────────────────────────────────────────────
function GlitchText({ text, color, className }) {
    const [glitched, setGlitched] = useState(false);

    useEffect(() => {
        const t1 = setTimeout(() => setGlitched(true), 200);
        const t2 = setTimeout(() => setGlitched(false), 400);
        const t3 = setTimeout(() => setGlitched(true), 600);
        const t4 = setTimeout(() => setGlitched(false), 700);
        return () => [t1, t2, t3, t4].forEach(clearTimeout);
    }, [text]);

    return (
        <span
            className={`glitch-text ${glitched ? 'glitching' : ''} ${className || ''}`}
            style={{ '--glitch-color': color }}
            data-text={text}
        >
            {text}
        </span>
    );
}

// ── Ability Card ──────────────────────────────────────────────────────────────
function AbilityCard({ ability, accentColor, index, visible }) {
    return (
        <motion.div
            className="intro-ability-card"
            style={{ '--ability-accent': accentColor }}
            initial={{ opacity: 0, x: 40 }}
            animate={visible ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 0.5, delay: 0.1 * index, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ scale: 1.02, x: 4 }}
        >
            <div className="ability-card-icon" style={{ color: accentColor }}>
                {ability.icon}
            </div>
            <div className="ability-card-content">
                <div className="ability-card-name" style={{ color: accentColor }}>
                    {ability.name}
                </div>
                <div className="ability-card-desc">{ability.description}</div>
                <div className="ability-card-stat" style={{ color: accentColor }}>
                    {ability.stat}
                </div>
            </div>
            {/* Hover glow border */}
            <div className="ability-card-border" />
            {/* Corner brackets */}
            <div className="ac-corner ac-tl" />
            <div className="ac-corner ac-br" />
        </motion.div>
    );
}

// ── Signal Distortion Entry ───────────────────────────────────────────────────
function SignalDistortion({ onComplete }) {
    useEffect(() => {
        const t = setTimeout(onComplete, 900);
        return () => clearTimeout(t);
    }, [onComplete]);

    return (
        <motion.div
            className="signal-distortion"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
        >
            <motion.div
                className="distortion-scanline"
                initial={{ scaleY: 1 }}
                animate={{ scaleY: 0 }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
            />
            <motion.div
                className="distortion-flash"
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
            />
        </motion.div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
function CharacterIntroPage() {
    const introCharacterIndex = useGameStore((s) => s.introCharacterIndex);
    const completeCharIntro = useGameStore((s) => s.completeCharIntro);
    const pendingUnlock = useGameStore((s) => s.pendingUnlock);

    const character = CHARACTERS[introCharacterIndex];
    const [entryDone, setEntryDone] = useState(false);
    const [abilitiesVisible, setAbilitiesVisible] = useState(false);

    const { displayed: narrativeText, done: narrativeDone } = useTypewriter(
        character.narrative,
        14,
        1200
    );

    const handleEntryComplete = useCallback(() => {
        setEntryDone(true);
    }, []);

    // Show abilities after narrative finishes
    useEffect(() => {
        if (narrativeDone) {
            const t = setTimeout(() => setAbilitiesVisible(true), 300);
            return () => clearTimeout(t);
        }
    }, [narrativeDone]);

    // Reset on character change
    useEffect(() => {
        setEntryDone(false);
        setAbilitiesVisible(false);
    }, [introCharacterIndex]);

    // Keyboard: Enter to proceed
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Enter' && entryDone) completeCharIntro();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [entryDone, completeCharIntro]);

    const isUnlock = pendingUnlock !== null;
    const accentColor = character.avatarAccent;

    return (
        <div
            className="char-intro-scene"
            style={{ '--intro-accent': accentColor, '--intro-accent-rgb': hexToRgb(accentColor) }}
        >
            {/* Particle background */}
            <IntroParticles accentColor={accentColor} />

            {/* Scanline overlay */}
            <div className="intro-scanlines" />

            {/* Grid overlay */}
            <div className="intro-grid" />

            {/* Signal distortion entry */}
            <AnimatePresence>
                {!entryDone && (
                    <SignalDistortion onComplete={handleEntryComplete} />
                )}
            </AnimatePresence>

            {/* Main content */}
            <motion.div
                className="intro-content"
                initial={{ opacity: 0 }}
                animate={entryDone ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6 }}
            >
                {/* Top status bar */}
                <div className="intro-top-bar">
                    <div className="intro-top-left">
                        <span className="intro-bar-label" style={{ color: accentColor }}>
                            PROJECT AEGIS
                        </span>
                        <span className="intro-bar-sep">//</span>
                        <span className="intro-bar-sub">OPERATIVE BRIEFING</span>
                    </div>
                    <div className="intro-top-center" style={{ color: accentColor }}>
                        {isUnlock ? '◈ NEW OPERATIVE UNLOCKED ◈' : '◈ OPERATIVE PROFILE ◈'}
                    </div>
                    <div className="intro-top-right">
                        <span className="intro-bar-sub">CLEARANCE: LEVEL 5</span>
                    </div>
                </div>

                {/* Main two-column layout */}
                <div className="intro-body">
                    {/* ── LEFT: Portrait panel ── */}
                    <motion.div
                        className="intro-portrait-panel"
                        initial={{ opacity: 0, x: -60 }}
                        animate={entryDone ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        {/* Unlock badge */}
                        {isUnlock && (
                            <motion.div
                                className="unlock-badge"
                                style={{ borderColor: accentColor, color: accentColor }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                ◈ UNLOCKED
                            </motion.div>
                        )}

                        {/* Portrait frame */}
                        <div className="portrait-frame" style={{ '--frame-color': accentColor }}>
                            {/* Corner brackets */}
                            <div className="pf-corner pf-tl" />
                            <div className="pf-corner pf-tr" />
                            <div className="pf-corner pf-bl" />
                            <div className="pf-corner pf-br" />

                            {/* Portrait image */}
                            <div className="portrait-image-wrap">
                                <img
                                    src={AVATAR_IMAGES[character.index]}
                                    alt={character.title}
                                    className="portrait-img"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                                {/* Neon edge glow */}
                                <div
                                    className="portrait-glow"
                                    style={{ boxShadow: `inset 0 0 40px ${accentColor}33, 0 0 60px ${accentColor}22` }}
                                />
                                {/* Scan line sweep */}
                                <motion.div
                                    className="portrait-sweep"
                                    style={{ background: `linear-gradient(180deg, transparent, ${accentColor}44, transparent)` }}
                                    initial={{ top: '-100%' }}
                                    animate={{ top: '200%' }}
                                    transition={{ duration: 2.5, delay: 0.8, repeat: Infinity, repeatDelay: 4, ease: 'linear' }}
                                />
                            </div>

                            {/* Animated corner accents */}
                            <motion.div
                                className="portrait-accent-line portrait-accent-h"
                                style={{ background: accentColor }}
                                initial={{ scaleX: 0 }}
                                animate={entryDone ? { scaleX: 1 } : {}}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            />
                            <motion.div
                                className="portrait-accent-line portrait-accent-v"
                                style={{ background: accentColor }}
                                initial={{ scaleY: 0 }}
                                animate={entryDone ? { scaleY: 1 } : {}}
                                transition={{ duration: 0.6, delay: 0.4 }}
                            />
                        </div>

                        {/* Identity block */}
                        <div className="portrait-identity">
                            <div className="portrait-codename">
                                <GlitchText text={character.codename} color={accentColor} />
                            </div>
                            <div className="portrait-title" style={{ color: accentColor }}>
                                {character.title}
                            </div>
                            <div className="portrait-division">{character.division}</div>

                            {/* Stats row */}
                            <div className="portrait-stats">
                                <div className="portrait-stat">
                                    <span className="stat-label">ZONE</span>
                                    <span className="stat-value" style={{ color: accentColor }}>{character.zone}</span>
                                </div>
                                <div className="portrait-stat">
                                    <span className="stat-label">COOLDOWN</span>
                                    <span className="stat-value" style={{ color: accentColor }}>{character.cooldown}s</span>
                                </div>
                                <div className="portrait-stat">
                                    <span className="stat-label">KEY</span>
                                    <span className="stat-value" style={{ color: accentColor }}>[{character.keybind}]</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* ── RIGHT: Briefing panel ── */}
                    <motion.div
                        className="intro-briefing-panel"
                        initial={{ opacity: 0, x: 60 }}
                        animate={entryDone ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        {/* Tagline */}
                        <motion.div
                            className="intro-tagline"
                            style={{ color: accentColor }}
                            initial={{ opacity: 0, y: -20 }}
                            animate={entryDone ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            {character.introTagline}
                        </motion.div>

                        {/* Section header */}
                        <div className="intro-section-header">
                            <div className="section-line" style={{ background: accentColor }} />
                            <span className="section-label">OPERATIVE PROFILE</span>
                            <div className="section-line" style={{ background: accentColor }} />
                        </div>

                        {/* Narrative typewriter */}
                        <div className="intro-narrative">
                            <span className="narrative-text">{narrativeText}</span>
                            {!narrativeDone && <span className="narrative-cursor" style={{ color: accentColor }}>█</span>}
                        </div>

                        {/* Abilities section */}
                        <AnimatePresence>
                            {abilitiesVisible && (
                                <motion.div
                                    className="intro-abilities-section"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="intro-section-header">
                                        <div className="section-line" style={{ background: accentColor }} />
                                        <span className="section-label">TACTICAL ABILITIES</span>
                                        <div className="section-line" style={{ background: accentColor }} />
                                    </div>

                                    <div className="intro-abilities-list">
                                        {character.abilities.map((ability, i) => (
                                            <AbilityCard
                                                key={ability.name}
                                                ability={ability}
                                                accentColor={accentColor}
                                                index={i}
                                                visible={abilitiesVisible}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Deploy button */}
                        <AnimatePresence>
                            {abilitiesVisible && (
                                <motion.button
                                    className="intro-deploy-btn"
                                    style={{ '--btn-color': accentColor }}
                                    onClick={completeCharIntro}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.5 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="deploy-btn-icon" style={{ color: accentColor }}>▶</span>
                                    <span>OPERATIVE CLEARED FOR DEPLOYMENT</span>
                                    <span className="deploy-btn-key">[ENTER]</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Bottom bar */}
                <div className="intro-bottom-bar">
                    <div className="bottom-bar-left" style={{ color: accentColor }}>
                        {character.codename} // {character.division.toUpperCase()}
                    </div>
                    <div className="bottom-bar-center">
                        <motion.div
                            className="bottom-pulse"
                            style={{ background: accentColor }}
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        SIGNAL SECURE
                    </div>
                    <div className="bottom-bar-right">PROJECT AEGIS // CLASSIFIED</div>
                </div>
            </motion.div>
        </div>
    );
}

// Helper: hex color to "r, g, b" string
function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

export default CharacterIntroPage;
