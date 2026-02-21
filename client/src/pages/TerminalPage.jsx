/**
 * TerminalPage — route: /terminal
 * Renders the SERN Login Terminal.
 * If the user already has a valid token:
 *   - hasCompletedIntro=true  → go to /level/{n}  (returning user)
 *   - hasCompletedIntro=false → go to /mission     (hasn't seen aegis/char-intro yet)
 */
import { Suspense, lazy, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

        // Use a raw axios call with a short timeout to avoid the shared
        // interceptor's 401-redirect logic, which can cause loops here.
        const baseURL = import.meta.env.VITE_API_URL || '/api';
        axios.get(`${baseURL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 3000,
        })
            .then(({ data }) => {
                const lvl = Math.max(1, data.currentLevel);
                if (data.hasCompletedIntro) {
                    navigate(`/level/${lvl}`, { replace: true });
                } else {
                    navigate('/mission', { replace: true });
                }
            })
            .catch(() => {
                // Invalid / expired token or server unreachable — show terminal
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
