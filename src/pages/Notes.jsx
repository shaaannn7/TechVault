import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import PDFViewer from '../components/PDFViewer';
import { Search, Filter, BookOpen, Star, Download, Bookmark, PlusCircle, X, MessageSquare, CornerDownRight, ShieldAlert, Sparkles, Loader2, ChevronLeft, ChevronRight, Award, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notes({ viewingDoc, setViewingDoc }) {
  const { notes, currentUser, uploadFile, uploadNote, toggleBookmark, trackDownload, addReview, getAIAssistance } = useContext(AppContext);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // AI Study Assistant state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiData, setAiData] = useState(null);
  const [activeAiTab, setActiveAiTab] = useState('summary'); // 'summary' | 'flashcards' | 'quiz'
  
  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [flippedCard, setFlippedCard] = useState(false);

  // Quiz state
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Reset AI states when selected document changes
  useEffect(() => {
    setAiOpen(false);
    setAiData(null);
    setAiError('');
    setAiLoading(false);
  }, [viewingDoc]);

  const handleToggleAIAssistant = async () => {
    if (!currentUser) {
      alert('Please sign in to access the AI Study Assistant.');
      return;
    }
    
    if (aiOpen) {
      setAiOpen(false);
      return;
    }

    setAiOpen(true);

    if (!aiData || aiData.noteId !== viewingDoc._id) {
      setAiLoading(true);
      setAiError('');
      try {
        const payload = await getAIAssistance(viewingDoc._id);
        setAiData({ ...payload, noteId: viewingDoc._id });
        setActiveAiTab('summary');
        setCurrentCardIdx(0);
        setFlippedCard(false);
        setCurrentQuizIdx(0);
        setSelectedQuizOption(null);
        setQuizSubmitted(false);
        setQuizScore(0);
        setQuizCompleted(false);
      } catch (err) {
        setAiError(err.message || 'Failed to fetch AI study materials.');
      } finally {
        setAiLoading(false);
      }
    }
  };
  
  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSubject, setNewSubject] = useState('Computer Science');
  const [newTags, setNewTags] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFile, setNewFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  // JECRC / RTU Specific state variables
  const [selectedSemester, setSelectedSemester] = useState(() => {
    const initialSem = localStorage.getItem('tv_initial_sem');
    if (initialSem) {
      localStorage.removeItem('tv_initial_sem');
      return initialSem;
    }
    return 'All';
  });

  const [newSemester, setNewSemester] = useState(1);
  const [newSyllabusCode, setNewSyllabusCode] = useState('');
  const [newCampusBlock, setNewCampusBlock] = useState('A-Block (CSE/IT Department)');

  // Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Dropdown list
  const subjects = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Civil Engineering', 'Electronics Engineering', 'Mechanical Engineering', 'Electrical Engineering'];

  // Filter notes that are published
  const publishedNotes = React.useMemo(() => {
    return notes.filter(n => n.isPublished);
  }, [notes]);

  // Apply search & filter using useMemo to avoid performance lag during typing
  const filteredNotes = React.useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    if (!searchLower && selectedSubject === 'All' && selectedSemester === 'All') return publishedNotes;

    return publishedNotes.filter(note => {
      const matchesSearch = !searchLower ||
                            note.title.toLowerCase().includes(searchLower) || 
                            note.description.toLowerCase().includes(searchLower) ||
                            note.tags.some(t => t.toLowerCase().includes(searchLower)) ||
                            (note.syllabusCode && note.syllabusCode.toLowerCase().includes(searchLower));
      const matchesSubject = selectedSubject === 'All' || note.subject === selectedSubject;
      const matchesSemester = selectedSemester === 'All' || (note.semester && note.semester.toString() === selectedSemester);
      return matchesSearch && matchesSubject && matchesSemester;
    });
  }, [publishedNotes, search, selectedSubject, selectedSemester]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!newTitle.trim() || !newDesc.trim() || !newFile) {
      setUploadError('Please fill in all details and select a PDF file.');
      return;
    }

    try {
      setUploadSuccess('Uploading document...');
      const uploadData = await uploadFile(newFile);
      
      setUploadSuccess('Publishing study material...');
      await uploadNote(newTitle, newDesc, newSubject, newTags, uploadData.fileName, uploadData.fileUrl, newSemester, newSyllabusCode, newCampusBlock);
      
      setUploadSuccess(
        currentUser.role === 'admin' || currentUser.role === 'moderator'
          ? 'Note uploaded and auto-published successfully!'
          : 'Note uploaded successfully! Awaiting moderator approval.'
      );
      
      // Reset form
      setTimeout(() => {
        setNewTitle('');
        setNewDesc('');
        setNewTags('');
        setNewFileName('');
        setNewFile(null);
        setNewSemester(1);
        setNewSyllabusCode('');
        setNewCampusBlock('A-Block (CSE/IT Department)');
        setUploadOpen(false);
        setUploadSuccess('');
      }, 1500);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload note.');
      setUploadSuccess('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.pdf')) {
        setUploadError('Only PDF files are supported.');
        setNewFileName('');
        setNewFile(null);
        return;
      }
      setNewFileName(file.name);
      setNewFile(file);
      setUploadError('');
    }
  };

  const handleDownload = (note) => {
    trackDownload(note._id);
    
    // Simulate real browser download
    const link = document.createElement('a');
    link.href = note.fileUrl;
    link.setAttribute('download', note.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReviewSubmit = (e, noteId) => {
    e.preventDefault();
    if (reviewComment.trim()) {
      addReview(noteId, reviewRating, reviewComment.trim());
      setReviewComment('');
      setReviewRating(5);
    }
  };

  const isBookmarked = (noteId) => {
    return currentUser && (currentUser.bookmarks || []).includes(noteId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6 text-slate-200">
      
      {/* Grid wrapper for details vs listing */}
      {!viewingDoc ? (
        <div className="flex flex-col gap-6">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-extrabold tracking-widest text-violet-500 uppercase">TechVault Library</span>
              <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-100 tracking-tight">Engineering Study Materials</h2>
            </div>

            <button
              onClick={() => {
                if (!currentUser) {
                  alert('Please sign in to upload resources.');
                  return;
                }
                setUploadOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/25 transition-all duration-200 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Upload Materials
            </button>
          </div>

          {/* Search bar and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search Input */}
              <div className="relative w-full md:flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search notes by title, topics, syllabus code, tags (e.g. DSA, 3CS4-04)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500/40 focus:ring-1 focus:ring-violet-500/20 text-sm outline-none transition-all text-slate-200 placeholder:text-slate-600"
                />
              </div>

              {/* Subject Filters */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                <Filter className="w-4 h-4 text-slate-500 shrink-0 hidden sm:inline" />
                {subjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                      selectedSubject === subject 
                        ? 'bg-violet-600 text-white border-violet-500'
                        : 'bg-slate-950/40 text-slate-400 border-white/5 hover:text-white'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Semester Filters */}
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 scrollbar-none border-t border-white/5 pt-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-2">Semester:</span>
              {['All', '1', '2', '3', '4', '5', '6', '7', '8'].map(sem => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                    selectedSemester === sem 
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-950/40 text-slate-400 border-white/5 hover:text-white hover:bg-slate-900/20'
                  }`}
                >
                  {sem === 'All' ? 'All Semesters' : `Sem ${sem}`}
                </button>
              ))}
            </div>
          </div>

          {/* Notes Grid */}
          {filteredNotes.length === 0 ? (
            <div className="py-24 rounded-3xl border border-dashed border-white/5 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
              <BookOpen className="w-10 h-10 text-slate-600" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-400">No notes match your filters</span>
                <span className="text-xs text-slate-600">Try modifying your search text or choosing a different subject.</span>
              </div>
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.04 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredNotes.map(note => (
                <motion.div 
                  key={note._id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                  }}
                  className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 hover:bg-slate-900/25 transition-all flex flex-col justify-between group h-64 text-left"
                >
                  <div>
                    {/* Top Subject & Bookmark */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                          {note.subject}
                        </span>
                        {note.semester && (
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                            Sem {note.semester}
                          </span>
                        )}
                        {note.syllabusCode && (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wide text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            {note.syllabusCode}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (!currentUser) {
                            alert('Please sign in to bookmark.');
                            return;
                          }
                          toggleBookmark(note._id);
                        }}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked(note._id) 
                            ? 'bg-violet-600/20 border-violet-500/30 text-violet-400 hover:text-slate-400' 
                            : 'bg-slate-950/40 border-white/5 text-slate-500 hover:text-slate-200'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(note._id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Title */}
                    <h3 
                      onClick={() => setViewingDoc(note)}
                      className="text-base font-extrabold text-slate-200 group-hover:text-violet-400 transition-colors line-clamp-1 mb-2 cursor-pointer"
                    >
                      {note.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {note.description}
                    </p>

                    {/* JECRC Specific Card Metadata */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 font-semibold mb-3">
                      {note.campusBlock && (
                        <>
                          <span>{note.campusBlock.split(' ')[0]}</span>
                          <span>•</span>
                        </>
                      )}
                      {note.uploadedBy && (
                        <div className="flex items-center gap-1">
                          <span>by {note.uploadedBy.name}</span>
                          {note.isVerifiedCreator && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-current" title="Verified Contributor" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {note.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-[9px] font-semibold bg-slate-900 border border-white/5 text-slate-500 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-[10px] font-bold text-slate-300 ml-1">{note.rating}</span>
                      </div>
                      <div className="flex items-center text-slate-500 gap-1" title={`${note.downloads} downloads`}>
                        <Download className="w-3 h-3" />
                        <span className="text-[10px] font-bold">{note.downloads}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setViewingDoc(note)}
                      className="text-xs font-bold text-slate-300 group-hover:text-violet-400 transition-colors flex items-center gap-1"
                    >
                      <span>Study Note</span>
                      <CornerDownRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      ) : (
        /* Notes Detail View / PDF Viewer */
        <div className="flex flex-col gap-6 text-left">
          
          {/* Breadcrumb nav */}
          <div>
            <button
              onClick={() => setViewingDoc(null)}
              className="text-xs font-bold text-violet-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              ← Back to Notes Library
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left side: Metadata and reviews */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              
              {/* Note Specs */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-0.5 rounded-full">
                    {viewingDoc.subject}
                  </span>
                  
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        alert('Please sign in to bookmark.');
                        return;
                      }
                      toggleBookmark(viewingDoc._id);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                      isBookmarked(viewingDoc._id) 
                        ? 'bg-violet-600/20 border-violet-500/30 text-violet-400' 
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked(viewingDoc._id) ? 'fill-current' : ''}`} />
                    <span>{isBookmarked(viewingDoc._id) ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                <h1 className="text-xl font-bold uppercase text-slate-100 leading-snug">{viewingDoc.title}</h1>
                
                <p className="text-xs text-slate-400 leading-relaxed border-b border-white/5 pb-4">{viewingDoc.description}</p>

                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Uploaded By</span>
                    <span className="text-slate-300 font-bold flex items-center gap-1">
                      {viewingDoc.uploadedBy?.name || 'Academic Contributor'}
                      {viewingDoc.isVerifiedCreator && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-current" title="Verified Creator" />
                      )}
                    </span>
                  </div>
                  {viewingDoc.uploadedBy?.rollNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Contributor Roll No.</span>
                      <span className="text-slate-300 font-semibold">{viewingDoc.uploadedBy.rollNumber}</span>
                    </div>
                  )}
                  {viewingDoc.semester && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">RTU Semester</span>
                      <span className="text-slate-300 font-bold text-indigo-400">Semester {viewingDoc.semester}</span>
                    </div>
                  )}
                  {viewingDoc.syllabusCode && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">RTU Syllabus Code</span>
                      <span className="text-emerald-400 font-mono font-bold">{viewingDoc.syllabusCode}</span>
                    </div>
                  )}
                  {viewingDoc.campusBlock && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-medium">Classroom Block Location</span>
                      <span className="text-slate-300 font-semibold">{viewingDoc.campusBlock}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">File Name</span>
                    <span className="text-slate-300 font-semibold truncate max-w-[150px]" title={viewingDoc.fileName}>
                      {viewingDoc.fileName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">File Size</span>
                    <span className="text-slate-300 font-semibold">{(viewingDoc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Downloads</span>
                    <span className="text-slate-300 font-bold">{viewingDoc.downloads}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(viewingDoc)}
                  className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-900/90 border border-white/5 hover:border-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-violet-400" />
                  Download Notes Package
                </button>
              </div>

              {/* Reviews & Ratings */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tight flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-violet-400" />
                    Reviews & Feedback
                  </h3>
                  <div className="flex items-center text-amber-500 text-sm font-black">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    <span>{viewingDoc.rating}</span>
                  </div>
                </div>

                {/* Review inputs */}
                {currentUser ? (
                  <form onSubmit={(e) => handleReviewSubmit(e, viewingDoc._id)} className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Score note:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${reviewRating >= star ? 'fill-current' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add your review comment..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-950/60 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5 text-[11px] text-slate-500 text-center">
                    Sign in to submit a review for this guide.
                  </div>
                )}

                {/* Reviews List */}
                <div className="flex flex-col gap-4 overflow-y-auto max-h-60 pr-1">
                  {viewingDoc.reviews.length === 0 ? (
                    <div className="text-[11px] text-slate-500 py-4 text-center">
                      No reviews yet. Be the first to leave a review!
                    </div>
                  ) : (
                    viewingDoc.reviews.map(review => (
                      <div key={review._id} className="flex flex-col gap-1 text-left bg-slate-950/40 p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[11px] text-slate-300">{review.author}</span>
                          <div className="flex items-center text-amber-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-[10px] font-semibold ml-0.5">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Interactive PDF Viewer & AI Assistant Sidebar */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Header Toggle Banner */}
              <div className="flex justify-between items-center bg-slate-900/40 border border-white/5 px-4 py-3 rounded-2xl">
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-300">Need help studying?</span>
                  <span className="text-[10px] text-slate-500">Generate summaries, interactive flashcards, and quizzes automatically.</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleAIAssistant}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-extrabold transition-all duration-200 cursor-pointer shadow-md ${
                    aiOpen 
                      ? 'bg-violet-600 border-violet-500 text-white shadow-violet-600/10' 
                      : 'bg-slate-950/60 border-white/5 text-violet-400 hover:bg-slate-900 hover:text-violet-300'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${aiLoading ? 'animate-pulse' : ''}`} />
                  <span>{aiOpen ? 'Hide AI Assistant' : 'AI Study Assistant'}</span>
                </button>
              </div>

              {/* Grid split when AI is open */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
                <div className={`${aiOpen ? 'xl:col-span-2' : 'xl:col-span-3'} transition-all duration-300`}>
                  <PDFViewer
                    title={viewingDoc.title}
                    subject={viewingDoc.subject}
                    author={viewingDoc.uploadedBy.name}
                    fileUrl={viewingDoc.fileUrl}
                    onDownload={() => handleDownload(viewingDoc)}
                  />
                </div>
                
                <AnimatePresence>
                  {aiOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95, x: 20 }}
                      transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                      className="xl:col-span-1 glass-panel rounded-2xl border border-white/5 p-4 min-h-[650px] flex flex-col gap-4 text-left"
                    >
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-violet-400" />
                        <h3 className="text-sm font-bold uppercase tracking-tight text-slate-200">AI Study Tool</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAiOpen(false)}
                        className="p-1 rounded bg-slate-900 border border-white/5 text-slate-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Loader / Error / Content */}
                    {aiLoading ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                        <span className="text-xs font-semibold animate-pulse text-slate-400">Synthesizing study materials...</span>
                      </div>
                    ) : aiError ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <ShieldAlert className="w-8 h-8 text-red-400" />
                        <span className="text-xs text-red-400 font-semibold">{aiError}</span>
                        <button
                          type="button"
                          onClick={handleToggleAIAssistant}
                          className="px-4 py-1.5 bg-slate-900 border border-white/5 rounded-lg text-xs text-slate-300 hover:text-white mt-2 cursor-pointer"
                        >
                          Retry Generation
                        </button>
                      </div>
                    ) : aiData ? (
                      <div className="flex-1 flex flex-col gap-4">
                        {/* Tabs Navigation */}
                        <div className="flex gap-1 p-1 bg-slate-950 rounded-xl border border-white/5">
                          {['summary', 'flashcards', 'quiz'].map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => {
                                setActiveAiTab(tab);
                                setFlippedCard(false);
                              }}
                              className={`flex-1 py-2 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                                activeAiTab === tab
                                  ? 'bg-violet-600 text-white'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                              }`}
                            >
                              {tab}
                            </button>
                          ))}
                        </div>

                        {/* Tab Contents */}
                        <div className="flex-1 flex flex-col justify-between">
                          
                          {/* SUMMARY TAB */}
                          {activeAiTab === 'summary' && (
                            <div className="flex flex-col gap-4 py-2">
                              {aiData.summary.map((point, index) => (
                                <div
                                  key={index}
                                  style={{ animationDelay: `${index * 150}ms` }}
                                  className="flex gap-3 items-start bg-slate-900/30 border border-white/5 p-3 rounded-xl hover:border-white/10 transition-colors animate-slideUp"
                                >
                                  <div className="mt-1 p-1 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
                                    <Sparkles className="w-3 h-3" />
                                  </div>
                                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    {point}
                                  </p>
                                </div>
                              ))}
                              
                              <div className="mt-6 p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl text-[10px] text-slate-500 leading-normal">
                                💡 <strong>Active Learning Tip:</strong> Read through each summary bullet point and explain it out loud in your own words before moving to the flashcards.
                              </div>
                            </div>
                          )}

                          {/* FLASHCARDS TAB */}
                          {activeAiTab === 'flashcards' && (
                            <div className="flex flex-col gap-4 py-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                                Card {currentCardIdx + 1} of {aiData.flashcards.length}
                              </span>

                              {/* Card Container (3D Flip) */}
                              <div 
                                onClick={() => setFlippedCard(!flippedCard)}
                                className="w-full h-64 perspective-1000 cursor-pointer group"
                              >
                                <div className={`relative w-full h-full duration-500 transform-style-3d ${flippedCard ? 'rotate-y-180' : ''}`}>
                                  {/* FRONT OF CARD (Question) */}
                                  <div className="absolute inset-0 w-full h-full backface-hidden bg-slate-900/60 hover:bg-slate-900/80 border border-white/5 hover:border-violet-500/20 rounded-2xl p-6 flex flex-col justify-between transition-all">
                                    <div className="flex justify-between items-start">
                                      <span className="text-[9px] font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
                                        Question
                                      </span>
                                      <HelpCircle className="w-4 h-4 text-slate-600 group-hover:text-violet-400/60 transition-colors" />
                                    </div>
                                    
                                    <p className="text-xs md:text-sm font-extrabold text-slate-100 text-center leading-relaxed px-2">
                                      {aiData.flashcards[currentCardIdx].question}
                                    </p>

                                    <span className="text-[9px] font-bold text-slate-500 text-center uppercase tracking-widest animate-pulse">
                                      Click to reveal answer
                                    </span>
                                  </div>

                                  {/* BACK OF CARD (Answer) */}
                                  <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-violet-950/15 hover:bg-violet-950/20 border border-violet-500/30 rounded-2xl p-6 flex flex-col justify-between transition-all">
                                    <div className="flex justify-between items-start">
                                      <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                        Answer
                                      </span>
                                      <Sparkles className="w-4 h-4 text-emerald-400/60" />
                                    </div>
                                    
                                    <p className="text-xs md:text-sm font-semibold text-slate-200 text-center leading-relaxed overflow-y-auto max-h-36 pr-1">
                                      {aiData.flashcards[currentCardIdx].answer}
                                    </p>

                                    <span className="text-[9px] font-bold text-violet-400/60 text-center uppercase tracking-widest">
                                      Click to flip back
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                                <div 
                                  className="bg-violet-600 h-full transition-all duration-300"
                                  style={{ width: `${((currentCardIdx + 1) / aiData.flashcards.length) * 100}%` }}
                                ></div>
                              </div>

                              {/* Nav buttons */}
                              <div className="flex justify-between items-center gap-4 mt-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFlippedCard(false);
                                    setTimeout(() => {
                                      setCurrentCardIdx(prev => Math.max(0, prev - 1));
                                    }, 150);
                                  }}
                                  disabled={currentCardIdx === 0}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white transition-colors cursor-pointer text-xs font-bold"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                  <span>Prev</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setFlippedCard(false);
                                    setTimeout(() => {
                                      setCurrentCardIdx(prev => Math.min(aiData.flashcards.length - 1, prev + 1));
                                    }, 150);
                                  }}
                                  disabled={currentCardIdx === aiData.flashcards.length - 1}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white transition-colors cursor-pointer text-xs font-bold"
                                >
                                  <span>Next</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}

                          {/* QUIZ TAB */}
                          {activeAiTab === 'quiz' && (
                            <div className="flex flex-col gap-4 py-2">
                              {!quizCompleted ? (
                                <div className="flex flex-col gap-3">
                                  {/* Progress Header */}
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                      Question {currentQuizIdx + 1} of {aiData.quiz.length}
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                      Score: {quizScore}/{currentQuizIdx}
                                    </span>
                                  </div>

                                  {/* Question Card */}
                                  <div className="p-4 bg-slate-900/30 border border-white/5 rounded-2xl flex flex-col gap-3">
                                    <span className="text-[9px] font-extrabold text-violet-400 uppercase tracking-widest">
                                      Question
                                    </span>
                                    <p className="text-xs font-extrabold text-slate-200 leading-relaxed">
                                      {aiData.quiz[currentQuizIdx].question}
                                    </p>
                                  </div>

                                  {/* Options List */}
                                  <div className="flex flex-col gap-2">
                                    {aiData.quiz[currentQuizIdx].options.map((option, idx) => {
                                      const isSelected = selectedQuizOption === idx;
                                      const isCorrect = aiData.quiz[currentQuizIdx].correctIndex === idx;
                                      
                                      let optionStyles = 'bg-slate-950/40 border-white/5 text-slate-300 hover:bg-slate-900 hover:text-white';
                                      
                                      if (quizSubmitted) {
                                        if (isCorrect) {
                                          optionStyles = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
                                        } else if (isSelected) {
                                          optionStyles = 'bg-red-500/10 border-red-500/30 text-red-400';
                                        } else {
                                          optionStyles = 'bg-slate-950/20 border-white/5 text-slate-600 opacity-60';
                                        }
                                      } else if (isSelected) {
                                        optionStyles = 'bg-violet-600/20 border-violet-500 text-violet-300';
                                      }

                                      return (
                                        <button
                                          key={idx}
                                          type="button"
                                          disabled={quizSubmitted}
                                          onClick={() => setSelectedQuizOption(idx)}
                                          className={`w-full p-3 rounded-xl border text-left text-xs font-semibold leading-relaxed transition-all flex items-center justify-between cursor-pointer ${optionStyles}`}
                                        >
                                          <span>{option}</span>
                                          {quizSubmitted && isCorrect && (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-2" />
                                          )}
                                          {quizSubmitted && isSelected && !isCorrect && (
                                            <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 ml-2" />
                                          )}
                                        </button>
                                      );
                                    })}
                                  </div>

                                  {/* Explanation Block */}
                                  {quizSubmitted && (
                                    <div className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-xl flex flex-col gap-1 text-[11px] leading-relaxed animate-fadeIn">
                                      <span className="font-extrabold text-violet-400 uppercase tracking-widest text-[9px]">
                                        Explanation
                                      </span>
                                      <p className="text-slate-400">
                                        {aiData.quiz[currentQuizIdx].explanation}
                                      </p>
                                    </div>
                                  )}

                                  {/* Control Buttons */}
                                  <div className="mt-3 flex justify-end">
                                    {!quizSubmitted ? (
                                      <button
                                        type="button"
                                        disabled={selectedQuizOption === null}
                                        onClick={() => {
                                          setQuizSubmitted(true);
                                          if (selectedQuizOption === aiData.quiz[currentQuizIdx].correctIndex) {
                                            setQuizScore(s => s + 1);
                                          }
                                        }}
                                        className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                      >
                                        Submit Answer
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (currentQuizIdx === aiData.quiz.length - 1) {
                                            setQuizCompleted(true);
                                          } else {
                                            setCurrentQuizIdx(idx => idx + 1);
                                            setSelectedQuizOption(null);
                                            setQuizSubmitted(false);
                                          }
                                        }}
                                        className="px-5 py-2.5 bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                      >
                                        {currentQuizIdx === aiData.quiz.length - 1 ? 'See Results' : 'Next Question'}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                /* Quiz Score/Completion View */
                                <div className="flex flex-col items-center justify-center text-center gap-4 py-8 animate-fadeIn">
                                  <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <Award className="w-8 h-8" />
                                  </div>
                                  
                                  <div className="flex flex-col gap-1">
                                    <h4 className="text-sm font-black uppercase text-slate-100">Quiz Completed!</h4>
                                    <p className="text-xs text-slate-500">How did you do?</p>
                                  </div>

                                  <div className="text-3xl font-black text-violet-400">
                                    {quizScore} / {aiData.quiz.length}
                                  </div>

                                  <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed">
                                    {quizScore === aiData.quiz.length 
                                      ? 'Perfect score! You have mastered these study materials.'
                                      : quizScore >= aiData.quiz.length / 2
                                      ? 'Good job! Review the flashcards to target any weak areas.'
                                      : 'Keep studying. Try reviewing the notes summary and try again!'}
                                  </p>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentQuizIdx(0);
                                      setSelectedQuizOption(null);
                                      setQuizSubmitted(false);
                                      setQuizScore(0);
                                      setQuizCompleted(false);
                                    }}
                                    className="mt-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                                  >
                                    Try Quiz Again
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-slate-500 text-center">
                        <Sparkles className="w-8 h-8 text-slate-600" />
                        <span className="text-xs font-semibold text-slate-400">No assistant data available.</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal Drawer */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 bg-[#0b0f19]/90 p-6 md:p-8 animate-scaleIn">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col text-left">
                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Publish Study Material
                </h3>
                <span className="text-xs text-slate-400 mt-1">Submit notes in PDF format. Auto-publishes for admins/mods.</span>
              </div>
              <button
                onClick={() => setUploadOpen(false)}
                className="p-1 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alert boxes */}
            {uploadError && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadSuccess && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs text-left">
                <PlusCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 text-left">
              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Calculus & Solved Integrals"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200 placeholder:text-slate-600"
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</label>
                <textarea
                  placeholder="Summarize the core topics covered, equations, chapter numbers, etc."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows="3"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200 placeholder:text-slate-600 resize-none"
                />
              </div>

              {/* Subject & Tags */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject Area</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200 cursor-pointer"
                  >
                    {subjects.slice(1).map(subj => (
                      <option key={subj} value={subj} className="bg-[#0b0f19] text-slate-200">{subj}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="Calculus, Integrals, Math"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200 placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Semester, RTU Course Code & Campus Block */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">RTU Sem</label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s} className="bg-[#0b0f19] text-slate-200">Sem {s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">RTU Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 3CS4-04"
                    value={newSyllabusCode}
                    onChange={(e) => setNewSyllabusCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200 placeholder:text-slate-600"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Campus Block</label>
                  <select
                    value={newCampusBlock}
                    onChange={(e) => setNewCampusBlock(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200 cursor-pointer"
                  >
                    <option className="bg-[#0b0f19] text-slate-200">A-Block (CSE/IT)</option>
                    <option className="bg-[#0b0f19] text-slate-200">B-Block (ECE/EE)</option>
                    <option className="bg-[#0b0f19] text-slate-200">C-Block (Civil/Mech)</option>
                    <option className="bg-[#0b0f19] text-slate-200">JECRC Node</option>
                  </select>
                </div>
              </div>

              {/* File Attachment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PDF Document File</label>
                <div className="relative border border-dashed border-white/10 hover:border-violet-500/40 rounded-xl p-4 bg-slate-950/20 text-center transition-colors cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Download className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />
                    <span className="text-xs font-bold text-slate-300">
                      {newFileName || 'Drag and drop or select file'}
                    </span>
                    <span className="text-[10px] text-slate-500">Only .pdf documents up to 25MB are accepted</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="flex-1 py-3 bg-slate-950 text-slate-400 border border-white/5 hover:bg-slate-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
