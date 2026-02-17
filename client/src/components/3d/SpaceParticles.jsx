import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * SpaceParticles - Sparse depth particles (floating dust motes)
 * Very few, large, dim, slow drift — not a star field
 */

const particleVertexShader = `
  uniform float time;
  attribute float size;
  attribute float brightness;
  attribute float phase;
  varying float vBrightness;
  varying float vPhase;

  void main() {
    vBrightness = brightness;
    vPhase = phase;

    vec3 pos = position;

    // Very slow drift
    pos.x += sin(time * 0.08 + phase * 6.28) * 0.3;
    pos.y += cos(time * 0.06 + phase * 4.0) * 0.2;
    pos.z += sin(time * 0.04 + phase * 3.0) * 0.15;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (50.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const particleFragmentShader = `
  uniform float time;
  varying float vBrightness;
  varying float vPhase;

  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;

    float alpha = smoothstep(0.5, 0.05, d) * vBrightness;

    // Flicker
    float flicker = 0.6 + sin(time * 1.5 + vPhase * 10.0) * 0.4;
    alpha *= flicker;

    // Mix cyan and white
    vec3 color = mix(vec3(0.0, 0.8, 0.9), vec3(0.9, 0.9, 1.0), vBrightness * 0.5);

    gl_FragColor = vec4(color, alpha * 0.2);
  }
`;

function SpaceParticles({ count = 40 }) {
    const meshRef = useRef();

    const { positions, sizes, brightnesses, phases } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const brightnesses = new Float32Array(count);
        const phases = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Scattered sparsely in a wide volume
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 4;

            sizes[i] = Math.random() * 2 + 1;
            brightnesses[i] = Math.random() * 0.5 + 0.2;
            phases[i] = Math.random();
        }

        return { positions, sizes, brightnesses, phases };
    }, [count]);

    const material = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        uniforms: {
            time: { value: 0 }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), []);

    useFrame((state) => {
        if (material) {
            material.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
                <bufferAttribute attach="attributes-brightness" count={count} array={brightnesses} itemSize={1} />
                <bufferAttribute attach="attributes-phase" count={count} array={phases} itemSize={1} />
            </bufferGeometry>
            <primitive object={material} attach="material" />
        </points>
    );
}

export default SpaceParticles;
