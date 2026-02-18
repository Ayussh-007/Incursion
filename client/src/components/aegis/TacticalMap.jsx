/**
 * TacticalMap — SVG-based holographic spaceship blueprint
 * Features: parallax depth, zone ambient pulses, animated corridor lines
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../store/gameState';
import CHARACTERS from '../../data/characters';

// Zone definitions with SVG coordinates (viewBox 0 0 800 500)
const ZONES = [
    { id: 'bridge', label: 'BRIDGE', x: 340, y: 30, w: 120, h: 70, charIndex: 0 },
    { id: 'chrono', label: 'CHRONOVIZER ROOM', x: 80, y: 160, w: 150, h: 80, charIndex: 1 },
    { id: 'archive', label: 'ARCHIVE VAULT', x: 570, y: 160, w: 150, h: 80, charIndex: 2 },
    { id: 'bioshield', label: 'BIOSHIELD CHAMBER', x: 100, y: 340, w: 160, h: 80, charIndex: 3 },
    { id: 'engineering', label: 'ENGINEERING/ARMORY', x: 540, y: 340, w: 160, h: 80, charIndex: 4 },
];

// Corridor path definitions
const CORRIDORS = [
    'M400,100 L400,160',          // Bridge → center hub
    'M400,160 L230,200',          // Center → Chrono
    'M400,160 L570,200',          // Center → Archive
    'M400,160 L400,280',          // Center → lower hub
    'M400,280 L260,380',          // Lower → Bioshield
    'M400,280 L540,380',          // Lower → Engineering
    'M230,200 L260,380',          // Chrono → Bioshield (side corridor)
    'M570,200 L540,380',          // Archive → Engineering (side corridor)
    'M80,160 L80,340',            // Left wall conduit
    'M720,160 L720,340',          // Right wall conduit
];

// Ship hull outline
const HULL_PATH = `
  M400,10
  L700,80 L760,160 L760,420 L700,480
  L400,490
  L100,480 L40,420 L40,160 L100,80
  Z
`;

const THEME_COLORS = {
    0: '#1e90ff',
    1: '#00e676',
    2: '#ffc107',
    3: '#00c853',
    4: '#ff5722',
};

function TacticalMap({ onZoneClick }) {
    const selectedCharacter = useGameStore((s) => s.selectedCharacter);
    const svgRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [dashOffset, setDashOffset] = useState(0);
    const animRef = useRef(null);

    // Parallax on mouse move
    const handleMouseMove = useCallback((e) => {
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x: cx * 12, y: cy * 8 });
    }, []);

    // Animate corridor dash offset
    useEffect(() => {
        let offset = 0;
        const tick = () => {
            offset = (offset + 0.4) % 20;
            setDashOffset(offset);
            animRef.current = requestAnimationFrame(tick);
        };
        animRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(animRef.current);
    }, []);

    const accentColor = THEME_COLORS[selectedCharacter];

    return (
        <div
            className="tactical-map-container"
            onMouseMove={handleMouseMove}
        >
            {/* Background parallax layer (deeper) */}
            <motion.div
                className="map-bg-layer"
                animate={{ x: mousePos.x * 0.3, y: mousePos.y * 0.3 }}
                transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            />

            {/* Main SVG map */}
            <motion.div
                className="map-svg-layer"
                animate={{ x: mousePos.x, y: mousePos.y }}
                transition={{ type: 'spring', stiffness: 100, damping: 25 }}
            >
                <svg
                    ref={svgRef}
                    viewBox="0 0 800 500"
                    className="tactical-svg"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        {/* Glow filter */}
                        <filter id="zone-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        <filter id="hull-glow" x="-10%" y="-10%" width="120%" height="120%">
                            <feGaussianBlur stdDeviation="2" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                        {/* Gradient for hull */}
                        <linearGradient id="hullGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={accentColor} stopOpacity="0.15" />
                            <stop offset="100%" stopColor={accentColor} stopOpacity="0.04" />
                        </linearGradient>
                    </defs>

                    {/* Ship hull */}
                    <path
                        d={HULL_PATH}
                        fill="url(#hullGrad)"
                        stroke={accentColor}
                        strokeWidth="1"
                        strokeOpacity="0.3"
                        filter="url(#hull-glow)"
                    />

                    {/* Interior grid lines */}
                    {[100, 200, 300, 400, 500, 600, 700].map((x) => (
                        <line key={`vg-${x}`} x1={x} y1={10} x2={x} y2={490}
                            stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.08" />
                    ))}
                    {[100, 200, 300, 400].map((y) => (
                        <line key={`hg-${y}`} x1={40} y1={y} x2={760} y2={y}
                            stroke={accentColor} strokeWidth="0.3" strokeOpacity="0.08" />
                    ))}

                    {/* Corridor lines (animated dashes) */}
                    {CORRIDORS.map((d, i) => (
                        <g key={`corridor-${i}`}>
                            {/* Base dim line */}
                            <path
                                d={d}
                                fill="none"
                                stroke={accentColor}
                                strokeWidth="1"
                                strokeOpacity="0.15"
                            />
                            {/* Animated flowing dash */}
                            <path
                                d={d}
                                fill="none"
                                stroke={accentColor}
                                strokeWidth="1.5"
                                strokeOpacity="0.5"
                                strokeDasharray="6 14"
                                strokeDashoffset={-dashOffset + i * 3}
                            />
                        </g>
                    ))}

                    {/* Zone boxes */}
                    {ZONES.map((zone) => {
                        const char = CHARACTERS[zone.charIndex];
                        const isSelected = selectedCharacter === zone.charIndex;
                        const zoneColor = THEME_COLORS[zone.charIndex];

                        return (
                            <g
                                key={zone.id}
                                className="map-zone"
                                onClick={() => onZoneClick(zone.charIndex)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Ambient pulse ring */}
                                <motion.circle
                                    cx={zone.x + zone.w / 2}
                                    cy={zone.y + zone.h / 2}
                                    r={isSelected ? 55 : 40}
                                    fill="none"
                                    stroke={zoneColor}
                                    strokeWidth="1"
                                    animate={{
                                        opacity: [0.1, 0.35, 0.1],
                                        r: [isSelected ? 50 : 35, isSelected ? 65 : 50, isSelected ? 50 : 35],
                                    }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: zone.charIndex * 0.4 }}
                                />

                                {/* Zone rectangle */}
                                <motion.rect
                                    x={zone.x}
                                    y={zone.y}
                                    width={zone.w}
                                    height={zone.h}
                                    rx="3"
                                    fill={zoneColor}
                                    fillOpacity={isSelected ? 0.18 : 0.06}
                                    stroke={zoneColor}
                                    strokeWidth={isSelected ? 1.5 : 0.8}
                                    strokeOpacity={isSelected ? 0.9 : 0.4}
                                    filter={isSelected ? 'url(#zone-glow)' : undefined}
                                    animate={{ fillOpacity: isSelected ? 0.18 : 0.06 }}
                                    transition={{ duration: 0.4 }}
                                />

                                {/* Corner ticks */}
                                {[
                                    [zone.x, zone.y, zone.x + 8, zone.y, zone.x, zone.y + 8],
                                    [zone.x + zone.w, zone.y, zone.x + zone.w - 8, zone.y, zone.x + zone.w, zone.y + 8],
                                    [zone.x, zone.y + zone.h, zone.x + 8, zone.y + zone.h, zone.x, zone.y + zone.h - 8],
                                    [zone.x + zone.w, zone.y + zone.h, zone.x + zone.w - 8, zone.y + zone.h, zone.x + zone.w, zone.y + zone.h - 8],
                                ].map((pts, ci) => (
                                    <polyline
                                        key={ci}
                                        points={`${pts[0]},${pts[1]} ${pts[2]},${pts[3]} ${pts[4]},${pts[5]}`}
                                        fill="none"
                                        stroke={zoneColor}
                                        strokeWidth="1.5"
                                        strokeOpacity={isSelected ? 1 : 0.6}
                                    />
                                ))}

                                {/* Zone label */}
                                <text
                                    x={zone.x + zone.w / 2}
                                    y={zone.y + zone.h / 2 - 6}
                                    textAnchor="middle"
                                    fill={zoneColor}
                                    fontSize="7"
                                    fontFamily="'Courier New', monospace"
                                    fontWeight="bold"
                                    letterSpacing="1"
                                    opacity={isSelected ? 1 : 0.7}
                                >
                                    {zone.label}
                                </text>
                                <text
                                    x={zone.x + zone.w / 2}
                                    y={zone.y + zone.h / 2 + 8}
                                    textAnchor="middle"
                                    fill={zoneColor}
                                    fontSize="6"
                                    fontFamily="'Courier New', monospace"
                                    opacity={isSelected ? 0.9 : 0.5}
                                >
                                    [{char.codename}]
                                </text>

                                {/* Key binding indicator */}
                                <text
                                    x={zone.x + zone.w - 6}
                                    y={zone.y + 10}
                                    textAnchor="middle"
                                    fill={zoneColor}
                                    fontSize="7"
                                    fontFamily="'Courier New', monospace"
                                    opacity={0.8}
                                >
                                    {char.keybind}
                                </text>
                            </g>
                        );
                    })}

                    {/* Center hub node */}
                    <motion.circle
                        cx={400} cy={160} r={6}
                        fill={accentColor}
                        fillOpacity={0.8}
                        animate={{ r: [5, 8, 5], fillOpacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.circle
                        cx={400} cy={280} r={6}
                        fill={accentColor}
                        fillOpacity={0.8}
                        animate={{ r: [5, 8, 5], fillOpacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                    />

                    {/* CLASSIFIED watermark */}
                    <text
                        x={400} y={490}
                        textAnchor="middle"
                        fill={accentColor}
                        fontSize="8"
                        fontFamily="'Courier New', monospace"
                        opacity="0.2"
                        letterSpacing="4"
                    >
                        PROJECT AEGIS — CLASSIFIED LEVEL 5
                    </text>
                </svg>
            </motion.div>

            {/* Foreground parallax layer (closer) */}
            <motion.div
                className="map-fg-layer"
                animate={{ x: mousePos.x * 1.5, y: mousePos.y * 1.2 }}
                transition={{ type: 'spring', stiffness: 120, damping: 22 }}
            />
        </div>
    );
}

export default TacticalMap;
