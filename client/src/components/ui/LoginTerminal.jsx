import { useState, useEffect, useRef } from 'react';
import useGameStore from '../../store/gameState';
import '../../styles/LoginTerminal.css';

/**
 * LoginTerminal - Classified government terminal login interface
 * Features: CRT effects, typing animation, neon green text, authentication flow
 */
function LoginTerminal() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [output, setOutput] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState('username');
    const outputRef = useRef(null);
    const inputRef = useRef(null);

    const { setScene, login } = useGameStore();

    useEffect(() => {
        // Boot sequence
        const bootSequence = [
            'SERN CLASSIFIED TERMINAL v2.36.14',
            'ESTABLISHING SECURE CONNECTION...',
            '> CONNECTION ESTABLISHED',
            '> INITIALIZING QUANTUM ENCRYPTION...',
            '> ENCRYPTION ACTIVE',
            '',
            'PROJECT AEGIS - AUTHORIZATION REQUIRED',
            'CLEARANCE LEVEL: GAMMA-7 OR HIGHER',
            ''
        ];

        bootSequence.forEach((line, index) => {
            setTimeout(() => {
                setOutput(prev => [...prev, line]);
            }, index * 200);
        });

        setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, bootSequence.length * 200 + 100);
    }, []);

    // Auto scroll to bottom
    useEffect(() => {
        if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
        }
    }, [output]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (currentPrompt === 'username') {
            if (username.trim()) {
                setOutput(prev => [...prev, `USER: ${username}`, '']);
                setCurrentPrompt('password');
                setPassword('');
            }
        } else {
            setOutput(prev => [...prev, `PASS: ${'*'.repeat(password.length)}`, '', 'AUTHENTICATING...']);
            setIsLoading(true);

            // Simulate authentication
            setTimeout(async () => {
                try {
                    // Try real authentication first
                    await login(username, password);

                    setOutput(prev => [
                        ...prev,
                        '> AUTHENTICATION SUCCESSFUL',
                        '> ACCESS GRANTED: PROJECT AEGIS',
                        '> LOADING CLASSIFIED BRIEFING...',
                        ''
                    ]);

                    setTimeout(() => {
                        setScene('CUTSCENE');
                    }, 2000);
                } catch (error) {
                    // For demo purposes, accept any login
                    if (username && password.length >= 4) {
                        setOutput(prev => [
                            ...prev,
                            '> DEMO MODE: ACCESS GRANTED',
                            '> LOADING CLASSIFIED BRIEFING...',
                            ''
                        ]);
                        setTimeout(() => {
                            setScene('CUTSCENE');
                        }, 2000);
                    } else {
                        setOutput(prev => [
                            ...prev,
                            '> ERROR: AUTHENTICATION FAILED',
                            '> ACCESS DENIED - SECURITY VIOLATION LOGGED',
                            ''
                        ]);
                        setIsLoading(false);
                        setUsername('');
                        setPassword('');
                        setCurrentPrompt('username');
                    }
                }
            }, 1500);
        }
    };

    const handleInput = (e) => {
        const value = e.target.value;
        if (currentPrompt === 'username') {
            setUsername(value);
        } else {
            setPassword(value);
        }
    };

    return (
        <div className="login-terminal">
            {/* CRT scanlines effect */}
            <div className="terminal-scanlines"></div>

            {/* Terminal content */}
            <div className="terminal-container">
                <div className="terminal-header">
                    <span className="terminal-indicator"></span>
                    <span>SERN.GOV.SECURE - CLASSIFIED ACCESS</span>
                </div>

                <div className="terminal-output" ref={outputRef}>
                    {output.map((line, index) => (
                        <div key={index} className="terminal-line">
                            {line.startsWith('>') ? (
                                <span className="terminal-success">{line}</span>
                            ) : line.includes('ERROR') || line.includes('DENIED') ? (
                                <span className="terminal-error">{line}</span>
                            ) : (
                                <span>{line}</span>
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="terminal-input-form">
                    <div className="terminal-prompt-line">
                        <span className="terminal-prompt">
                            {currentPrompt === 'username' ? 'USERNAME > ' : 'PASSWORD > '}
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
                        />
                        <span className="terminal-cursor"></span>
                    </div>
                </form>

                {/* Help text */}
                <div className="terminal-footer">
                    <span className="terminal-hint">
                        Demo credentials: Any username + password (4+ chars)
                    </span>
                </div>
            </div>

            {/* CRT screen glow */}
            <div className="terminal-glow"></div>
        </div>
    );
}

export default LoginTerminal;
