import React, { useState, useEffect, useContext } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import SearchPalette from './components/SearchPalette';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import PYQs from './pages/PYQs';
import Admin from './pages/Admin';
import { Shield, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function AppContent() {
  const { currentUser, loading } = useContext(AppContext);
  const [activePage, setActivePage] = useState('landing');
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewingPYQ, setViewingPYQ] = useState(null);
  const [searchPaletteOpen, setSearchPaletteOpen] = useState(false);

  // Global search palette keyboard shortcut listener (Ctrl + K or Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Enforce page auth guards
  useEffect(() => {
    const authProtectedPages = ['notes', 'pyqs', 'dashboard', 'admin'];
    if (authProtectedPages.includes(activePage) && !currentUser && !loading) {
      setActivePage('auth');
    }
  }, [activePage, currentUser, loading]);

  const handleSearchNavigate = (type, item) => {
    setSearchPaletteOpen(false);
    if (!currentUser) {
      setActivePage('auth');
      return;
    }
    if (type === 'notes') {
      setViewingDoc(item);
      setActivePage('notes');
    } else if (type === 'pyqs') {
      setViewingPYQ(item);
      setActivePage('pyqs');
    }
  };

  const renderActivePage = () => {
    if (loading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <span className="text-xs font-semibold animate-pulse">Restoring secure session...</span>
        </div>
      );
    }

    switch (activePage) {
      case 'landing':
        return <Landing setActivePage={setActivePage} />;
      case 'auth':
        return <Auth setActivePage={setActivePage} />;
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} setViewingDoc={setViewingDoc} />;
      case 'notes':
        return <Notes viewingDoc={viewingDoc} setViewingDoc={setViewingDoc} />;
      case 'pyqs':
        return <PYQs viewingPYQ={viewingPYQ} setViewingPYQ={setViewingPYQ} />;
      case 'admin':
        return <Admin setActivePage={setActivePage} setViewingDoc={setViewingDoc} />;
      default:
        return <Landing setActivePage={setActivePage} />;
    }
  };

  const handlePageChange = (page) => {
    if (page !== 'notes') {
      setViewingDoc(null);
    }
    if (page !== 'pyqs') {
      setViewingPYQ(null);
    }
    setActivePage(page);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#060814] text-slate-200 selection:bg-violet-600/35 relative">
      {/* Ambient Top Glow */}
      <div className="absolute top-0 inset-x-0 h-[350px] bg-gradient-to-b from-violet-600/10 via-blue-500/5 to-transparent pointer-events-none"></div>

      {/* Global Spotlight Search Palette */}
      <AnimatePresence>
        {searchPaletteOpen && (
          <SearchPalette 
            isOpen={searchPaletteOpen} 
            onClose={() => setSearchPaletteOpen(false)} 
            onNavigate={handleSearchNavigate} 
          />
        )}
      </AnimatePresence>

      {/* Navigation */}
      <Navbar 
        activePage={activePage} 
        setActivePage={handlePageChange} 
        onSearchOpen={() => setSearchPaletteOpen(true)} 
      />

      {/* Content Wrapper */}
      <main className="flex-1 w-full flex flex-col justify-start py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex-1 w-full flex flex-col"
          >
            {renderActivePage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-[#04060d]/80 border-t border-white/5 py-8 px-4 text-center text-xs text-slate-500 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-violet-600 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">T</span>
            </div>
            <span className="font-bold text-slate-400">TechVault</span>
            <span className="text-[10px] text-slate-600">v1.0.0</span>
          </div>
          
          <div className="flex gap-6 text-slate-600 font-medium">
            <span className="hover:text-slate-400 cursor-pointer" onClick={() => alert('Mit License - Use freely')}>Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer" onClick={() => alert('Mock Privacy Policy')}>Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer" onClick={() => alert('Support: support@techvault.com')}>Contact Support</span>
          </div>

          <div className="text-slate-600 font-semibold flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />
            <span>Certified Secure Database</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
