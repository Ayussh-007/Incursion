import React, { useMemo } from 'react';

/**
 * AlienGlyphs - Generates random geometric symbols for alien transmission
 */
function AlienGlyphs({ count = 8, size = 24, className = '' }) {
    // Generate random geometric glyphs
    const glyphs = useMemo(() => {
        const shapes = [];

        for (let i = 0; i < count; i++) {
            const type = Math.floor(Math.random() * 5);
            let path = '';

            switch (type) {
                case 0: // Triangle
                    path = `M ${size / 2} 2 L ${size - 2} ${size - 2} L 2 ${size - 2} Z`;
                    break;
                case 1: // Diamond
                    path = `M ${size / 2} 2 L ${size - 2} ${size / 2} L ${size / 2} ${size - 2} L 2 ${size / 2} Z`;
                    break;
                case 2: // Pentagon
                    path = `M ${size / 2} 2 L ${size - 2} ${size * 0.4} L ${size * 0.8} ${size - 2} L ${size * 0.2} ${size - 2} L 2 ${size * 0.4} Z`;
                    break;
                case 3: // Hexagon
                    path = `M ${size / 2} 2 L ${size * 0.9} ${size * 0.25} L ${size * 0.9} ${size * 0.75} L ${size / 2} ${size - 2} L ${size * 0.1} ${size * 0.75} L ${size * 0.1} ${size * 0.25} Z`;
                    break;
                case 4: // Star
                    path = `M ${size / 2} 2 L ${size * 0.6} ${size * 0.4} L ${size - 2} ${size * 0.4} L ${size * 0.65} ${size * 0.6} L ${size * 0.8} ${size - 2} L ${size / 2} ${size * 0.7} L ${size * 0.2} ${size - 2} L ${size * 0.35} ${size * 0.6} L 2 ${size * 0.4} L ${size * 0.4} ${size * 0.4} Z`;
                    break;
                default:
                    path = `M ${size / 2} 2 L ${size - 2} ${size - 2} L 2 ${size - 2} Z`;
            }

            shapes.push({
                id: i,
                path,
                // Random delay for flicker animation
                delay: Math.random() * 2
            });
        }

        return shapes;
    }, [count, size]);

    return (
        <div className={`alien-glyphs ${className}`} aria-hidden="true">
            {glyphs.map((glyph) => (
                <svg
                    key={glyph.id}
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="glyph"
                    style={{
                        animationDelay: `${glyph.delay}s`
                    }}
                >
                    <path
                        d={glyph.path}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ))}
        </div>
    );
}

export default AlienGlyphs;
