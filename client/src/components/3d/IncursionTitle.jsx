import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Center } from '@react-three/drei';
import * as THREE from 'three';

/**
 * IncursionTitle - Ultra-detailed 3D brushed black steel typography
 * Features:
 * - Brushed steel with crimson fracture glow
 * - Electromagnetic glitch ripples
 * - Pulsing between crimson energy and cold metallic grey
 * - Fracture + advance animation on Enter press
 */
function IncursionTitle({ onFractureComplete }) {
    const groupRef = useRef();
    const glitchTimer = useRef(0);
    const pulsePhase = useRef(0);
    const entranceStart = useRef(null);
    const [visible, setVisible] = useState(false);
    const [animPhase, setAnimPhase] = useState(0); // 0=hidden, 1=entering, 2=idle, 3=fracturing
    const [fractured, setFractured] = useState(false);

    // Entrance timing
    useEffect(() => {
        const t1 = setTimeout(() => {
            setVisible(true);
            setAnimPhase(1);
            entranceStart.current = performance.now();
        }, 1200);

        const t2 = setTimeout(() => {
            setAnimPhase(2);
        }, 3500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    // Listen for fracture trigger from parent
    const triggerFracture = useCallback(() => {
        if (animPhase === 2 && !fractured) {
            setAnimPhase(3);
            setFractured(true);
            setTimeout(() => {
                if (onFractureComplete) onFractureComplete();
            }, 1000);
        }
    }, [animPhase, fractured, onFractureComplete]);

    // Expose trigger through ref pattern
    useEffect(() => {
        window.__incursionTitleFracture = triggerFracture;
        return () => { delete window.__incursionTitleFracture; };
    }, [triggerFracture]);

    // Brushed dark steel material
    const steelMaterial = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: 0x0e0e1a,
            metalness: 0.97,
            roughness: 0.18,
            emissive: new THREE.Color(0x000000),
            emissiveIntensity: 0.0,
            envMapIntensity: 2.0
        });
    }, []);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const elapsed = state.clock.elapsedTime;

        // ===== ENTRANCE (Phase 1) =====
        if (animPhase === 1) {
            const entryDuration = 2.2;
            const t = Math.min((elapsed - 1.2) / entryDuration, 1.0);
            const eased = 1.0 - Math.pow(1.0 - t, 4); // Ease out quartic

            // Scale from small to full
            const scale = 0.2 + eased * 0.8;
            groupRef.current.scale.set(scale, scale, scale);

            // Emissive ramp
            steelMaterial.emissiveIntensity = eased * 0.5;
            steelMaterial.emissive.setRGB(0.86 * eased, 0.08 * eased, 0.24 * eased);

            // Z approach
            groupRef.current.position.z = -3 + eased * 3;

            // Random glitch flickers during entrance
            if (Math.random() < 0.06) {
                groupRef.current.position.x = (Math.random() - 0.5) * 0.2;
                groupRef.current.rotation.z = (Math.random() - 0.5) * 0.03;
            } else {
                groupRef.current.position.x *= 0.88;
                groupRef.current.rotation.z *= 0.88;
            }
        }

        // ===== IDLE (Phase 2) =====
        if (animPhase === 2) {
            // Settle
            groupRef.current.position.x *= 0.92;
            groupRef.current.position.z = 0;
            groupRef.current.rotation.z *= 0.92;
            groupRef.current.scale.set(1, 1, 1);

            // Pulse between crimson energy and cold metallic grey
            pulsePhase.current += delta * 0.4;
            const pulse = Math.sin(pulsePhase.current) * 0.5 + 0.5;
            const slowPulse = Math.sin(pulsePhase.current * 0.3) * 0.5 + 0.5;

            steelMaterial.emissiveIntensity = 0.1 + pulse * 0.4;

            // Transition between crimson and cold grey
            const r = 0.3 + pulse * 0.56;
            const g = pulse * 0.06;
            const b = 0.08 + slowPulse * 0.16;
            steelMaterial.emissive.setRGB(r, g, b);

            // Slight roughness variation for micro-scratch illusion
            steelMaterial.roughness = 0.18 + Math.sin(elapsed * 1.2) * 0.04;

            // Electromagnetic glitch every 4-7s
            glitchTimer.current += delta;
            if (glitchTimer.current > 4.0 + Math.random() * 3.0) {
                glitchTimer.current = 0;

                // Controlled ripple distortion
                const intensity = 0.06;
                groupRef.current.position.x = (Math.random() - 0.5) * intensity;
                groupRef.current.position.y = (Math.random() - 0.5) * intensity * 0.3;
                groupRef.current.rotation.z = (Math.random() - 0.5) * 0.015;

                // Brief emissive spike
                steelMaterial.emissiveIntensity = 0.8;

                setTimeout(() => {
                    if (groupRef.current) {
                        groupRef.current.position.x = 0;
                        groupRef.current.position.y = Math.sin(elapsed * 0.5) * 0.015;
                        groupRef.current.rotation.z = 0;
                    }
                }, 100);
            }

            // Subtle floating
            groupRef.current.position.y = Math.sin(elapsed * 0.5) * 0.015;
        }

        // ===== FRACTURING (Phase 3) =====
        if (animPhase === 3) {
            const fractureT = Math.min((state.clock.elapsedTime - (elapsed - delta)) * 2 + (groupRef.current.position.z / 20), 1);

            // Rapidly advance toward camera
            groupRef.current.position.z += delta * 25;
            groupRef.current.scale.multiplyScalar(1 + delta * 3);

            // Intense glow
            steelMaterial.emissiveIntensity = 2.0;
            steelMaterial.emissive.setRGB(0.86, 0.08, 0.24);
            steelMaterial.opacity = Math.max(0, 1 - groupRef.current.position.z / 15);

            // Shake
            groupRef.current.position.x = (Math.random() - 0.5) * 0.3;
            groupRef.current.position.y = (Math.random() - 0.5) * 0.2;
            groupRef.current.rotation.z = (Math.random() - 0.5) * 0.1;

            // Hide when past camera
            if (groupRef.current.position.z > 15) {
                setVisible(false);
            }
        }
    });

    if (!visible) return null;

    return (
        <group ref={groupRef} position={[0, 0.8, -3]} scale={[0.2, 0.2, 0.2]}>
            <Center>
                <Text
                    fontSize={1.2}
                    letterSpacing={0.18}
                    maxWidth={14}
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                    font="https://fonts.gstatic.com/s/orbitron/v31/yMJMMIlzdpvBhQQL_SC3X9yhF25-T1nyGy6BoWgz.woff"
                >
                    INCURSION
                    <primitive object={steelMaterial} attach="material" />
                </Text>
            </Center>

            {/* Dynamic lighting for metallic reflections */}
            <pointLight position={[3, 1, 2]} intensity={0.6} color="#dc143c" distance={10} />
            <pointLight position={[-3, -1, 2]} intensity={0.4} color="#3344aa" distance={10} />
            <pointLight position={[0, 0, 3]} intensity={0.2} color="#ffffff" distance={8} />
            <pointLight position={[0, -2, 1]} intensity={0.15} color="#dc143c" distance={6} />
        </group>
    );
}

export default IncursionTitle;
