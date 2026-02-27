
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ClipboardCheck, Loader2, Mail, Lock, ArrowRight, User as UserIcon, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type AuthMode = 'login' | 'signup' | 'confirm';

export const Login: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup, confirmSignUp, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();
    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'signup') {
        const isConfirmed = await signup(name, email, password);
        if (!isConfirmed) {
          // Cognito requires email verification
          setMode('confirm');
        }
      } else if (mode === 'confirm') {
        await confirmSignUp(email, confirmCode);
        // After confirmation, auto-login
        await login(email, password);
      }
    } catch {
      // Error is already set in context
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    clearError();
    if (mode === 'confirm') {
      setMode('signup');
    } else {
      setMode(mode === 'login' ? 'signup' : 'login');
    }
    setConfirmCode('');
    setShowPassword(false);
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Create Account';
      case 'confirm': return 'Verify Email';
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case 'login': return 'Please enter your credentials to access the clinical suite';
      case 'signup': return 'Join the precision clinical summarization network';
      case 'confirm': return `We sent a verification code to ${email}`;
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(circle_at_top_right,#1e1b4b,#0f172a)] p-6 overflow-hidden">
      <motion.div
        className="bg-slate-800/40 backdrop-blur-2xl border border-white/10 p-6 md:p-10 rounded-[2.5rem] w-full max-w-[480px] shadow-2xl relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/20 blur-[60px] rounded-full -z-10" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-purple-500/20 blur-[60px] rounded-full -z-10" />

        <div className="flex justify-center mb-8 gap-3">
          <ClipboardCheck className="w-12 h-12 text-indigo-400" />
          <span className="text-3xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Kiro Clinical</span>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">{getTitle()}</h2>
          <p className="text-slate-400 font-medium">{getSubtitle()}</p>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'confirm' ? (
            /* ─── Confirmation Code Input ─── */
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest pl-1">
                <ShieldCheck className="w-4 h-4" /> Verification Code
              </label>
              <input
                type="text"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal font-mono"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                autoFocus
              />
            </motion.div>
          ) : (
            /* ─── Login / Signup Fields ─── */
            <>
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest pl-1">
                      <UserIcon className="w-4 h-4" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 font-medium"
                      placeholder="Dr. John Doe"
                      required={mode === 'signup'}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest pl-1">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600 font-medium"
                  placeholder="clinician@hospital.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest pl-1">
                  <Lock className="w-4 h-4" /> Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 pr-14 transition-all placeholder:text-slate-600 font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-slate-500 pl-1 mt-1">
                    Min 8 characters, with uppercase, lowercase, and a number
                  </p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-4 group cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  {mode === 'login' ? 'Authenticating...' : mode === 'signup' ? 'Creating Account...' : 'Verifying...'}
                </span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'login' ? 'Sign In to Dashboard' : mode === 'signup' ? 'Complete Registration' : 'Verify & Sign In'}
                </span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={toggleMode}
              className="text-indigo-400 hover:text-indigo-300 font-bold text-sm transition-colors cursor-pointer"
            >
              {mode === 'login'
                ? "Don't have an account? Sign Up"
                : mode === 'signup'
                  ? "Already have an account? Login"
                  : "Back to Sign Up"}
            </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
            Secure clinical-grade authentication powered by AWS Cognito
          </p>
        </div>
      </motion.div>
    </div>
  );
};
