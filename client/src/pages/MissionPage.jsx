/**
 * MissionPage — route: /mission
 * Houses the post-login cinematic sequence before level play:
 *   CUTSCENE → AEGIS (character selection) → CHAR_INTRO → /level/{n}
 *
 * This page is protected (requires auth). On reload, if the user already
 * completed the intro (hasCompletedIntro=true in DB), they are redirected
 * straight to their level.
 */
import { Suspense, lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameState';
import useAuth from '../hooks/useAuth';

const CutsceneSequence = lazy(() => import('../components/ui/CutsceneSequence'));
const AegisScene = lazy(() => import('../scenes/AegisScene'));
const CharacterIntroPage = lazy(() => import('../scenes/CharacterIntroPage'));

function LoadingScreen({ text = 'LOADING...' }) {
    return (
        <div className="loading-screen">
            <div className="loading-text">{text}</div>
            <div className="loading-bar"><div className="loading-fill" /></div>
        </div>
    );
}

export default function MissionPage() {
    const navigate = useNavigate();
    const currentScene = useGameStore((s) => s.currentScene);
    const currentLevelDB = useGameStore((s) => s.currentLevelDB);
    const setScene = useGameStore((s) => s.setScene);
    const { isAuthenticated, isLoading } = useAuth();

    // Redirect unauthenticated users to terminal
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/terminal', { replace: true });
        }
    }, [isLoading, isAuthenticated, navigate]);

    // When MissionPage first mounts, always start at CUTSCENE
    useEffect(() => {
        setScene('CUTSCENE');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When Zustand signals 'GAME', navigate to the player's current level
    useEffect(() => {
        if (currentScene === 'GAME') {
            const lvl = Math.max(1, currentLevelDB);
            navigate(`/level/${lvl}`, { replace: true });
        }
    }, [currentScene, currentLevelDB, navigate]);

    if (isLoading) return <LoadingScreen text="VALIDATING CLEARANCE..." />;

    return (
        <Suspense fallback={<LoadingScreen text="LOADING MISSION..." />}>
            {currentScene === 'CUTSCENE' && <CutsceneSequence />}
            {currentScene === 'AEGIS' && <AegisScene />}
            {currentScene === 'CHAR_INTRO' && <CharacterIntroPage />}
        </Suspense>
    );
}
