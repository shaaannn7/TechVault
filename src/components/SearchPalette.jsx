import React, { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, X, BookOpen, GraduationCap, Star, Download, ChevronRight, Loader2, CornerDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchPalette({ isOpen, onClose, onNavigate }) {
  const { performSearch, getSearchSuggestions } = useContext(AppContext);
  
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState({ notes: [], pyqs: [] });
  const [loading, setLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);
  
  // Navigation indexes for keyboard arrow keys
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);
  const [activeResultSection, setActiveResultSection] = useState('notes'); // 'notes' | 'pyqs'
  const [activeResultIdx, setActiveResultIdx] = useState(-1);

  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
      setQuery('');
      setSuggestions([]);
      setResults({ notes: [], pyqs: [] });
      setIsSearched(false);
      setActiveSuggestionIdx(-1);
      setActiveResultIdx(-1);
    }
  }, [isOpen]);

  // Debounced search suggestions fetching
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    if (isSearched) return; // Don't fetch suggestions if we just searched

    const delayDebounce = setTimeout(async () => {
      try {
        const list = await getSearchSuggestions(query);
        setSuggestions(list);
      } catch (err) {
        console.error('Failed to load suggestions:', err);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query, isSearched]);

  // Handle Search Submission
  const handleSearchSubmit = async (searchQuery) => {
    const q = searchQuery.trim();
    if (!q) return;

    setLoading(true);
    setIsSearched(true);
    setSuggestions([]);
    setActiveSuggestionIdx(-1);
    setActiveResultIdx(0);
    setActiveResultSection('notes');

    try {
      const data = await performSearch(q);
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      // If viewing suggestions list
      if (!isSearched && suggestions.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveSuggestionIdx((prev) => (prev + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveSuggestionIdx((prev) => (prev - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (activeSuggestionIdx >= 0) {
            setQuery(suggestions[activeSuggestionIdx]);
            handleSearchSubmit(suggestions[activeSuggestionIdx]);
          } else {
            handleSearchSubmit(query);
          }
        }
      }

      // If viewing search results
      if (isSearched && !loading) {
        const notesCount = results.notes.length;
        const pyqsCount = results.pyqs.length;
        const totalCount = notesCount + pyqsCount;

        if (totalCount === 0) return;

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (activeResultSection === 'notes') {
            if (activeResultIdx < notesCount - 1) {
              setActiveResultIdx((prev) => prev + 1);
            } else if (pyqsCount > 0) {
              setActiveResultSection('pyqs');
              setActiveResultIdx(0);
            } else {
              setActiveResultIdx(0);
            }
          } else {
            if (activeResultIdx < pyqsCount - 1) {
              setActiveResultIdx((prev) => prev + 1);
            } else if (notesCount > 0) {
              setActiveResultSection('notes');
              setActiveResultIdx(0);
            } else {
              setActiveResultIdx(0);
            }
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (activeResultSection === 'notes') {
            if (activeResultIdx > 0) {
              setActiveResultIdx((prev) => prev - 1);
            } else if (pyqsCount > 0) {
              setActiveResultSection('pyqs');
              setActiveResultIdx(pyqsCount - 1);
            } else {
              setActiveResultIdx(notesCount - 1);
            }
          } else {
            if (activeResultIdx > 0) {
              setActiveResultIdx((prev) => prev - 1);
            } else if (notesCount > 0) {
              setActiveResultSection('notes');
              setActiveResultIdx(notesCount - 1);
            } else {
              setActiveResultIdx(pyqsCount - 1);
            }
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (activeResultSection === 'notes' && results.notes[activeResultIdx]) {
            onNavigate('notes', results.notes[activeResultIdx]);
          } else if (activeResultSection === 'pyqs' && results.pyqs[activeResultIdx]) {
            onNavigate('pyqs', results.pyqs[activeResultIdx]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSearched, suggestions, results, activeSuggestionIdx, activeResultSection, activeResultIdx, loading, query]);

  return (
    <motion.div 
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-950/70 backdrop-blur-md px-4"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: -16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -16 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="w-full max-w-2xl bg-[#090d16]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[75vh]"
      >
        
        {/* Search input header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 relative">
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search study notes, question papers, subjects (e.g. DSA, RCC, Math)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsSearched(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && activeSuggestionIdx === -1) {
                handleSearchSubmit(query);
              }
            }}
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600 pr-10"
          />
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-600 bg-slate-900 border border-white/5 px-2 py-0.5 rounded">
              ESC
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic content panel */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
              <span className="text-xs font-semibold animate-pulse">Running global search across archive...</span>
            </div>
          ) : !query.trim() ? (
            /* Empty state initial recommendations */
            <div className="flex flex-col gap-4 text-left p-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 pl-1">
                Suggested Searches
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { title: 'Data Structures and Algorithms', icon: <BookOpen className="w-4 h-4 text-violet-400" /> },
                  { title: 'Reinforced Cement Concrete (RCC)', icon: <BookOpen className="w-4 h-4 text-violet-400" /> },
                  { title: 'Mathematics II PYQ (RTU)', icon: <GraduationCap className="w-4 h-4 text-blue-400" /> },
                  { title: 'Computer Science Exam (RTU)', icon: <GraduationCap className="w-4 h-4 text-blue-400" /> }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(item.title);
                      handleSearchSubmit(item.title);
                    }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/30 hover:bg-slate-900/80 border border-white/5 hover:border-white/10 text-slate-300 text-xs font-semibold text-left transition-all cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-[#0d1220] border border-white/5 shrink-0 group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    <span className="line-clamp-1">{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : !isSearched && suggestions.length > 0 ? (
            /* Suggestions list view */
            <div className="flex flex-col gap-1 text-left">
              {suggestions.map((suggestion, idx) => {
                const isActive = activeSuggestionIdx === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuery(suggestion);
                      handleSearchSubmit(suggestion);
                    }}
                    onMouseEnter={() => setActiveSuggestionIdx(idx)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-violet-600/10 border-violet-500/30 text-violet-300' 
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Search className="w-3.5 h-3.5 text-slate-500" />
                      <span>{suggestion}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-violet-400" />}
                  </button>
                );
              })}
            </div>
          ) : isSearched ? (
            /* Search results view */
            <div className="flex flex-col gap-6 text-left">
              {results.notes.length === 0 && results.pyqs.length === 0 ? (
                <div className="py-16 text-center flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Search className="w-8 h-8 text-slate-600" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-extrabold text-slate-400">No matches found for "{query}"</span>
                    <span className="text-[10px] text-slate-600">Double check spelling or try other keywords.</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {/* Notes Section */}
                  {results.notes.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 pl-1">
                        Study Notes & Guides ({results.notes.length})
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {results.notes.map((note, idx) => {
                          const isSelected = activeResultSection === 'notes' && activeResultIdx === idx;
                          return (
                            <div
                              key={note._id}
                              onClick={() => onNavigate('notes', note)}
                              onMouseEnter={() => {
                                setActiveResultSection('notes');
                                setActiveResultIdx(idx);
                              }}
                              className={`flex justify-between items-center p-3 rounded-2xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-violet-600/10 border-violet-500/30 shadow-md shadow-violet-500/5'
                                  : 'bg-slate-900/30 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
                                  <BookOpen className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-extrabold text-slate-200 line-clamp-1">
                                    {note.title}
                                  </span>
                                  <span className="text-[10px] font-medium text-slate-500">
                                    {note.subject}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 shrink-0">
                                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                  <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
                                  <span>{note.rating}</span>
                                </div>
                                {isSelected ? (
                                  <span className="text-[10px] font-bold text-violet-400 flex items-center gap-0.5">
                                    <span>Study</span>
                                    <CornerDownRight className="w-3 h-3" />
                                  </span>
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* PYQs Section */}
                  {results.pyqs.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 pl-1">
                        Exam Papers & Question Sheets ({results.pyqs.length})
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {results.pyqs.map((paper, idx) => {
                          const isSelected = activeResultSection === 'pyqs' && activeResultIdx === idx;
                          return (
                            <div
                              key={paper._id}
                              onClick={() => onNavigate('pyqs', paper)}
                              onMouseEnter={() => {
                                setActiveResultSection('pyqs');
                                setActiveResultIdx(idx);
                              }}
                              className={`flex justify-between items-center p-3 rounded-2xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-violet-600/10 border-violet-500/30 shadow-md shadow-violet-500/5'
                                  : 'bg-slate-900/30 border-white/5 hover:border-white/10'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                                  <GraduationCap className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-xs font-extrabold text-slate-200 line-clamp-1">
                                    {paper.subject} Exam Paper
                                  </span>
                                  <span className="text-[10px] font-medium text-slate-500">
                                    {paper.university} — {paper.year} ({paper.difficultyLevel})
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 shrink-0">
                                <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                                  <Download className="w-3.5 h-3.5 text-slate-500" />
                                  <span>{paper.downloads}</span>
                                </div>
                                {isSelected ? (
                                  <span className="text-[10px] font-bold text-violet-400 flex items-center gap-0.5">
                                    <span>Open</span>
                                    <CornerDownRight className="w-3 h-3" />
                                  </span>
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-600">
              No recommendations matching the query.
            </div>
          )}
        </div>

        {/* Search footer helper text */}
        <div className="bg-slate-950 px-5 py-2.5 border-t border-white/5 text-[9px] text-slate-500 flex justify-between items-center shrink-0">
          <div className="flex gap-4">
            <span>
              <strong>↑↓</strong> Navigate list
            </span>
            <span>
              <strong>↵</strong> Select result
            </span>
          </div>
          <span>TechVault global indexing</span>
        </div>

      </motion.div>
    </motion.div>
  );
}
