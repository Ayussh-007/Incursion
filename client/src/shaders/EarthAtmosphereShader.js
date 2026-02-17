/**
 * Earth Atmosphere Shader
 * Creates realistic atmospheric glow using Fresnel effect
 */

export const EarthAtmosphereShader = {
    vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

    fragmentShader: `
    uniform vec3 glowColor;
    uniform float coefficient;
    uniform float power;
    
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec3 vWorldPosition;
    
    void main() {
      vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
      
      // Fresnel effect for atmospheric edge glow
      float intensity = pow(coefficient + dot(viewDirection, vNormal), power);
      
      // Color gradient from blue to subtle purple
      vec3 atmosphereColor = mix(
        vec3(0.3, 0.6, 1.0),  // Blue
        vec3(0.5, 0.3, 0.8),  // Purple
        intensity * 0.3
      );
      
      gl_FragColor = vec4(atmosphereColor * glowColor, intensity * 0.9);
    }
  `,

    uniforms: {
        glowColor: { value: [0.6, 0.8, 1.0] },
        coefficient: { value: 0.1 },
        power: { value: 2.5 }
    }
};
