import React, { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { AppProvider, AppContext } from './context/AppContext';
import Navbar from './components/Navbar';
import SearchPalette from './components/SearchPalette';
import { Analytics } from '@vercel/analytics/react';

// Lazy load page components to improve initial page load performance
const Landing = lazy(() => import('./pages/Landing'));
const Auth = lazy(() => import('./pages/Auth'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Notes = lazy(() => import('./pages/Notes'));
const PYQs = lazy(() => import('./pages/PYQs'));
const Admin = lazy(() => import('./pages/Admin'));

import { Shield, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * AppContent Component
 * The main layout engine and page-switcher for the TechVault application.
 * Manages SPA-style routing via the 'activePage' state and handles global search.
 */
function AppContent() {
  // Global context for authentication state and initialization status
  const { currentUser, loading } = useContext(AppContext);
  
  // --- Routing State ---
  const [activePage, setActivePage] = useState('landing');
  
  // --- Cross-Page State ---
  // Shared state for when a user selects a specific Note or PYQ from Dashboard/Search
  const [viewingDoc, setViewingDoc] = useState(null);
  const [viewingPYQ, setViewingPYQ] = useState(null);
  
  // UI State: Global search spotlight visibility
  const [searchPaletteOpen, setSearchPaletteOpen] = useState(false);

  /**
   * Effect: Monitors Ctrl+K or Command+K globally.
   * Dispatches a toggle to open/close the Spotlight Search Palette.
   */
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

  /**
   * Auth Guard: Enforces redirection to the Auth page for protected features
   * if the user is not logged in.
   */
  useEffect(() => {
    const authProtectedPages = ['notes', 'pyqs', 'dashboard', 'admin'];
    if (authProtectedPages.includes(activePage) && !currentUser && !loading) {
      setActivePage('auth');
    }
  }, [activePage, currentUser, loading]);

  /**
   * Centralized navigation handler for search results.
   */
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

  /**
   * Dynamic Page Router
   * Renders the requested view based on the current 'activePage' state.
   */
  const renderActivePage = () => {
    // Initialization Screen: Displayed while checking JWT from localStorage
    if (loading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <span className="text-xs font-semibold animate-pulse">Restoring secure session...</span>
        </div>
      );
    }

    return (
      <Suspense fallback={
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <span className="text-xs font-semibold animate-pulse">Loading section...</span>
        </div>
      }>
        {(() => {
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
        })()}
      </Suspense>
    );
  };

  /**
   * Navigation handler that clears context-specific viewing state when switching tabs.
   */
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
      {/* Visual background gradient */}
      <div className="absolute top-0 inset-x-0 h-[350px] bg-gradient-to-b from-violet-600/10 via-blue-500/5 to-transparent pointer-events-none"></div>

      {/* Global Search Palette (Framer Motion Overlay) */}
      <AnimatePresence>
        {searchPaletteOpen && (
          <SearchPalette 
            isOpen={searchPaletteOpen} 
            onClose={() => setSearchPaletteOpen(false)} 
            onNavigate={handleSearchNavigate} 
          />
        )}
      </AnimatePresence>

      {/* Primary Navigation */}
      <Navbar 
        activePage={activePage} 
        setActivePage={handlePageChange} 
        onSearchOpen={() => setSearchPaletteOpen(true)} 
      />

      {/* Page Content with Framer Motion transitions */}
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

      {/* Global TechVault Footer */}
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
      
      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}

/**
 * Root App Component
 * Wraps the entire application in the AppProvider for global state availability.
 */
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
