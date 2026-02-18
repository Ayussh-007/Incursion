import { create } from 'zustand';
import api from '../services/api';

const useGameStore = create((set, get) => ({
    // Scene state
    currentScene: 'INTRO', // 'INTRO' | 'TRANSITION' | 'LOGIN' | 'CUTSCENE' | 'AEGIS' | 'GAME'
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

    // ── AEGIS Operative Selection State ──────────────────────────────────────
    selectedCharacter: 0,          // 0–4 index into CHARACTERS array
    abilityActive: false,          // true while ability effect is playing
    abilityCooldownProgress: 1.0,  // 1.0 = ready, 0.0 = on cooldown
    aegisPhase: 'MAP_INTRO',       // 'MAP_INTRO' | 'CARDS_RISE' | 'READY'
    _cooldownTimer: null,          // internal ref for cleanup

    // Actions
    setScene: (scene) => set({ currentScene: scene }),
    setTransitionProgress: (progress) => set({ transitionProgress: Math.min(1, Math.max(0, progress)) }),
    setSceneReady: (ready) => set({ sceneReady: ready }),
    setFadeOverlay: (opacity) => set({ fadeOverlay: opacity }),
    setTitleFractured: (fractured) => set({ titleFractured: fractured }),
    setAudioInitialized: (initialized) => set({ audioInitialized: initialized }),
    setAudioMuted: (muted) => set({ audioMuted: muted }),
    setAudioVolume: (volume) => set({ audioVolume: volume }),

    // AEGIS actions
    setSelectedCharacter: (index) => {
        const { abilityActive } = get();
        if (abilityActive) return; // don't switch mid-ability
        set({ selectedCharacter: index, abilityCooldownProgress: 1.0 });
    },

    setAegisPhase: (phase) => set({ aegisPhase: phase }),

    activateAbility: (cooldownSeconds) => {
        const { abilityActive, abilityCooldownProgress, _cooldownTimer } = get();
        if (abilityActive || abilityCooldownProgress < 1.0) return; // on cooldown or already active

        // Clear any existing timer
        if (_cooldownTimer) clearInterval(_cooldownTimer);

        set({ abilityActive: true, abilityCooldownProgress: 0.0 });

        // Dismiss ability effect after 1.5s
        setTimeout(() => {
            set({ abilityActive: false });
        }, 1500);

        // Refill cooldown ring over cooldownSeconds
        const totalMs = cooldownSeconds * 1000;
        const tickMs = 50;
        const tickIncrement = tickMs / totalMs;
        let progress = 0;

        const timer = setInterval(() => {
            progress += tickIncrement;
            if (progress >= 1.0) {
                progress = 1.0;
                clearInterval(timer);
                set({ abilityCooldownProgress: 1.0, _cooldownTimer: null });
            } else {
                set({ abilityCooldownProgress: progress });
            }
        }, tickMs);

        set({ _cooldownTimer: timer });
    },

    // Transition orchestration
    triggerEnterTransition: () => {
        const { setScene, setTitleFractured } = get();
        setTitleFractured(true);
        setTimeout(() => {
            setScene('TRANSITION');
        }, 1200);
    },

    completeTransition: () => {
        set({ currentScene: 'LOGIN', transitionProgress: 0 });
    },

    completeCutscene: () => {
        set({ currentScene: 'AEGIS' });
    },

    completeAegis: () => {
        set({ currentScene: 'GAME' });
    },

    // Authentication
    login: async (username, password) => {
        try {
            const response = await api.post('/auth/login', { username, password });
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
            await api.post('/auth/logout');
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
