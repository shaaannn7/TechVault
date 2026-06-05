import { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Hash, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Auth Component
 * Redesigned premium split-screen layout for TechVault.
 * Handles student login and registration workflows with high-fidelity animations.
 */
export default function Auth({ setActivePage }) {
  // Global auth logic from context
  const { handleLogin, handleRegister } = useContext(AppContext);

  // Form toggle states
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Register fields
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [branch, setBranch] = useState('Computer Science');
  const [semester, setSemester] = useState(1);
  const [campusBlock, setCampusBlock] = useState('A-Block (CSE/IT Department)');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Status feedback states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear fields and toggle modes
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setName('');
    setRollNumber('');
    setBranch('Computer Science');
    setSemester(1);
    setCampusBlock('A-Block (CSE/IT Department)');
    setLoginEmail('');
    setLoginPassword('');
    setRegEmail('');
    setRegPassword('');
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      if (!loginEmail || !loginPassword) {
        setError('Please fill in all required fields');
        return;
      }
      if (!validateEmail(loginEmail)) {
        setError('Please enter a valid email address');
        return;
      }

      setLoading(true);
      try {
        await handleLogin(loginEmail, loginPassword);
        setSuccess('Logged in successfully! Redirecting...');
        setTimeout(() => {
          setActivePage('notes');
        }, 1200);
      } catch (err) {
        setError(err.message || 'Login failed. Please check credentials.');
        setLoading(false);
      }
    } else {
      if (!name || !regEmail || !regPassword || !rollNumber) {
        setError('Please fill in all required fields');
        return;
      }
      if (!validateEmail(regEmail)) {
        setError('Please enter a valid college email address');
        return;
      }
      if (regPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      setLoading(true);
      try {
        await handleRegister(name, regEmail, regPassword, rollNumber, branch, semester, campusBlock);
        setSuccess('Account created successfully! Welcome to TechVault.');
        setTimeout(() => {
          setActivePage('notes');
        }, 1200);
      } catch (err) {
        setError(err.message || 'Registration failed.');
        setLoading(false);
      }
    }
  };

  // Framer Motion Animation Variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  return (
    <div className="min-h-[80vh] w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-center relative py-12 select-none">
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        
        {/* Left Side: Branding & Trust Stats */}
        <div className="lg:col-span-7 flex flex-col gap-10 text-left">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActivePage('landing')}
          >
            <div className="w-10 h-10 rounded-lg bg-violet-600 flex items-center justify-center font-extrabold text-xl text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              TV
            </div>
            <span className="font-heading text-2xl font-black tracking-tight text-white">TechVault</span>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-5"
          >
            <motion.span 
              variants={fadeInUp}
              className="self-start text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3.5 py-1.5 rounded-full"
            >
              Engineering Workspace
            </motion.span>
            
            <motion.h1 
              variants={fadeInUp}
              className="font-heading text-4xl md:text-5xl font-black tracking-tight text-white leading-tight"
            >
              The Academic Repository for <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">Engineers</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl"
            >
              Access curated, peer-reviewed lecture notes, RTU past year question papers, and interactive study aids structured by JECRC Foundation students.
            </motion.p>
          </motion.div>

          {/* Trust statistics panel */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-4 w-full max-w-lg"
          >
            <motion.div variants={fadeInUp} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 md:p-5 backdrop-blur-sm">
              <span className="block font-heading text-2xl font-extrabold text-white">1,200+</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Contributors</span>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 md:p-5 backdrop-blur-sm">
              <span className="block font-heading text-2xl font-extrabold text-white">450+</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Lecture Notes</span>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 md:p-5 backdrop-blur-sm">
              <span className="block font-heading text-2xl font-extrabold text-white">180+</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">RTU Papers</span>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-slate-950/40 border border-white/5 rounded-xl p-4 md:p-5 backdrop-blur-sm">
              <span className="block font-heading text-2xl font-extrabold text-white">99.8%</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Approval Rating</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="lg:col-span-5 relative w-full flex justify-center">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-violet-600/10 blur-[90px] pointer-events-none z-0"></div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-[#0a0f1a]/85 border border-white/5 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative z-10 overflow-hidden text-left"
          >
            {/* Subtle engineering grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none mask-image-[radial-gradient(circle,black_40%,transparent_70%)] z-0"></div>

            <div className="relative z-10">
              {/* Header */}
              <div className="flex flex-col gap-2 mb-6">
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-100 font-heading">
                  {isLogin ? 'Welcome Back' : 'Create Profile'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isLogin 
                    ? 'Enter your credentials to access your academic vault.' 
                    : 'Register as a JECRC verified contributor to start sharing resources.'
                  }
                </p>
              </div>

              {/* Success / Error Messages */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form elements */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {/* LOGIN FORM VIEW */}
                {isLogin && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          placeholder="you@jecrc.ac.in"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          disabled={loading}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 placeholder:text-slate-600 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                        <span 
                          onClick={() => alert('Password reset requested. Check your registered college inbox for next instructions.')}
                          className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          disabled={loading}
                          required
                          className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 placeholder:text-slate-600 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400 font-medium">
                        <input 
                          type="checkbox" 
                          checked={rememberMe} 
                          onChange={(e) => setRememberMe(e.target.checked)} 
                          className="hidden" 
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${rememberMe ? 'bg-violet-600 border-violet-600' : 'bg-slate-950/40 border-white/5'}`}>
                          {rememberMe && <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />}
                        </div>
                        <span>Remember me for 30 days</span>
                      </label>
                    </div>
                  </>
                )}

                {/* SIGNUP FORM VIEW */}
                {!isLogin && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Full Name</label>
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
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 placeholder:text-slate-600 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">JECRC Student Roll Number</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                          <Hash className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. 23EJCAC124"
                          value={rollNumber}
                          onChange={(e) => setRollNumber(e.target.value)}
                          disabled={loading}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 placeholder:text-slate-600 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Department Branch</label>
                        <select
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          disabled={loading}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 disabled:opacity-50"
                        >
                          <option className="bg-[#0a0f1a]">Computer Science</option>
                          <option className="bg-[#0a0f1a]">Electronics Engineering</option>
                          <option className="bg-[#0a0f1a]">Civil Engineering</option>
                          <option className="bg-[#0a0f1a]">Mechanical Engineering</option>
                          <option className="bg-[#0a0f1a]">Electrical Engineering</option>
                          <option className="bg-[#0a0f1a]">Mathematics</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Semester</label>
                        <select
                          value={semester}
                          onChange={(e) => setSemester(parseInt(e.target.value))}
                          disabled={loading}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 disabled:opacity-50"
                        >
                          <option value="1" className="bg-[#0a0f1a]">Sem 1</option>
                          <option value="2" className="bg-[#0a0f1a]">Sem 2</option>
                          <option value="3" className="bg-[#0a0f1a]">Sem 3</option>
                          <option value="4" className="bg-[#0a0f1a]">Sem 4</option>
                          <option value="5" className="bg-[#0a0f1a]">Sem 5</option>
                          <option value="6" className="bg-[#0a0f1a]">Sem 6</option>
                          <option value="7" className="bg-[#0a0f1a]">Sem 7</option>
                          <option value="8" className="bg-[#0a0f1a]">Sem 8</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Primary Campus Block</label>
                      <select
                        value={campusBlock}
                        onChange={(e) => setCampusBlock(e.target.value)}
                        disabled={loading}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 disabled:opacity-50"
                      >
                        <option className="bg-[#0a0f1a]">A-Block (CSE/IT Department)</option>
                        <option className="bg-[#0a0f1a]">B-Block (ECE/EE Department)</option>
                        <option className="bg-[#0a0f1a]">C-Block (Civil/Mech/Main Block)</option>
                        <option className="bg-[#0a0f1a]">JECRC Foundation Campus Node</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">College Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          placeholder="student@jecrc.ac.in"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          disabled={loading}
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 placeholder:text-slate-600 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Password</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                          <Lock className="w-4 h-4" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          disabled={loading}
                          required
                          className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 placeholder:text-slate-600 disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Submit button */}
                <motion.button
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 mt-3 bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 text-white font-bold text-sm rounded-lg shadow-lg shadow-violet-500/10 hover:shadow-violet-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>{isLogin ? 'Verifying...' : 'Registering...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Create Profile'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Form Toggles */}
              <div className="mt-6 border-t border-white/5 pt-5 text-center text-xs">
                <span className="text-slate-500 font-medium">
                  {isLogin ? "New contributor? " : "Already registered? "}
                </span>
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-bold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer ml-1"
                >
                  {isLogin ? 'Create profile' : 'Sign in here'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
