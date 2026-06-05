import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Shield, Users, CheckSquare, BarChart3, Check, X, ShieldCheck, UserMinus, UserCheck, RefreshCw, FileText } from 'lucide-react';

export default function Admin({ setActivePage, setViewingDoc }) {
  const { currentUser, users, notes, pyqs, approveNote, rejectNote, updateUserRole, toggleUserStatus, adminStats } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('queue');

  // Verify access privileges
  const isAuthorized = currentUser && (currentUser.role === 'admin' || currentUser.role === 'moderator');
  const isAdmin = currentUser && currentUser.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full">
          <Shield className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold uppercase tracking-tight text-slate-100">Restricted Panel</h2>
          <p className="text-sm text-slate-400 max-w-sm">You do not have administrative or moderation permissions to access this screen.</p>
        </div>
        <button
          onClick={() => setActivePage('landing')}
          className="px-6 py-2.5 bg-slate-900 border border-white/5 text-slate-300 text-sm font-bold rounded-xl transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Filter notes pending moderation (isPublished = false)
  const pendingNotes = notes.filter(n => !n.isPublished);

  // Fallback stats resolution if API hasn't loaded
  const stats = adminStats || {
    totalUsers: users.length,
    totalNotes: notes.length,
    publishedNotes: notes.filter(n => n.isPublished).length,
    pendingNotes: pendingNotes.length,
    totalPYQs: pyqs.length,
    totalDownloads: notes.reduce((sum, n) => sum + (n.downloads || 0), 0) + pyqs.reduce((sum, p) => sum + (p.downloads || 0), 0),
    subjectDistribution: Object.entries(
      notes.reduce((acc, note) => {
        acc[note.subject] = (acc[note.subject] || 0) + 1;
        return acc;
      }, {})
    ).map(([subject, count]) => ({ subject, count })),
    downloadHistory: [
      { day: 'Mon', downloads: 20, uploads: 1 },
      { day: 'Tue', downloads: 30, uploads: 2 },
      { day: 'Wed', downloads: 40, uploads: 4 },
      { day: 'Thu', downloads: 35, uploads: 1 },
      { day: 'Fri', downloads: 50, uploads: 3 },
      { day: 'Sat', downloads: 15, uploads: 0 },
      { day: 'Sun', downloads: 10, uploads: 1 }
    ],
    activityFeed: notes.slice(-3).map(n => ({
      _id: n._id,
      userName: n.uploadedBy?.name || 'Academic Board',
      userAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${n.uploadedBy?.name || 'Board'}`,
      action: 'uploaded note',
      targetName: n.title,
      time: 'Recently'
    }))
  };

  const renderDonutChart = () => {
    const data = stats.subjectDistribution || [];
    const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
    let accumulatedPercent = 0;
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

    return (
      <div className="flex flex-col sm:flex-row items-center gap-8 py-4 justify-center">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
            {data.map((item, idx) => {
              const percent = item.count / total;
              const dashArray = `${percent * 314.159} 314.159`;
              const dashOffset = 314.159 - (accumulatedPercent * 314.159);
              accumulatedPercent += percent;
              const color = colors[idx % colors.length];

              return (
                <circle
                  key={idx}
                  cx="80"
                  cy="80"
                  r="50"
                  fill="transparent"
                  stroke={color}
                  strokeWidth="18"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-500 hover:stroke-[22] cursor-pointer"
                  title={`${item.subject}: ${item.count} items`}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-black text-slate-100">{total}</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Total Files</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 text-xs text-left">
          {data.map((item, idx) => {
            const color = colors[idx % colors.length];
            const pct = Math.round((item.count / total) * 100);
            return (
              <div key={idx} className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: color }}></div>
                <span className="font-semibold text-slate-300 text-left">{item.subject}</span>
                <span className="text-slate-500 font-mono">({item.count} - {pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAreaChart = () => {
    const history = stats.downloadHistory || [];
    if (history.length === 0) return null;

    const maxVal = Math.max(...history.map(h => h.downloads), 20);
    const height = 180;
    const width = 500;
    const paddingLeft = 45;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const points = history.map((h, idx) => {
      const x = paddingLeft + (idx * (chartWidth / (history.length - 1)));
      const y = paddingTop + chartHeight - ((h.downloads / maxVal) * chartHeight);
      return { x, y, day: h.day, downloads: h.downloads, uploads: h.uploads };
    });

    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = points.length > 0 
      ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z` 
      : '';

    return (
      <div className="w-full overflow-x-auto select-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[350px] h-auto">
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + (chartHeight * ratio);
            const val = Math.round(maxVal * (1 - ratio));
            return (
              <g key={idx} className="opacity-10">
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y + 3} fill="#ffffff" fontSize="9" textAnchor="end" fontFamily="monospace">{val}</text>
              </g>
            );
          })}

          {areaPath && <path d={areaPath} fill="url(#areaGrad)" />}
          {linePath && <path d={linePath} stroke="#8b5cf6" strokeWidth="2.5" fill="none" strokeLinecap="round" />}

          {points.map((p, idx) => (
            <g key={idx} className="group/dot cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4.5"
                fill="#8b5cf6"
                stroke="#0b0f19"
                strokeWidth="1.5"
                className="transition-all duration-150 group-hover/dot:r-6 group-hover/dot:fill-violet-400"
              />
              <rect
                x={p.x - 30}
                y={p.y - 30}
                width="60"
                height="20"
                rx="6"
                fill="#0f172a"
                stroke="#8b5cf6"
                strokeWidth="1"
                className="opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none"
              />
              <text
                x={p.x}
                y={p.y - 17}
                fill="#ffffff"
                fontSize="8"
                fontWeight="bold"
                textAnchor="middle"
                className="opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none font-mono"
              >
                {p.downloads} DLs
              </text>
              <text
                x={p.x}
                y={height - 10}
                fill="#64748b"
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                className="font-sans"
              >
                {p.day}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const handleApprove = (noteId) => {
    approveNote(noteId);
  };

  const handleReject = (noteId) => {
    if (window.confirm('Are you sure you want to reject and delete this submission?')) {
      rejectNote(noteId);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    updateUserRole(userId, newRole);
  };

  const handleStatusToggle = (userId) => {
    toggleUserStatus(userId);
  };

  const handlePreview = (note) => {
    setViewingDoc(note);
    setActivePage('notes');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8 text-slate-200">
      
      {/* Header Banner */}
      <div className="flex flex-col text-left border-b border-white/5 pb-6">
        <span className="text-[10px] font-extrabold tracking-widest text-violet-500 uppercase font-mono">Administrative Center</span>
        <h2 className="text-2xl md:text-3xl font-black uppercase text-slate-100 tracking-tight flex items-center gap-2">
          Moderation & Management Control
        </h2>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-white/5 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-slate-100">{stats.totalUsers}</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Moderation</span>
            <CheckSquare className="w-4 h-4 text-amber-400" />
          </div>
          <span className={`text-2xl font-black ${stats.pendingNotes > 0 ? 'text-amber-400' : 'text-slate-100'}`}>
            {stats.pendingNotes}
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Archive</span>
            <FileText className="w-4 h-4 text-violet-400" />
          </div>
          <span className="text-2xl font-black text-slate-100">{stats.totalNotes + stats.totalPYQs}</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Accumulated Downloads</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-slate-100">{stats.totalDownloads}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-2 md:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-colors shrink-0 ${
            activeTab === 'queue' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Moderation Queue ({pendingNotes.length})
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-colors shrink-0 ${
              activeTab === 'users' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            User Management ({users.length})
          </button>
        )}

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold tracking-wide border-b-2 transition-colors shrink-0 ${
            activeTab === 'analytics' ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Subject Analytics
        </button>
      </div>

      {/* Content Panels */}
      <div className="w-full text-left">
        {/* Moderation Queue */}
        {activeTab === 'queue' && (
          <div className="w-full">
            {pendingNotes.length === 0 ? (
              <div className="py-20 rounded-2xl border border-dashed border-white/5 text-center text-slate-500 flex flex-col items-center gap-4 justify-center bg-slate-900/5">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-slate-400 font-mono uppercase">Queue Cleared!</span>
                  <span className="text-xs text-slate-600">All submitted study notes have been reviewed and published.</span>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto w-full glass-card border border-white/5 rounded-2xl">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 font-bold">
                      <th className="p-4">Submission Details</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Submitted By</th>
                      <th className="p-4">Uploaded File</th>
                      <th className="p-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingNotes.map(note => (
                      <tr key={note._id} className="border-b border-white/5 hover:bg-slate-900/10">
                        <td className="p-4">
                          <span 
                            onClick={() => handlePreview(note)}
                            className="font-bold text-slate-200 hover:text-violet-400 cursor-pointer hover:underline"
                          >
                            {note.title}
                          </span>
                          <span className="block text-[10px] text-slate-500 mt-1 line-clamp-1 max-w-sm">{note.description}</span>
                        </td>
                        <td className="p-4 text-slate-400">{note.subject}</td>
                        <td className="p-4 text-slate-400">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-300">{note.uploadedBy.name}</span>
                            <span className="text-[10px] text-slate-500 mt-0.5">{note.uploadedBy.email}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-400">
                          <span className="font-semibold block">{note.fileName}</span>
                          <span className="text-[10px] text-slate-500">{(note.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(note._id)}
                              className="p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                              title="Approve & Publish"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReject(note._id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition-all cursor-pointer"
                              title="Reject & Delete"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* User Management */}
        {activeTab === 'users' && isAdmin && (
          <div className="w-full">
            <div className="overflow-x-auto w-full glass-card border border-white/5 rounded-2xl">
              <table className="w-full border-collapse text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 font-bold">
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">User Role</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} className="border-b border-white/5 hover:bg-slate-900/10">
                      <td className="p-4">
                        <div className="flex items-center gap-3.5">
                          <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-lg bg-slate-800 border border-white/5" />
                          <span className="font-bold text-slate-200">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">{u.email}</td>
                      <td className="p-4 text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          disabled={u._id === currentUser._id} // Cannot change own role
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="px-2 py-1 rounded bg-slate-950 border border-white/5 text-slate-300 text-xs outline-none cursor-pointer focus:border-violet-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <option value="user" className="bg-[#0b0f19]">user</option>
                          <option value="moderator" className="bg-[#0b0f19]">moderator</option>
                          <option value="admin" className="bg-[#0b0f19]">admin</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.isActive 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/10 border border-red-500/20 text-red-400'
                        }`}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleStatusToggle(u._id)}
                          disabled={u._id === currentUser._id} // Cannot disable own self
                          className={`p-2 rounded-lg border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                            u.isActive
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          }`}
                          title={u.isActive ? 'Disable Account' : 'Enable Account'}
                        >
                          {u.isActive ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Subject Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Subject Distribution Donut */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-6 lg:col-span-1">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tight">Resource Classification</h3>
              {renderDonutChart()}
            </div>

            {/* Platform Growth Line Chart */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-6 lg:col-span-1">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tight">7-Day Download Activity</h3>
              <div className="my-auto">
                {renderAreaChart()}
              </div>
            </div>

            {/* Platform Recent activity logs */}
            <div className="glass-card rounded-2xl p-6 border border-white/5 flex flex-col gap-6 lg:col-span-1 text-left">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-tight">Recent Platform Activity</h3>
              <div className="flex flex-col gap-4 overflow-y-auto max-h-64 pr-1">
                {stats.activityFeed && stats.activityFeed.length > 0 ? (
                  stats.activityFeed.map((activity, idx) => (
                    <div key={idx} className="flex gap-3 items-start border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                      <img src={activity.userAvatar} alt={activity.userName} className="w-8 h-8 rounded-lg border border-white/5 shrink-0 bg-slate-800" />
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        <span className="font-bold text-slate-200">{activity.userName}</span>
                        <span className="text-slate-400">{activity.action} <span className="text-violet-400 font-semibold">"{activity.targetName}"</span></span>
                        <span className="text-[9px] text-slate-600 mt-0.5">{activity.time === 'Recently' ? 'Just now' : new Date(activity.time).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-500">No activity recorded today.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
