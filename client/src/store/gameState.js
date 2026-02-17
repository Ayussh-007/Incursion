import { create } from 'zustand';
import api from '../services/api';

const useGameStore = create((set) => ({
    // Sequence state
    currentScene: 'INTRO', // 'INTRO' | 'TRANSITION' | 'LOGIN' | 'CUTSCENE' | 'GAME'

    // User state
    isAuthenticated: false,
    user: null,
    gameProgress: null,

    // Audio state
    audioMuted: false,
    audioVolume: 0.7,

    // Actions
    setScene: (scene) => set({ currentScene: scene }),
    setAudioMuted: (muted) => set({ audioMuted: muted }),
    setAudioVolume: (volume) => set({ audioVolume: volume }),

    // Authentication
    login: async (username, password) => {
        try {
            const response = await api.post('/api/auth/login', { username, password });
            set({
                isAuthenticated: true,
                user: response.data.user
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: async () => {
        try {
            await api.post('/api/auth/logout');
            set({
                isAuthenticated: false,
                user: null,
                gameProgress: null,
                currentScene: 'INTRO'
            });
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
}));

export default useGameStore;
