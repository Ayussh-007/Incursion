import { useRef, useCallback } from 'react';

/**
 * useMouseParallax - Optimized mouse parallax using refs (no re-renders)
 * Returns a ref object with { x, y } that updates every frame via rAF
 */
const useMouseParallax = (smoothing = 0.05) => {
    const position = useRef({ x: 0, y: 0 });
    const target = useRef({ x: 0, y: 0 });
    const frameId = useRef(null);
    const initialized = useRef(false);

    // Initialize only once
    if (!initialized.current) {
        initialized.current = true;

        const handleMouseMove = (event) => {
            target.current = {
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: -(event.clientY / window.innerHeight) * 2 + 1
            };
        };

        const animate = () => {
            position.current = {
                x: position.current.x + (target.current.x - position.current.x) * smoothing,
                y: position.current.y + (target.current.y - position.current.y) * smoothing
            };
            frameId.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        frameId.current = requestAnimationFrame(animate);
    }

    return position;
};

export default useMouseParallax;
