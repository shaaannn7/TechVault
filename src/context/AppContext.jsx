import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const API_BASE = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [pyqs, setPyqs] = useState([]);
  const [users, setUsers] = useState([]); // Loaded for admin only
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper for setting headers
  const getHeaders = (isJson = true) => {
    const token = localStorage.getItem('tv_token');
    const headers = {};
    if (isJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Fetch initial data
  const fetchNotes = async (user = currentUser) => {
    try {
      const res = await fetch(`${API_BASE}/notes?limit=50`, {
        headers: getHeaders()
      });
      let fetchedNotes = [];
      if (res.ok) {
        const json = await res.json();
        fetchedNotes = json.data.notes || [];
      }

      // If user is admin/moderator, fetch moderation queue and merge
      if (user && (user.role === 'admin' || user.role === 'moderator')) {
        try {
          const token = localStorage.getItem('tv_token');
          const modRes = await fetch(`${API_BASE}/admin/moderation-queue`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (modRes.ok) {
            const modJson = await modRes.json();
            const modNotes = modJson.data.notes || [];
            // Merge, avoiding duplicates
            const merged = [...fetchedNotes];
            modNotes.forEach(mn => {
              if (!merged.some(n => n._id === mn._id)) {
                merged.push(mn);
              }
            });
            setNotes(merged);
            return;
          }
        } catch (modErr) {
          console.error('Failed to fetch moderation queue:', modErr);
        }
      }

      setNotes(fetchedNotes);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const fetchPYQs = async () => {
    try {
      const res = await fetch(`${API_BASE}/pyqs`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        setPyqs(json.data.pyqs);
      }
    } catch (err) {
      console.error('Failed to fetch PYQs:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        setAdminStats(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    }
  };

  // Verify profile on startup
  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('tv_token');
      let userObj = null;
      if (token) {
        try {
          const res = await fetch(`${API_BASE}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const json = await res.json();
            userObj = json.data.user;
            setCurrentUser(userObj);
          } else {
            localStorage.removeItem('tv_token');
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
        }
      }
      
      // Load initial lists
      await Promise.all([fetchNotes(userObj), fetchPYQs()]);
      setLoading(false);
    };

    initSession();
  }, []);

  // Fetch queue/users/stats if admin/moderator logs in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        fetchUsers();
      }
      if (currentUser.role === 'admin' || currentUser.role === 'moderator') {
        fetchAdminStats();
      }
      fetchNotes(currentUser);
      fetchPYQs();
    } else {
      fetchNotes(null);
      setPyqs([]);
      setAdminStats(null);
    }
  }, [currentUser]);

  // Auth Operations
  const handleRegister = async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Registration failed');

    localStorage.setItem('tv_token', json.data.accessToken);
    setCurrentUser(json.data.user);
    return json.data.user;
  };

  const handleLogin = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Login failed');

    localStorage.setItem('tv_token', json.data.accessToken);
    setCurrentUser(json.data.user);
    
    // Refresh notes list (including moderation states if admin/moderator)
    fetchNotes(json.data.user);
    return json.data.user;
  };

  const handleLogout = () => {
    localStorage.removeItem('tv_token');
    setCurrentUser(null);
    setUsers([]);
    fetchNotes(null); // Re-fetch notes without user bookmarks
  };

  const updateProfile = async (name, avatar) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ name, avatar })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update profile');

    setCurrentUser(json.data.user);
    if (currentUser && currentUser.role === 'admin') {
      fetchUsers();
    }
  };

  // Bookmark Operations
  const toggleBookmark = async (noteId) => {
    const res = await fetch(`${API_BASE}/notes/${noteId}/bookmark`, {
      method: 'POST',
      headers: getHeaders()
    });

    if (res.ok) {
      const json = await res.json();
      setCurrentUser(prev => prev ? { ...prev, bookmarks: json.data.bookmarks } : null);
    }
  };

  const getAIAssistance = async (noteId) => {
    const res = await fetch(`${API_BASE}/ai/${noteId}`, {
      method: 'POST',
      headers: getHeaders()
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'AI Study Assistant failed to analyze the document.');
    return json.data; // { summary: string[], flashcards: Array, quiz: Array }
  };

  const performSearch = async (query) => {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Search execution failed');
    return json.data; // { notes: [], pyqs: [] }
  };

  const getSearchSuggestions = async (query) => {
    const res = await fetch(`${API_BASE}/suggestions?q=${encodeURIComponent(query)}`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) return [];
    return json.data.suggestions || [];
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('tv_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'File upload failed');
    return json.data; // { fileName, fileUrl, fileSize }
  };

  // Note Operations
  const uploadNote = async (title, description, subject, tags, fileName, fileUrl) => {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, description, subject, tags, fileName, fileUrl })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to upload note');

    // Reload note lists
    fetchNotes();
    return json.data.note;
  };

  const deleteNote = async (noteId) => {
    const res = await fetch(`${API_BASE}/notes/${noteId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete note');

    // Sync lists
    fetchNotes();
    if (currentUser) {
      setCurrentUser(prev => prev ? {
        ...prev,
        bookmarks: (prev.bookmarks || []).filter(bId => bId !== noteId)
      } : null);
    }
  };

  const trackDownload = async (noteId) => {
    try {
      // Fetch details triggers download count increments in MERN backend
      const res = await fetch(`${API_BASE}/notes/${noteId}`);
      if (res.ok) {
        fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addReview = async (noteId, rating, comment) => {
    const res = await fetch(`${API_BASE}/notes/${noteId}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ rating, comment })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to submit review');

    // Reload notes list
    fetchNotes();
  };

  const uploadPYQ = async (year, subject, university, difficultyLevel, fileName, fileUrl) => {
    const res = await fetch(`${API_BASE}/pyqs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ year, subject, university, difficultyLevel, fileName, fileUrl })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to upload past paper');

    fetchPYQs();
    return json.data.pyq;
  };

  const deletePYQ = async (pyqId) => {
    const res = await fetch(`${API_BASE}/pyqs/${pyqId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to delete paper');

    fetchPYQs();
  };

  const trackPYQDownload = async (pyqId) => {
    try {
      const res = await fetch(`${API_BASE}/pyqs/${pyqId}/download`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchPYQs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Moderation Operations
  const approveNote = async (noteId) => {
    const res = await fetch(`${API_BASE}/admin/notes/${noteId}/approve`, {
      method: 'POST',
      headers: getHeaders()
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to approve note');

    fetchNotes();
  };

  const rejectNote = async (noteId) => {
    const res = await fetch(`${API_BASE}/admin/notes/${noteId}/reject`, {
      method: 'POST',
      headers: getHeaders()
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to reject note');

    fetchNotes();
  };

  const updateUserRole = async (userId, role) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ role })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update role');

    fetchUsers();
  };

  const toggleUserStatus = async (userId) => {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/disable`, {
      method: 'PUT',
      headers: getHeaders()
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update account status');

    fetchUsers();
    
    // If current logged in user disabled themselves (handled by controller as blocked, but let's keep sync)
    if (currentUser && currentUser._id === userId) {
      handleLogout();
    }
  };

  return (
    <AppContext.Provider value={{
      users,
      notes,
      pyqs,
      currentUser,
      loading,
      handleRegister,
      handleLogin,
      handleLogout,
      updateProfile,
      toggleBookmark,
      getAIAssistance,
      performSearch,
      getSearchSuggestions,
      uploadFile,
      uploadNote,
      deleteNote,
      trackDownload,
      addReview,
      uploadPYQ,
      deletePYQ,
      trackPYQDownload,
      approveNote,
      rejectNote,
      updateUserRole,
      toggleUserStatus,
      adminStats,
      fetchAdminStats
    }}>
      {children}
    </AppContext.Provider>
  );
};
