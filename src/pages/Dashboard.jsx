import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { LayoutDashboard, Bookmark, CloudUpload, Settings, Trash2, ExternalLink, Calendar, Mail, Shield, Check, X, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import API_BASE_URL from '../config/api';

export default function Dashboard({ setActivePage, setViewingDoc }) {
  const { currentUser, notes, toggleBookmark, deleteNote, updateProfile } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');

  // Filter notes/pyqs uploaded by current user
  const userUploads = notes.filter(n => n.uploadedBy?.email === currentUser?.email || n.uploadedBy?._id === currentUser?._id);
  const userBookmarks = notes.filter(n => (currentUser?.bookmarks || []).includes(n._id));

  const renderUploadsImpactChart = () => {
    const data = userUploads.slice(0, 5); // display up to 5 uploads
    const hasData = data.length > 0;
    
    // Fallback data if user has no uploads
    const chartData = hasData 
      ? data.map(d => ({ title: d.title, value: d.downloads || 0 }))
      : [
          { title: 'Example DSA Guide', value: 45 },
          { title: 'Example Calculus Notes', value: 30 },
          { title: 'Example Physics Lab', value: 15 }
        ];

    const maxVal = Math.max(...chartData.map(d => d.value), 10);
    const height = 160;
    const width = 450;
    const paddingLeft = 30;
    const paddingRight = 10;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    const barWidth = Math.min(45, chartWidth / chartData.length - 15);

    return (
      <div className="relative w-full overflow-x-auto select-none">
        {!hasData && (
          <div className="absolute inset-0 bg-[#0b0f19]/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center p-6 text-center z-10 border border-white/5">
            <span className="text-[11px] font-bold text-violet-400 max-w-[200px]">
              Upload study notes to track downloads and real-time student impact metrics!
            </span>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[300px] h-auto">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio, idx) => {
            const y = paddingTop + (chartHeight * ratio);
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={idx} className="opacity-10">
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y + 3} fill="#ffffff" fontSize="8" textAnchor="end" fontFamily="monospace">{val}</text>
              </g>
            );
          })}

          {chartData.map((d, idx) => {
            const spacing = chartWidth / chartData.length;
            const x = paddingLeft + (idx * spacing) + (spacing - barWidth) / 2;
            const barHeight = (d.value / maxVal) * chartHeight;
            const y = paddingTop + chartHeight - barHeight;

            return (
              <g key={idx} className="group/bar cursor-pointer">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#barGrad)"
                  rx="4"
                  className="transition-all duration-300 hover:fill-blue-400"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="font-mono opacity-80"
                >
                  {d.value}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height - 12}
                  fill="#64748b"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="font-sans"
                >
                  {d.title.length > 10 ? d.title.substring(0, 10) + '..' : d.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderBookmarksDistribution = () => {
    const hasData = userBookmarks.length > 0;
    const subjectsMap = {};
    userBookmarks.forEach(n => {
      subjectsMap[n.subject] = (subjectsMap[n.subject] || 0) + 1;
    });

    const chartData = hasData
      ? Object.entries(subjectsMap).map(([subject, count]) => ({ subject, count }))
      : [
          { subject: 'Computer Science', count: 3 },
          { subject: 'Civil Engineering', count: 2 },
          { subject: 'Mathematics', count: 1 }
        ];

    const total = chartData.reduce((sum, item) => sum + item.count, 0) || 1;
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    return (
      <div className="flex flex-col gap-4 py-1.5 relative w-full">
        {!hasData && (
          <div className="absolute inset-0 bg-[#0b0f19]/70 backdrop-blur-[1px] rounded-xl flex items-center justify-center p-6 text-center z-10 border border-white/5">
            <span className="text-[11px] font-bold text-violet-400 max-w-[200px]">
              Bookmark files in Notes library to track bookmarked subject weights!
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {chartData.map((item, idx) => {
            const pct = Math.round((item.count / total) * 100);
            const color = colors[idx % colors.length];

            return (
              <div key={idx} className="flex flex-col gap-1.5 text-xs text-left">
                <div className="flex justify-between font-semibold text-slate-300">
                  <span className="truncate max-w-[150px]">{item.subject}</span>
                  <span className="text-slate-500 font-mono">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 animate-pulse-slow">
                  <div
                    style={{ width: `${pct}%`, backgroundColor: color }}
                    className="h-full rounded-full transition-all duration-500"
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Edit profile states
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState(currentUser?.name || '');
  const [newAvatar, setNewAvatar] = useState(currentUser?.avatar || '');
  const [newRollNumber, setNewRollNumber] = useState(currentUser?.rollNumber || '');
  const [newBranch, setNewBranch] = useState(currentUser?.branch || 'Computer Science');
  const [newSemester, setNewSemester] = useState(currentUser?.semester || 1);
  const [newCampusBlock, setNewCampusBlock] = useState(currentUser?.campusBlock || 'A-Block (CSE/IT Department)');

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
          <Shield className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold uppercase tracking-tight text-slate-100">Access Restricted</h2>
          <p className="text-sm text-slate-400 max-w-sm">Please log in to your account to view your dashboard, bookmarks, and uploads.</p>
        </div>
        <button
          onClick={() => setActivePage('auth')}
          className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-bold rounded-xl transition-all"
        >
          Sign In Now
        </button>
      </div>
    );
  }


  const handleProfileSave = (e) => {
    e.preventDefault();
    if (newName.trim()) {
      updateProfile(newName.trim(), newAvatar, newRollNumber, newBranch, newSemester, newCampusBlock);
      setEditMode(false);
    }
  };

  const handleAvatarChange = (gender) => {
    const seed = Math.floor(Math.random() * 1000);
    const api = gender === 'bot' 
      ? `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`
      : `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
    setNewAvatar(api);
  };

  const handleDocClick = (doc) => {
    setViewingDoc(doc);
    setActivePage('notes'); // Trigger notes page details
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 text-slate-200">
      
      {/* Profile Summary Card */}
      <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[80px] pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full">
          <div className="relative group">
            <img 
              src={editMode ? newAvatar : currentUser.avatar} 
              alt={currentUser.name} 
              className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-white/10 shadow-lg"
            />
            {editMode && (
              <div className="flex gap-1 mt-2 justify-center">
                <button 
                  type="button" 
                  onClick={() => handleAvatarChange('human')}
                  className="px-1.5 py-0.5 bg-slate-900 border border-white/10 hover:border-violet-500 rounded text-[9px] text-slate-300"
                >
                  Human
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAvatarChange('bot')}
                  className="px-1.5 py-0.5 bg-slate-900 border border-white/10 hover:border-violet-500 rounded text-[9px] text-slate-300"
                >
                  Robot
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1 w-full sm:w-auto">
            {editMode ? (
              <form onSubmit={handleProfileSave} className="flex flex-col gap-4 mt-2 w-full max-w-lg text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-950/60 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Roll Number</label>
                    <input
                      type="text"
                      value={newRollNumber}
                      onChange={(e) => setNewRollNumber(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-950/60 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200"
                      placeholder="e.g. 23EJCAC124"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Branch</label>
                    <select
                      value={newBranch}
                      onChange={(e) => setNewBranch(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-950/60 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200"
                    >
                      <option className="bg-[#0a0f1a]">Computer Science</option>
                      <option className="bg-[#0a0f1a]">Electronics Engineering</option>
                      <option className="bg-[#0a0f1a]">Civil Engineering</option>
                      <option className="bg-[#0a0f1a]">Mechanical Engineering</option>
                      <option className="bg-[#0a0f1a]">Electrical Engineering</option>
                      <option className="bg-[#0a0f1a]">Mathematics</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Semester</label>
                    <select
                      value={newSemester}
                      onChange={(e) => setNewSemester(parseInt(e.target.value))}
                      className="px-3 py-2 rounded-lg bg-slate-950/60 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s} className="bg-[#0a0f1a]">Sem {s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campus Block</label>
                    <select
                      value={newCampusBlock}
                      onChange={(e) => setNewCampusBlock(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-950/60 border border-white/5 focus:border-violet-500 text-xs outline-none text-slate-200"
                    >
                      <option className="bg-[#0a0f1a]">A-Block (CSE/IT Department)</option>
                      <option className="bg-[#0a0f1a]">B-Block (ECE/EE Department)</option>
                      <option className="bg-[#0a0f1a]">C-Block (Civil/Mech/Main Block)</option>
                      <option className="bg-[#0a0f1a]">JECRC Foundation Campus Node</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-start mt-1">
                  <button
                    type="submit"
                    className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-500 hover:from-violet-500 hover:to-indigo-400 rounded-lg text-xs font-bold text-white shadow-lg cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditMode(false);
                      setNewName(currentUser.name);
                      setNewAvatar(currentUser.avatar);
                      setNewRollNumber(currentUser.rollNumber || '');
                      setNewBranch(currentUser.branch || 'Computer Science');
                      setNewSemester(currentUser.semester || 1);
                      setNewCampusBlock(currentUser.campusBlock || 'A-Block (CSE/IT Department)');
                    }}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-900 border border-white/5 hover:border-white/10 rounded-lg text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-1 items-center sm:items-start">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-100">{currentUser.name}</h2>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                    {currentUser.role}
                  </span>
                </div>
                {currentUser.rollNumber && (
                  <div className="text-xs text-slate-400 flex flex-wrap gap-x-2 gap-y-1 justify-center sm:justify-start items-center">
                    <span className="font-semibold text-slate-300">Roll: {currentUser.rollNumber}</span>
                    <span className="text-slate-600">•</span>
                    <span>{currentUser.branch}</span>
                    <span className="text-slate-600">•</span>
                    <span>Sem {currentUser.semester}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-violet-400 font-medium">{currentUser.campusBlock}</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-400 mt-1">
              <div className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Joined {new Date(currentUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer text-slate-300 hover:text-white"
          >
            <Settings className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 gap-2 md:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-colors shrink-0 ${
            activeTab === 'overview' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Workspace Overview
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-colors shrink-0 ${
            activeTab === 'bookmarks' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          My Bookmarks ({userBookmarks.length})
        </button>

        <button
          onClick={() => setActiveTab('uploads')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-colors shrink-0 ${
            activeTab === 'uploads' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CloudUpload className="w-4 h-4" />
          My Uploads ({userUploads.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="w-full">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex flex-col gap-6 text-left"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-1">Bookmarked Notes</span>
                <span className="text-2xl font-black text-slate-100">{userBookmarks.length}</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-1">My Uploaded Documents</span>
                <span className="text-2xl font-black text-slate-100">{userUploads.length}</span>
              </div>
              <div className="glass-card rounded-2xl p-5 border border-white/5">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest block mb-1">Platform Account Standing</span>
                <span className="text-2xl font-black text-emerald-400">Excellent</span>
            </div>
            </div>

            {/* RTU 1st Year Syllabus Reference Card */}
            <div className="glass-card rounded-2xl p-6 border border-violet-500/20 bg-gradient-to-r from-violet-950/20 to-blue-950/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
              <div className="flex items-center gap-4">
                <div className="p-3.5 rounded-2xl bg-violet-600/10 text-violet-400 border border-violet-500/25">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-base font-extrabold text-slate-100">RTU 1st Year Common Syllabus</h4>
                  <p className="text-xs text-slate-400 max-w-md">Download the official Rajasthan Technical University curriculum syllabus guidelines common for all engineering branches.</p>
                </div>
              </div>
              <a 
                href={`${API_BASE_URL}/uploads/rtu_1st_year_syllabus.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-500 hover:to-blue-400 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Download Syllabus (PDF)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Upload Impact Chart */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest block">My Upload Impact (Downloads)</span>
                {renderUploadsImpactChart()}
              </div>

              {/* Bookmark Distribution Chart */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest block">Saved Materials Breakdown</span>
                {renderBookmarksDistribution()}
              </div>
            </div>

            {/* Recent Bookmarks */}
            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-lg font-bold text-slate-200 uppercase tracking-tight">Recently Bookmarked</h3>
              {userBookmarks.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-white/5 text-center text-slate-500 text-xs">
                  No bookmarked items. Navigate to the Notes Library to bookmark study materials.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userBookmarks.slice(0, 4).map(note => (
                    <div 
                      key={note._id}
                      onClick={() => handleDocClick(note)}
                      className="glass-card rounded-xl p-4 border border-white/5 hover:border-violet-500/30 hover:bg-slate-900/20 transition-all flex justify-between items-center cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-violet-600/10 text-violet-400 border border-violet-500/20 group-hover:scale-105 transition-transform">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-1">{note.title}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{note.subject}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-violet-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Bookmarks Tab */}
        {activeTab === 'bookmarks' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full text-left flex flex-col gap-4"
          >
            {userBookmarks.length === 0 ? (
              <div className="py-20 rounded-2xl border border-dashed border-white/5 text-center text-slate-500 flex flex-col items-center gap-4 justify-center">
                <Bookmark className="w-8 h-8 text-slate-600" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-400">Your bookmark shelf is empty</span>
                  <span className="text-xs text-slate-500">Collect and save structural engineering notes or calculus guides.</span>
                </div>
                <button
                  onClick={() => setActivePage('notes')}
                  className="px-5 py-2 mt-2 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 font-bold text-xs rounded-xl border border-violet-500/25"
                >
                  Browse Library
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userBookmarks.map(note => (
                  <div 
                    key={note._id}
                    className="glass-card rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-extrabold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                          {note.subject}
                        </span>
                        <button
                          onClick={() => toggleBookmark(note._id)}
                          className="p-1 rounded bg-slate-900 border border-white/5 text-violet-400 hover:text-slate-400"
                          title="Remove bookmark"
                        >
                          <Bookmark className="w-3.5 h-3.5 fill-current" />
                        </button>
                      </div>

                      <h4 
                        onClick={() => handleDocClick(note)}
                        className="text-sm font-bold text-slate-200 hover:text-violet-400 transition-colors cursor-pointer line-clamp-1 mb-2 text-left"
                      >
                        {note.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 leading-relaxed text-left line-clamp-2 mb-6">
                        {note.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                      <span className="text-[10px] text-slate-500">Downloads: {note.downloads}</span>
                      <button
                        onClick={() => handleDocClick(note)}
                        className="flex items-center gap-1 text-[10px] font-bold text-violet-400 hover:underline"
                      >
                        <span>Open Doc</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Uploads Tab */}
        {activeTab === 'uploads' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full text-left"
          >
            {userUploads.length === 0 ? (
              <div className="py-20 rounded-2xl border border-dashed border-white/5 text-center text-slate-500 flex flex-col items-center gap-4 justify-center">
                <CloudUpload className="w-8 h-8 text-slate-600" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-400">No uploads found</span>
                  <span className="text-xs text-slate-500">Contribute by sharing course sheets, cheatsheets, or exam papers.</span>
                </div>
                <button
                  onClick={() => setActivePage('notes')}
                  className="px-5 py-2 mt-2 bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 font-bold text-xs rounded-xl border border-violet-500/25"
                >
                  Upload Your First Note
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto w-full glass-card border border-white/5 rounded-2xl">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 font-bold">
                      <th className="p-4">Title</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Size</th>
                      <th className="p-4">Date Uploaded</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userUploads.map(note => (
                      <tr key={note._id} className="border-b border-white/5 hover:bg-slate-900/10">
                        <td className="p-4">
                          <span 
                            onClick={() => note.isPublished && handleDocClick(note)}
                            className={`font-bold text-slate-200 ${note.isPublished ? 'hover:text-violet-400 hover:underline cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                          >
                            {note.title}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-0.5">{note.fileName}</span>
                        </td>
                        <td className="p-4 text-slate-400">{note.subject}</td>
                        <td className="p-4 text-slate-400">{(note.fileSize / 1024 / 1024).toFixed(2)} MB</td>
                        <td className="p-4 text-slate-400">{new Date(note.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          {note.isPublished ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-amber-500/10 border border-amber-500/20 text-amber-400" title="Awaiting moderator review">
                              Pending Review
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => deleteNote(note._id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
