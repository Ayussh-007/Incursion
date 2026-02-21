import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../../store/gameState';
import audioManager from '../../utils/AudioManager';
import api from '../../services/api';
import '../../styles/LoginTerminal.css';

/**
 * LoginTerminal — SERN Classified Terminal
 * Command-style input interface:
 *   /register <username> <password>   — create account, auto-login
 *   /login    <username> <password>   — authenticate, redirect to level
 *   /help                             — show available commands
 *   /clear                            — clear terminal output
 */
function LoginTerminal() {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [bootComplete, setBootComplete] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [commandHistory, setCommandHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [pendingEmail, setPendingEmail] = useState(null);
    const outputRef = useRef(null);
    const inputRef = useRef(null);

    const navigate = useNavigate();

    // ── Boot Sequence ─────────────────────────────────────────────────────────

    useEffect(() => {
        const bootLines = [
            { text: '████████████████████████████████████████', delay: 0, type: 'dim' },
            { text: 'SERN CLASSIFIED TERMINAL v3.17.42', delay: 200 },
            { text: 'BUILD: 2026.02.21-AEGIS', delay: 350, type: 'dim' },
            { text: '', delay: 450 },
            { text: 'ESTABLISHING QUANTUM-ENCRYPTED CHANNEL...', delay: 550 },
            { text: '> HANDSHAKE COMPLETE', delay: 900, type: 'success' },
            { text: '> ENCRYPTION: AES-512 / LAYERED', delay: 1100, type: 'success' },
            { text: '> BIOMETRIC SCAN: BYPASSED (REMOTE)', delay: 1300, type: 'warning' },
            { text: '', delay: 1500 },
            { text: '╔══════════════════════════════════════╗', delay: 1600 },
            { text: '║    PROJECT AEGIS — GAMMA-7 ACCESS    ║', delay: 1700 },
            { text: '║    COMMAND INTERFACE READY            ║', delay: 1800 },
            { text: '╚══════════════════════════════════════╝', delay: 1900 },
            { text: '', delay: 2000 },
            { text: '> TYPE /help TO LIST COMMANDS', delay: 2100, type: 'dim' },
            { text: '', delay: 2200 },
        ];

        setOutput([]);
        const timers = [];

        bootLines.forEach(({ text, delay, type }) => {
            const t = setTimeout(() => {
                setOutput(prev => [...prev, { text, type: type || 'normal' }]);
                if (text.trim()) audioManager.playBootBeep?.();
            }, delay);
            timers.push(t);
        });

        const bootDone = setTimeout(() => {
            setBootComplete(true);
            if (inputRef.current) inputRef.current.focus();
        }, 2400);
        timers.push(bootDone);

        audioManager.startStaticNoise?.();

        const scanInterval = setInterval(() => {
            setScanProgress(p => (p + 0.5) % 100);
        }, 30);

        return () => {
            timers.forEach(clearTimeout);
            clearInterval(scanInterval);
        };
    }, []);

    // Auto-scroll
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    // ── Command Parser ────────────────────────────────────────────────────────

    const addLines = (lines) => {
        setOutput(prev => [...prev, ...lines]);
    };

    const parseAndExecute = async (raw) => {
        const trimmed = raw.trim();
        if (!trimmed) return;

        // Echo the command
        addLines([{ text: `> ${trimmed}`, type: 'input' }, { text: '', type: 'normal' }]);

        const parts = trimmed.split(/\s+/);
        const cmd = parts[0].toLowerCase();

        switch (cmd) {
            case '/help':
                addLines([
                    { text: 'AVAILABLE COMMANDS:', type: 'dim' },
                    { text: '  /register <user> <email> <pass> <confirm>  — request operative access', type: 'normal' },
                    { text: '  /verify   <otp_code>                       — verify email with OTP', type: 'normal' },
                    { text: '  /login    <username> <password>             — authenticate account', type: 'normal' },
                    { text: '  /help                                      — show this message', type: 'normal' },
                    { text: '  /clear                                     — clear terminal output', type: 'normal' },
                    { text: '', type: 'normal' },
                ]);
                break;

            case '/clear':
                setOutput([]);
                break;

            case '/register':
                await handleRegister(parts[1], parts[2], parts[3], parts[4]);
                break;

            case '/verify':
                await handleVerifyOtp(parts[1]);
                break;

            case '/login':
                await handleLogin(parts[1], parts[2]);
                break;

            default:
                addLines([
                    { text: `✗ UNKNOWN COMMAND: ${parts[0]}`, type: 'error' },
                    { text: '  TYPE /help FOR AVAILABLE COMMANDS', type: 'dim' },
                    { text: '', type: 'normal' },
                ]);
        }
    };

    // ── /register ─────────────────────────────────────────────────────────────

    const handleRegister = async (username, email, password, confirmPassword) => {
        if (!username || !email || !password || !confirmPassword) {
            addLines([
                { text: '✗ USAGE: /register <username> <email> <password> <confirm_password>', type: 'error' },
                { text: '', type: 'normal' },
            ]);
            return;
        }
        if (password.length < 6) {
            addLines([
                { text: '✗ PASSWORD MUST BE AT LEAST 6 CHARACTERS', type: 'error' },
                { text: '', type: 'normal' },
            ]);
            return;
        }
        if (password !== confirmPassword) {
            addLines([
                { text: '✗ PASSWORDS DO NOT MATCH', type: 'error' },
                { text: '', type: 'normal' },
            ]);
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            addLines([
                { text: '✗ INVALID EMAIL FORMAT', type: 'error' },
                { text: '', type: 'normal' },
            ]);
            return;
        }

        setIsLoading(true);
        addLines([{ text: 'INITIATING REGISTRATION PROTOCOL...', type: 'processing' }]);

        try {
            await api.post('/auth/register', { username, email, password });

            audioManager.playSuccessChime?.();
            setPendingEmail(email);
            addLines([
                { text: `> VERIFICATION CODE TRANSMITTED TO ${email.toUpperCase()}`, type: 'success' },
                { text: '> OTP VALID FOR 5 MINUTES', type: 'warning' },
                { text: '', type: 'normal' },
                { text: '> ENTER:  /verify <otp_code>  TO COMPLETE REGISTRATION', type: 'dim' },
                { text: '', type: 'normal' },
            ]);
        } catch (err) {
            audioManager.playGlitchBurst?.();
            const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'REGISTRATION FAILED';
            addLines([
                { text: `✗ ${msg.toUpperCase()}`, type: 'error' },
                { text: '', type: 'normal' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // ── /verify ───────────────────────────────────────────────────────────────

    const handleVerifyOtp = async (otpCode) => {
        if (!otpCode) {
            addLines([
                { text: '✗ USAGE: /verify <otp_code>', type: 'error' },
                { text: '', type: 'normal' },
            ]);
            return;
        }
        if (!pendingEmail) {
            addLines([
                { text: '✗ NO PENDING REGISTRATION. USE /register FIRST', type: 'error' },
                { text: '', type: 'normal' },
            ]);
            return;
        }

        setIsLoading(true);
        addLines([{ text: 'VERIFYING ACCESS CODE...', type: 'processing' }]);

        try {
            const { data } = await api.post('/auth/verify-otp', {
                email: pendingEmail,
                otp: otpCode
            });
            const lvl = Math.max(1, data.currentLevel ?? 1);

            // Persist tokens
            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);

            audioManager.playSuccessChime?.();
            setPendingEmail(null);
            addLines([
                { text: '> IDENTITY CONFIRMED', type: 'success' },
                { text: `> OPERATIVE "${data.user.username}" ACTIVATED`, type: 'success' },
                { text: '> CLEARANCE LEVEL: GAMMA-7 GRANTED', type: 'success' },
                { text: `> ASSIGNING TO LEVEL ${lvl}...`, type: 'success' },
                { text: '', type: 'normal' },
                { text: 'LOADING MISSION BRIEFING...', type: 'processing' },
            ]);

            setTimeout(() => {
                audioManager.fadeOutAll?.(2);
                navigate('/mission', { replace: true });
            }, 1800);
        } catch (err) {
            audioManager.playGlitchBurst?.();
            const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'VERIFICATION FAILED';
            addLines([
                { text: `✗ ${msg.toUpperCase()}`, type: 'error' },
                { text: '', type: 'normal' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // ── /login ────────────────────────────────────────────────────────────────

    const handleLogin = async (username, password) => {
        if (!username || !password) {
            addLines([
                { text: '✗ USAGE: /login <username> <password>', type: 'error' },
                { text: '', type: 'normal' },
            ]);
            return;
        }

        setIsLoading(true);
        addLines([{ text: 'AUTHENTICATING...', type: 'processing' }]);

        try {
            const { data } = await api.post('/auth/login', { username, password });
            // hasCompletedIntro tells us if the user already went through the mission flow
            const introComplete = data.hasCompletedIntro === true;
            const lvl = Math.max(1, data.currentLevel ?? 1);

            // Persist tokens
            localStorage.setItem('accessToken', data.accessToken);
            if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
            audioManager.playSuccessChime?.();
            addLines([
                { text: '> CREDENTIALS VERIFIED', type: 'success' },
                { text: `> WELCOME BACK, OPERATIVE ${username.toUpperCase()}`, type: 'success' },
                { text: introComplete ? `> RESUMING FROM LEVEL ${lvl}` : '> INITIATING MISSION BRIEFING...', type: 'success' },
                { text: '', type: 'normal' },
                { text: 'ESTABLISHING DEEP SPACE UPLINK...', type: 'processing' },
            ]);

            setTimeout(() => {
                audioManager.fadeOutAll?.(2);
                // Returning users skip to their level; first-timers go through mission flow
                navigate(introComplete ? `/level/${lvl}` : '/mission', { replace: true });
            }, 1800);
        } catch (err) {
            audioManager.playGlitchBurst?.();
            const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'AUTHENTICATION FAILED';
            addLines([
                { text: `✗ ${msg.toUpperCase()}`, type: 'error' },
                { text: '✗ SECURITY VIOLATION — INCIDENT LOGGED', type: 'error' },
                { text: '', type: 'normal' },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Input Handlers ────────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bootComplete || isLoading) return;
        const value = input.trim();
        if (!value) return;

        // Update command history
        setCommandHistory(prev => [value, ...prev.filter(c => c !== value)].slice(0, 50));
        setHistoryIndex(-1);
        setInput('');

        await parseAndExecute(value);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHistoryIndex(prev => {
                const next = Math.min(prev + 1, commandHistory.length - 1);
                setInput(commandHistory[next] || '');
                return next;
            });
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHistoryIndex(prev => {
                const next = Math.max(prev - 1, -1);
                setInput(next === -1 ? '' : commandHistory[next]);
                return next;
            });
        }
    };

    const handleChange = (e) => {
        audioManager.playKeystroke?.();
        setInput(e.target.value);
    };

    // ── Render ────────────────────────────────────────────────────────────────

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
                    {output.map((line, i) => (
                        <div key={i} className={`terminal-line ${line.type}`}>
                            {line.text}
                        </div>
                    ))}

                    {/* Typing spinner when loading */}
                    {isLoading && (
                        <div className="terminal-line processing">▌</div>
                    )}
                </div>

                {bootComplete && !isLoading && (
                    <form onSubmit={handleSubmit} className="terminal-input-form">
                        <div className="terminal-prompt-line">
                            <span className="terminal-prompt">GAMMA-7 &gt;</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                className="terminal-input"
                                autoComplete="off"
                                spellCheck="false"
                                autoFocus
                                placeholder="/login or /register"
                            />
                            <span className="terminal-cursor" />
                        </div>
                    </form>
                )}

                <div className="terminal-footer">
                    <span className="terminal-hint">
                        /register &lt;user&gt; &lt;email&gt; &lt;pass&gt; &lt;confirm&gt; &nbsp;•&nbsp; /verify &lt;otp&gt; &nbsp;•&nbsp; /login &lt;user&gt; &lt;pass&gt; &nbsp;•&nbsp; /help
                    </span>
                </div>
            </div>

            {/* Screen glow */}
            <div className="terminal-glow" />
        </div>
    );
}

export default LoginTerminal;
