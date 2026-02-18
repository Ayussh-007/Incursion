import { Suspense, lazy, useEffect, useState } from 'react';
import useGameStore from './store/gameState';
import './styles/index.css';

// Lazy load heavy scenes
const SpaceScene = lazy(() => import('./scenes/SpaceScene'));
const TransitionSequence = lazy(() => import('./components/ui/TransitionSequence'));
const LoginTerminal = lazy(() => import('./components/ui/LoginTerminal'));
const CutsceneSequence = lazy(() => import('./components/ui/CutsceneSequence'));
const AegisScene = lazy(() => import('./scenes/AegisScene'));
const CharacterIntroPage = lazy(() => import('./scenes/CharacterIntroPage'));
const Level1Scene = lazy(() => import('./scenes/Level1Scene'));

// Loading screen component
function LoadingScreen({ text = 'INITIALIZING...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-text">{text}</div>
      <div className="loading-bar">
        <div className="loading-fill" />
      </div>
    </div>
  );
}

function App() {
  const currentScene = useGameStore((state) => state.currentScene);
  const [initialFade, setInitialFade] = useState(1);

  // Fade from complete black on initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialFade(0);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      {/* INTRO: Deep space scene */}
      {currentScene === 'INTRO' && (
        <Suspense fallback={<LoadingScreen text="INITIALIZING INCURSION..." />}>
          <SpaceScene />
        </Suspense>
      )}

      {/* TRANSITION: Atmospheric dive sequence */}
      {currentScene === 'TRANSITION' && (
        <Suspense fallback={<LoadingScreen text="ATMOSPHERIC ENTRY DETECTED..." />}>
          <TransitionSequence />
        </Suspense>
      )}

      {/* LOGIN: Classified terminal */}
      {currentScene === 'LOGIN' && (
        <Suspense fallback={<LoadingScreen text="BOOTING SECURE TERMINAL..." />}>
          <LoginTerminal />
        </Suspense>
      )}

      {/* CUTSCENE: Post-login signal transmission */}
      {currentScene === 'CUTSCENE' && (
        <Suspense fallback={<LoadingScreen text="ESTABLISHING DEEP SPACE LINK..." />}>
          <CutsceneSequence />
        </Suspense>
      )}

      {/* AEGIS: Operative selection */}
      {currentScene === 'AEGIS' && (
        <Suspense fallback={<LoadingScreen text="INITIALIZING OPERATIVE SELECTION..." />}>
          <AegisScene />
        </Suspense>
      )}

      {/* CHAR_INTRO: Character introduction briefing */}
      {currentScene === 'CHAR_INTRO' && (
        <Suspense fallback={<LoadingScreen text="LOADING OPERATIVE BRIEFING..." />}>
          <CharacterIntroPage />
        </Suspense>
      )}

      {/* GAME: Level 1 – Breach Protocol */}
      {currentScene === 'GAME' && (
        <Suspense fallback={<LoadingScreen text="LOADING BREACH PROTOCOL..." />}>
          <Level1Scene />
        </Suspense>
      )}

      {/* Global fade-from-black overlay */}
      <div
        className="global-fade-overlay"
        style={{
          opacity: initialFade,
          pointerEvents: initialFade > 0 ? 'all' : 'none',
          transition: 'opacity 2s ease-out'
        }}
      />
    </div>
  );
}

export default App;
