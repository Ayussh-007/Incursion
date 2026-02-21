/**
 * useAuth — JWT authentication hook
 * Reads tokens from localStorage, validates via GET /api/auth/me,
 * and returns user + currentLevel for ProtectedRoute and app init.
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export default function useAuth() {
    const [user, setUser] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const validate = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
            setCurrentLevel(Math.max(1, data.currentLevel));
            setIsAuthenticated(true);
        } catch {
            // Token invalid or expired — clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        validate();
    }, [validate]);

    /** Call after a successful login/register to update state without re-fetching */
    const setAuthData = useCallback((userData, level, accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        setUser(userData);
        setCurrentLevel(Math.max(1, level));
        setIsAuthenticated(true);
    }, []);

    /** Advance the stored currentLevel in React state (after DB PATCH succeeds) */
    const advanceLevel = useCallback((newLevel) => {
        setCurrentLevel(prev => Math.max(prev, newLevel));
    }, []);

    const logout = useCallback(async () => {
        try { await api.post('/auth/logout'); } catch { /* swallow */ }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setCurrentLevel(1);
        setIsAuthenticated(false);
    }, []);

    return { user, currentLevel, isAuthenticated, isLoading, setAuthData, advanceLevel, logout, validate };
}
