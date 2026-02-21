import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './styles/index.css';

// Pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const TerminalPage = lazy(() => import('./pages/TerminalPage'));
const MissionPage = lazy(() => import('./pages/MissionPage'));
const LevelPage = lazy(() => import('./pages/LevelPage'));

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
  const [initialFade, setInitialFade] = useState(1);

  // Fade from complete black on initial load
  useEffect(() => {
    const timer = setTimeout(() => setInitialFade(0), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="app">
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* ── Public ─────────────────────────────────────────── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/terminal" element={<TerminalPage />} />

          {/* ── Pre-level mission flow (cutscene → aegis → char-intro) ── */}
          <Route path="/mission" element={<MissionPage />} />

          {/* ── Protected level routes ──────────────────────────── */}
          <Route path="/level/:levelId" element={<LevelPage />} />

          {/* ── Catch-all ───────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

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
