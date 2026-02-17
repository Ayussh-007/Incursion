import { create } from 'zustand';

const useGameStore = create((set) => ({
    // Sequence state
    currentScene: 'INTRO', // INTRO, TRANSITION, LOGIN, CUTSCENE, GAME
    isTransitioning: false,

    // User state
    user: null,
    isAuthenticated: false,
    gameProgress: null,

    // Audio state
    isMuted: false,
    volume: 0.7,

    // Actions
    setScene: (scene) => set({ currentScene: scene }),
    setTransitioning: (isTransitioning) => set({ isTransitioning }),
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setGameProgress: (gameProgress) => set({ gameProgress }),
    toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    setVolume: (volume) => set({ volume }),
    logout: () => set({
        user: null,
        isAuthenticated: false,
        gameProgress: null,
        currentScene: 'INTRO'
    })
}));

export default useGameStore;
