import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Auth({ setActivePage }) {
  const { handleLogin, handleRegister } = useContext(AppContext);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Common validations
    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Handle Login
        handleLogin(email, password);
        setSuccess('Logged in successfully! Redirecting...');
        setTimeout(() => {
          setActivePage('dashboard');
        }, 1200);
      } else {
        // Handle Registration
        if (!name) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        handleRegister(name, email, password);
        setSuccess('Account created successfully! Welcome to TechVault.');
        setTimeout(() => {
          setActivePage('dashboard');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] w-full px-4 relative">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-600/15 blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 bg-[#0b0f19]/80 p-6 md:p-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2 text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-slate-100">
            {isLogin ? 'Welcome Back' : 'Join TechVault'}
          </h2>
          <p className="text-xs text-slate-400">
            {isLogin 
              ? 'Access peer-reviewed notes, blueprints, and past papers' 
              : 'Create a student profile to save bookmarks and share study guides'
            }
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Full Name (Sign Up only) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5 text-left">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
              {isLogin && (
                <span className="text-[10px] font-semibold text-violet-400 hover:underline cursor-pointer" onClick={() => setError('Password reset via email is under construction.')}>
                  Forgot?
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 placeholder:text-slate-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {!isLogin && (
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 placeholder:text-slate-600"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-2 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{loading ? 'Please Wait...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-8 border-t border-white/5 pt-6 text-center">
          <span className="text-xs text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={toggleMode}
            className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
          >
            {isLogin ? 'Sign Up Free' : 'Sign In Here'}
          </button>
        </div>
      </div>
    </div>
  );
}
