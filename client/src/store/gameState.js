import { create } from 'zustand';
import api from '../services/api';

const useGameStore = create((set, get) => ({
    // Scene state
    currentScene: 'INTRO', // 'INTRO' | 'TRANSITION' | 'LOGIN' | 'CUTSCENE' | 'AEGIS' | 'CHAR_INTRO' | 'GAME'
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

    // ── Character Unlock & Progression State ─────────────────────────────────
    unlockedCharacters: [0],       // indices of unlocked characters (Strategist always unlocked)
    currentLevel: 0,               // levels cleared
    pendingUnlock: null,           // index of character just unlocked (null = none pending)
    introCharacterIndex: 0,        // which character's intro page to show
    hasSeenIntro: false,           // true after first CHAR_INTRO has been seen

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
        const { abilityActive, unlockedCharacters } = get();
        if (abilityActive) return; // don't switch mid-ability
        if (!unlockedCharacters.includes(index)) return; // locked character
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

    // ── Progression Actions ───────────────────────────────────────────────────

    // Called when a level is cleared — checks for new unlocks
    completeLevel: () => {
        const { currentLevel, unlockedCharacters } = get();
        const nextLevel = currentLevel + 1;

        // Character unlock map: level cleared → character index unlocked
        const UNLOCK_MAP = { 1: 1, 2: 2, 3: 3, 4: 4 };
        const newUnlock = UNLOCK_MAP[nextLevel];

        if (newUnlock !== undefined && !unlockedCharacters.includes(newUnlock)) {
            // New character unlocked — show their intro page
            set({
                currentLevel: nextLevel,
                unlockedCharacters: [...unlockedCharacters, newUnlock],
                pendingUnlock: newUnlock,
                introCharacterIndex: newUnlock,
                currentScene: 'CHAR_INTRO',
            });
        } else {
            // No new unlock — just increment level and go back to AEGIS
            set({ currentLevel: nextLevel, currentScene: 'AEGIS' });
        }
    },

    // Called when the CHAR_INTRO "Deploy" button is pressed
    completeCharIntro: () => {
        const { pendingUnlock, hasSeenIntro } = get();
        if (pendingUnlock !== null) {
            // Coming from an unlock — return to AEGIS deck with new character available
            set({
                pendingUnlock: null,
                hasSeenIntro: true,
                selectedCharacter: pendingUnlock,
                currentScene: 'AEGIS',
            });
        } else {
            // First-time Strategist intro — go to GAME
            set({ hasSeenIntro: true, currentScene: 'GAME' });
        }
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

    // From AEGIS "Deploy" button — show Strategist intro first time, then GAME
    completeAegis: () => {
        const { hasSeenIntro, selectedCharacter } = get();
        if (!hasSeenIntro) {
            set({ currentScene: 'CHAR_INTRO', introCharacterIndex: selectedCharacter });
        } else {
            set({ currentScene: 'GAME' });
        }
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
