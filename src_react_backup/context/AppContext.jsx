import React, { createContext, useState, useEffect } from 'react';

/**
 * AppContext
 * The central state management hub for the TechVault frontend.
 * Provides global access to user data, content lists (notes, pyqs), 
 * and various operational methods (auth, bookmarks, uploads).
 */
export const AppContext = createContext();

// Backend API Base URL
const API_BASE = 'http://localhost:5000/api';

export const AppProvider = ({ children }) => {
  // --- Global State ---
  const [currentUser, setCurrentUser] = useState(null); // Currently logged in user object
  const [notes, setNotes] = useState([]);               // List of study notes (filtered for library)
  const [pyqs, setPyqs] = useState([]);                 // List of past year papers
  const [users, setUsers] = useState([]);               // List of all users (accessible by Admin only)
  const [adminStats, setAdminStats] = useState(null);   // Platform-wide statistics for the dashboard
  const [loading, setLoading] = useState(true);         // App-wide initialization loading state

  /**
   * Helper utility to construct consistent headers for fetch requests.
   * Automatically attaches JWT token from localStorage if present.
   */
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

  /**
   * Fetches published notes and merges with moderation queue for privileged users.
   */
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

      // If user is admin or moderator, we also fetch the 'pending' notes for the queue
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
            // Merge the lists to ensure admins see everything in one collection
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

  /**
   * Fetches the complete list of Past Year Questions.
   */
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

  /**
   * Admin only: Fetches all registered users for moderation purposes.
   */
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

  /**
   * Privileged users: Fetches dashboard analytics and stats.
   */
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

  /**
   * Session Initialization: Checks for an existing token and verifies it.
   * Runs exactly once when the AppProvider mounts.
   */
  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('tv_token');
      let userObj = null;
      if (token) {
        try {
          // Verify token by fetching the user's current profile
          const res = await fetch(`${API_BASE}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const json = await res.json();
            userObj = json.data.user;
            setCurrentUser(userObj);
          } else {
            // Token is likely invalid or expired; clear it
            localStorage.removeItem('tv_token');
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
        }
      }
      
      // Load public lists immediately
      await Promise.all([fetchNotes(userObj), fetchPYQs()]);
      setLoading(false);
    };

    initSession();
  }, []);

  /**
   * Reactively load privileged data when a user with proper roles logs in.
   */
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
      // Clear sensitive data on logout
      fetchNotes(null);
      setPyqs([]);
      setAdminStats(null);
    }
  }, [currentUser]);

  // --- Auth Operations ---

  const handleRegister = async (name, email, password, rollNumber = '', branch = '', semester = 1, campusBlock = '') => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, rollNumber, branch, semester, campusBlock })
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
    
    // Refresh content to include moderation rights if applicable
    fetchNotes(json.data.user);
    return json.data.user;
  };

  const handleLogout = () => {
    localStorage.removeItem('tv_token');
    setCurrentUser(null);
    setUsers([]);
    fetchNotes(null); // Reset visibility to public-only
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

  // --- Bookmark & Content Operations ---

  const toggleBookmark = async (noteId) => {
    const res = await fetch(`${API_BASE}/notes/${noteId}/bookmark`, {
      method: 'POST',
      headers: getHeaders()
    });

    if (res.ok) {
      const json = await res.json();
      // Sync bookmarks state on the local user object
      setCurrentUser(prev => prev ? { ...prev, bookmarks: json.data.bookmarks } : null);
    }
  };

  /**
   * Fetches AI-generated study aids (summary, flashcards, quiz) for a document.
   */
  const getAIAssistance = async (noteId) => {
    const res = await fetch(`${API_BASE}/ai/${noteId}`, {
      method: 'POST',
      headers: getHeaders()
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'AI Study Assistant failed to analyze the document.');
    return json.data; 
  };

  /**
   * Global Spotlight Search implementation.
   */
  const performSearch = async (query) => {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Search execution failed');
    return json.data; 
  };

  const getSearchSuggestions = async (query) => {
    const res = await fetch(`${API_BASE}/suggestions?q=${encodeURIComponent(query)}`, {
      headers: getHeaders()
    });
    const json = await res.json();
    if (!res.ok) return [];
    return json.data.suggestions || [];
  };

  /**
   * Handles binary file uploads to the backend server.
   */
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
    return json.data; // Returns metadata like fileName and URL
  };

  // --- Note Operations ---

  const uploadNote = async (title, description, subject, tags, fileName, fileUrl) => {
    const res = await fetch(`${API_BASE}/notes`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title, description, subject, tags, fileName, fileUrl })
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to upload note');

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

    fetchNotes();
  };

  // --- Moderation Operations ---

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
    
    // Log out if user disables their own account
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
