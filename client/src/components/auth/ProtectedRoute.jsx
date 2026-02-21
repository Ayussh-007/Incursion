/**
 * ProtectedRoute — wraps level routes with JWT + level-access checks
 * Props:
 *   levelRequired  (number) — the level number this route belongs to
 *   children       (ReactNode) — the scene component to render
 *
 * Behaviour:
 *   - While validating: show loading screen
 *   - Not authenticated: redirect to /terminal
 *   - Authenticated but level not unlocked: redirect to /level/{currentLevel}
 *   - All checks pass: render children
 */
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function LoadingScreen() {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Orbitron', monospace", color: 'rgba(30,144,255,0.7)',
            fontSize: '12px', letterSpacing: '0.3em'
        }}>
            VALIDATING CLEARANCE...
        </div>
    );
}

export default function ProtectedRoute({ children, levelRequired }) {
    const { isAuthenticated, isLoading, currentLevel } = useAuth();

    if (isLoading) return <LoadingScreen />;
    if (!isAuthenticated) return <Navigate to="/terminal" replace />;

    // Block access to levels the user hasn't unlocked yet
    if (levelRequired && currentLevel < levelRequired) {
        return <Navigate to={`/level/${currentLevel}`} replace />;
    }

    return children;
}
