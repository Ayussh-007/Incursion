/**
 * ThemeProvider — Injects per-character CSS variables into the DOM
 * Uses Framer Motion for smooth background gradient transitions
 */
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameState';
import CHARACTERS from '../../data/characters';
import THEMES from '../../data/themeConfig';

function ThemeProvider({ children }) {
    const selectedCharacter = useGameStore((s) => s.selectedCharacter);
    const character = CHARACTERS[selectedCharacter];
    const theme = THEMES[character.themeKey];
    const containerRef = useRef(null);

    // Inject CSS variables onto the aegis root element
    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;
        Object.entries(theme).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }, [theme]);

    return (
        <div ref={containerRef} className="aegis-theme-root" style={{ width: '100%', height: '100%', position: 'relative' }}>
            {/* Animated background gradient layer */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={character.themeKey}
                    className="aegis-bg-gradient"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                    style={{ background: theme['--bg-gradient'] }}
                />
            </AnimatePresence>

            {/* Scanline overlay */}
            <div className="aegis-scanlines" />

            {/* Grid overlay */}
            <div className="aegis-grid" />

            {children}
        </div>
    );
}

export default ThemeProvider;
