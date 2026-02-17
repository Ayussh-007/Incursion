import { create } from 'zustand';
import api from '../services/api';

const useGameStore = create((set, get) => ({
    // Scene state
    currentScene: 'INTRO', // 'INTRO' | 'TRANSITION' | 'LOGIN' | 'CUTSCENE' | 'GAME'
    transitionProgress: 0,
    sceneReady: false,

    // User state
    isAuthenticated: false,
    user: null,
    gameProgress: null,

    // Audio state
    audioInitialized: false,
    audioMuted: false,
    audioVolume: 0.7,

    // UI state
    fadeOverlay: 1, // 1 = fully black, 0 = transparent
    titleFractured: false,

    // Actions
    setScene: (scene) => set({ currentScene: scene }),
    setTransitionProgress: (progress) => set({ transitionProgress: Math.min(1, Math.max(0, progress)) }),
    setSceneReady: (ready) => set({ sceneReady: ready }),
    setFadeOverlay: (opacity) => set({ fadeOverlay: opacity }),
    setTitleFractured: (fractured) => set({ titleFractured: fractured }),
    setAudioInitialized: (initialized) => set({ audioInitialized: initialized }),
    setAudioMuted: (muted) => set({ audioMuted: muted }),
    setAudioVolume: (volume) => set({ audioVolume: volume }),

    // Transition orchestration
    triggerEnterTransition: () => {
        const { setScene, setTitleFractured } = get();
        setTitleFractured(true);
        // Title fractures, then camera dives
        setTimeout(() => {
            setScene('TRANSITION');
        }, 1200);
    },

    completeTransition: () => {
        set({ currentScene: 'LOGIN', transitionProgress: 0 });
    },

    completeCutscene: () => {
        set({ currentScene: 'GAME' });
    },

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
