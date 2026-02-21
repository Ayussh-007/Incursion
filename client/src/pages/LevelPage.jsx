/**
 * LevelPage — route: /level/:levelId
 * Lazy-loads the correct level scene component, wrapped in ProtectedRoute.
 * Prevents manual URL skipping by comparing levelId with user's currentLevel.
 */
import { Suspense, lazy } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// ── Level scene registry ──────────────────────────────────────────────────────
// Add new levels here as they are built. Keep lazy so only the current level's
// bundle is loaded.
const LEVEL_SCENES = {
    1: lazy(() => import('../scenes/Level1Scene')),
    // 2: lazy(() => import('../scenes/Level2Scene')),
};

function LoadingScreen({ text = 'LOADING MISSION...' }) {
    return (
        <div className="loading-screen">
            <div className="loading-text">{text}</div>
            <div className="loading-bar"><div className="loading-fill" /></div>
        </div>
    );
}

export default function LevelPage() {
    const { levelId } = useParams();
    const numericLevel = parseInt(levelId, 10);

    // If URL contains a non-numeric or unknown level, redirect to /
    if (!numericLevel || !LEVEL_SCENES[numericLevel]) {
        return <Navigate to="/" replace />;
    }

    const LevelScene = LEVEL_SCENES[numericLevel];

    return (
        <ProtectedRoute levelRequired={numericLevel}>
            <Suspense fallback={<LoadingScreen text={`LOADING ACT ${numericLevel}...`} />}>
                <LevelScene />
            </Suspense>
        </ProtectedRoute>
    );
}
