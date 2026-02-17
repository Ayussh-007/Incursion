import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { EarthAtmosphereShader } from '../../shaders/EarthAtmosphereShader';
import { AuroraShader } from '../../shaders/AuroraShader';

/**
 * Earth - Hyper-realistic Earth component with textures, atmosphere, and aurora
 * Includes fallback to procedural materials if textures fail to load
 */
function Earth() {
    const earthRef = useRef();
    const cloudsRef = useRef();
    const atmosphereRef = useRef();
    const auroraRef = useRef();
    const cityLightsRef = useRef();

    const [texturesLoaded, setTexturesLoaded] = useState(false);

    // Try to load textures, fallback to procedural if unavailable
    const textures = useMemo(() => {
        try {
            const textureLoader = new THREE.TextureLoader();
            return {
                day: textureLoader.load('/textures/earth/day.jpg',
                    () => setTexturesLoaded(true),
                    undefined,
                    () => console.log('Day texture not found, using procedural fallback')),
                night: textureLoader.load('/textures/earth/night.jpg'),
                clouds: textureLoader.load('/textures/earth/clouds.jpg'),
                normal: textureLoader.load('/textures/earth/normal.jpg'),
                specular: textureLoader.load('/textures/earth/specular.jpg')
            };
        } catch (error) {
            console.log('Texture loading failed, using procedural materials');
            return null;
        }
    }, []);

    // Enhanced atmosphere shader material
    const atmosphereMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: EarthAtmosphereShader.vertexShader,
            fragmentShader: EarthAtmosphereShader.fragmentShader,
            uniforms: {
                glowColor: { value: new THREE.Vector3(0.6, 0.8, 1.0) },
                coefficient: { value: 0.1 },
                power: { value: 2.5 }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });
    }, []);

    // Aurora material
    const auroraMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            vertexShader: AuroraShader.vertexShader,
            fragmentShader: AuroraShader.fragmentShader,
            uniforms: {
                time: { value: 0.0 },
                color1: { value: new THREE.Vector3(0.2, 1.0, 0.5) },
                color2: { value: new THREE.Vector3(0.3, 0.5, 1.0) },
                intensity: { value: 0.8 }
            },
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            transparent: true,
            depthWrite: false
        });
    }, []);

    // Earth surface material (with or without textures)
    const earthMaterial = useMemo(() => {
        if (textures) {
            return new THREE.MeshStandardMaterial({
                map: textures.day,
                normalMap: textures.normal,
                roughnessMap: textures.specular,
                roughness: 0.7,
                metalness: 0.1,
                normalScale: new THREE.Vector2(0.85, 0.85)
            });
        } else {
            // Procedural fallback
            return new THREE.MeshStandardMaterial({
                color: 0x2244aa,
                roughness: 0.7,
                metalness: 0.1,
                emissive: new THREE.Color(0x001122),
                emissiveIntensity: 0.1
            });
        }
    }, [textures]);

    // Clouds material
    const cloudsMaterial = useMemo(() => {
        if (textures && textures.clouds) {
            return new THREE.MeshStandardMaterial({
                map: textures.clouds,
                transparent: true,
                opacity: 0.4,
                depthWrite: false,
                blending: THREE.NormalBlending
            });
        } else {
            // Procedural clouds
            return new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.3,
                depthWrite: false
            });
        }
    }, [textures]);

    // City lights material (night side)
    const cityLightsMaterial = useMemo(() => {
        if (textures && textures.night) {
            return new THREE.MeshBasicMaterial({
                map: textures.night,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.8
            });
        }
        return null;
    }, [textures]);

    // Animation loop
    useFrame((state, delta) => {
        // Rotate Earth slowly
        if (earthRef.current) {
            earthRef.current.rotation.y += delta * 0.05;
        }

        // Clouds rotate slightly faster
        if (cloudsRef.current) {
            cloudsRef.current.rotation.y += delta * 0.07;
        }

        // City lights rotate with Earth
        if (cityLightsRef.current) {
            cityLightsRef.current.rotation.y += delta * 0.05;
        }

        // Animate aurora
        if (auroraRef.current && auroraRef.current.material.uniforms) {
            auroraRef.current.material.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    return (
        <group position={[0, 0, -10]}>
            {/* Main Earth sphere */}
            <mesh ref={earthRef} castShadow receiveShadow>
                <sphereGeometry args={[2, 128, 128]} />
                <primitive object={earthMaterial} attach="material" />
            </mesh>

            {/* City lights (night side) */}
            {cityLightsMaterial && (
                <mesh ref={cityLightsRef}>
                    <sphereGeometry args={[2.002, 128, 128]} />
                    <primitive object={cityLightsMaterial} attach="material" />
                </mesh>
            )}

            {/* Cloud layer */}
            <mesh ref={cloudsRef}>
                <sphereGeometry args={[2.01, 64, 64]} />
                <primitive object={cloudsMaterial} attach="material" />
            </mesh>

            {/* Aurora effect (near poles) */}
            <mesh ref={auroraRef} scale={[1.05, 1.05, 1.05]}>
                <sphereGeometry args={[2, 64, 64]} />
                <primitive object={auroraMaterial} attach="material" />
            </mesh>

            {/* Atmospheric glow */}
            <mesh ref={atmosphereRef} scale={[1.15, 1.15, 1.15]}>
                <sphereGeometry args={[2, 64, 64]} />
                <primitive object={atmosphereMaterial} attach="material" />
            </mesh>

            {/* Sun directional light */}
            <directionalLight
                position={[5, 3, 5]}
                intensity={3.5}
                color="#ffffff"
                castShadow
            />

            {/* Ambient fill light */}
            <ambientLight intensity={0.15} color="#4466ff" />

            {/* Subtle rim light */}
            <directionalLight
                position={[-5, -2, -5]}
                intensity={0.3}
                color="#6688ff"
            />
        </group>
    );
}

export default Earth;
