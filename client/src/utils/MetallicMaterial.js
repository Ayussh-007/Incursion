import * as THREE from 'three';

/**
 * Create a brushed metal PBR material with procedural details
 */
export function createMetallicMaterial({
    baseColor = 0x1a1a1a,
    metalness = 0.95,
    roughness = 0.4,
    emissiveColor = 0xdc143c,
    emissiveIntensity = 0.0
} = {}) {
    const material = new THREE.MeshStandardMaterial({
        color: baseColor,
        metalness: metalness,
        roughness: roughness,
        emissive: new THREE.Color(emissiveColor),
        emissiveIntensity: emissiveIntensity,
        flatShading: false,
    });

    return material;
}

/**
 * Create brushed steel material with micro-scratches and fractures
 */
export function createBrushedSteelMaterial({
    emissiveIntensity = 0.2,
    scratchIntensity = 1.0
} = {}) {
    // Create a custom shader material for more control
    const material = new THREE.ShaderMaterial({
        uniforms: {
            baseColor: { value: new THREE.Color(0x1a1a1a) },
            emissiveColor: { value: new THREE.Color(0xdc143c) },
            emissiveIntensity: { value: emissiveIntensity },
            time: { value: 0.0 },
            scratchIntensity: { value: scratchIntensity }
        },

        vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,

        fragmentShader: `
      uniform vec3 baseColor;
      uniform vec3 emissiveColor;
      uniform float emissiveIntensity;
      uniform float time;
      uniform float scratchIntensity;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;
      
      // Simple noise for scratches
      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }
      
      void main() {
        // Base metallic color
        vec3 finalColor = baseColor;
        
        // Add brushed texture (vertical scratches)
        float brushPattern = noise(vec2(vUv.x * 100.0, vUv.y * 2.0)) * 0.1;
        finalColor += vec3(brushPattern * scratchIntensity);
        
        // Add micro-scratches (horizontal variation)
        float microScratches = noise(vUv * 500.0) * 0.05;
        finalColor += vec3(microScratches * scratchIntensity);
        
        // Emissive crimson glow (fracture pattern)
        float fracture = step(0.97, noise(vUv * 20.0));
        vec3 emissive = emissiveColor * emissiveIntensity * fracture;
        
        // Combine
        finalColor += emissive;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    });

    return material;
}

/**
 * Animate material properties over time
 */
export function updateMetallicMaterial(material, deltaTime) {
    if (material.uniforms && material.uniforms.time) {
        material.uniforms.time.value += deltaTime;
    }

    if (material.emissiveIntensity !== undefined) {
        // Already handled by component animation
    }
}
