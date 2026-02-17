import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Center } from '@react-three/drei';
import * as THREE from 'three';

/**
 * IncursionTitle - Ultra-detailed 3D brushed steel typography with crimson glow and glitch effects
 */
function IncursionTitle() {
    const titleRef = useRef();
    const groupRef = useRef();
    const glitchTimer = useRef(0);
    const pulsePhase = useRef(0);

    // Advanced brushed steel material with procedural details
    const steelMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x0a0a0a,  // Very dark steel
            metalness: 0.95,
            roughness: 0.35,
            emissive: new THREE.Color(0xdc143c), // Crimson
            emissiveIntensity: 0.2,
            flatShading: false,
            envMapIntensity: 1.5
        });
    }, []);

    // Advanced animation: pulsing glow + electromagnetic glitches
    useFrame((state, delta) => {
        if (!titleRef.current || !groupRef.current) return;

        // Smooth pulsing between crimson and metallic grey
        pulsePhase.current += delta * 0.6;
        const pulse = Math.sin(pulsePhase.current) * 0.5 + 0.5;

        // Fluctuate emissive intensity (0.15 to 0.5)
        steelMaterial.emissiveIntensity = 0.15 + pulse * 0.35;

        // Subtle color shift between crimson and darker grey
        const crimsonInfluence = pulse;
        steelMaterial.emissive.setRGB(
            0.5 + crimsonInfluence * 0.36,  // R: 0.5 to 0.86
            crimsonInfluence * 0.08,         // G: 0 to 0.08
            crimsonInfluence * 0.24          // B: 0 to 0.24
        );

        // Controlled electromagnetic glitch ripple (every 3-5 seconds)
        glitchTimer.current += delta;

        if (glitchTimer.current > 3.0 + Math.random() * 2.0) {
            glitchTimer.current = 0;

            // Brief controlled distortion
            const glitchIntensity = 0.08;
            const glitchX = (Math.random() - 0.5) * glitchIntensity;
            const glitchY = (Math.random() - 0.5) * glitchIntensity * 0.5;
            const glitchRotation = (Math.random() - 0.5) * 0.02;

            groupRef.current.position.x += glitchX;
            groupRef.current.position.y += glitchY;
            groupRef.current.rotation.z += glitchRotation;

            // Quick recovery (not instant, smoother)
            setTimeout(() => {
                if (groupRef.current) {
                    groupRef.current.position.x -= glitchX * 0.7;
                    groupRef.current.position.y -= glitchY * 0.7;
                    groupRef.current.rotation.z -= glitchRotation * 0.7;
                }
            }, 30);

            setTimeout(() => {
                if (groupRef.current) {
                    groupRef.current.position.set(0, 0, 0);
                    groupRef.current.rotation.set(0, 0, 0);
                }
            }, 60);
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            <Center>
                <Text
                    ref={titleRef}
                    fontSize={0.8}
                    letterSpacing={0.1}
                    maxWidth={10}
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff"
                >
                    INCURSION
                    <primitive object={steelMaterial} attach="material" />
                </Text>
            </Center>

            {/* Point lights for enhanced metallic reflections */}
            <pointLight position={[2, 1, 2]} intensity={0.5} color="#ff4466" />
            <pointLight position={[-2, -1, 2]} intensity={0.3} color="#4466ff" />
        </group>
    );
}

export default IncursionTitle;

