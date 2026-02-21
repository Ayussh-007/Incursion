import { create } from 'zustand';
import api from '../services/api';

const useGameStore = create((set, get) => ({
    // Scene state — governs sub-phases WITHIN the MissionPage route
    // CUTSCENE → completeCutscene() → AEGIS → completeAegis() → CHAR_INTRO → completeCharIntro() → GAME
    // When currentScene === 'GAME', MissionPage navigates to /level/{n}
    currentScene: 'INTRO',
    transitionProgress: 0,
    sceneReady: false,

    // User state (synced with backend after login)
    isAuthenticated: false,
    user: null,
    currentLevelDB: 1,   // authoritative level from MongoDB
    gameProgress: null,

    // Audio state
    audioInitialized: false,
    audioMuted: false,
    audioVolume: 0.7,

    // UI state
    fadeOverlay: 1,
    titleFractured: false,

    // ── AEGIS Operative Selection State ──────────────────────────────────────
    selectedCharacter: 0,
    abilityActive: false,
    abilityCooldownProgress: 1.0,
    aegisPhase: 'MAP_INTRO',
    _cooldownTimer: null,

    // ── Character Unlock & Progression State ─────────────────────────────────
    unlockedCharacters: [0],
    pendingUnlock: null,
    introCharacterIndex: 0,
    hasSeenIntro: false,

    // ── Basic Scene Actions ───────────────────────────────────────────────────
    setScene: (scene) => set({ currentScene: scene }),
    setTransitionProgress: (progress) => set({ transitionProgress: Math.min(1, Math.max(0, progress)) }),
    setSceneReady: (ready) => set({ sceneReady: ready }),
    setFadeOverlay: (opacity) => set({ fadeOverlay: opacity }),
    setTitleFractured: (fractured) => set({ titleFractured: fractured }),
    setAudioInitialized: (initialized) => set({ audioInitialized: initialized }),
    setAudioMuted: (muted) => set({ audioMuted: muted }),
    setAudioVolume: (volume) => set({ audioVolume: volume }),

    // ── AEGIS actions ─────────────────────────────────────────────────────────
    setSelectedCharacter: (index) => {
        const { abilityActive, unlockedCharacters } = get();
        if (abilityActive) return;
        if (!unlockedCharacters.includes(index)) return;
        set({ selectedCharacter: index, abilityCooldownProgress: 1.0 });
    },

    setAegisPhase: (phase) => set({ aegisPhase: phase }),

    activateAbility: (cooldownSeconds) => {
        const { abilityActive, abilityCooldownProgress, _cooldownTimer } = get();
        if (abilityActive || abilityCooldownProgress < 1.0) return;
        if (_cooldownTimer) clearInterval(_cooldownTimer);

        set({ abilityActive: true, abilityCooldownProgress: 0.0 });
        setTimeout(() => set({ abilityActive: false }), 1500);

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

    /**
     * Call when a level is completed.
     * 1. Sends PATCH /api/progress to persist the new level in MongoDB.
     * 2. Updates local state (character unlocks etc.).
     */
    completeLevel: async () => {
        const { currentLevelDB, unlockedCharacters } = get();
        const nextLevel = currentLevelDB + 1;

        try {
            await api.patch('/progress', { currentLevel: nextLevel });
        } catch (err) {
            console.error('[gameState] Failed to persist level progress:', err);
        }

        const UNLOCK_MAP = { 1: 1, 2: 2, 3: 3, 4: 4 };
        const newUnlock = UNLOCK_MAP[nextLevel];

        if (newUnlock !== undefined && !unlockedCharacters.includes(newUnlock)) {
            set({
                currentLevelDB: nextLevel,
                unlockedCharacters: [...unlockedCharacters, newUnlock],
                pendingUnlock: newUnlock,
                introCharacterIndex: newUnlock,
            });
        } else {
            set({ currentLevelDB: nextLevel });
        }

        return nextLevel;
    },

    /**
     * Called when CHAR_INTRO "Deploy" button is pressed.
     * Sets hasCompletedIntro in DB, then signals 'GAME' so MissionPage
     * navigates to /level/{currentLevelDB}.
     */
    completeCharIntro: async () => {
        const { pendingUnlock, currentLevelDB } = get();

        // Persist intro completion to DB
        try {
            await api.post('/progress', { hasCompletedIntro: true });
        } catch (err) {
            console.error('[gameState] Failed to mark intro complete:', err);
        }

        if (pendingUnlock !== null) {
            set({
                pendingUnlock: null,
                hasSeenIntro: true,
                selectedCharacter: pendingUnlock,
                currentScene: 'GAME',
            });
        } else {
            set({ hasSeenIntro: true, currentScene: 'GAME' });
        }
    },

    // ── Transition Orchestration ──────────────────────────────────────────────
    // LandingPage sub-phase sequence:
    // triggerEnterTransition() → TRANSITION → completeTransition() → LOGIN
    // LandingPage watches 'LOGIN' and navigates to /terminal

    triggerEnterTransition: () => {
        const { setScene, setTitleFractured } = get();
        setTitleFractured(true);
        setTimeout(() => setScene('TRANSITION'), 1200);
    },

    completeTransition: () => {
        set({ currentScene: 'LOGIN', transitionProgress: 0 });
    },

    // MissionPage sub-phase transitions:
    completeCutscene: () => {
        set({ currentScene: 'AEGIS' });
    },

    completeAegis: () => {
        const { hasSeenIntro, selectedCharacter } = get();
        if (!hasSeenIntro) {
            set({ currentScene: 'CHAR_INTRO', introCharacterIndex: selectedCharacter });
        } else {
            // Already seen intro — go straight to game
            set({ currentScene: 'GAME' });
        }
    },

    // ── Auth ──────────────────────────────────────────────────────────────────

    setUserFromAuth: (userData, level) => {
        set({ isAuthenticated: true, user: userData, currentLevelDB: Math.max(1, level) });
    },

    logout: async () => {
        try { await api.post('/auth/logout'); } catch { /* swallow */ }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
            isAuthenticated: false,
            user: null,
            currentLevelDB: 1,
            gameProgress: null,
            currentScene: 'INTRO',
        });
    }
}));

export default useGameStore;
