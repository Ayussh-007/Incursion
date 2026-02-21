/**
 * LandingPage — route: /
 * Houses the SpaceScene (3D space intro) and TransitionSequence.
 * On "ENTER" the user is transition-animated to /terminal via navigate().
 * The Zustand store's scene state (INTRO / TRANSITION) still drives
 * the sub-phase within this page; only the final transition to login
 * now uses navigate() instead of setScene('LOGIN').
 */
import { Suspense, lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameState';

const SpaceScene = lazy(() => import('../scenes/SpaceScene'));
const TransitionSequence = lazy(() => import('../components/ui/TransitionSequence'));

function LoadingScreen({ text = 'INITIALIZING...' }) {
    return (
        <div className="loading-screen">
            <div className="loading-text">{text}</div>
            <div className="loading-bar"><div className="loading-fill" /></div>
        </div>
    );
}

export default function LandingPage() {
    const currentScene = useGameStore((s) => s.currentScene);
    const navigate = useNavigate();

    // When the Zustand store reaches 'LOGIN' state, navigate to /terminal
    useEffect(() => {
        if (currentScene === 'LOGIN') {
            navigate('/terminal', { replace: true });
        }
    }, [currentScene, navigate]);

    return (
        <>
            {(currentScene === 'INTRO') && (
                <Suspense fallback={<LoadingScreen text="INITIALIZING INCURSION..." />}>
                    <SpaceScene />
                </Suspense>
            )}
            {currentScene === 'TRANSITION' && (
                <Suspense fallback={<LoadingScreen text="ATMOSPHERIC ENTRY DETECTED..." />}>
                    <TransitionSequence />
                </Suspense>
            )}
        </>
    );
}
