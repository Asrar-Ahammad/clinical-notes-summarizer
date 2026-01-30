
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
          <h2 className="text-2xl font-bold text-white mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-slate-400 font-medium">{isLogin ? 'Please enter your credentials to access the clinical suite' : 'Join the precision clinical summarization network'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {!isLogin && (
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
                  required={!isLogin}
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
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 mt-4 group"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isLogin ? 'Authenticating...' : 'Creating Account...'}</span>
              </>
            ) : (
              <>
                <span>{isLogin ? 'Sign In to Dashboard' : 'Complete Registration'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={toggleMode}
              className="text-indigo-400 hover:text-indigo-300 font-bold text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest">
            Secure clinical-grade authentication compliant with HIPAA/GDPR standards
          </p>
        </div>
      </motion.div>
    </div>
  );
};
