import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import Earth from '../components/3d/Earth';
import IncursionTitle from '../components/3d/IncursionTitle';
import SpaceParticles from '../components/3d/SpaceParticles';
import TransmissionMessage from '../components/ui/TransmissionMessage';
import useMouseParallax from '../hooks/useMouseParallax';
import useGameStore from '../store/gameState';

/**
 * CameraRig - Camera with smooth mouse parallax
 */
function CameraRig() {
    const mousePosition = useMouseParallax(0.05);

    return (
        <PerspectiveCamera
            makeDefault
            position={[
                mousePosition.x * 2,
                mousePosition.y * 1,
                5
            ]}
            fov={60}
        />
    );
}

/**
 * SpaceScene - Deep space environment with Earth and cinematic effects
 */
function SpaceScene() {
    const setScene = useGameStore((state) => state.setScene);

    const handleEnterPress = () => {
        setScene('TRANSITION');
        setTimeout(() => {
            setScene('LOGIN');
        }, 3000);
    };

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
            <Canvas
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                    toneMapping: 2,
                    toneMappingExposure: 1.2
                }}
                dpr={[1, 2]}
            >
                {/* Camera */}
                <CameraRig />

                {/* Lighting */}
                <ambientLight intensity={0.15} color="#1a2a4a" />

                {/* Background */}
                <color attach="background" args={['#000508']} />

                {/* Earth - always renders (no external deps) */}
                <Earth />

                {/* Title - wrapped in Suspense since it loads external font */}
                <Suspense fallback={null}>
                    <IncursionTitle />
                </Suspense>

                {/* Space particles */}
                <Suspense fallback={null}>
                    <SpaceParticles count={2000} />
                </Suspense>

                {/* Post-Processing - Bloom + Vignette only (no DepthOfField) */}
                <EffectComposer>
                    <Bloom
                        intensity={0.8}
                        luminanceThreshold={0.2}
                        luminanceSmoothing={0.9}
                        height={300}
                        mipmapBlur={true}
                    />
                    <Vignette
                        offset={0.3}
                        darkness={0.5}
                        eskil={false}
                        blendFunction={BlendFunction.NORMAL}
                    />
                </EffectComposer>
            </Canvas>

            {/* UI Overlay */}
            <TransmissionMessage onEnter={handleEnterPress} />
        </div>
    );
}

export default SpaceScene;
