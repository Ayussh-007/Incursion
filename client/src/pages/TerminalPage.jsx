/**
 * TerminalPage — route: /terminal
 * Renders the SERN Login Terminal.
 * If the user already has a valid token:
 *   - hasCompletedIntro=true  → go to /level/{n}  (returning user)
 *   - hasCompletedIntro=false → go to /mission     (hasn't seen aegis/char-intro yet)
 */
import { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const LoginTerminal = lazy(() => import('../components/ui/LoginTerminal'));

function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-text">BOOTING SECURE TERMINAL...</div>
            <div className="loading-bar"><div className="loading-fill" /></div>
        </div>
    );
}

export default function TerminalPage() {
    const navigate = useNavigate();
    const [checking, setChecking] = useState(true);

    // If a valid token exists, skip the terminal and resume at correct point
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setChecking(false);
            return;
        }
        api.get('/auth/me')
            .then(({ data }) => {
                const lvl = Math.max(1, data.currentLevel);
                if (data.hasCompletedIntro) {
                    // Returning user who already saw the mission intro — go straight to level
                    navigate(`/level/${lvl}`, { replace: true });
                } else {
                    // Has a token but hasn't completed the aegis/char-intro flow yet
                    navigate('/mission', { replace: true });
                }
            })
            .catch(() => {
                // Invalid token — show terminal
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                setChecking(false);
            });
    }, [navigate]);

    if (checking) return <LoadingScreen />;

    return (
        <Suspense fallback={<LoadingScreen />}>
            <LoginTerminal />
        </Suspense>
    );
}
