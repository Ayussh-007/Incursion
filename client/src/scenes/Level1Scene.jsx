/**
 * Level1Scene — Orchestrator for Level 1: Breach Protocol
 * Phase flow: ACT_INTRO → GAMEPLAY → UNLOCKING → SUCCESS
 */
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../store/gameState';
import ActIntro from '../components/level1/ActIntro';
import KeypadLock from '../components/level1/KeypadLock';
import UnlockSequence from '../components/level1/UnlockSequence';
import SuccessOverlay from '../components/level1/SuccessOverlay';
import '../styles/Level1Scene.css';

// ── Corridor Environment ──────────────────────────────────────────────────────
function CorridorEnvironment({ flickering }) {
    return (
        <div className={`corridor-env ${flickering ? 'corridor-flicker' : ''}`}>
            {/* Ceiling */}
            <div className="corridor-ceiling">
                <div className="ceiling-panel ceiling-panel-1" />
                <div className="ceiling-panel ceiling-panel-2" />
                <div className="ceiling-panel ceiling-panel-3" />
                {/* Emergency lighting strips */}
                <div className="ceiling-light-strip ceiling-light-left" />
                <div className="ceiling-light-strip ceiling-light-right" />
            </div>

            {/* Left wall */}
            <div className="corridor-wall corridor-wall-left">
                <div className="wall-panel-lines" />
                <div className="wall-rivet wall-rivet-1" />
                <div className="wall-rivet wall-rivet-2" />
                <div className="wall-rivet wall-rivet-3" />
                {/* Damaged wiring sparks */}
                <div className="wall-spark wall-spark-1" />
                <div className="wall-spark wall-spark-2" />
                {/* Emergency light strip */}
                <div className="wall-light-strip" />
            </div>

            {/* Right wall */}
            <div className="corridor-wall corridor-wall-right">
                <div className="wall-panel-lines" />
                <div className="wall-rivet wall-rivet-1" />
                <div className="wall-rivet wall-rivet-2" />
                <div className="wall-rivet wall-rivet-3" />
                <div className="wall-light-strip" />
            </div>

            {/* Floor */}
            <div className="corridor-floor">
                <div className="floor-reflection" />
                <div className="floor-grid" />
                <div className="floor-center-line" />
            </div>

            {/* Volumetric fog layers */}
            <div className="corridor-fog corridor-fog-1" />
            <div className="corridor-fog corridor-fog-2" />
            <div className="corridor-fog corridor-fog-3" />

            {/* The reinforced door */}
            <div className="corridor-door">
                {/* Door frame */}
                <div className="door-frame">
                    {/* Status lights on frame */}
                    <div className="door-frame-lights">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="door-frame-light door-frame-light--red" />
                        ))}
                    </div>
                    {/* Door surface */}
                    <div className="door-surface">
                        <div className="door-panel door-panel-top" />
                        <div className="door-center-seam" />
                        <div className="door-panel door-panel-bottom" />
                        {/* Door bolts */}
                        <div className="door-bolt door-bolt-tl" />
                        <div className="door-bolt door-bolt-tr" />
                        <div className="door-bolt door-bolt-bl" />
                        <div className="door-bolt door-bolt-br" />
                        {/* Warning stripes */}
                        <div className="door-warning-stripe door-warning-top" />
                        <div className="door-warning-stripe door-warning-bottom" />
                    </div>
                </div>
            </div>

            {/* Keypad mount — right of door */}
            <div className="keypad-mount" />
        </div>
    );
}

// ── Main Scene ────────────────────────────────────────────────────────────────
function Level1Scene() {
    const completeLevel = useGameStore((s) => s.completeLevel);
    const [phase, setPhase] = useState('ACT_INTRO'); // 'ACT_INTRO' | 'GAMEPLAY' | 'UNLOCKING' | 'SUCCESS'
    const [flickering, setFlickering] = useState(false);

    const handleActDone = useCallback(() => {
        setPhase('GAMEPLAY');
    }, []);

    const handleUnlock = useCallback(() => {
        setPhase('UNLOCKING');
    }, []);

    const handleUnlockDone = useCallback(() => {
        setPhase('SUCCESS');
    }, []);

    const handleSuccessDone = useCallback(() => {
        completeLevel();
    }, [completeLevel]);

    const handleFlicker = useCallback(() => {
        setFlickering(true);
        setTimeout(() => setFlickering(false), 1200);
    }, []);

    return (
        <div className="level1-scene">
            {/* ── ACT INTRO ── */}
            <AnimatePresence>
                {phase === 'ACT_INTRO' && (
                    <ActIntro onComplete={handleActDone} />
                )}
            </AnimatePresence>

            {/* ── GAMEPLAY: Corridor + Keypad ── */}
            <AnimatePresence>
                {(phase === 'GAMEPLAY' || phase === 'UNLOCKING') && (
                    <motion.div
                        className="level1-gameplay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <CorridorEnvironment flickering={flickering} />

                        {/* Keypad — only visible during GAMEPLAY */}
                        <AnimatePresence>
                            {phase === 'GAMEPLAY' && (
                                <motion.div
                                    className="level1-keypad-wrapper"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 30 }}
                                    transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                    <KeypadLock onUnlock={handleUnlock} onFlicker={handleFlicker} />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Unlock sequence overlays the corridor */}
                        <AnimatePresence>
                            {phase === 'UNLOCKING' && (
                                <UnlockSequence onComplete={handleUnlockDone} />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── SUCCESS OVERLAY ── */}
            <AnimatePresence>
                {phase === 'SUCCESS' && (
                    <SuccessOverlay onComplete={handleSuccessDone} />
                )}
            </AnimatePresence>

            {/* HUD — top left level indicator */}
            {phase !== 'ACT_INTRO' && (
                <div className="level1-hud">
                    <div className="hud-level-tag">
                        <span className="hud-label">LEVEL</span>
                        <span className="hud-value">01</span>
                    </div>
                    <div className="hud-mission-tag">
                        <span className="hud-label">MISSION</span>
                        <span className="hud-value">BREACH PROTOCOL</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Level1Scene;
