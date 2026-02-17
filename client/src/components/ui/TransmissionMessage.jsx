import { useEffect, useRef, useState } from 'react';
import '../../styles/TransmissionMessage.css';

/**
 * TransmissionMessage - Ominous transmission UI overlay with alien glyphs
 */
function TransmissionMessage({ onEnter }) {
    const [glitchActive, setGlitchActive] = useState(false);

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

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            clearInterval(glitchInterval);
        };
    }, [onEnter]);

    // Alien glyphs (geometric symbols)
    const alienGlyphs = ['◈', '◉', '◊', '◬', '◭', '◮', '◯', '◰', '◱', '◲', '◳'];
    const randomGlyphs = Array.from(
        { length: 12 },
        () => alienGlyphs[Math.floor(Math.random() * alienGlyphs.length)]
    );

    return (
        <div className="transmission-overlay">
            <div className={`transmission-container ${glitchActive ? 'glitch' : ''}`}>
                {/* Alien glyphs */}
                <div className="alien-glyphs">
                    {randomGlyphs.map((glyph, i) => (
                        <span key={i} className="glyph" style={{ animationDelay: `${i * 0.1}s` }}>
                            {glyph}
                        </span>
                    ))}
                </div>

                {/* System message */}
                <div className="system-message">
                    <div className="message-line scanline">TRANSMISSION ACKNOWLEDGED</div>
                    <div className="message-line pulse">AUTHORIZATION REQUIRED</div>
                </div>

                {/* Enter prompt */}
                <div className="enter-prompt">
                    <span className="bracket">[</span>
                    <span className="text">PRESS ENTER TO PROCEED</span>
                    <span className="bracket">]</span>
                </div>
            </div>

            {/* Scanline effect */}
            <div className="scanline-overlay"></div>
        </div>
    );
}

export default TransmissionMessage;
