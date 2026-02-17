import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Earth - Hyper-realistic Earth component with atmosphere and procedural materials
 * Version without texture dependencies for initial testing
 */
function Earth() {
    const earthRef = useRef();
    const cloudsRef = useRef();
    const atmosphereRef = useRef();

    // Atmosphere shader material
    const atmosphereMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          vec3 atmosphere = vec3(0.3, 0.6, 1.0) * intensity;
          gl_FragColor = vec4(atmosphere, intensity * 0.8);
        }
      `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
    }, []);

    // Procedural earth material
    const earthMaterial = useMemo(() => {
        return new THREE.MeshPhongMaterial({
            color: 0x2244aa,
            emissive: new THREE.Color(0x111100),
            specular: new THREE.Color(0x333333),
            shininess: 25
        });
    }, []);

    // Clouds material
    const cloudsMaterial = useMemo(() => {
        return new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2,
            depthWrite: false
        });
    }, []);

    // Slow rotation animation
    useFrame((state, delta) => {
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.05;
        }
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.07;
        }
    });

    return (
        <group position={[0, 0, -10]}>
            {/* Main Earth sphere */}
            <mesh ref={earthRef}>
                <sphereGeometry args={[2, 64, 64]} />
                <primitive object={earthMaterial} attach="material" />
            </mesh>

            {/* Cloud layer */}
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[2.01, 64, 64]} />
                <primitive object={cloudsMaterial} attach="material" />
            </mesh>

            {/* Atmospheric glow */}
            <mesh ref={atmosphereRef} scale={[1.1, 1.1, 1.1]}>
                <sphereGeometry args={[2, 64, 64]} />
                <primitive object={atmosphereMaterial} attach="material" />
            </mesh>

            {/* Directional light for sun illumination */}
            <directionalLight position={[5, 3, 5]} intensity={2} color="#ffffff" />
        </group>
    );
}

export default Earth;
