import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Suspense, useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import HolographicSphere from '../components/3d/HolographicSphere';
import GridFloor from '../components/3d/GridFloor';
import SpaceParticles from '../components/3d/SpaceParticles';
import TransmissionMessage from '../components/ui/TransmissionMessage';
import useMouseParallax from '../hooks/useMouseParallax';
import useGameStore from '../store/gameState';
import audioManager from '../utils/AudioManager';
import '../styles/TitleIntro.css';

/**
 * CameraRig - Smooth parallax camera with minimal sway
 */
function CameraRig() {
    const mousePos = useMouseParallax(0.03);
    const camRef = useRef();

    useFrame(() => {
        if (camRef.current && mousePos.current) {
            camRef.current.position.x = THREE.MathUtils.lerp(
                camRef.current.position.x,
                mousePos.current.x * 0.8,
                0.025
            );
            camRef.current.position.y = THREE.MathUtils.lerp(
                camRef.current.position.y,
                mousePos.current.y * 0.4 + 0.3,
                0.025
            );
            camRef.current.lookAt(0, 0, 0);
        }
    });

    return (
        <PerspectiveCamera
            ref={camRef}
            makeDefault
            position={[0, 0.3, 5]}
            fov={50}
        />
    );
}

/**
 * SpaceScene - Dark cyberpunk environment with holographic wireframe sphere
 */
function SpaceScene() {
    const triggerEnterTransition = useGameStore((state) => state.triggerEnterTransition);
    const titleFractured = useGameStore((state) => state.titleFractured);
    const titleReady = useRef(false);

    const [audioInitialized, setAudioInitialized] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => {
            titleReady.current = true;
        }, 3500);
        return () => clearTimeout(t);
    }, []);

    const handleEnterPress = useCallback(() => {
        if (titleReady.current && !titleFractured) {
            // Initialize audio context on user interaction
            if (!audioInitialized) {
                audioManager.init();
                audioManager.startAmbientDrone();
                audioManager.startStaticNoise();
                setAudioInitialized(true);
            }

            triggerEnterTransition();

            // Fade out audio before next scene
            setTimeout(() => {
                audioManager.fadeOutAll(1.0);
            }, 800);
        }
    }, [triggerEnterTransition, titleFractured, audioInitialized]);

    // Random glitch sound effects synced with visual glitch bar
    useEffect(() => {
        if (!audioInitialized) return;

        const glitchInterval = setInterval(() => {
            if (Math.random() > 0.7) {
                audioManager.playGlitchBurst();
            }
        }, 4000);

        return () => clearInterval(glitchInterval);
    }, [audioInitialized]);

    return (
        <div className="space-scene">
            <Canvas
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.0
                }}
                dpr={[1, 1.5]}
            >
                <CameraRig />
                <ambientLight intensity={0.03} color="#001520" />
                <color attach="background" args={['#000000']} />

                {/* Holographic wireframe sphere — pushed into background */}
                <group position={[0, 0, -3]}>
                    <HolographicSphere />
                </group>

                {/* Thin grid floor */}
                <GridFloor />

                {/* Sparse depth particles */}
                <Suspense fallback={null}>
                    <SpaceParticles count={40} />
                </Suspense>

                {/* Post-processing — bloom for wireframe glow */}
                <EffectComposer>
                    <Bloom
                        intensity={0.4}
                        luminanceThreshold={0.3}
                        luminanceSmoothing={0.95}
                        height={200}
                        mipmapBlur
                    />
                    <Vignette
                        offset={0.3}
                        darkness={0.75}
                        eskil={false}
                        blendFunction={BlendFunction.NORMAL}
                    />
                </EffectComposer>
            </Canvas>

            {/* Moving scanlines behind title area */}
            <div className="title-scanline-bg" />

            {/* CSS Title overlay + Cyberpunk HUD */}
            <div className="title-overlay">
                <div className="hud-corner hud-tl"></div>
                <div className="hud-corner hud-tr"></div>
                <div className="hud-corner hud-bl"></div>
                <div className="hud-corner hud-br"></div>

                <div className="hud-data hud-data-left">
                    <span className="hud-label">SYS.STATUS</span>
                    <span className="hud-value">NOMINAL</span>
                </div>
                <div className="hud-data hud-data-right">
                    <span className="hud-label">SIGNAL</span>
                    <span className="hud-value hud-value-crimson">DETECTED</span>
                </div>

                <div className="title-subtitle visible">
                    PROJECT AEGIS // CLASSIFIED
                </div>

                <h1 className="title-main visible">
                    {'INCURSION'.split('').map((letter, i) => (
                        <span key={i} className="title-letter" style={{ animationDelay: `${i * 0.08}s` }}>
                            {letter}
                        </span>
                    ))}
                </h1>

                <div className="title-line visible" />

                <div className="title-tagline visible">
                    THE SIGNAL HAS BEEN RECEIVED
                </div>
            </div>

            {/* Vertical side panels */}
            <div className="side-panel side-panel-left">
                {[20, 40, 60, 80, 100].map(top => (
                    <div key={top} className="side-panel-tick" style={{ top: `${top}px` }} />
                ))}
            </div>
            <div className="side-panel side-panel-right">
                {[20, 40, 60, 80, 100].map(top => (
                    <div key={top} className="side-panel-tick" style={{ top: `${top}px` }} />
                ))}
            </div>

            {/* Center darkening for title readability */}
            <div className="center-darken" />

            {/* Transmission message with Enter prompt */}
            <TransmissionMessage onEnter={handleEnterPress} />

            {/* Scanline interference + glitch overlay */}
            <div className="scene-scanlines" />
            <div className="glitch-bar" />
        </div>
    );
}

export default SpaceScene;
