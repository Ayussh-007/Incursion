import { useMemo } from 'react';

/**
 * AlienGlyphs - Complex geometric alien symbols
 * Features: runes, nested polygons, circles with inner structures
 */
function AlienGlyphs({ count = 8, size = 24, className = '' }) {
    const glyphs = useMemo(() => {
        const shapes = [];
        const s = size;
        const c = s / 2; // center
        const r = s / 2 - 2; // radius

        for (let i = 0; i < count; i++) {
            const type = Math.floor(Math.random() * 8);
            let paths = [];

            switch (type) {
                case 0: // Inverted triangle with inner circle
                    paths.push(`M ${c} ${s - 2} L ${s - 2} 3 L 2 3 Z`);
                    paths.push(`M ${c} ${c + 2} m -${r * 0.35} 0 a ${r * 0.35} ${r * 0.35} 0 1 0 ${r * 0.7} 0 a ${r * 0.35} ${r * 0.35} 0 1 0 -${r * 0.7} 0`);
                    break;
                case 1: // Diamond with cross
                    paths.push(`M ${c} 2 L ${s - 2} ${c} L ${c} ${s - 2} L 2 ${c} Z`);
                    paths.push(`M ${c} ${c * 0.6} L ${c} ${s - c * 0.6}`);
                    paths.push(`M ${c * 0.6} ${c} L ${s - c * 0.6} ${c}`);
                    break;
                case 2: // Nested hexagon
                    paths.push(`M ${c} 2 L ${s * 0.9} ${s * 0.25} L ${s * 0.9} ${s * 0.75} L ${c} ${s - 2} L ${s * 0.1} ${s * 0.75} L ${s * 0.1} ${s * 0.25} Z`);
                    paths.push(`M ${c} ${s * 0.25} L ${s * 0.72} ${s * 0.37} L ${s * 0.72} ${s * 0.63} L ${c} ${s * 0.75} L ${s * 0.28} ${s * 0.63} L ${s * 0.28} ${s * 0.37} Z`);
                    break;
                case 3: // Circle with inscribed triangle
                    paths.push(`M ${c} ${c} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`);
                    paths.push(`M ${c} ${2 + r * 0.3} L ${s - 2 - r * 0.2} ${s - 2 - r * 0.2} L ${2 + r * 0.2} ${s - 2 - r * 0.2} Z`);
                    break;
                case 4: // Rune: vertical line with branches
                    paths.push(`M ${c} 2 L ${c} ${s - 2}`);
                    paths.push(`M ${c} ${s * 0.3} L ${s * 0.8} ${s * 0.15}`);
                    paths.push(`M ${c} ${s * 0.5} L ${s * 0.75} ${s * 0.65}`);
                    paths.push(`M ${c} ${s * 0.4} L ${s * 0.2} ${s * 0.55}`);
                    break;
                case 5: // Concentric rings with dot
                    paths.push(`M ${c} ${c} m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`);
                    paths.push(`M ${c} ${c} m -${r * 0.6} 0 a ${r * 0.6} ${r * 0.6} 0 1 0 ${r * 1.2} 0 a ${r * 0.6} ${r * 0.6} 0 1 0 -${r * 1.2} 0`);
                    paths.push(`M ${c} ${c} m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0`);
                    break;
                case 6: // Arrow-like rune
                    paths.push(`M ${c} 2 L ${s - 3} ${c} L ${c} ${c * 0.7} L 3 ${c} Z`);
                    paths.push(`M ${c} ${c * 0.7} L ${c} ${s - 2}`);
                    break;
                case 7: // Pentagon with inner star
                    const pVerts = Array.from({ length: 5 }, (_, k) => {
                        const a = (k * 2 * Math.PI / 5) - Math.PI / 2;
                        return { x: c + r * Math.cos(a), y: c + r * Math.sin(a) };
                    });
                    paths.push(pVerts.map((v, k) => `${k === 0 ? 'M' : 'L'} ${v.x.toFixed(1)} ${v.y.toFixed(1)}`).join(' ') + ' Z');
                    // Inner star
                    const sVerts = Array.from({ length: 5 }, (_, k) => {
                        const a = (k * 2 * Math.PI / 5) - Math.PI / 2;
                        return { x: c + r * 0.4 * Math.cos(a + Math.PI / 5), y: c + r * 0.4 * Math.sin(a + Math.PI / 5) };
                    });
                    paths.push(sVerts.map((v, k) => `${k === 0 ? 'M' : 'L'} ${v.x.toFixed(1)} ${v.y.toFixed(1)}`).join(' ') + ' Z');
                    break;
                default:
                    paths.push(`M ${c} 2 L ${s - 2} ${s - 2} L 2 ${s - 2} Z`);
            }

            shapes.push({
                id: i,
                paths,
                delay: Math.random() * 3
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
                    style={{ animationDelay: `${glyph.delay}s` }}
                >
                    {glyph.paths.map((path, j) => (
                        <path
                            key={j}
                            d={path}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    ))}
                </svg>
            ))}
        </div>
    );
}

export default AlienGlyphs;
