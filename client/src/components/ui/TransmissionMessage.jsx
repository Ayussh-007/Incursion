import { useEffect, useState, useRef } from 'react';
import AlienGlyphs from './AlienGlyphs';
import '../../styles/TransmissionMessage.css';

/**
 * TransmissionMessage - Ominous lore-driven transmission overlay
 * Features: alien glyphs, cycling classified directives, glitch interference
 */
function TransmissionMessage({ onEnter }) {
    const [glitchActive, setGlitchActive] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(0);
    const [visible, setVisible] = useState(false);

    const messages = [
        { primary: 'TRANSMISSION ACKNOWLEDGED', secondary: 'AUTHORIZATION REQUIRED.' },
        { primary: 'PROJECT AEGIS AWAITS', secondary: 'CLEARANCE PENDING.' },
        { primary: 'SIGNAL ORIGIN: UNKNOWN', secondary: 'DECRYPTING PROTOCOL...' },
        { primary: 'ANOMALY DETECTED', secondary: 'CONTAINMENT PROTOCOL ACTIVE.' },
    ];

    useEffect(() => {
        // Delay visibility
        const showTimer = setTimeout(() => setVisible(true), 4800);

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                onEnter();
            }
        };

        // Randomized glitches
        const glitchInterval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 80 + Math.random() * 100);
        }, 2500 + Math.random() * 3000);

        // Cycle messages
        const messageInterval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 6000);

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            clearTimeout(showTimer);
            window.removeEventListener('keydown', handleKeyPress);
            clearInterval(glitchInterval);
            clearInterval(messageInterval);
        };
    }, [onEnter]);

    if (!visible) return null;

    return (
        <div className="transmission-overlay">
            <div className={`transmission-container ${glitchActive ? 'glitch' : ''}`}>
                {/* Alien geometric glyphs */}
                <AlienGlyphs count={12} size={26} className="glyph-row" />

                {/* System directive */}
                <div className="system-message">
                    <div className="message-line scanline">
                        {messages[currentMessage].primary}
                    </div>
                    <div className="message-line pulse">
                        {messages[currentMessage].secondary}
                    </div>
                </div>

                {/* Enter prompt */}
                <div className="enter-prompt">
                    <span className="bracket">[</span>
                    <span className="prompt-text">PRESS ENTER TO PROCEED</span>
                    <span className="bracket">]</span>
                </div>
            </div>

            {/* Scanline interference */}
            <div className="scanline-overlay" />

            {/* CRT noise */}
            <div className="crt-noise" />
        </div>
    );
}

export default TransmissionMessage;
