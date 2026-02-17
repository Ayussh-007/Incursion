import { useState, useEffect, useRef } from 'react';

/**
 * useMouseParallax - Custom hook for smooth orbital parallax effect
 * Returns normalized mouse position with smoothing for camera movement
 */
const useMouseParallax = (smoothing = 0.05) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const targetPosition = useRef({ x: 0, y: 0 });
    const animationFrame = useRef(null);

    useEffect(() => {
        const handleMouseMove = (event) => {
            // Normalize to -1 to 1 range
            targetPosition.current = {
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: -(event.clientY / window.innerHeight) * 2 + 1
            };
        };

        const animate = () => {
            setMousePosition((prev) => ({
                x: prev.x + (targetPosition.current.x - prev.x) * smoothing,
                y: prev.y + (targetPosition.current.y - prev.y) * smoothing
            }));

            animationFrame.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animationFrame.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationFrame.current) {
                cancelAnimationFrame(animationFrame.current);
            }
        };
    }, [smoothing]);

    return mousePosition;
};

export default useMouseParallax;
