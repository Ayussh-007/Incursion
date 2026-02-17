import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

// Simple rotating cube to test Three.js rendering
function TestCube() {
    const meshRef = useRef();

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta;
            meshRef.current.rotation.y += delta * 0.5;
        }
    });

    return (
        <mesh ref={meshRef}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#00ffff" />
        </mesh>
    );
}

// Minimal test scene
function MinimalTestScene() {
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
            <Canvas camera={{ position: [0, 0, 3], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} />
                <TestCube />
            </Canvas>

            {/* Debug text */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: '#00ff00',
                fontFamily: 'monospace',
                fontSize: '14px',
                background: 'rgba(0,0,0,0.7)',
                padding: '10px'
            }}>
                THREE.JS TEST SCENE<br />
                You should see a rotating cyan cube
            </div>
        </div>
    );
}

export default MinimalTestScene;
