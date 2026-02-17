import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Earth - Hyper-realistic procedural Earth with enhanced shaders
 * Features: aurora, city lights, cloud layers, atmospheric scattering, polar ice
 */

const earthVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPosition = wp.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const earthFragmentShader = `
  uniform float time;
  uniform vec3 sunDir;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  // Fast hash-based noise
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  // 4-octave FBM for richer detail
  float fbm(vec3 p) {
    float v = 0.0;
    float amp = 0.5;
    for (int i = 0; i < 4; i++) {
      v += amp * noise(p);
      p *= 2.03;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 pos = normalize(vPosition) * 2.0;
    float lat = abs(pos.y);

    // Continent mask with better definition
    float n = fbm(pos * 1.5 + vec3(3.0, 1.0, 2.0));
    float continent = smoothstep(0.36, 0.50, n);

    // Ocean colors - deep and rich
    vec3 deepOcean = vec3(0.005, 0.02, 0.10);
    vec3 shallowOcean = vec3(0.02, 0.08, 0.22);
    vec3 ocean = mix(deepOcean, shallowOcean, smoothstep(0.26, 0.40, n));

    // Ocean specular highlight
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float spec = pow(max(dot(reflect(-sunDir, vNormal), viewDir), 0.0), 64.0);
    ocean += vec3(0.15, 0.2, 0.28) * spec * (1.0 - continent);

    // Land biomes with more detail
    float detail = noise(pos * 6.0);
    float detail2 = noise(pos * 12.0);
    vec3 lowland = vec3(0.08, 0.18, 0.04);
    vec3 highland = vec3(0.20, 0.18, 0.10);
    vec3 mountain = vec3(0.35, 0.30, 0.22);
    vec3 desert = vec3(0.45, 0.38, 0.20);
    vec3 snow = vec3(0.88, 0.90, 0.95);

    vec3 land = mix(lowland, highland, smoothstep(0.35, 0.55, detail));
    land = mix(land, mountain, smoothstep(0.55, 0.72, detail));
    // Desert near equator
    land = mix(land, desert, smoothstep(0.6, 0.75, detail) * (1.0 - smoothstep(0.0, 0.35, lat)));
    land = mix(land, snow, smoothstep(0.76, 0.9, detail + lat * 0.35));
    // Micro terrain detail
    land *= 0.9 + detail2 * 0.2;

    // Polar ice caps
    float iceEdge = smoothstep(0.62, 0.82, lat);
    land = mix(land, snow, iceEdge);
    ocean = mix(ocean, vec3(0.45, 0.55, 0.65), smoothstep(0.72, 0.88, lat));

    // Combine surface
    vec3 surface = mix(ocean, land, continent);

    // Lighting
    float diff = max(dot(vNormal, sunDir), 0.0);
    float ambient = 0.06;

    // Terminator softness
    float terminator = smoothstep(-0.1, 0.15, dot(vNormal, sunDir));

    // ===== NIGHT SIDE: City Lights =====
    float nightFade = smoothstep(0.05, -0.2, dot(vNormal, sunDir));
    // Clustered city lights
    float cityN1 = noise(pos * 15.0);
    float cityN2 = noise(pos * 30.0);
    float cityCluster = step(0.6, cityN1) * step(0.4, cityN2);
    float cities = cityCluster * continent * nightFade;
    // Color variation: warm white to amber
    vec3 cityColor = mix(vec3(1.0, 0.9, 0.6), vec3(1.0, 0.7, 0.3), noise(pos * 20.0));
    vec3 cityGlow = cityColor * cities * 0.6;
    // Scattered individual lights
    float scatter = step(0.78, noise(pos * 50.0)) * continent * nightFade * 0.3;
    cityGlow += vec3(1.0, 0.85, 0.5) * scatter;

    // ===== AURORA =====
    float polarProx = smoothstep(0.55, 0.75, lat);
    float auroraWave = sin(pos.x * 4.0 + time * 0.3) * cos(pos.z * 3.0 + time * 0.2);
    float auroraIntensity = polarProx * nightFade * smoothstep(-0.2, 0.4, auroraWave) * 0.4;
    vec3 auroraColor = mix(
      vec3(0.1, 0.8, 0.3),
      vec3(0.2, 0.3, 0.9),
      sin(pos.x * 2.0 + time * 0.15) * 0.5 + 0.5
    );
    vec3 aurora = auroraColor * auroraIntensity;

    // ===== ATMOSPHERE EDGE (Fresnel) =====
    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.5);
    vec3 atmoDay = vec3(0.3, 0.55, 1.0) * fresnel * 0.3 * terminator;
    vec3 atmoNight = vec3(0.05, 0.1, 0.25) * fresnel * 0.15 * nightFade;

    // ===== CLOUDS =====
    float cloudBase = noise(pos * 3.0 + vec3(time * 0.012, 0.0, time * 0.006));
    float cloudDetail = noise(pos * 6.0 + vec3(time * 0.008, time * 0.004, 0.0));
    float cloud = smoothstep(0.45, 0.65, cloudBase + cloudDetail * 0.3);
    vec3 cloudCol = vec3(0.92, 0.94, 0.98) * cloud * 0.35 * max(diff, 0.03);

    // ===== FINAL COMPOSITE =====
    vec3 color = surface * (diff * terminator + ambient) + cityGlow + aurora + atmoDay + atmoNight + cloudCol;

    // Tone mapping (filmic)
    color = color / (color + vec3(1.0));
    // Slight cold blue grade
    color = mix(color, color * vec3(0.9, 0.95, 1.05), 0.15);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const atmoVert = `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmoFrag = `
  uniform vec3 sunDir;
  uniform float time;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float rim = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 4.5);
    float sun = max(dot(vNormal, sunDir), 0.0) * 0.5 + 0.5;
    // Day side: warm blue atmosphere, night side: faint purple
    vec3 dayCol = mix(vec3(0.1, 0.25, 0.7), vec3(0.4, 0.65, 1.0), sun);
    vec3 nightCol = vec3(0.04, 0.03, 0.08);
    float nightMask = smoothstep(0.0, -0.2, dot(vNormal, sunDir));
    vec3 col = mix(dayCol, nightCol, nightMask);
    // Subtle atmospheric breathing
    float breath = sin(time * 0.3) * 0.05 + 1.0;
    gl_FragColor = vec4(col, rim * 0.55 * breath);
  }
`;

function Earth() {
  const ref = useRef();
  const sunDir = useMemo(() => new THREE.Vector3(1, 0.3, 0.5).normalize(), []);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms: {
      time: { value: 0 },
      sunDir: { value: sunDir }
    }
  }), [sunDir]);

  const atmoMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: atmoVert,
    fragmentShader: atmoFrag,
    uniforms: {
      sunDir: { value: sunDir },
      time: { value: 0 }
    },
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }), [sunDir]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.025;
      const t = state.clock.elapsedTime;
      mat.uniforms.time.value = t;
      atmoMat.uniforms.time.value = t;
    }
  });

  return (
    <group position={[0.8, -0.5, -3]}>
      <directionalLight position={[10, 3, 5]} intensity={3.5} color="#fffaf0" />
      <ambientLight intensity={0.04} color="#1a2a6a" />

      {/* Earth sphere - high detail */}
      <mesh ref={ref}>
        <sphereGeometry args={[2.5, 128, 128]} />
        <primitive object={mat} attach="material" />
      </mesh>

      {/* Atmosphere shell */}
      <mesh scale={[1.06, 1.06, 1.06]}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <primitive object={atmoMat} attach="material" />
      </mesh>
    </group>
  );
}

export default Earth;
