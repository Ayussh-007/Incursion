import { useEffect, useState } from 'react';
import '../../styles/TransitionSequence.css';

/**
 * TransitionSequence - Animated atmospheric descent sequence
 * Features: Glitch effects, typing animation, particle rain, coordinate tracking
 */
function TransitionSequence() {
    const [text, setText] = useState('');
    const [showCoords, setShowCoords] = useState(false);
    const [glitchActive, setGlitchActive] = useState(false);

    const fullText = "ATMOSPHERIC ENTRY DETECTED";

    useEffect(() => {
        // Typing animation
        let currentIndex = 0;
        const typeInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typeInterval);
                setTimeout(() => setShowCoords(true), 500);
            }
        }, 80);

        // Random glitch effect
        const glitchInterval = setInterval(() => {
            setGlitchActive(true);
            setTimeout(() => setGlitchActive(false), 150);
        }, 2000);

        return () => {
            clearInterval(typeInterval);
            clearInterval(glitchInterval);
        };
    }, []);

    return (
        <div className="transition-sequence">
            {/* Animated particle rain */}
            <div className="particle-rain">
                {[...Array(50)].map((_, i) => (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            {/* Glitch overlay */}
            {glitchActive && <div className="glitch-overlay" />}

            {/* Main content */}
            <div className="transition-content">
                {/* Main title with glitch effect */}
                <div className={`transition-title ${glitchActive ? 'glitch' : ''}`}>
                    {text}
                    <span className="cursor-blink">_</span>
                </div>

                {/* Coordinates with fade-in */}
                {showCoords && (
                    <>
                        <div className="coordinate-line fade-in" style={{ animationDelay: '0.2s' }}>
                            <span className="label">DESCENDING TO:</span>
                            <span className="value coordinates">46.2°N, 7.4°E</span>
                        </div>
                        <div className="coordinate-line fade-in" style={{ animationDelay: '0.5s' }}>
                            <span className="label">DESTINATION:</span>
                            <span className="value destination">SERN RESEARCH FACILITY</span>
                        </div>
                        <div className="status-line fade-in" style={{ animationDelay: '0.8s' }}>
                            <div className="loading-bar">
                                <div className="loading-progress"></div>
                            </div>
                            <span className="status-text">Loading classified terminal...</span>
                        </div>
                    </>
                )}

                {/* Scanline effect */}
                <div className="scan-line"></div>
            </div>

            {/* Corner decorations */}
            <div className="corner-decoration top-left"></div>
            <div className="corner-decoration top-right"></div>
            <div className="corner-decoration bottom-left"></div>
            <div className="corner-decoration bottom-right"></div>
        </div>
    );
}

export default TransitionSequence;
