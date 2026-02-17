import { Suspense, lazy } from 'react';
import useGameStore from './store/gameState';
import './styles/index.css';

// Temporary: minimal test scene for debugging
import MinimalTestScene from './scenes/MinimalTestScene';

function App() {
  const currentScene = useGameStore((state) => state.currentScene);

  return (
    <div className="app">
      {currentScene === 'INTRO' && <MinimalTestScene />}
      {currentScene === 'TRANSITION' && (
        <div style={{
          width: '100vw',
          height: '100vh',
          background: '#000000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#00ffff',
          fontFamily: 'monospace',
          fontSize: '2rem'
        }}>
          TRANSITION SEQUENCE (Coming Soon)
        </div>
      )}
    </div>
  );
}

export default App;
