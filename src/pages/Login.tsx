import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Video, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        const loadingToast = toast.loading('Signing in...');

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
            const response = await axios.post(`${baseUrl}/api/v1/admins/auth/login`, {
                email,
                password
            });

            // Handle different variations of success response
            if (response.data.success || response.data.token || (response.data.data && response.data.data.token)) {
                const token = response.data.token || response.data.data?.token;
                if (!token) throw new Error('No token received');

                login(token);
                toast.success('Welcome back, Admin!', { id: loadingToast });
                navigate('/');
            } else {
                toast.error(response.data.message || 'Login failed', { id: loadingToast });
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Invalid credentials or server error';
            toast.error(message, { id: loadingToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-glow"></div>
            <div className="login-card glass animate-fade-in">
                <div className="login-header">
                    <div className="logo-icon">
                        <Video size={32} />
                    </div>
                    <h1>VideoGen Admin</h1>
                    <p>Login to your account to manage the platform</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <div className="input-with-icon">
                            <Mail size={18} />
                            <input
                                type="email"
                                id="email"
                                className="input-field"
                                placeholder="admin@videogen.ai"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-with-icon">
                            <Lock size={18} />
                            <input
                                type="password"
                                id="password"
                                className="input-field"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                        {isLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Loader2 size={18} className="animate-spin" />
                                Signing In...
                            </div>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>&copy; 2026 VideoGen. All rights reserved.</p>
                </div>
            </div>

            <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          position: relative;
          overflow: hidden;
        }

        .login-glow {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
          filter: blur(60px);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 0;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 3rem;
          border-radius: var(--radius-lg);
          z-index: 1;
          position: relative;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .logo-icon {
          width: 64px;
          height: 64px;
          background: var(--accent-primary);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 8px 16px var(--accent-glow);
        }

        .login-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          letter-spacing: -0.01em;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 0.9375rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon svg {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
        }

        .input-with-icon .input-field {
          padding-left: 3rem;
        }

        .btn-block {
          width: 100%;
          padding: 0.875rem;
          font-size: 1rem;
          margin-top: 0.5rem;
        }

        .login-footer {
          margin-top: 2.5rem;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default Login;
