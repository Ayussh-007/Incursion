import { Suspense, lazy } from 'react';
import useGameStore from './store/gameState';
import './styles/index.css';

// Lazy load scenes
const SpaceScene = lazy(() => import('./scenes/SpaceScene'));
const LoginTerminal = lazy(() => import('./components/ui/LoginTerminal'));

function App() {
  const currentScene = useGameStore((state) => state.currentScene);

  return (
    <div className="app">
      {/* Intro: Deep space scene */}
      {currentScene === 'INTRO' && (
        <Suspense fallback={
          <div style={{
            width: '100vw',
            height: '100vh',
            background: '#000000',
            color: '#00ffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontFamily: 'monospace'
          }}>
            INITIALIZING INCURSION...
          </div>
        }>
          <SpaceScene />
        </Suspense>
      )}

      {/* Transition: Atmospheric dive sequence */}
      {currentScene === 'TRANSITION' && (
        <div style={{
          width: '100vw',
          height: '100vh',
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00ffff',
          fontFamily: 'monospace',
          fontSize: '1.5rem',
          gap: '20px'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>
            ATMOSPHERIC ENTRY DETECTED
          </div>
          <div>DESCENDING TO COORDINATES: 46.2°N, 7.4°E</div>
          <div>DESTINATION: SERN RESEARCH FACILITY</div>
          <div style={{ marginTop: '40px', fontSize: '1.2rem', opacity: 0.6 }}>
            Loading classified terminal...
          </div>
        </div>
      )}

      {/* Login: Classified terminal */}
      {currentScene === 'LOGIN' && (
        <Suspense fallback={
          <div style={{
            width: '100vw',
            height: '100vh',
            background: '#000000',
            color: '#00ff00',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Courier New, monospace'
          }}>
            BOOTING SECURE TERMINAL...
          </div>
        }>
          <LoginTerminal />
        </Suspense>
      )}

      {/* Cutscene: Post-login sequence */}
      {currentScene === 'CUTSCENE' && (
        <div style={{
          width: '100vw',
          height: '100vh',
          background: '#000000',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00ffff',
          fontFamily: 'monospace',
          fontSize: '1.2rem',
          gap: '30px'
        }}>
          <div style={{ fontSize: '2rem' }}>PROJECT AEGIS</div>
          <div>CLASSIFIED BRIEFING - CLEARANCE REQUIRED</div>
          <div style={{ maxWidth: '600px', textAlign: 'center', lineHeight: '1.8' }}>
            On August 4, 2026, SERN detected an anomalous signal originating from
            unknown coordinates in deep space. The signal exhibited patterns inconsistent
            with natural cosmic phenomena.
          </div>
          <div style={{ marginTop: '40px', opacity: 0.7 }}>
            [ Protocol: First Contact ]
          </div>
        </div>
      )}

      {/* Game: Main gameplay */}
      {currentScene === 'GAME' && (
        <div style={{
          width: '100vw',
          height: '100vh',
          background: '#0a0a0a',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif',
          fontSize: '2rem'
        }}>
          GAME SCENE (Coming Soon)
        </div>
      )}
    </div>
  );
}

export default App;
