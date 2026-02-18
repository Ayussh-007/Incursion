/**
 * KeypadLock — 4-digit alien entry lock panel
 * Per-digit validation against code [6, 9, 6, 7]
 * Keyboard + on-screen input, sound feedback
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    resumeAudio,
    playDigitClick,
    playCorrectChime,
    playWrongTone,
} from '../../utils/soundEngine';

const CORRECT_CODE = [6, 9, 6, 7];

// Digit slot states: 'empty' | 'pending' | 'correct' | 'wrong'
function DigitSlot({ value, state, isActive, index }) {
    return (
        <motion.div
            className={`keypad-slot keypad-slot--${state} ${isActive ? 'keypad-slot--active' : ''}`}
            animate={state === 'wrong' ? { x: [-4, 4, -3, 3, 0] } : { x: 0 }}
            transition={state === 'wrong' ? { duration: 0.3, ease: 'easeInOut' } : {}}
        >
            {/* Slot number */}
            <AnimatePresence mode="wait">
                {value !== null && (
                    <motion.span
                        key={`${index}-${value}`}
                        className="keypad-slot-digit"
                        initial={{ opacity: 0, y: -8, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.8 }}
                        transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
                    >
                        {value}
                    </motion.span>
                )}
            </AnimatePresence>

            {/* Active cursor blink */}
            {isActive && value === null && (
                <motion.div
                    className="keypad-slot-cursor"
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.9, repeat: Infinity }}
                />
            )}

            {/* State indicator line */}
            <div className="keypad-slot-indicator" />

            {/* Corner brackets */}
            <div className="ks-corner ks-tl" />
            <div className="ks-corner ks-tr" />
            <div className="ks-corner ks-bl" />
            <div className="ks-corner ks-br" />
        </motion.div>
    );
}

function KeypadButton({ label, onClick, isBackspace }) {
    return (
        <motion.button
            className={`keypad-btn ${isBackspace ? 'keypad-btn--back' : ''}`}
            onClick={onClick}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
        >
            {label}
        </motion.button>
    );
}

function KeypadLock({ onUnlock, onFlicker }) {
    const [digits, setDigits] = useState([null, null, null, null]);
    const [states, setStates] = useState(['empty', 'empty', 'empty', 'empty']);
    const [activeSlot, setActiveSlot] = useState(0);
    const [allCorrect, setAllCorrect] = useState(false);
    const flickerRef = useRef(false);

    const validateDigit = useCallback((slot, value) => {
        const isCorrect = value === CORRECT_CODE[slot];
        if (isCorrect) {
            playCorrectChime();
        } else {
            playWrongTone();
        }
        return isCorrect ? 'correct' : 'wrong';
    }, []);

    const enterDigit = useCallback((num) => {
        resumeAudio();
        if (allCorrect) return;

        const slot = activeSlot;
        if (slot >= 4) return;

        playDigitClick();

        const newDigits = [...digits];
        newDigits[slot] = num;

        const newStates = [...states];
        const result = validateDigit(slot, num);
        newStates[slot] = result;

        setDigits(newDigits);
        setStates(newStates);

        const nextSlot = slot + 1;
        setActiveSlot(nextSlot);

        // Check if all 4 entered
        if (nextSlot === 4) {
            const allFilled = newDigits.every((d) => d !== null);
            const allRight = newStates.every((s) => s === 'correct');

            if (allFilled && allRight) {
                setAllCorrect(true);
                setTimeout(() => onUnlock?.(), 600);
            } else if (allFilled && !allRight) {
                // Wrong attempt — flicker + reset after delay
                if (!flickerRef.current) {
                    flickerRef.current = true;
                    onFlicker?.();
                    setTimeout(() => {
                        setDigits([null, null, null, null]);
                        setStates(['empty', 'empty', 'empty', 'empty']);
                        setActiveSlot(0);
                        flickerRef.current = false;
                    }, 1200);
                }
            }
        }
    }, [activeSlot, allCorrect, digits, states, validateDigit, onUnlock, onFlicker]);

    const backspace = useCallback(() => {
        resumeAudio();
        if (allCorrect) return;
        const slot = Math.max(0, activeSlot - 1);
        const newDigits = [...digits];
        newDigits[slot] = null;
        const newStates = [...states];
        newStates[slot] = 'empty';
        setDigits(newDigits);
        setStates(newStates);
        setActiveSlot(slot);
    }, [activeSlot, allCorrect, digits, states]);

    // Keyboard input
    useEffect(() => {
        const handler = (e) => {
            if (e.key >= '0' && e.key <= '9') {
                enterDigit(parseInt(e.key));
            } else if (e.key === 'Backspace') {
                backspace();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [enterDigit, backspace]);

    return (
        <div className="keypad-panel">
            {/* Panel header */}
            <div className="keypad-header">
                <div className="keypad-header-dot" />
                <span className="keypad-header-label">ENTRY LOCK SYSTEM</span>
                <div className="keypad-header-dot" />
            </div>

            {/* Status line */}
            <div className="keypad-status-line">
                <span className="keypad-status-text">
                    {allCorrect ? 'ACCESS GRANTED' : 'ENTER ACCESS CODE'}
                </span>
                <motion.div
                    className="keypad-status-indicator"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    style={{ background: allCorrect ? '#00c8a0' : '#dc143c' }}
                />
            </div>

            {/* Digit slots */}
            <div className="keypad-slots">
                {digits.map((d, i) => (
                    <DigitSlot
                        key={i}
                        index={i}
                        value={d}
                        state={states[i]}
                        isActive={i === activeSlot && !allCorrect}
                    />
                ))}
            </div>

            {/* Separator */}
            <div className="keypad-divider" />

            {/* Numeric grid */}
            <div className="keypad-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <KeypadButton key={n} label={n} onClick={() => enterDigit(n)} />
                ))}
                <KeypadButton label="⌫" isBackspace onClick={backspace} />
                <KeypadButton label={0} onClick={() => enterDigit(0)} />
                <div className="keypad-btn-spacer" />
            </div>

            {/* Energy lines */}
            <div className="keypad-energy-lines">
                <div className="keypad-energy-line" />
                <div className="keypad-energy-line" />
                <div className="keypad-energy-line" />
            </div>

            {/* Corner brackets */}
            <div className="kp-corner kp-tl" />
            <div className="kp-corner kp-tr" />
            <div className="kp-corner kp-bl" />
            <div className="kp-corner kp-br" />
        </div>
    );
}

export default KeypadLock;
