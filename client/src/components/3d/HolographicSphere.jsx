import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * HolographicSphere — Low-poly wireframe + orbital rings + radar sweep
 * Premium cyberpunk aesthetic, lightweight render
 */

const wireVertexShader = `
  uniform float time;
  uniform float glitchIntensity;
  varying vec3 vPosition;
  varying float vDistFromCenter;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    vPosition = position;
    vDistFromCenter = length(position);

    vec3 pos = position;

    // Subtle breathing
    float breathe = 1.0 + sin(time * 0.35) * 0.012;
    pos *= breathe;

    // Glitch distortion
    float glitchTime = floor(time * 2.5);
    float glitch = step(0.93, hash(glitchTime));
    pos.x += glitch * glitchIntensity * sin(pos.y * 10.0 + time * 20.0) * 0.06;
    pos.z += glitch * glitchIntensity * cos(pos.x * 8.0 + time * 15.0) * 0.04;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const wireFragmentShader = `
  uniform float time;
  varying vec3 vPosition;
  varying float vDistFromCenter;

  void main() {
    // Subdued cyan wireframe
    vec3 cyan = vec3(0.0, 0.75, 0.85);
    vec3 crimson = vec3(0.7, 0.06, 0.2);

    float pulse = sin(time * 0.5 + vPosition.y * 2.0) * 0.5 + 0.5;
    float crimsonMix = smoothstep(0.75, 1.0, pulse) * 0.2;
    vec3 color = mix(cyan, crimson, crimsonMix);

    // Radar sweep — angular band rotating around Y axis
    float angle = atan(vPosition.z, vPosition.x);
    float sweepAngle = mod(time * 0.7, 6.283185);
    float angleDiff = abs(mod(angle - sweepAngle + 3.14159, 6.283185) - 3.14159);
    float sweep = smoothstep(0.5, 0.0, angleDiff) * 0.5;
    color += vec3(0.0, sweep * 0.6, sweep * 0.7);

    // Faint scan line
    float scanY = sin(time * 0.6) * 1.5;
    float scanGlow = smoothstep(0.5, 0.0, abs(vPosition.y - scanY)) * 0.2;
    color += vec3(0.0, scanGlow * 0.2, scanGlow * 0.25);

    // Reduced alpha — background element
    float edgeFade = smoothstep(0.0, 0.3, abs(vPosition.y));
    float alpha = 0.28 + edgeFade * 0.18 + sweep * 0.25 + scanGlow * 0.1;

    gl_FragColor = vec4(color, alpha);
  }
`;

/* Orbital ring shader */
const ringVertexShader = `
  uniform float time;
  uniform float ringIndex;
  varying float vAngle;
  varying vec3 vPos;

  void main() {
    vPos = position;
    vAngle = atan(position.z, position.x);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const ringFragmentShader = `
  uniform float time;
  uniform float ringIndex;
  varying float vAngle;
  varying vec3 vPos;

  void main() {
    vec3 cyan = vec3(0.0, 0.7, 0.8);
    vec3 crimson = vec3(0.65, 0.06, 0.18);

    // Directional fade — brighter at "leading edge"
    float sweepAngle = mod(time * (0.3 + ringIndex * 0.15), 6.283185);
    float angleDiff = abs(mod(vAngle - sweepAngle + 3.14159, 6.283185) - 3.14159);
    float trail = smoothstep(2.0, 0.0, angleDiff);

    // Color — mostly cyan with crimson accent at tail
    float crimsonMix = smoothstep(1.5, 2.5, angleDiff) * 0.3;
    vec3 color = mix(cyan, crimson, crimsonMix);

    float alpha = trail * 0.18 + 0.04;

    gl_FragColor = vec4(color, alpha);
  }
`;

function OrbitalRing({ radius, tiltX, tiltZ, ringIndex, rotationSpeed }) {
    const ref = useRef();

    const geometry = useMemo(() => {
        const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
        const points = curve.getPoints(80);
        const geo = new THREE.BufferGeometry().setFromPoints(
            points.map(p => new THREE.Vector3(p.x, 0, p.y))
        );
        return geo;
    }, [radius]);

    const material = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: ringVertexShader,
        fragmentShader: ringFragmentShader,
        uniforms: {
            time: { value: 0 },
            ringIndex: { value: ringIndex }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [ringIndex]);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (material) material.uniforms.time.value = t;
        if (ref.current) {
            ref.current.rotation.y = t * rotationSpeed;
        }
    });

    return (
        <group ref={ref} rotation={[tiltX, 0, tiltZ]}>
            <line geometry={geometry}>
                <primitive object={material} attach="material" />
            </line>
        </group>
    );
}

function HolographicSphere() {
    const groupRef = useRef();

    // Low-poly icosahedron wireframe
    const geometry = useMemo(() => {
        const geo = new THREE.IcosahedronGeometry(1.6, 2);
        return new THREE.EdgesGeometry(geo);
    }, []);

    const innerGeo = useMemo(() => {
        return new THREE.IcosahedronGeometry(1.58, 2);
    }, []);

    const wireMaterial = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: wireVertexShader,
        fragmentShader: wireFragmentShader,
        uniforms: {
            time: { value: 0 },
            glitchIntensity: { value: 1.0 }
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    }), []);

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (groupRef.current) {
            groupRef.current.rotation.y = t * 0.06;
            groupRef.current.rotation.x = Math.sin(t * 0.1) * 0.08;
        }
        if (wireMaterial) {
            wireMaterial.uniforms.time.value = t;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Wireframe sphere */}
            <lineSegments geometry={geometry}>
                <primitive object={wireMaterial} attach="material" />
            </lineSegments>

            {/* Inner ghost fill */}
            <mesh geometry={innerGeo}>
                <meshBasicMaterial
                    color="#002030"
                    transparent
                    opacity={0.03}
                    side={THREE.BackSide}
                    depthWrite={false}
                />
            </mesh>

            {/* Core glow point */}
            <mesh>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshBasicMaterial color="#00ddee" transparent opacity={0.4} />
            </mesh>

            {/* Orbital rings */}
            <OrbitalRing radius={2.2} tiltX={0.3} tiltZ={0.1} ringIndex={0} rotationSpeed={0.08} />
            <OrbitalRing radius={2.5} tiltX={-0.5} tiltZ={0.25} ringIndex={1} rotationSpeed={-0.05} />
            <OrbitalRing radius={2.8} tiltX={0.15} tiltZ={-0.4} ringIndex={2} rotationSpeed={0.03} />
        </group>
    );
}

export default HolographicSphere;
