import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

/**
 * IncursionTitle - 3D brushed steel typography with crimson glow
 */
function IncursionTitle() {
    const titleRef = useRef();
    const groupRef = useRef();

    // Brushed steel material with emissive glow
    const steelMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.3,
            emissive: new THREE.Color(0xdc143c), // Crimson
            emissiveIntensity: 0
        });
    }, []);

    // Pulsing glow animation
    useFrame((state) => {
        if (titleRef.current && titleRef.current.material) {
            // Pulse between high and low intensity
            const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.5 + 0.5;
            titleRef.current.material.emissiveIntensity = pulse * 0.4;

            // Occasional glitch effect
            if (Math.random() > 0.98) {
                groupRef.current.position.x += (Math.random() - 0.5) * 0.1;
                groupRef.current.position.y += (Math.random() - 0.5) * 0.1;
                setTimeout(() => {
                    groupRef.current.position.set(0, 0, 0);
                }, 50);
            }
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            <Text
                ref={titleRef}
                fontSize={0.7}
                letterSpacing={0.05}
                maxWidth={10}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
                font="https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff"
            >
                INCURSION
                <primitive object={steelMaterial} attach="material" />
            </Text>
        </group>
    );
}

export default IncursionTitle;
