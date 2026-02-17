import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import Earth from '../components/3d/Earth';
import IncursionTitle from '../components/3d/IncursionTitle';
import SpaceParticles from '../components/3d/SpaceParticles';
import TransmissionMessage from '../components/ui/TransmissionMessage';
import useMouseParallax from '../hooks/useMouseParallax';
import useGameStore from '../store/gameState';

/**
 * CameraRig - Camera with mouse parallax
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
 * SpaceScene - Main deep space environment
 */
function SpaceScene() {
    const setScene = useGameStore((state) => state.setScene);

    const handleEnterPress = () => {
        setScene('TRANSITION');
    };

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000000' }}>
            <Canvas
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance'
                }}
                dpr={[1, 2]}
            >
                <Suspense fallback={null}>
                    {/* Camera */}
                    <CameraRig />

                    {/* Lighting */}
                    <ambientLight intensity={0.1} />

                    {/* Background */}
                    <color attach="background" args={['#000508']} />
                    <fog attach="fog" args={['#000508', 10, 50]} />

                    {/* 3D Elements */}
                    <Earth />
                    <IncursionTitle />
                    <SpaceParticles count={1500} />
                </Suspense>
            </Canvas>

            {/* UI Overlay */}
            <TransmissionMessage onEnter={handleEnterPress} />
        </div>
    );
}

export default SpaceScene;
