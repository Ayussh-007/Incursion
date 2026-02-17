import { useState, useEffect, useRef } from 'react';
import useGameStore from '../../store/gameState';
import audioManager from '../../utils/AudioManager';
import '../../styles/LoginTerminal.css';

/**
 * LoginTerminal - High-tech classified system dashboard
 * Features: crimson accents, holographic layers, scanning sweeps, boot sequence
 */
function LoginTerminal() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [output, setOutput] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState(null); // null during boot
    const [bootComplete, setBootComplete] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const outputRef = useRef(null);
    const inputRef = useRef(null);

    const { setScene, login } = useGameStore();

    // Boot sequence with typing effect
    useEffect(() => {
        const bootLines = [
            { text: '████████████████████████████████████████', delay: 0, type: 'dim' },
            { text: 'SERN CLASSIFIED TERMINAL v3.17.42', delay: 200 },
            { text: 'BUILD: 2026.02.18-AEGIS', delay: 350, type: 'dim' },
            { text: '', delay: 450 },
            { text: 'ESTABLISHING QUANTUM-ENCRYPTED CHANNEL...', delay: 550 },
            { text: '> HANDSHAKE COMPLETE', delay: 900, type: 'success' },
            { text: '> ENCRYPTION: AES-512 / LAYERED', delay: 1100, type: 'success' },
            { text: '> BIOMETRIC SCAN: BYPASSED (REMOTE)', delay: 1300, type: 'warning' },
            { text: '', delay: 1500 },
            { text: '╔══════════════════════════════════════╗', delay: 1600 },
            { text: '║    PROJECT AEGIS — GAMMA-7 ACCESS    ║', delay: 1700 },
            { text: '║    AUTHORIZATION REQUIRED             ║', delay: 1800 },
            { text: '╚══════════════════════════════════════╝', delay: 1900 },
            { text: '', delay: 2000 },
        ];

        // Reset output on mount (prevents StrictMode double-render)
        setOutput([]);

        const bootTimers = [];
        bootLines.forEach(({ text, delay, type }) => {
            const t = setTimeout(() => {
                setOutput(prev => [...prev, { text, type: type || 'normal' }]);
                if (text.trim()) audioManager.playBootBeep(); // Audio beep
            }, delay);
            bootTimers.push(t);
        });

        // After boot, show prompt
        const bootDone = setTimeout(() => {
            setBootComplete(true);
            setCurrentPrompt('username');
            if (inputRef.current) inputRef.current.focus();
        }, 2200);
        bootTimers.push(bootDone);

        // Resume static noise
        audioManager.startStaticNoise();

        // Scanning sweep animation
        const scanInterval = setInterval(() => {
            setScanProgress(p => (p + 0.5) % 100);
        }, 30);

        return () => {
            bootTimers.forEach(clearTimeout);
            clearInterval(scanInterval);
        };
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (currentPrompt === 'username') {
            if (username.trim()) {
                setOutput(prev => [...prev,
                { text: `OPERATOR: ${username}`, type: 'input' },
                { text: '', type: 'normal' }
                ]);
                audioManager.playImpact(); // Confirm sound
                setCurrentPrompt('password');
                setPassword('');
                setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 50);
            }
        } else if (currentPrompt === 'password') {
            setOutput(prev => [...prev,
            { text: `PASSKEY: ${'●'.repeat(password.length)}`, type: 'input' },
            { text: '', type: 'normal' },
            { text: 'AUTHENTICATING...', type: 'processing' }
            ]);
            audioManager.playImpact();

            setIsLoading(true);
            setCurrentPrompt(null);

            setTimeout(async () => {
                try {
                    await login(username, password);
                    showSuccess();
                } catch (error) {
                    // Demo mode fallback
                    if (username && password.length >= 4) {
                        showSuccess();
                    } else {
                        showError();
                    }
                }
            }, 1800);
        }
    };

    const showSuccess = () => {
        audioManager.playSuccessChime(); // Success audio

        const successLines = [
            { text: '> CREDENTIALS VERIFIED', type: 'success', delay: 0 },
            { text: '> ACCESS LEVEL: GAMMA-7 — GRANTED', type: 'success', delay: 200 },
            { text: '> OPERATOR REGISTERED IN AEGIS DATABASE', type: 'success', delay: 400 },
            { text: '', type: 'normal', delay: 600 },
            { text: 'LOADING CLASSIFIED BRIEFING...', type: 'processing', delay: 800 },
            { text: '> ESTABLISHING DEEP SPACE UPLINK...', type: 'success', delay: 1200 },
        ];

        successLines.forEach(({ text, type, delay }) => {
            setTimeout(() => {
                setOutput(prev => [...prev, { text, type }]);
                audioManager.playBootBeep();
            }, delay);
        });

        setTimeout(() => {
            audioManager.fadeOutAll(2);
            setScene('CUTSCENE');
        }, 2500);
    };

    const showError = () => {
        audioManager.playGlitchBurst(); // Error glitch sound

        setOutput(prev => [...prev,
        { text: '✗ AUTHENTICATION FAILED', type: 'error' },
        { text: '✗ SECURITY VIOLATION — INCIDENT LOGGED', type: 'error' },
        { text: '', type: 'normal' }
        ]);
        setIsLoading(false);
        setUsername('');
        setPassword('');
        setCurrentPrompt('username');
        setTimeout(() => { if (inputRef.current) inputRef.current.focus(); }, 100);
    };

    const handleInput = (e) => {
        audioManager.playKeystroke(); // Typing sound
        if (currentPrompt === 'username') {
            setUsername(e.target.value);
        } else {
            setPassword(e.target.value);
        }
    };

    return (
        <div className="login-terminal">
            {/* Scanning sweep */}
            <div className="terminal-scan-sweep" style={{ top: `${scanProgress}%` }} />

            {/* Holographic layer */}
            <div className="terminal-holographic" />

            {/* CRT scanlines */}
            <div className="terminal-scanlines" />

            {/* Terminal content */}
            <div className="terminal-container">
                <div className="terminal-header">
                    <div className="terminal-header-left">
                        <span className="terminal-indicator" />
                        <span className="header-text">SERN.GOV.SECURE</span>
                    </div>
                    <div className="terminal-header-right">
                        <span className="header-classification">CLASSIFICATION: GAMMA-7</span>
                        <span className="header-dot" />
                    </div>
                </div>

                <div className="terminal-output" ref={outputRef}>
                    {output.map((line, index) => (
                        <div key={index} className={`terminal-line ${line.type}`}>
                            {line.text}
                        </div>
                    ))}
                </div>

                {currentPrompt && bootComplete && (
                    <form onSubmit={handleSubmit} className="terminal-input-form">
                        <div className="terminal-prompt-line">
                            <span className="terminal-prompt">
                                {currentPrompt === 'username' ? 'OPERATOR >' : 'PASSKEY >'}
                            </span>
                            <input
                                ref={inputRef}
                                type={currentPrompt === 'password' ? 'password' : 'text'}
                                value={currentPrompt === 'username' ? username : password}
                                onChange={handleInput}
                                disabled={isLoading}
                                className="terminal-input"
                                autoComplete="off"
                                spellCheck="false"
                                autoFocus
                            />
                            <span className="terminal-cursor" />
                        </div>
                    </form>
                )}

                <div className="terminal-footer">
                    <span className="terminal-hint">
                        Any credentials accepted (password 4+ chars) • Demo Mode
                    </span>
                </div>
            </div>

            {/* Screen glow */}
            <div className="terminal-glow" />
        </div>
    );
}

export default LoginTerminal;
