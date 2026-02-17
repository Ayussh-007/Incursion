/**
 * Aurora Shader
 * Procedural aurora borealis effect using noise patterns
 */

export const AuroraShader = {
    vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

    fragmentShader: `
    uniform float time;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float intensity;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;
    
    // Simplex noise function (simplified)
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    float fbm(vec2 st) {
      float value = 0.0;
      float amplitude = 0.5;
      
      for(int i = 0; i < 3; i++) {
        value += amplitude * noise(st);
        st *= 2.0;
        amplitude *= 0.5;
      }
      
      return value;
    }
    
    void main() {
      // Only show aurora near poles (high latitude)
      float latitude = abs(vPosition.y / length(vPosition));
      float polarMask = smoothstep(0.6, 0.9, latitude);
      
      if(polarMask < 0.01) {
        discard;
      }
      
      // Animated noise pattern
      vec2 st = vUv * 3.0;
      st.x += time * 0.1;
      
      float n = fbm(st);
      
      // Create flowing curtain effect
      float wave = sin(st.x * 2.0 + time * 0.5) * 0.5 + 0.5;
      float pattern = n * wave;
      
      // Mix colors
      vec3 auroraColor = mix(color1, color2, pattern);
      
      // Fade based on pattern and polar position
      float alpha = pattern * polarMask * intensity;
      
      gl_FragColor = vec4(auroraColor, alpha * 0.6);
    }
  `,

    uniforms: {
        time: { value: 0.0 },
        color1: { value: [0.2, 1.0, 0.5] },  // Green
        color2: { value: [0.3, 0.5, 1.0] },  // Blue
        intensity: { value: 0.8 }
    }
};
