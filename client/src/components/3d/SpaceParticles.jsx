import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useMouseParallax from '../../hooks/useMouseParallax';

/**
 * SpaceParticles - Floating particles that react to mouse movement
 */
function SpaceParticles({ count = 1000 }) {
    const particlesRef = useRef();
    const mousePosition = useMouseParallax(0.03);

    // Generate particles in 3D space
    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Random positions in spherical volume
            const radius = Math.random() * 15 + 5;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi) - 10;

            // Small random velocities
            velocities[i * 3] = (Math.random() - 0.5) * 0.01;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
        }

        return { positions, velocities };
    }, [count]);

    // Animate particles
    useFrame((state, delta) => {
        if (particlesRef.current) {
            const positions = particlesRef.current.geometry.attributes.position.array;

            for (let i = 0; i < count; i++) {
                // Natural drift
                positions[i * 3] += particles.velocities[i * 3] * delta * 10;
                positions[i * 3 + 1] += particles.velocities[i * 3 + 1] * delta * 10;
                positions[i * 3 + 2] += particles.velocities[i * 3 + 2] * delta * 10;

                // Mouse influence (subtle)
                positions[i * 3] += mousePosition.x * 0.01;
                positions[i * 3 + 1] += mousePosition.y * 0.01;
            }

            particlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={particles.positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#ffffff"
                transparent
                opacity={0.6}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export default SpaceParticles;
