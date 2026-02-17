import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Earth - Procedural Earth with atmosphere glow
 * Uses simple Three.js materials for reliable rendering
 */
function Earth() {
    const earthRef = useRef();
    const cloudsRef = useRef();
    const glowRef = useRef();

    // Slow rotation
    useFrame((state, delta) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.05;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.07;
            cloudsRef.current.rotation.x += delta * 0.01;
        }
    });

    return (
        <group position={[3, -1.5, -2]}>
            {/* Sun light hitting the Earth */}
            <directionalLight
                position={[5, 3, 5]}
                intensity={3}
                color="#ffffff"
            />
            <ambientLight intensity={0.3} color="#4466ff" />

            {/* Main Earth sphere - ocean blue with slight emissive */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[3, 64, 64]} />
                <meshStandardMaterial
                    color="#1a4a8a"
                    roughness={0.6}
                    metalness={0.1}
                    emissive="#001133"
                    emissiveIntensity={0.3}
                />
            </mesh>

            {/* Landmass overlay - slightly larger sphere with green tint */}
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[3.01, 48, 48]} />
                <meshStandardMaterial
                    color="#ffffff"
                    transparent={true}
                    opacity={0.08}
                    depthWrite={false}
                />
            </mesh>

            {/* Atmospheric glow ring - backside rendered for outer glow */}
            <mesh ref={glowRef} scale={[1.15, 1.15, 1.15]}>
                <sphereGeometry args={[3, 48, 48]} />
                <meshBasicMaterial
                    color="#4488ff"
                    transparent={true}
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Inner atmospheric edge */}
            <mesh scale={[1.05, 1.05, 1.05]}>
                <sphereGeometry args={[3, 48, 48]} />
                <meshBasicMaterial
                    color="#66aaff"
                    transparent={true}
                    opacity={0.08}
                    side={THREE.BackSide}
                />
            </mesh>
        </group>
    );
}

export default Earth;
