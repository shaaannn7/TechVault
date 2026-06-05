import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import PDFViewer from '../components/PDFViewer';
import { Download, GraduationCap, Search, Filter, PlusCircle, X, ShieldAlert, Sparkles, CornerDownRight, Star, Loader2, ChevronLeft, ChevronRight, Award, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PYQs({ viewingPYQ, setViewingPYQ }) {
  const { pyqs, currentUser, uploadFile, uploadPYQ, trackPYQDownload, deletePYQ, getAIAssistance } = useContext(AppContext);

  // States
  const [universityFilter, setUniversityFilter] = useState('RTU (Rajasthan Technical University)');
  const [yearFilter, setYearFilter] = useState('All');

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
  }, [viewingPYQ]);

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

    if (!aiData || aiData.noteId !== viewingPYQ._id) {
      setAiLoading(true);
      setAiError('');
      try {
        const payload = await getAIAssistance(viewingPYQ._id);
        setAiData({ ...payload, noteId: viewingPYQ._id });
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
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Modals & view state
  const [uploadOpen, setUploadOpen] = useState(false);

  // Upload Form states
  const [upYear, setUpYear] = useState('2024');
  const [upSubject, setUpSubject] = useState('Computer Science');
  const [upUniversity, setUpUniversity] = useState('RTU (Rajasthan Technical University)');
  const [upDifficulty, setUpDifficulty] = useState('Medium');
  const [upFileName, setUpFileName] = useState('');
  const [upFile, setUpFile] = useState(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Dropdowns lists
  const universities = ['All', 'RTU (Rajasthan Technical University)', 'VTU', 'Mumbai University', 'Pune University', 'AKTU', 'Delhi University', 'Anna University', 'IP University', 'Other University'];
  const years = ['All', '2024', '2023', '2022', '2021', '2020'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const subjects = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Civil Engineering', 'Electronics Engineering', 'Mechanical Engineering', 'Electrical Engineering'];

  // Filter papers using useMemo to avoid performance lag during typing
  const filteredPYQs = React.useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    return pyqs.filter(paper => {
      const matchesSearch = !searchLower ||
                            paper.subject.toLowerCase().includes(searchLower) || 
                            paper.university.toLowerCase().includes(searchLower);
      const matchesUniversity = universityFilter === 'All' || paper.university === universityFilter;
      const matchesYear = yearFilter === 'All' || paper.year.toString() === yearFilter;
      const matchesDifficulty = difficultyFilter === 'All' || paper.difficultyLevel === difficultyFilter;

      return matchesSearch && matchesUniversity && matchesYear && matchesDifficulty;
    });
  }, [pyqs, search, universityFilter, yearFilter, difficultyFilter]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!upYear || !upFile) {
      setFormError('Please input a valid year and select a PDF file.');
      return;
    }

    const yearNum = parseInt(upYear);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2026) {
      setFormError('Please enter a valid year between 2000 and 2026.');
      return;
    }

    try {
      setFormSuccess('Uploading paper...');
      const uploadData = await uploadFile(upFile);
      
      setFormSuccess('Publishing exam paper...');
      await uploadPYQ(upYear, upSubject, upUniversity, upDifficulty, uploadData.fileName, uploadData.fileUrl);
      setFormSuccess('Previous Year Question paper uploaded successfully!');
      
      // Reset form
      setTimeout(() => {
        setUpYear('2024');
        setUpFileName('');
        setUpFile(null);
        setUploadOpen(false);
        setFormSuccess('');
      }, 1500);
    } catch (err) {
      setFormError(err.message || 'Failed to upload paper.');
      setFormSuccess('');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.endsWith('.pdf')) {
        setFormError('Only PDF files are supported.');
        setUpFileName('');
        setUpFile(null);
        return;
      }
      setUpFileName(file.name);
      setUpFile(file);
      setFormError('');
    }
  };

  const handleDownload = (paper) => {
    trackPYQDownload(paper._id);
    
    // Simulate real browser download
    const link = document.createElement('a');
    link.href = paper.fileUrl;
    link.setAttribute('download', paper.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6 text-slate-200">
      
      {!viewingPYQ ? (
        <div className="flex flex-col gap-6">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-extrabold tracking-widest text-violet-500 uppercase font-mono">Exam Archive</span>
              <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-100 tracking-tight">Previous Year Questions (PYQs)</h2>
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
              Upload Question Paper
            </button>
          </div>

          {/* Search bar & Filter selects */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-900/10 border border-white/5 p-4 rounded-2xl">
            {/* Search Input */}
            <div className="relative md:col-span-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200 placeholder:text-slate-600"
              />
            </div>

            {/* University Filter */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">University / Board</label>
              <select
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-300 outline-none cursor-pointer focus:border-violet-500"
              >
                {universities.map(u => (
                  <option key={u} value={u} className="bg-[#0b0f19] text-slate-200">{u}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Exam Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-300 outline-none cursor-pointer focus:border-violet-500"
              >
                {years.map(y => (
                  <option key={y} value={y} className="bg-[#0b0f19] text-slate-200">{y}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">Difficulty</label>
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 text-xs text-slate-300 outline-none cursor-pointer focus:border-violet-500"
              >
                {difficulties.map(d => (
                  <option key={d} value={d} className="bg-[#0b0f19] text-slate-200">{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid of papers */}
          {filteredPYQs.length === 0 ? (
            <div className="py-24 rounded-3xl border border-dashed border-white/5 text-center text-slate-500 flex flex-col items-center justify-center gap-4">
              <GraduationCap className="w-10 h-10 text-slate-600" />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold text-slate-400">No question papers match your filters</span>
                <span className="text-xs text-slate-600">Try adjusting your filters or expanding the search string.</span>
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
              {filteredPYQs.map(paper => (
                <motion.div 
                  key={paper._id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
                  }}
                  className="glass-card rounded-2xl p-5 border border-white/5 hover:border-white/10 hover:bg-slate-900/25 transition-all flex flex-col justify-between group text-left h-52"
                >
                  <div>
                    {/* Header Details */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
                        {paper.university}
                      </span>
                      
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        paper.difficultyLevel === 'Easy' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                        paper.difficultyLevel === 'Medium' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                        'bg-red-500/10 border border-red-500/20 text-red-400'
                      }`}>
                        {paper.difficultyLevel}
                      </span>
                    </div>

                    {/* Paper Title */}
                    <h3 className="text-sm font-extrabold text-slate-200 group-hover:text-violet-400 transition-colors mb-1">
                      {paper.subject} Exam Paper
                    </h3>
                    <span className="text-xs text-slate-500 font-bold block mb-4">Year: {paper.year}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4">
                    <span className="text-[10px] text-slate-500">Downloads: {paper.downloads}</span>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDownload(paper)}
                        className="p-1.5 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-slate-200"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setViewingPYQ(paper)}
                        className="text-xs font-bold text-slate-300 group-hover:text-violet-400 transition-colors flex items-center gap-1"
                      >
                        <span>Open Paper</span>
                        <CornerDownRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      ) : (
        /* Detailed paper view (incorporates simulated PDF reader) */
        <div className="flex flex-col gap-6 text-left">
          <div>
            <button
              onClick={() => setViewingPYQ(null)}
              className="text-xs font-bold text-violet-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              ← Back to Exam Papers
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Metadata left */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">
                    {viewingPYQ.university}
                  </span>
                  
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    viewingPYQ.difficultyLevel === 'Easy' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                    viewingPYQ.difficultyLevel === 'Medium' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                    'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {viewingPYQ.difficultyLevel}
                  </span>
                </div>

                <h1 className="text-xl font-bold uppercase text-slate-100 leading-snug">
                  {viewingPYQ.subject} ({viewingPYQ.year}) Question Sheet
                </h1>

                <div className="flex flex-col gap-2 text-xs border-t border-white/5 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Uploaded By</span>
                    <span className="text-slate-300 font-bold">{viewingPYQ.uploadedBy.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">File Name</span>
                    <span className="text-slate-300 font-semibold truncate max-w-[150px]" title={viewingPYQ.fileName}>
                      {viewingPYQ.fileName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Downloads</span>
                    <span className="text-slate-300 font-bold">{viewingPYQ.downloads}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDownload(viewingPYQ)}
                  className="w-full mt-2 py-3 bg-slate-900 hover:bg-slate-900/90 border border-white/5 hover:border-white/10 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-violet-400" />
                  Download Question Sheet
                </button>
              </div>
            </div>

            {/* PDF Viewer right: Interactive PDF Viewer & AI Assistant Sidebar */}
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
                    title={`${viewingPYQ.university} — ${viewingPYQ.subject} Exam (${viewingPYQ.year})`}
                    subject={viewingPYQ.subject}
                    author={viewingPYQ.uploadedBy.name}
                    fileUrl={viewingPYQ.fileUrl}
                    onDownload={() => handleDownload(viewingPYQ)}
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

      {/* Upload Question Paper Modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl relative border border-white/5 bg-[#0b0f19]/90 p-6 md:p-8 animate-scaleIn">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col text-left">
                <h3 className="text-xl font-bold uppercase tracking-tight text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Upload Exam Paper
                </h3>
                <span className="text-xs text-slate-400 mt-1">Submit past question papers in PDF format.</span>
              </div>
              <button
                onClick={() => setUploadOpen(false)}
                className="p-1 rounded-lg bg-slate-900 border border-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form alerts */}
            {formError && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-left">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs text-left">
                <PlusCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 text-left">
              {/* Grid 1: Year & Board */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Exam Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2024"
                    value={upYear}
                    onChange={(e) => setUpYear(e.target.value)}
                    min="2000"
                    max="2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">University / Institution</label>
                  <select
                    value={upUniversity}
                    onChange={(e) => setUpUniversity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200 cursor-pointer"
                  >
                    {universities.slice(1).map(u => (
                      <option key={u} value={u} className="bg-[#0b0f19] text-slate-200">{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Grid 2: Subject & Difficulty */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Subject Area</label>
                  <select
                    value={upSubject}
                    onChange={(e) => setUpSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200 cursor-pointer"
                  >
                    {subjects.map(s => (
                      <option key={s} value={s} className="bg-[#0b0f19] text-slate-200">{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Difficulty Level</label>
                  <select
                    value={upDifficulty}
                    onChange={(e) => setUpDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200 cursor-pointer"
                  >
                    {difficulties.slice(1).map(d => (
                      <option key={d} value={d} className="bg-[#0b0f19] text-slate-200">{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* PDF file selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PDF File</label>
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
                      {upFileName || 'Drag and drop or select file'}
                    </span>
                    <span className="text-[10px] text-slate-500">Only .pdf documents up to 25MB are accepted</span>
                  </div>
                </div>
              </div>

              {/* Confirm Actions */}
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
