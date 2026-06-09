import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import { Search, X, BookOpen, GraduationCap, Star, Download, Bookmark, ChevronRight, Loader2, CornerDownRight, CheckCircle2, SlidersHorizontal, Info, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SearchPalette({ isOpen, onClose, onNavigate }) {
  const { performSearch, currentUser, toggleBookmark, trackDownload, trackPYQDownload } = useContext(AppContext);
  
  // --- Search & Filters State ---
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All'); // 'All' | 'Notes' | 'PYQs'
  const [branch, setBranch] = useState('All'); // 'All' | 'CSE' | 'ECE' | 'EE' | 'ME' | 'CE' | 'MATH' | 'PHYS' | 'CHEM'
  const [semester, setSemester] = useState('All'); // 'All' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'popular' | 'rating' | 'title'
  const [page, setPage] = useState(1);

  const [results, setResults] = useState({ notes: [], pyqs: [] });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalNotes: 0, totalPYQs: 0 });
  const [loading, setLoading] = useState(false);

  // Track previous filters to adjust page during render (avoiding effect setState)
  const [prevFilters, setPrevFilters] = useState({ query, category, branch, semester, sortBy });
  if (prevFilters.query !== query ||
      prevFilters.category !== category ||
      prevFilters.branch !== branch ||
      prevFilters.semester !== semester ||
      prevFilters.sortBy !== sortBy) {
    setPrevFilters({ query, category, branch, semester, sortBy });
    setPage(1);
  }

  // --- Keyboard & Focus State ---
  const [activeResultSection, setActiveResultSection] = useState('notes'); // 'notes' | 'pyqs'
  const [activeResultIdx, setActiveResultIdx] = useState(0);

  const inputRef = useRef(null);
  const overlayRef = useRef(null);

  // --- Filter Options ---
  const categories = ['All', 'Notes', 'PYQs'];
  const branches = ['All', 'CSE', 'ECE', 'EE', 'ME', 'CE', 'MATH', 'PHYS', 'CHEM'];
  const semesters = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'popular', label: 'Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'title', label: 'Alphabetical' }
  ];

  // Helper: Format file size to human-readable format
  const formatSize = (bytes) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  // Auto-focus input on mount
  useEffect(() => {
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  }, []);

  const fetchResults = useCallback(async (searchQuery, filters, append = false) => {
    setLoading(true);
    try {
      const data = await performSearch(searchQuery, filters);

      if (append) {
        setResults(prev => ({
          notes: [...prev.notes, ...(data.notes || [])],
          pyqs: [...prev.pyqs, ...(data.pyqs || [])]
        }));
      } else {
        const notesList = data.notes || [];
        const pyqsList = data.pyqs || [];
        setResults({
          notes: notesList,
          pyqs: pyqsList
        });

        // Set default keyboard focus selection
        if (notesList.length > 0) {
          setActiveResultSection('notes');
          setActiveResultIdx(0);
        } else if (pyqsList.length > 0) {
          setActiveResultSection('pyqs');
          setActiveResultIdx(0);
        } else {
          setActiveResultSection('notes');
          setActiveResultIdx(0);
        }
      }

      setPagination(data.pagination || { page: 1, limit: 10, totalNotes: 0, totalPYQs: 0 });
    } catch (err) {
      console.error('TechVault Discovery failed:', err);
    } finally {
      setLoading(false);
    }
  }, [performSearch]);



  // Fetch results based on debounced search query + filters + pagination
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchResults(query, { category, branch, semester, sortBy, page }, page > 1);
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [query, category, branch, semester, sortBy, page, fetchResults]);

  // Determine currently focused item for the preview column
  const getFocusedItem = () => {
    if (activeResultSection === 'notes' && results.notes.length > 0) {
      return { item: results.notes[activeResultIdx], type: 'notes' };
    }
    if (activeResultSection === 'pyqs' && results.pyqs.length > 0) {
      return { item: results.pyqs[activeResultIdx], type: 'pyqs' };
    }
    // Fallbacks
    if (results.notes.length > 0) return { item: results.notes[0], type: 'notes' };
    if (results.pyqs.length > 0) return { item: results.pyqs[0], type: 'pyqs' };
    return null;
  };

  const focusedData = getFocusedItem();

  // Check if a Note is bookmarked by the logged-in user
  const isBookmarked = (noteId) => {
    return currentUser && (currentUser.bookmarks || []).includes(noteId);
  };

  // Direct Document Download Orchestrator
  const handleDownload = (item, type) => {
    if (type === 'notes') {
      trackDownload(item._id);
    } else {
      trackPYQDownload(item._id);
    }
    const link = document.createElement('a');
    link.href = item.fileUrl;
    link.setAttribute('download', item.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset all filters to default
  const handleResetFilters = () => {
    setCategory('All');
    setBranch('All');
    setSemester('All');
    setSortBy('newest');
    setQuery('');
  };

  // Redirect to upload notes view
  const handleUploadRedirect = () => {
    localStorage.setItem('tv_open_upload', 'true');
    onClose();
    onNavigate('notes', null);
  };

  // Keyboard navigation controller
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      const notesCount = results.notes.length;
      const pyqsCount = results.pyqs.length;
      const totalCount = notesCount + pyqsCount;

      if (totalCount === 0 || loading) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeResultSection === 'notes') {
          if (activeResultIdx < notesCount - 1) {
            setActiveResultIdx(prev => prev + 1);
          } else if (pyqsCount > 0) {
            setActiveResultSection('pyqs');
            setActiveResultIdx(0);
          } else {
            setActiveResultIdx(0); // Loop back
          }
        } else {
          if (activeResultIdx < pyqsCount - 1) {
            setActiveResultIdx(prev => prev + 1);
          } else if (notesCount > 0) {
            setActiveResultSection('notes');
            setActiveResultIdx(0);
          } else {
            setActiveResultIdx(0); // Loop back
          }
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeResultSection === 'notes') {
          if (activeResultIdx > 0) {
            setActiveResultIdx(prev => prev - 1);
          } else if (pyqsCount > 0) {
            setActiveResultSection('pyqs');
            setActiveResultIdx(pyqsCount - 1);
          } else {
            setActiveResultIdx(notesCount - 1); // Loop back
          }
        } else {
          if (activeResultIdx > 0) {
            setActiveResultIdx(prev => prev - 1);
          } else if (notesCount > 0) {
            setActiveResultSection('notes');
            setActiveResultIdx(notesCount - 1);
          } else {
            setActiveResultIdx(pyqsCount - 1); // Loop back
          }
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const activeItem = focusedData;
        if (activeItem) {
          onNavigate(activeItem.type, activeItem.item);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeResultSection, activeResultIdx, loading, focusedData, onClose, onNavigate]);

  // Determine pagination bounds
  const hasMore = (category === 'All' && (results.notes.length < pagination.totalNotes || results.pyqs.length < pagination.totalPYQs)) ||
                  (category === 'Notes' && results.notes.length < pagination.totalNotes) ||
                  (category === 'PYQs' && results.pyqs.length < pagination.totalPYQs);

  return (
    <motion.div 
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-[#030408]/80 backdrop-blur-md px-4 overflow-hidden"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -8 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="w-full max-w-5xl bg-[#090d16]/95 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[82vh]"
      >
        
        {/* Raycast Header Section */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 relative bg-[#06090f]/60">
          <Search className="w-5 h-5 text-violet-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search resources, topics, course codes, or creators..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none placeholder:text-slate-600 pr-10"
          />
          
          <div className="flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 text-violet-400 animate-spin mr-1" />}
            {query && (
              <button 
                onClick={() => setQuery('')} 
                className="text-xs text-slate-500 hover:text-white mr-1.5 transition-colors"
              >
                Clear
              </button>
            )}
            <span className="text-[10px] font-black text-slate-500 bg-slate-900 border border-white/5 px-2 py-0.5 rounded">
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

        {/* Filter Chip Bands */}
        <div className="flex flex-col gap-2.5 px-5 py-3.5 border-b border-white/5 bg-[#070a12]/40 text-left shrink-0">
          
          {/* Category & Sort Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider shrink-0 mr-1.5">Category</span>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                    category === cat 
                      ? 'bg-violet-600/20 border-violet-500/30 text-violet-300'
                      : 'bg-slate-950/30 text-slate-500 border-white/5 hover:text-slate-300'
                  }`}
                >
                  {cat === 'All' ? 'All Formats' : cat}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider shrink-0 mr-1.5">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-white/5 text-slate-400 text-xs px-2.5 py-1 rounded-lg focus:border-violet-500 outline-none transition-colors"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Academic Branch Selector */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-white/5 pt-2.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider shrink-0 mr-1.5">Branch</span>
            {branches.map(br => (
              <button
                key={br}
                onClick={() => setBranch(br)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all border shrink-0 cursor-pointer ${
                  branch === br 
                    ? 'bg-indigo-600/25 border-indigo-500/30 text-indigo-300'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                {br}
              </button>
            ))}
          </div>

          {/* Semester Selector */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-white/5 pt-2.5">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider shrink-0 mr-1.5">Semester</span>
            {semesters.map(sem => (
              <button
                key={sem}
                onClick={() => setSemester(sem)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition-all border shrink-0 cursor-pointer ${
                  semester === sem 
                    ? 'bg-violet-600/25 border-violet-500/30 text-violet-300'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                {sem === 'All' ? 'All Semesters' : `Sem ${sem}`}
              </button>
            ))}
          </div>
        </div>

        {/* Two-Column Search & Discovery Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Results List */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin flex flex-col gap-4">
            
            {results.notes.length === 0 && results.pyqs.length === 0 ? (
              
              /* EMPTY STATE */
              <div className="py-24 text-center flex flex-col items-center justify-center gap-4 text-slate-500 max-w-md mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-500/10 to-blue-500/5 border border-white/5 flex items-center justify-center">
                  <Info className="w-6 h-6 text-violet-400" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-bold text-slate-300">No resources found</span>
                  <span className="text-xs text-slate-500 leading-relaxed">
                    We couldn't find any documents matching your current filters or search query string. Try expanding your search options or clearing active filters.
                  </span>
                </div>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-slate-900 border border-white/5 hover:border-white/10 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={handleUploadRedirect}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    Upload Materials
                  </button>
                </div>
              </div>
            ) : (
              
              /* RESULTS LIST */
              <div className="flex flex-col gap-5 text-left">
                
                {/* Notes results */}
                {results.notes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 pl-1">
                      Study Notes ({results.notes.length})
                    </span>
                    <div className="flex flex-col gap-2">
                      {results.notes.map((note, idx) => {
                        const isFocused = activeResultSection === 'notes' && activeResultIdx === idx;
                        return (
                          <div
                            key={note._id}
                            onClick={() => onNavigate('notes', note)}
                            onMouseEnter={() => {
                              setActiveResultSection('notes');
                              setActiveResultIdx(idx);
                            }}
                            className={`flex justify-between items-center p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                              isFocused
                                ? 'bg-violet-600/10 border-violet-500/40 shadow-md shadow-violet-500/5 scale-[1.005]'
                                : 'bg-slate-900/35 border-white/5 hover:border-white/10 hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400 border border-violet-500/20 shrink-0">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-violet-400 transition-colors">
                                  {note.title}
                                </span>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 font-medium mt-0.5">
                                  <span className="text-violet-400 font-bold uppercase tracking-wider">{note.subject}</span>
                                  <span>•</span>
                                  <span>Sem {note.semester}</span>
                                  {note.syllabusCode && (
                                    <>
                                      <span>•</span>
                                      <span className="font-mono text-emerald-400">{note.syllabusCode}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 ml-3">
                              <span className="text-[10px] text-slate-500 font-bold bg-slate-950 border border-white/5 px-2 py-0.5 rounded hidden sm:inline">
                                {formatSize(note.fileSize)}
                              </span>
                              {isFocused ? (
                                <ChevronRight className="w-4 h-4 text-violet-400 animate-pulse" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-700" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PYQ results */}
                {results.pyqs.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 pl-1">
                      Exam Papers & PYQs ({results.pyqs.length})
                    </span>
                    <div className="flex flex-col gap-2">
                      {results.pyqs.map((pyq, idx) => {
                        const isFocused = activeResultSection === 'pyqs' && activeResultIdx === idx;
                        return (
                          <div
                            key={pyq._id}
                            onClick={() => onNavigate('pyqs', pyq)}
                            onMouseEnter={() => {
                              setActiveResultSection('pyqs');
                              setActiveResultIdx(idx);
                            }}
                            className={`flex justify-between items-center p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                              isFocused
                                ? 'bg-blue-600/10 border-blue-500/40 shadow-md shadow-blue-500/5 scale-[1.005]'
                                : 'bg-slate-900/35 border-white/5 hover:border-white/10 hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/20 shrink-0">
                                <GraduationCap className="w-4 h-4" />
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-blue-400 transition-colors">
                                  {pyq.subject} ({pyq.year}) Exam Paper
                                </span>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-500 font-medium mt-0.5">
                                  <span className="text-blue-400 font-bold">{pyq.university.split(' ')[0]}</span>
                                  <span>•</span>
                                  <span>Sem {pyq.semester}</span>
                                  <span>•</span>
                                  <span className={`font-bold ${pyq.difficultyLevel === 'Hard' ? 'text-red-400' : pyq.difficultyLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {pyq.difficultyLevel}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 ml-3">
                              <span className="text-[10px] text-slate-500 font-bold bg-slate-950 border border-white/5 px-2 py-0.5 rounded hidden sm:inline">
                                PYQ
                              </span>
                              {isFocused ? (
                                <ChevronRight className="w-4 h-4 text-blue-400 animate-pulse" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-700" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PAGINATION / LOAD MORE */}
                {hasMore && (
                  <button
                    onClick={() => setPage(prev => prev + 1)}
                    className="w-full py-3 bg-slate-900/40 hover:bg-slate-900 border border-white/5 hover:border-white/10 text-xs font-bold text-slate-400 hover:text-white rounded-2xl transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                        <span>Querying next page...</span>
                      </>
                    ) : (
                      <span>Load More Resources</span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Detailed focused preview panel */}
          <div className="hidden md:flex w-[380px] border-l border-white/5 bg-[#05080e]/40 p-5 flex-col justify-between overflow-y-auto text-left shrink-0">
            {focusedData ? (
              <div className="flex flex-col gap-5 h-full justify-between">
                
                {/* Product Metadata Details */}
                <div className="flex flex-col gap-4">
                  
                  {/* Large Icon Box */}
                  <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                      focusedData.type === 'notes'
                        ? 'bg-violet-600/10 border-violet-500/25 text-violet-400'
                        : 'bg-blue-600/10 border-blue-500/25 text-blue-400'
                    }`}>
                      {focusedData.type === 'notes' ? <BookOpen className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                        {focusedData.type === 'notes' ? 'LECTURE NOTE' : 'EXAM PYQ'}
                      </span>
                      <span className="text-xs font-bold text-slate-300 truncate" title={focusedData.item.subject}>
                        {focusedData.item.subject}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-extrabold text-slate-100 leading-snug">
                    {focusedData.type === 'notes' ? focusedData.item.title : `${focusedData.item.subject} (${focusedData.item.year})`}
                  </h3>

                  {/* Desc / Specific Info */}
                  {focusedData.type === 'notes' && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-4 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                      {focusedData.item.description}
                    </p>
                  )}

                  {/* Detail list grid */}
                  <div className="flex flex-col gap-2.5 text-[11px] bg-slate-950/20 border border-white/5 p-4 rounded-2xl">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-500 font-semibold">Semester</span>
                      <span className="text-slate-300 font-bold text-violet-400">Semester {focusedData.item.semester}</span>
                    </div>
                    {focusedData.item.syllabusCode && (
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-slate-500 font-semibold">Course Code</span>
                        <span className="font-mono text-emerald-400 font-bold">{focusedData.item.syllabusCode}</span>
                      </div>
                    )}
                    {focusedData.item.campusBlock && (
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-slate-500 font-semibold">Academic Block</span>
                        <span className="text-slate-300 font-medium truncate max-w-[150px]" title={focusedData.item.campusBlock}>
                          {focusedData.item.campusBlock.split(' ')[0]}
                        </span>
                      </div>
                    )}
                    {focusedData.type === 'pyqs' && (
                      <>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="text-slate-500 font-semibold">University</span>
                          <span className="text-slate-300 font-medium truncate max-w-[160px]" title={focusedData.item.university}>
                            {focusedData.item.university}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1.5">
                          <span className="text-slate-500 font-semibold">Difficulty</span>
                          <span className={`font-extrabold ${focusedData.item.difficultyLevel === 'Hard' ? 'text-red-400' : focusedData.item.difficultyLevel === 'Medium' ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {focusedData.item.difficultyLevel}
                          </span>
                        </div>
                      </>
                    )}
                    {focusedData.type === 'notes' && (
                      <div className="flex justify-between border-b border-white/5 pb-1.5">
                        <span className="text-slate-500 font-semibold">Rating</span>
                        <span className="text-amber-500 font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{focusedData.item.rating} / 5</span>
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-slate-500 font-semibold">Size</span>
                      <span className="text-slate-300 font-semibold">{formatSize(focusedData.type === 'notes' ? focusedData.item.fileSize : 3100000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Downloads</span>
                      <span className="text-slate-300 font-bold">{focusedData.item.downloads}</span>
                    </div>
                  </div>

                  {/* Contributor Profile */}
                  {focusedData.item.uploadedBy && (
                    <div className="flex items-center gap-3 bg-[#0c101a] border border-white/5 p-3 rounded-2xl">
                      <img 
                        src={focusedData.item.uploadedBy.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Academic'} 
                        alt={focusedData.item.uploadedBy.name} 
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 shrink-0"
                      />
                      <div className="flex flex-col text-left min-w-0">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="text-xs font-bold text-slate-300 truncate">
                            {focusedData.item.uploadedBy.name}
                          </span>
                          {(focusedData.item.isVerifiedCreator || focusedData.item.uploadedBy.isVerified) && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-current shrink-0" title="Verified Creator" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Contributor • {focusedData.item.uploadedBy.branch || 'JECRC Peer'}
                        </span>
                      </div>
                    </div>
                  )}

                </div>

                {/* Primary CTA Buttons */}
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => onNavigate(focusedData.type, focusedData.item)}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-violet-600/10 transition-all active:scale-95"
                  >
                    <CornerDownRight className="w-4 h-4" />
                    <span>Open in PDF Viewer</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(focusedData.item, focusedData.type)}
                      className="flex-1 py-2.5 bg-slate-900 border border-white/5 hover:border-white/10 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-violet-400" />
                      <span>Download</span>
                    </button>

                    {focusedData.type === 'notes' && (
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            alert('Please sign in to bookmark.');
                            return;
                          }
                          toggleBookmark(focusedData.item._id);
                        }}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isBookmarked(focusedData.item._id)
                            ? 'bg-violet-600/20 border-violet-500/30 text-violet-400'
                            : 'bg-slate-900 border-white/5 text-slate-500 hover:text-white hover:bg-slate-800'
                        }`}
                        title="Bookmark Resource"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(focusedData.item._id) ? 'fill-current' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 h-full text-slate-600 text-xs">
                <SlidersHorizontal className="w-8 h-8 stroke-1" />
                <span>Select a result to preview details</span>
              </div>
            )}
          </div>

        </div>

        {/* Global Footer Hotkeys */}
        <div className="bg-[#05070c] px-5 py-3 border-t border-white/5 text-[10px] text-slate-500 flex justify-between items-center shrink-0">
          <div className="flex gap-4">
            <span>
              <strong>↑↓</strong> Navigate focused item
            </span>
            <span>
              <strong>↵</strong> Open PDF viewer
            </span>
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>TechVault Secure Resource Verification</span>
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
