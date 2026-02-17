import { useEffect, useState } from 'react';
import AlienGlyphs from './AlienGlyphs';
import '../../styles/TransmissionMessage.css';

/**
 * TransmissionMessage - Ominous transmission UI overlay with alien glyphs and system directive
 */
function TransmissionMessage({ onEnter }) {
    const [glitchActive, setGlitchActive] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(0);

    // Cycle through different transmission messages
    const messages = [
        { primary: 'TRANSMISSION ACKNOWLEDGED', secondary: 'AUTHORIZATION REQUIRED' },
        { primary: 'PROJECT AEGIS AWAITS', secondary: 'CLEARANCE PENDING' },
        { primary: 'SIGNAL INTERCEPTED', secondary: 'DECRYPTING PROTOCOL' }
    ];

    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                onEnter();
            }
        };

        // Random glitches
        const glitchInterval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 150);
        }, 3000 + Math.random() * 2000);

        // Cycle messages slowly
        const messageInterval = setInterval(() => {
            setCurrentMessage((prev) => (prev + 1) % messages.length);
        }, 8000);

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            clearInterval(glitchInterval);
            clearInterval(messageInterval);
        };
    }, [onEnter]);

    return (
        <div className="transmission-overlay">
            <div className={`transmission-container ${glitchActive ? 'glitch' : ''}`}>
                {/* Alien geometric glyphs */}
                <AlienGlyphs count={10} size={28} className="glyph-row" />

                {/* System message */}
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
                    <span className="text">PRESS ENTER TO PROCEED</span>
                    <span className="bracket">]</span>
                </div>
            </div>

            {/* Scanline interference effect */}
            <div className="scanline-overlay"></div>

            {/* CRT noise */}
            <div className="crt-noise"></div>
        </div>
    );
}

export default TransmissionMessage;

