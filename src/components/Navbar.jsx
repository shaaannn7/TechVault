import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Menu, X, BookOpen, GraduationCap, ShieldAlert, LogOut, User, LayoutDashboard, Bookmark, Search } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onSearchOpen }) {
  const { currentUser, handleLogout } = useContext(AppContext);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (page) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  const onLogout = () => {
    handleLogout();
    setActivePage('landing');
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-4 md:px-8 py-3 bg-[#060814]/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform duration-200">
            <span className="text-white font-bold text-xl tracking-tight">T</span>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg leading-tight tracking-wider gradient-text">TechVault</span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase">Academic Archive</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => handleNavClick('notes')}
            className={`flex items-center gap-2 text-sm font-semibold tracking-wide transition-colors ${
              activePage === 'notes' ? 'text-violet-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Notes Library
          </button>
          
          <button
            onClick={() => handleNavClick('pyqs')}
            className={`flex items-center gap-2 text-sm font-semibold tracking-wide transition-colors ${
              activePage === 'pyqs' ? 'text-violet-400' : 'text-slate-300 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            PYQ Archive
          </button>

          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator') && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-2 text-sm font-semibold tracking-wide transition-colors ${
                activePage === 'admin' ? 'text-violet-400' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Admin Moderation
            </button>
          )}
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <button
            type="button"
            onClick={onSearchOpen}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-950/40 hover:bg-slate-900/60 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer text-xs font-semibold text-slate-400 hover:text-slate-200"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <span className="text-[9px] font-black text-slate-600 bg-slate-950 border border-white/5 px-1.5 py-0.5 rounded ml-1 tracking-widest font-mono">
              Ctrl+K
            </span>
          </button>
          {currentUser ? (
            <div className="flex items-center gap-4">
              <div 
                onClick={() => handleNavClick('dashboard')}
                className="flex items-center gap-2.5 cursor-pointer bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 py-1.5 pl-2.5 pr-4 rounded-xl transition-colors group"
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-7 h-7 rounded-lg bg-slate-800 border border-white/10 group-hover:scale-105 transition-transform"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-200 leading-tight">{currentUser.name}</span>
                  <span className="text-[9px] text-slate-500 font-semibold leading-none capitalize">{currentUser.role}</span>
                </div>
              </div>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-950/40 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/20 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('auth')}
              className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white rounded-xl shadow-lg shadow-violet-500/15 hover:shadow-violet-500/25 transition-all duration-200 cursor-pointer"
            >
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-950/40 text-slate-400 hover:text-white border border-white/5"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden w-full mt-4 flex flex-col gap-3 py-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => {
              onSearchOpen();
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-900/40"
          >
            <Search className="w-5 h-5 text-slate-400" />
            <span>Global Search</span>
          </button>

          <button
            onClick={() => handleNavClick('notes')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activePage === 'notes' ? 'bg-violet-600/10 text-violet-400' : 'text-slate-300 hover:bg-slate-900/40'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Notes Library
          </button>
          
          <button
            onClick={() => handleNavClick('pyqs')}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activePage === 'pyqs' ? 'bg-violet-600/10 text-violet-400' : 'text-slate-300 hover:bg-slate-900/40'
            }`}
          >
            <GraduationCap className="w-5 h-5" />
            PYQ Archive
          </button>

          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator') && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                activePage === 'admin' ? 'bg-violet-600/10 text-violet-400' : 'text-slate-300 hover:bg-slate-900/40'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
              Admin Moderation
            </button>
          )}

          {currentUser ? (
            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-white/5">
              <div className="flex items-center gap-3 px-4 py-2">
                <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-lg bg-slate-800" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-200">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">{currentUser.role}</span>
                </div>
              </div>
              
              <button
                onClick={() => handleNavClick('dashboard')}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-300 hover:bg-slate-900/40"
              >
                <LayoutDashboard className="w-5 h-5" />
                My Dashboard
              </button>

              <button
                onClick={onLogout}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleNavClick('auth')}
              className="mt-2 w-full py-2.5 bg-gradient-to-r from-violet-600 to-blue-500 text-white rounded-lg font-bold text-sm"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
