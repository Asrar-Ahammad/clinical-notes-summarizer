
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, Loader2, Mail, Lock, ArrowRight, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('demo@kiro.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
  };

  return (
    <div className="login-container">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <ClipboardCheck className="w-12 h-12 text-indigo-400" />
          <span style={{ fontSize: '2rem' }}>Kiro Clinical</span>
        </div>

        <div className="login-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Please enter your credentials to access the clinical suite' : 'Join the precision clinical summarization network'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                className="form-group"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label><UserIcon className="w-4 h-4" /> Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. John Doe"
                  required={!isLogin}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-group">
            <label><Mail className="w-4 h-4" /> Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="clinician@hospital.com"
              required
            />
          </div>

          <div className="form-group">
            <label><Lock className="w-4 h-4" /> Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', paddingRight: '3rem' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="button-primary login-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isLogin ? 'Authenticating...' : 'Creating Account...'}
              </>
            ) : (
              <>
                {isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={toggleMode}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p>Secure clinical-grade authentication compliant with HIPAA/GDPR standards</p>
        </div>
      </motion.div>

      <style>{`
                .login-container {
                    height: 100vh;
                    width: 100vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
                    overflow: hidden;
                }

                .login-card {
                    background: var(--bg-card);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    padding: 3rem;
                    border-radius: 2rem;
                    width: 100%;
                    max-width: 480px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .login-header {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .login-header h2 {
                    font-size: 1.75rem;
                    margin-bottom: 0.5rem;
                    background: linear-gradient(to right, #fff, #94a3b8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .login-header p {
                    color: var(--text-muted);
                    font-size: 0.9375rem;
                }

                .login-form {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .form-group label {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .form-group input {
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--border);
                    border-radius: 0.75rem;
                    padding: 0.875rem 1rem;
                    color: var(--text-main);
                    outline: none;
                    transition: border-color 0.2s;
                }

                .form-group input:focus {
                    border-color: var(--primary);
                }

                .password-toggle {
                    position: absolute;
                    right: 1rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: var(--text-muted);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                }

                .password-toggle:hover {
                    color: var(--text-main);
                }

                .login-button {
                    margin-top: 1rem;
                    padding: 1rem;
                    font-size: 1.05rem;
                    justify-content: center;
                }

                .login-footer {
                    margin-top: 2rem;
                    text-align: center;
                    padding-top: 1.5rem;
                    border-top: 1px solid var(--border);
                }

                .login-footer p {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    opacity: 0.6;
                }
            `}</style>
    </div>
  );
};
