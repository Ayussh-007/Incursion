import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';

/**
 * GridFloor - Faint digital grid plane for depth perception
 * Distance-based fade, no heavy geometry
 */

const gridVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const gridFragmentShader = `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    // Grid pattern
    vec2 coord = vWorldPos.xz * 0.8;
    vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
    float line = min(grid.x, grid.y);
    float gridAlpha = 1.0 - min(line, 1.0);

    // Distance fade from center
    float dist = length(vWorldPos.xz);
    float distFade = smoothstep(12.0, 2.0, dist);

    // Very subtle pulse
    float pulse = 0.7 + sin(time * 0.3) * 0.1;

    // Cyan tint
    vec3 color = vec3(0.0, 0.7, 0.8);

    float alpha = gridAlpha * distFade * 0.08 * pulse;

    gl_FragColor = vec4(color, alpha);
  }
`;

function GridFloor() {
    const materialRef = useRef();

    const material = useMemo(() => new THREE.ShaderMaterial({
        vertexShader: gridVertexShader,
        fragmentShader: gridFragmentShader,
        uniforms: {
            time: { value: 0 }
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    }), []);

    useFrame((state) => {
        if (material) {
            material.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
            <planeGeometry args={[30, 30, 1, 1]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

export default GridFloor;
