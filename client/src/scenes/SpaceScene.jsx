import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import { EffectComposer, Bloom, DepthOfField, Vignette } from '@react-three/postprocessing';
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
 * SpaceScene - Hyper-realistic deep space environment with cinematic post-processing
 */
function SpaceScene() {
    const setScene = useGameStore((state) => state.setScene);

    const handleEnterPress = () => {
        // First go to TRANSITION, then auto-advance to LOGIN
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
                    toneMapping: 2, // ACESFilmicToneMapping
                    toneMappingExposure: 1.2
                }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    {/* Camera */}
                    <CameraRig />

                    {/* Lighting */}
                    <ambientLight intensity={0.12} color="#0a1428" />

                    {/* Background */}
                    <color attach="background" args={['#000508']} />
                    <fog attach="fog" args={['#000508', 15, 60]} />

                    {/* 3D Elements */}
                    <Earth />
                    <IncursionTitle />
                    <SpaceParticles count={2000} />

                    {/* Post-Processing Effects */}
                    <EffectComposer>
                        {/* Bloom for glow effects */}
                        <Bloom
                            intensity={0.8}
                            luminanceThreshold={0.2}
                            luminanceSmoothing={0.9}
                            height={300}
                            mipmapBlur={true}
                        />

                        {/* Depth of Field for cinematic focus */}
                        <DepthOfField
                            focusDistance={0.02}
                            focalLength={0.05}
                            bokehScale={3}
                            height={480}
                        />

                        {/* Vignette for dramatic framing */}
                        <Vignette
                            offset={0.3}
                            darkness={0.6}
                            eskil={false}
                            blendFunction={BlendFunction.NORMAL}
                        />
                    </EffectComposer>
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <TransmissionMessage onEnter={handleEnterPress} />
        </div>
    );
}

export default SpaceScene;

