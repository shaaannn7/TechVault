/**
 * ==========================================================================
 *  TECHVAULT CLIENT APPLICATION LOGIC (app.js)
 *  
 *  Architecture: Vanilla Single Page Application (SPA).
 *  Core Mechanics:
 *    1. State Management: Keeping track of variables in JS memory.
 *    2. SPA Router: Hiding/showing DOM sections based on navigation.
 *    3. API Integration: communicating with Express backend using `fetch`.
 *    4. DOM Rendering: Constructing dynamic HTML strings and injecting them.
 *    5. Interactive Overlays: Opening modals, controlling sliders, flipping cards.
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. GLOBAL STATE & CONFIGURATIONS
// --------------------------------------------------------------------------

// Root URL of our backend API service running on port 5000
const API_BASE = 'http://localhost:5000/api';

// Core dynamic parameters kept in memory to track current session state
let currentUser = null;          // Holds the logged-in User profile object (name, email, role, bookmarks)
let notes = [];                  // Cached list of all notes loaded from the server
let pyqs = [];                   // Cached list of all PYQs loaded from the server
let activePage = 'landing';      // Tracks which SPA page section is currently visible
let activeDashboardTab = 'overview'; // Tracks which sub-tab is open inside the User Dashboard

// Context variables for the note/paper currently open in the detail view
let viewingDoc = null;
let viewingPYQ = null;

// AI Study Assistant state parameters for dynamic render trackers
let aiData = null;               // Stores the generated AI payload (summary, flashcards, quiz options)
let activeAiTab = 'summary';     // Current sub-view in the AI drawer ('summary' | 'flashcards' | 'quiz')
let currentCardIdx = 0;          // Index of the currently active study flashcard
let currentQuizIdx = 0;          // Index of the active multiple choice quiz question
let quizScore = 0;               // Accumulator score for active user quiz attempts

// Static catalog criteria lists used to populate drop-down select options
const subjects = [
  'All', 
  'Computer Science', 
  'Mathematics', 
  'Physics', 
  'Chemistry', 
  'Civil Engineering', 
  'Electronics Engineering', 
  'Mechanical Engineering', 
  'Electrical Engineering'
];

const universities = [
  'All', 
  'RTU (Rajasthan Technical University)', 
  'VTU', 
  'Mumbai University', 
  'Pune University', 
  'AKTU', 
  'Delhi University', 
  'Anna University', 
  'IP University', 
  'Other University'
];

const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

// --------------------------------------------------------------------------
// 2. HTTP COMMUNICATIONS UTILITIES (FETCH HEADERS)
// --------------------------------------------------------------------------

/**
 * Builds HTTP headers to send requests to our API.
 * Handles JSON content declarations and automatically appends the JWT security
 * token from localStorage if the user has an active session.
 */
function getHeaders(contentTypeJson = true) {
  const headers = {};
  if (contentTypeJson) {
    headers['Content-Type'] = 'application/json';
  }
  
  // Retrieve token string saved during login/registration
  const token = localStorage.getItem('tv_token');
  if (token) {
    // Standard format for sending authorization tokens
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// --------------------------------------------------------------------------
// 3. SPA ROUTING ENGINE
// --------------------------------------------------------------------------

/**
 * Hides all pages and renders the selected page section.
 * Controls page-specific loaders, navigation styling, and route filters.
 */
function navigateTo(targetPage) {
  // --- AUTH GUARD ROUTING FILTER ---
  // If the page requires login but the user is not authenticated, redirect to sign-in
  const protectedPages = ['notes', 'pyqs', 'dashboard', 'admin'];
  if (protectedPages.includes(targetPage) && !currentUser) {
    navigateTo('auth');
    return;
  }

  activePage = targetPage;
  
  // Hide all sections in index.html (remove class 'active')
  document.querySelectorAll('.page-section').forEach(sec => {
    sec.classList.remove('active');
  });

  // Display targeted section (add class 'active')
  const sectionId = `sec-${targetPage}`;
  const targetSec = document.getElementById(sectionId);
  if (targetSec) {
    targetSec.classList.add('active');
  }

  // Highlight the active link pill in the header navigation menu
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-target') === targetPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Reset the viewing cache if navigation exits the detail viewer
  if (targetPage !== 'document-detail') {
    viewingDoc = null;
    viewingPYQ = null;
  }

  // Reload or render list data when switching pages
  if (targetPage === 'notes') {
    renderNotesGrid();
  } else if (targetPage === 'pyqs') {
    renderPYQsGrid();
  } else if (targetPage === 'dashboard') {
    switchDashboardTab(activeDashboardTab);
  } else if (targetPage === 'admin') {
    loadAdminDashboard();
  }

  // Scroll viewport back to top with animation
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --------------------------------------------------------------------------
// 4. SESSION MANAGEMENT & REGISTRATION FLOWS
// --------------------------------------------------------------------------

/**
 * Runs on website load. Checks for existing JWT auth keys inside local storage
 * and fetches the corresponding profile to restore sessions automatically.
 */
async function checkAuthSession() {
  const token = localStorage.getItem('tv_token');
  if (token) {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        currentUser = json.data.user; // Set session user
        syncNavProfile();
      } else {
        localStorage.removeItem('tv_token'); // Token invalid or expired
      }
    } catch (err) {
      console.error('Session check failed:', err);
    }
  }
  
  // Load initial list data from backend API
  await Promise.all([fetchNotes(), fetchPYQs()]);
  
  // Direct route to the Landing page on start
  navigateTo('landing');
  lucide.createIcons(); // Initialize Lucide SVG Icons in DOM
}

/**
 * API: Fetches notes list
 */
async function fetchNotes() {
  try {
    const res = await fetch(`${API_BASE}/notes?limit=50`, {
      headers: getHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      notes = json.data.notes || [];
    }
  } catch (err) {
    console.error('Failed notes loading:', err);
  }
}

/**
 * API: Fetches PYQs list
 */
async function fetchPYQs() {
  try {
    const res = await fetch(`${API_BASE}/pyqs`, {
      headers: getHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      pyqs = json.data.pyqs || [];
    }
  } catch (err) {
    console.error('Failed PYQs loading:', err);
  }
}

/**
 * Updates UI headers. Shows/hides Login button or Profile avatar based on session.
 */
function syncNavProfile() {
  const btnLogin = document.getElementById('btn-login-nav');
  const profileArea = document.getElementById('profile-nav-area');
  const imgAvatar = document.getElementById('img-nav-avatar');
  const linkDashboard = document.getElementById('link-dashboard');
  const linkAdmin = document.getElementById('link-admin');

  if (currentUser) {
    btnLogin.style.display = 'none';
    profileArea.style.display = 'flex';
    imgAvatar.src = currentUser.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user';
    linkDashboard.style.display = 'inline-block';
    
    // Check role levels for Admin panel button visibility
    if (currentUser.role === 'admin' || currentUser.role === 'moderator') {
      linkAdmin.style.display = 'inline-block';
    } else {
      linkAdmin.style.display = 'none';
    }
  } else {
    btnLogin.style.display = 'inline-block';
    profileArea.style.display = 'none';
    linkDashboard.style.display = 'none';
    linkAdmin.style.display = 'none';
  }
}

// --------------------------------------------------------------------------
// 5. NOTES PAGE INTERACTION
// --------------------------------------------------------------------------

let currentNotesSubject = 'All'; // Track active domain tab index filter
let currentNotesSemester = 'All'; // Track active semester filter (1 to 8)

/**
 * Filter note items locally in browser memory and render inside the DOM grid.
 * Avoids redundant server hits and provides instantaneous search feedback.
 */
function renderNotesGrid() {
  const grid = document.getElementById('notes-grid');
  const searchInput = document.getElementById('notes-search-input');
  const query = searchInput.value.toLowerCase().trim();

  // 1. Filter out only published documents
  const published = notes.filter(n => n.isPublished);
  
  // 2. Match filters and query
  const filtered = published.filter(note => {
    const matchesSearch = !query ||
      note.title.toLowerCase().includes(query) ||
      note.description.toLowerCase().includes(query) ||
      note.tags.some(t => t.toLowerCase().includes(query)) ||
      (note.syllabusCode && note.syllabusCode.toLowerCase().includes(query));
    
    const matchesSubject = currentNotesSubject === 'All' || note.subject === currentNotesSubject;
    const matchesSemester = currentNotesSemester === 'All' || note.semester.toString() === currentNotesSemester;
    
    return matchesSearch && matchesSubject && matchesSemester;
  });

  // Render empty state template if list resolves empty
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i data-lucide="book-open" class="empty-state-icon" style="width: 48px; height: 48px;"></i>
        <h4 class="empty-state-title">No notes found matching filters</h4>
        <p>Try modifying search query or choosing another semester/department.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Render list items dynamically
  grid.innerHTML = filtered.map(note => {
    const bookmarked = currentUser && (currentUser.bookmarks || []).includes(note._id);
    const starIcon = bookmarked ? 'fill-current' : ''; // fill star icon if bookmarked
    const desc = note.description.length > 85 ? note.description.substring(0, 85) + '...' : note.description;
    
    // Syllabus and Creator badges
    const verifiedBadge = note.isVerifiedCreator 
      ? `<span class="verification-badge" style="color: #34d399; background: rgba(52, 211, 153, 0.08); border-color: rgba(52, 211, 153, 0.15); margin-left: 6px;">
          <i data-lucide="shield-check" style="width: 10px; height: 10px;"></i> Verified Peer
         </span>`
      : '';

    const syllabusMatchBadge = note.syllabusCode
      ? `<span class="verification-badge" style="color: #60a5fa; background: rgba(96, 165, 250, 0.08); border-color: rgba(96, 165, 250, 0.15); margin-left: 6px;" title="RTU Syllabus Match">
          <i data-lucide="book-check" style="width: 10px; height: 10px;"></i> ${note.syllabusCode}
         </span>`
      : '';

    const ratingHtml = note.rating > 0 
      ? `<span style="display: inline-flex; align-items: center; gap: 2px; color: #fbbf24; font-weight: 700;">
          <i data-lucide="star" style="width: 11px; height: 11px; fill: currentColor;"></i> ${note.rating.toFixed(1)}
         </span>`
      : `<span style="color: hsl(var(--text-muted)); font-size: 11px;">Unrated</span>`;

    return `
      <div class="card-item glass-card" style="display: flex; flex-direction: column; justify-content: space-between; min-height: 260px;">
        <div>
          <div class="card-meta">
            <span class="subject-badge">${note.subject}</span>
            <div style="display: flex; align-items: center; gap: 4px;">
              ${syllabusMatchBadge}
              <button class="btn-icon bookmark-toggle-btn" data-id="${note._id}" style="width: 28px; height: 28px;">
                <i data-lucide="bookmark" style="width: 13px; height: 13px;" class="${starIcon}"></i>
              </button>
            </div>
          </div>
          <div class="card-content">
            <h3 class="card-title">${note.title}</h3>
            <p class="card-desc">${desc}</p>
            
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; font-size: 11px; color: hsl(var(--text-muted)); font-weight: 600;">
              <span style="color: #a5b4fc;">Semester ${note.semester}</span>
              <span>•</span>
              <span>${note.campusBlock || 'JECRC Main Campus'}</span>
            </div>
          </div>
        </div>
        
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 8px 14px 0; border-top: 1px solid hsl(var(--border-light)); font-size: 11px; color: hsl(var(--text-muted));">
            <span style="display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="download" style="width: 12px; height: 12px;"></i> ${note.downloads || 0} DLs</span>
            <span style="display: inline-flex; align-items: center; gap: 4px;"><i data-lucide="thumbs-up" style="width: 12px; height: 12px;"></i> ${note.upvotes || 0} votes</span>
            <span>${ratingHtml}</span>
          </div>
          
          <div class="card-footer" style="padding-top: 0; border-top: none; background: transparent;">
            <div class="author-info">
              <img src="${note.uploadedBy?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}" class="author-avatar" />
              <div style="display: flex; flex-direction: column;">
                <span class="author-name" style="font-weight: 700; color: white; max-width: 95px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                  ${note.uploadedBy?.name || 'Academic Board'}
                </span>
                <span style="font-size: 9px; color: hsl(var(--text-muted)); margin-top: -2px;">
                  ${note.uploadedBy?.branch ? note.uploadedBy.branch + ' Dept' : 'JECRC peer'}
                </span>
              </div>
            </div>
            <div class="card-actions">
              <button class="btn btn-secondary py-1 px-3 doc-detail-trigger" style="font-size: 11px; padding: 6px 12px;" data-id="${note._id}">View note</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Attach event listeners to the dynamically generated list buttons
  document.querySelectorAll('.bookmark-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering details click when bookmark button is clicked
      toggleBookmark(btn.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.doc-detail-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      openDocDetail(btn.getAttribute('data-id'), 'notes');
    });
  });

  lucide.createIcons();
}

// --------------------------------------------------------------------------
// 6. PYQS PAGE INTERACTION
// --------------------------------------------------------------------------

/**
 * Performs local array filtering and updates the PYQ grid cards.
 */
function renderPYQsGrid() {
  const grid = document.getElementById('pyqs-grid');
  const searchInput = document.getElementById('pyq-search-input');
  const uniSelect = document.getElementById('pyq-university-select');
  const yearSelect = document.getElementById('pyq-year-select');
  const diffSelect = document.getElementById('pyq-difficulty-select');
  const semSelect = document.getElementById('pyq-semester-select');

  const query = searchInput.value.toLowerCase().trim();
  const selectedUni = uniSelect.value;
  const selectedYear = yearSelect.value;
  const selectedDiff = diffSelect.value;
  const selectedSem = semSelect ? semSelect.value : 'All';

  const filtered = pyqs.filter(paper => {
    const matchesSearch = !query || 
      paper.subject.toLowerCase().includes(query) || 
      (paper.syllabusCode && paper.syllabusCode.toLowerCase().includes(query));
    
    const matchesUni = selectedUni === 'All' || paper.university === selectedUni;
    const matchesYear = selectedYear === 'All' || paper.year.toString() === selectedYear;
    const matchesDiff = selectedDiff === 'All' || paper.difficultyLevel === selectedDiff;
    const matchesSem = selectedSem === 'All' || (paper.semester && paper.semester.toString() === selectedSem);
    
    return matchesSearch && matchesUni && matchesYear && matchesDiff && matchesSem;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i data-lucide="graduation-cap" class="empty-state-icon" style="width: 48px; height: 48px;"></i>
        <h4 class="empty-state-title">No exam papers found</h4>
        <p>Modify search filters or upload a past year question paper for this semester.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  grid.innerHTML = filtered.map(paper => {
    const syllabusMatch = paper.syllabusCode 
      ? `<span class="verification-badge" style="color: #60a5fa; background: rgba(96, 165, 250, 0.08); border-color: rgba(96, 165, 250, 0.15); font-size: 9px;" title="RTU Syllabus Match">
          <i data-lucide="book-check" style="width: 9px; height: 9px;"></i> ${paper.syllabusCode}
         </span>`
      : '';

    return `
      <div class="card-item glass-card" style="min-height: 230px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="card-meta" style="display: flex; justify-content: space-between; align-items: center;">
            <span class="subject-badge" style="background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-color: rgba(59, 130, 246, 0.2);">${paper.difficultyLevel}</span>
            <span style="font-size: 11px; font-weight: 700; color: white;">Year ${paper.year}</span>
          </div>
          <div class="card-content" style="margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="font-size: 11px; font-weight: 700; color: #a5b4fc; text-transform: uppercase;">Semester ${paper.semester || 1}</span>
              ${syllabusMatch}
            </div>
            <h3 class="card-title">${paper.subject} Exam Paper</h3>
            <p class="card-desc" style="font-size: 12.5px; color: hsl(var(--text-muted));">${paper.university}</p>
            <p style="font-size: 11px; color: hsl(var(--text-muted)); margin-top: 4px;">Location: ${paper.campusBlock || 'JECRC Campus'}</p>
          </div>
        </div>
        
        <div>
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: hsl(var(--text-muted)); margin-bottom: 10px; padding-top: 8px; border-top: 1px solid rgba(255, 255, 255, 0.04);">
            <span><i data-lucide="download" style="width: 12px; height: 12px; display: inline-block; vertical-align: text-bottom;"></i> ${paper.downloads || 0} downloads</span>
            <span><i data-lucide="thumbs-up" style="width: 12px; height: 12px; display: inline-block; vertical-align: text-bottom;"></i> ${paper.upvotes || 0} upvotes</span>
          </div>
          <div class="card-footer" style="padding: 0; border-top: none; background: transparent;">
            <div class="author-info">
              <img src="${paper.uploadedBy?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}" class="author-avatar" />
              <span class="author-name" style="font-weight: 700; color: white; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${paper.uploadedBy?.name || 'Board'}
              </span>
            </div>
            <div class="card-actions">
              <button class="btn btn-primary py-1 px-3 pyq-detail-trigger" style="font-size: 11px; padding: 6px 12px;" data-id="${paper._id}">Solve Paper</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  document.querySelectorAll('.pyq-detail-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      openDocDetail(btn.getAttribute('data-id'), 'pyqs');
    });
  });

  lucide.createIcons();
}

// --------------------------------------------------------------------------
// 7. BOOKMARK MANAGEMENT
// --------------------------------------------------------------------------

/**
 * Sends a request to toggle a bookmark status for the selected note.
 * Updates the user session and re-renders lists dynamically.
 */
async function toggleBookmark(noteId) {
  if (!currentUser) {
    alert('Please sign in to bookmark.');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/notes/${noteId}/bookmark`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      currentUser.bookmarks = json.data.bookmarks; // Update state bookmarks index array
      
      // Update UI components showing bookmarks
      if (activePage === 'notes') renderNotesGrid();
      if (activePage === 'dashboard') switchDashboardTab('bookmarks');
    }
  } catch (err) {
    console.error('Bookmark error:', err);
  }
}

// --------------------------------------------------------------------------
// 8. NOTES & PYQS DEEP DETAIL VIEW & PDF CONTROLLER
// --------------------------------------------------------------------------

// PDF simulated viewport control values
let pdfZoom = 100;
let pdfPage = 1;
let pdfRotation = 0;

/**
 * Loads note details by ID and renders the interactive viewer.
 */
async function openDocDetail(id, type) {
  try {
    navigateTo('document-detail');
    
    // Reset view controls to default values
    pdfPage = 1;
    pdfZoom = 100;
    pdfRotation = 0;
    
    document.getElementById('pdf-doc-title').innerText = 'Loading...';
    document.getElementById('pdf-doc-subject').innerText = '';
    
    if (type === 'notes') {
      const res = await fetch(`${API_BASE}/notes/${id}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        viewingDoc = json.data.note;
        
        // Inject data into details containers
        document.getElementById('pdf-doc-title').innerText = viewingDoc.title;
        document.getElementById('pdf-doc-subject').innerText = viewingDoc.subject;
        document.getElementById('detail-doc-title').innerText = viewingDoc.title;
        document.getElementById('detail-doc-subject').innerText = viewingDoc.subject;
        document.getElementById('detail-doc-desc').innerText = viewingDoc.description;
        
        // Set bookmark button styling
        const btnBookmark = document.getElementById('detail-btn-bookmark');
        const bookmarked = currentUser && (currentUser.bookmarks || []).includes(viewingDoc._id);
        btnBookmark.innerHTML = `<i data-lucide="bookmark" class="${bookmarked ? 'fill-current' : ''}"></i>`;
        
        renderSimulatedPDF();
        renderReviews();
      }
    } else {
      // Fetch PYQ detail
      const res = await fetch(`${API_BASE}/pyqs/${id}`, {
        headers: getHeaders()
      });
      if (res.ok) {
        const json = await res.json();
        viewingPYQ = json.data.pyq;
        
        // Map PYQ schema structure to match note details layout
        viewingDoc = {
          _id: viewingPYQ._id,
          title: `${viewingPYQ.subject} (${viewingPYQ.year})`,
          subject: viewingPYQ.university,
          description: `Exam Board previous year question paper for ${viewingPYQ.subject}. Difficulty: ${viewingPYQ.difficultyLevel}`,
          fileUrl: viewingPYQ.fileUrl,
          fileName: viewingPYQ.fileName,
          reviews: []
        };
        
        document.getElementById('pdf-doc-title').innerText = viewingDoc.title;
        document.getElementById('pdf-doc-subject').innerText = viewingDoc.subject;
        document.getElementById('detail-doc-title').innerText = viewingDoc.title;
        document.getElementById('detail-doc-subject').innerText = viewingDoc.subject;
        document.getElementById('detail-doc-desc').innerText = viewingDoc.description;
        
        // Deactivate bookmark option for PYQ
        document.getElementById('detail-btn-bookmark').innerHTML = `<i data-lucide="bookmark" style="opacity: 0.3;"></i>`;
        
        renderSimulatedPDF();
        renderReviews();
      }
    }
    lucide.createIcons();
  } catch (err) {
    console.error('Doc loader failed:', err);
  }
}

/**
 * Renders simulated study sheets instead of requiring heavy browser extensions
 * or external packages, ensuring direct HTML compatibility.
 */
function renderSimulatedPDF() {
  const container = document.getElementById('simulated-pdf-sheet');
  if (!viewingDoc) return;
  
  // Apply zoom scaling and rotation using CSS 2D Transforms
  container.style.transform = `scale(${pdfZoom / 100}) rotate(${pdfRotation}deg)`;
  
  if (pdfPage === 1) {
    container.innerHTML = `
      <div class="simulated-pdf-border">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <span style="font-size: 8px; font-weight: 800; text-transform: uppercase; border: 1.5px solid #1e293b; padding: 2px 6px;">TechVault Certified Archive</span>
          <span style="font-size: 8px; font-weight: 600; color: #64748b;">Ref: TV-DOC-99</span>
        </div>
        
        <div style="text-align: center; margin: auto 0;">
          <span style="font-size: 10px; font-weight: 800; color: #7c3aed; text-transform: uppercase; tracking-wider">${viewingDoc.subject}</span>
          <h1 class="simulated-pdf-title">${viewingDoc.title}</h1>
          <div style="width: 40px; height: 2px; background: #1e293b; margin: 12px auto;"></div>
          <p style="font-size: 11px; line-height: 1.5; color: #475569; max-width: 320px; margin: 0 auto; font-style: italic;">
            Peer-reviewed syllabus notes compiled under curriculum standards. Certified for exam reference.
          </p>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 9px; font-weight: 700; color: #0f172a;">
          <div>
            <span style="display: block; font-size: 7px; color: #94a3b8; text-transform: uppercase;">Uploader Node</span>
            <span>Academic Platform</span>
          </div>
          <div>
            <span style="display: block; font-size: 7px; color: #94a3b8; text-transform: uppercase;">Review Stamp</span>
            <span>2026 Archive</span>
          </div>
        </div>
      </div>
    `;
  } else if (pdfPage === 2) {
    container.innerHTML = `
      <div class="simulated-pdf-border" style="text-align: left; padding: 20px;">
        <h2 style="font-size: 16px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; color: #0f172a;">1.0 CORE THEORETICAL MODULE</h2>
        <p style="font-size: 11px; margin-top: 10px; line-height: 1.6; color: #334155;">
          This module defines structural relationships, matrix computation equations, and network latency formulas key to passing the technical exam questions.
        </p>
        
        <div style="border-left: 3px solid #7c3aed; background: #f8fafc; padding: 10px; margin: 12px 0; font-size: 10px; font-style: italic; color: #475569;">
          <strong>Core Definition:</strong> "The system is guaranteed stable if and only if all poles of the transfer function map directly onto the left-hand plane of the s-domain plot."
        </div>
        
        <div style="border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; background: #f8fafc; font-family: Georgia, serif; font-size: 14px; color: #0f172a; margin-top: 12px;">
          f(x) = &int; [ &psi;(t) &middot; &phi;(t, x) ] dt + &sum; &lambda;<sub>n</sub>
        </div>
        
        <div style="display: flex; gap: 8px; margin-top: 12px; font-size: 10px;">
          <div style="flex: 1; border: 1px solid #e2e8f0; padding: 8px; border-radius: 4px; background: white;">
            <strong>Stress Limit:</strong> &sigma; &le; 250 MPa
          </div>
          <div style="flex: 1; border: 1px solid #e2e8f0; padding: 8px; border-radius: 4px; background: white;">
            <strong>Frequency:</strong> f<sub>c</sub> &ge; 4.8 kHz
          </div>
        </div>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="simulated-pdf-border" style="text-align: left; padding: 20px;">
        <h2 style="font-size: 16px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; color: #0f172a;">2.0 NUMERICAL PROBLEMS</h2>
        
        <div style="margin-top: 12px; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; background: #f8fafc; font-size: 11px;">
          <strong>Question 2.1 (Stability Verification)</strong>
          <p style="color: #475569; margin-top: 4px;">Compute the eigenvalue limits of the response matrix under dynamic load factors.</p>
          
          <div style="margin-top: 8px; border-left: 2px solid #10b981; padding-left: 8px; color: #065f46; background: #ecfdf5;">
            <strong>Analytical Solution:</strong>
            <p style="font-family: monospace; font-size: 10px; margin-top: 2px;">
              Re(&lambda;<sub>1</sub>) = -2.5 (Negative)<br>
              Re(&lambda;<sub>2</sub>) = +0.5 (Positive) -> System unstable.
            </p>
          </div>
        </div>
        
        <div style="background: rgba(124, 58, 237, 0.05); border: 1px solid rgba(124, 58, 237, 0.1); border-radius: 6px; padding: 10px; margin-top: 16px; font-size: 10px; color: #581c87;">
          💡 <strong>Exam Insight:</strong> The derivation of stress tensors is high-yield. Draw shear diagrams before writing numerical integrals to secure max marks.
        </div>
      </div>
    `;
  }
  document.getElementById('pdf-page-indicator').innerText = `Page ${pdfPage} of 3`;
}

/**
 * Dynamic reviews injector
 */
function renderReviews() {
  const container = document.getElementById('doc-reviews-container');
  const list = viewingDoc.reviews || [];
  
  if (list.length === 0) {
    container.innerHTML = `<span style="font-size: 12px; color: hsl(var(--text-muted));">No reviews submitted yet. Be the first!</span>`;
    return;
  }

  container.innerHTML = list.map(rev => {
    const stars = '⭐'.repeat(rev.rating); // Constructs star counts dynamically
    return `
      <div class="review-item">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <img src="${rev.userId?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}" class="author-avatar" style="width: 20px; height: 20px;" />
            <span style="font-size: 12px; font-weight: 700; color: white;">${rev.userId?.name || 'Student'}</span>
          </div>
          <span style="font-size: 11px;">${stars}</span>
        </div>
        <p style="font-size: 12.5px; color: hsl(var(--text-secondary)); text-align: left;">${rev.comment}</p>
      </div>
    `;
  }).join('');
}

// --------------------------------------------------------------------------
// 9. DYNAMIC USER DASHBOARD CONTROLLER
// --------------------------------------------------------------------------

/**
 * Handles dashboard sub-navigation tabs toggling.
 */
function switchDashboardTab(tabName) {
  activeDashboardTab = tabName;
  
  // Sync tab highlight classes
  document.querySelectorAll('.dashboard-menu-item').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Display targeted view panel
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  document.getElementById(`tab-${tabName}`).classList.add('active');

  // Trigger sub-render processes
  if (tabName === 'overview') {
    document.getElementById('dash-name').innerText = currentUser.name;
    document.getElementById('dash-email').innerText = currentUser.email;
    document.getElementById('dash-avatar').src = currentUser.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=user';
    document.getElementById('dash-role').innerText = currentUser.role.toUpperCase();
    document.getElementById('stat-role').innerText = currentUser.role;
    document.getElementById('stat-bookmarks-count').innerText = (currentUser.bookmarks || []).length;
    
    // Count matches to compute uploader statistics
    const userNotesCount = notes.filter(n => n.uploadedBy?._id === currentUser._id || n.uploadedBy === currentUser._id).length;
    document.getElementById('stat-uploads-count').innerText = userNotesCount;
  } else if (tabName === 'bookmarks') {
    renderBookmarksTab();
  } else if (tabName === 'uploads') {
    renderUploadsTab();
  } else if (tabName === 'settings') {
    document.getElementById('profile-update-name').value = currentUser.name || '';
    document.getElementById('profile-update-roll').value = currentUser.rollNumber || '';
    document.getElementById('profile-update-branch').value = currentUser.branch || 'Computer Science';
    document.getElementById('profile-update-semester').value = currentUser.semester || '1';
    document.getElementById('profile-update-block').value = currentUser.campusBlock || 'A-Block (CSE/IT Department)';
    document.getElementById('profile-update-avatar').value = '';
  }
  lucide.createIcons();
}

/**
 * Tab: Bookmarks rendering
 */
function renderBookmarksTab() {
  const grid = document.getElementById('dashboard-bookmarks-grid');
  const bookmarkedIds = currentUser.bookmarks || [];
  const list = notes.filter(n => bookmarkedIds.includes(n._id));

  if (list.length === 0) {
    grid.innerHTML = `<span style="font-size: 13px; color: hsl(var(--text-muted)); text-align: left; width: 100%;">You have not bookmarked any notes yet.</span>`;
    return;
  }

  grid.innerHTML = list.map(note => {
    return `
      <div class="card-item glass-card" style="min-height: 200px;">
        <div class="card-meta">
          <span class="subject-badge">${note.subject}</span>
          <button class="btn-icon delete-bookmark-btn" data-id="${note._id}"><i data-lucide="x" style="width: 14px; height: 14px;"></i></button>
        </div>
        <div class="card-content">
          <h3 class="card-title">${note.title}</h3>
        </div>
        <div class="card-footer">
          <button class="btn btn-secondary py-1 px-3 doc-detail-trigger" style="font-size: 11px; padding: 6px 12px;" data-id="${note._id}">View</button>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.delete-bookmark-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleBookmark(btn.getAttribute('data-id')));
  });

  grid.querySelectorAll('.doc-detail-trigger').forEach(btn => {
    btn.addEventListener('click', () => openDocDetail(btn.getAttribute('data-id'), 'notes'));
  });
}

/**
 * Tab: Uploads listing and CRUD triggers
 */
function renderUploadsTab() {
  const grid = document.getElementById('dashboard-uploads-grid');
  
  // Filter items uploaded by logged-in user ID
  const list = notes.filter(n => n.uploadedBy?._id === currentUser._id || n.uploadedBy === currentUser._id);
  const userPyqs = pyqs.filter(p => p.uploadedBy?._id === currentUser._id || p.uploadedBy === currentUser._id);

  const totalList = [
    ...list.map(n => ({ ...n, type: 'note' })),
    ...userPyqs.map(p => ({ ...p, title: p.subject, type: 'pyq', isPublished: true }))
  ];

  if (totalList.length === 0) {
    grid.innerHTML = `<span style="font-size: 13px; color: hsl(var(--text-muted)); text-align: left; width: 100%;">You have not uploaded any study materials yet.</span>`;
    return;
  }

  grid.innerHTML = totalList.map(item => {
    const statusText = item.isPublished ? 'Published' : 'Awaiting Review';
    const statusColor = item.isPublished ? '#34d399' : '#fbbf24';
    
    return `
      <div class="card-item glass-card" style="min-height: 220px;">
        <div class="card-meta">
          <span class="subject-badge">${item.subject || 'Exam Paper'}</span>
          <span style="font-size: 10px; font-weight: 700; color: ${statusColor}">${statusText}</span>
        </div>
        <div class="card-content">
          <h3 class="card-title">${item.title}</h3>
          <p class="card-desc">Type: ${item.type.toUpperCase()}</p>
        </div>
        <div class="card-footer">
          <button class="btn btn-secondary py-1 px-3 item-view-btn" style="font-size: 11px; padding: 6px 12px;" data-id="${item._id}" data-type="${item.type}">Open</button>
          <button class="btn btn-danger py-1 px-3 item-delete-btn" style="font-size: 11px; padding: 6px 12px;" data-id="${item._id}" data-type="${item.type}">Delete</button>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.item-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-type') === 'note' ? 'notes' : 'pyqs';
      openDocDetail(btn.getAttribute('data-id'), type);
    });
  });

  // Handles DELETE actions sending request to API endpoints
  grid.querySelectorAll('.item-delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this contribution?')) return;
      const type = btn.getAttribute('data-type');
      const id = btn.getAttribute('data-id');
      try {
        const endpoint = type === 'note' ? `notes/${id}` : `pyqs/${id}`;
        const res = await fetch(`${API_BASE}/${endpoint}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        if (res.ok) {
          // Re-fetch lists and reload panel
          await Promise.all([fetchNotes(), fetchPYQs()]);
          renderUploadsTab();
        }
      } catch (err) {
        console.error('Deletion error:', err);
      }
    });
  });
}

// --------------------------------------------------------------------------
// 10. FILE UPLOADS PIPELINE
// --------------------------------------------------------------------------

let uploadTypeMode = 'notes'; // Tracks form routing direction

/**
 * Handles resetting forms and displaying inputs suited for either note
 * details (tags, subjects) or past papers (universities, years).
 */
function openUploadModal(type) {
  if (!currentUser) {
    navigateTo('auth');
    return;
  }
  uploadTypeMode = type;
  document.getElementById('modal-upload').classList.add('active');
  
  const title = document.getElementById('upload-modal-title');
  const notesFields = document.getElementById('upload-notes-extra-fields');
  const pyqsFields = document.getElementById('upload-pyqs-extra-fields');
  
  if (type === 'notes') {
    title.innerText = 'Upload Lecture Notes';
    notesFields.style.display = 'block';
    pyqsFields.style.display = 'none';
  } else {
    title.innerText = 'Upload Exam PYQ Paper';
    notesFields.style.display = 'none';
    pyqsFields.style.display = 'block';
  }
}

// --------------------------------------------------------------------------
// 11. AI STUDY ASSISTANT MODULE
// --------------------------------------------------------------------------

// Switch tabs inside the AI Assistant drawer
function switchAITab(tab) {
  activeAiTab = tab;
  
  document.querySelectorAll('.ai-sidebar-btn').forEach(b => {
    if (b.getAttribute('data-tab') === tab) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  
  document.querySelectorAll('.ai-tab-pane').forEach(p => p.style.display = 'none');
  document.getElementById(`ai-pane-${tab}`).style.display = 'block';
  
  if (tab === 'summary') {
    document.getElementById('ai-summary-text').innerText = aiData.summary;
  } else if (tab === 'flashcards') {
    currentCardIdx = 0;
    showFlashcard();
  } else if (tab === 'quiz') {
    currentQuizIdx = 0;
    quizScore = 0;
    document.getElementById('quiz-results-container').style.display = 'none';
    document.getElementById('quiz-question-container').style.display = 'block';
    showQuizQuestion();
  }
}

/**
 * Renders the active flashcard and tracks current progress limits.
 */
function showFlashcard() {
  const card = aiData.flashcards[currentCardIdx];
  if (!card) return;
  
  // Toggle off flipped state to start on Question face
  const cardBox = document.getElementById('flashcard-box');
  cardBox.classList.remove('flipped');
  
  document.getElementById('flashcard-question-text').innerText = card.question;
  document.getElementById('flashcard-answer-text').innerText = card.answer;
  document.getElementById('flashcard-progress-label').innerText = `Card ${currentCardIdx + 1} of ${aiData.flashcards.length}`;
}

/**
 * Renders multiple choice options dynamically for active quiz steps.
 */
let selectedQuizOption = null;
function showQuizQuestion() {
  const quiz = aiData.quiz[currentQuizIdx];
  if (!quiz) return;
  
  document.getElementById('quiz-question-number').innerText = `Question ${currentQuizIdx + 1} of ${aiData.quiz.length}`;
  document.getElementById('quiz-question-text').innerText = quiz.question;
  
  const optionsBox = document.getElementById('quiz-options-container');
  // Inject option buttons
  optionsBox.innerHTML = quiz.options.map((opt, index) => {
    return `<button class="quiz-option" data-idx="${index}">${opt}</button>`;
  }).join('');
  
  // Clean feedback areas
  document.getElementById('btn-quiz-submit').style.display = 'block';
  document.getElementById('btn-quiz-next').style.display = 'none';
  document.getElementById('quiz-feedback-success').style.display = 'none';
  document.getElementById('quiz-feedback-error').style.display = 'none';
  selectedQuizOption = null;
  
  // Setup option button listeners
  optionsBox.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', () => {
      optionsBox.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedQuizOption = parseInt(btn.getAttribute('data-idx'));
    });
  });
}

// --------------------------------------------------------------------------
// 12. SPOTLIGHT SEARCH MODULE (Ctrl+K Overlay)
// --------------------------------------------------------------------------

let debounceTimer = null; // Timer variable used to debounce suggestions input keyups

/**
 * Renders autocomplete suggestions or recommended tags inside the Spotlight Search.
 */
async function renderSpotlightSuggestions(query = '') {
  const container = document.getElementById('spotlight-suggestions-list');
  const title = document.getElementById('spotlight-title-suggestions');
  const resultsContainer = document.getElementById('spotlight-results-container');
  
  // Hide main results group and show suggestion panel
  resultsContainer.style.display = 'none';
  title.style.display = 'block';
  container.style.display = 'block';
  
  if (!query) {
    // If search term is empty, list trending/popular subjects
    title.innerText = 'Popular Academic Searches';
    const popular = [
      { text: 'Data Structures & Algorithms (3CS4-04)', val: 'Data Structures' },
      { text: 'Advanced Engineering Mathematics-II (3MA2-01)', val: 'Mathematics' },
      { text: 'Object Oriented Programming (3CS4-05)', val: 'OOP' },
      { text: 'Structural Analysis & RCC Design (5CE4-03)', val: 'RCC' }
    ];
    container.innerHTML = popular.map(item => `
      <div class="search-suggestion-item" data-value="${item.val}">
        <i data-lucide="trending-up" style="width: 14px; height: 14px; color: #818cf8;"></i>
        <span>${item.text}</span>
      </div>
    `).join('');
  } else {
    // Query suggestions list from API endpoint
    title.innerText = 'Search Suggestions';
    try {
      const res = await fetch(`${API_BASE}/suggestions?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const json = await res.json();
        const suggestions = json.data.suggestions || [];
        if (suggestions.length === 0) {
          container.innerHTML = `<span style="font-size: 12.5px; color: hsl(var(--text-muted)); padding: 8px 12px; display: block;">No matching suggestions found</span>`;
        } else {
          container.innerHTML = suggestions.map(s => `
            <div class="search-suggestion-item" data-value="${s}">
              <i data-lucide="search" style="width: 14px; height: 14px; color: hsl(var(--text-muted));"></i>
              <span>${s}</span>
            </div>
          `).join('');
        }
      }
    } catch (err) {
      console.error('Failed to load spotlight suggestions:', err);
    }
  }
  
  // Bind click listener on search suggestion items
  container.querySelectorAll('.search-suggestion-item').forEach(item => {
    item.addEventListener('click', () => {
      const val = item.getAttribute('data-value');
      const input = document.getElementById('search-spotlight-input');
      input.value = val;
      executeSpotlightSearch(val);
    });
  });
  
  lucide.createIcons();
}

// Spotlight text search autocomplete query
async function executeSpotlightSearch(query) {
  const container = document.getElementById('spotlight-suggestions-list');
  const title = document.getElementById('spotlight-title-suggestions');
  const resultsContainer = document.getElementById('spotlight-results-container');
  
  title.style.display = 'none';
  container.style.display = 'none';
  resultsContainer.style.display = 'block';
  
  const notesResults = document.getElementById('spotlight-notes-results');
  const pyqsResults = document.getElementById('spotlight-pyqs-results');
  
  notesResults.innerHTML = `<span style="font-size: 12px; color: hsl(var(--text-muted)); padding: 8px;">Searching archives...</span>`;
  pyqsResults.innerHTML = ``;
  
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const json = await res.json();
      const matchedNotes = json.data.notes || [];
      const matchedPyqs = json.data.pyqs || [];
      
      // Inject Notes results matches
      if (matchedNotes.length === 0) {
        notesResults.innerHTML = `<span style="font-size: 12px; color: hsl(var(--text-muted)); padding: 8px; display: block;">No notes found matching query</span>`;
      } else {
        notesResults.innerHTML = matchedNotes.map(n => {
          return `
            <div class="search-result-item" data-id="${n._id}" data-type="notes">
              <div class="search-result-info">
                <i data-lucide="book-open" class="search-result-icon" style="width: 16px; height: 16px;"></i>
                <div>
                  <span class="search-result-title">${n.title}</span>
                  <p style="font-size: 11px; color: hsl(var(--text-muted));">${n.subject}</p>
                </div>
              </div>
              <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i>
            </div>
          `;
        }).join('');
      }
      
      // Inject Exam papers results matches
      if (matchedPyqs.length === 0) {
        pyqsResults.innerHTML = `<span style="font-size: 12px; color: hsl(var(--text-muted)); padding: 8px; display: block;">No exam papers found matching query</span>`;
      } else {
        pyqsResults.innerHTML = matchedPyqs.map(p => {
          return `
            <div class="search-result-item" data-id="${p._id}" data-type="pyqs">
              <div class="search-result-info">
                <i data-lucide="graduation-cap" class="search-result-icon" style="width: 16px; height: 16px;"></i>
                <div>
                  <span class="search-result-title">${p.subject} Exam Paper (${p.year})</span>
                  <p style="font-size: 11px; color: hsl(var(--text-muted));">${p.university}</p>
                </div>
              </div>
              <i data-lucide="chevron-right" style="width: 14px; height: 14px;"></i>
            </div>
          `;
        }).join('');
      }
      
      // Attach detail triggers
      document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          document.getElementById('search-spotlight-overlay').classList.remove('active');
          openDocDetail(item.getAttribute('data-id'), item.getAttribute('data-type'));
        });
      });
      lucide.createIcons();
    }
  } catch (err) {
    console.error(err);
  }
}

// --------------------------------------------------------------------------
// 13. ADMIN DASHBOARD DATA CONSOLE
// --------------------------------------------------------------------------

/**
 * Administrative panel loading. Queries all platform profiles and moderation queue.
 */
async function loadAdminDashboard() {
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'moderator')) return;
  
  try {
    // 1. Fetch unapproved files from moderation endpoint
    const modRes = await fetch(`${API_BASE}/admin/moderation-queue`, {
      headers: getHeaders()
    });
    if (modRes.ok) {
      const modJson = await modRes.json();
      const pending = modJson.data.notes || [];
      const tbody = document.getElementById('admin-moderation-tbody');
      
      if (pending.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: hsl(var(--text-muted));">No notes pending review.</td></tr>`;
      } else {
        tbody.innerHTML = pending.map(n => {
          const fileSizeKb = Math.round(n.fileSize / 1024);
          return `
            <tr>
              <td style="font-weight: 700; color: white;">${n.title}</td>
              <td>${n.subject}</td>
              <td>${n.uploadedBy?.name || 'Student'}</td>
              <td>${fileSizeKb} KB</td>
              <td>
                <div style="display: flex; gap: 8px;">
                  <button class="btn btn-primary approve-btn" style="padding: 4px 10px; font-size: 11px;" data-id="${n._id}">Approve</button>
                  <button class="btn btn-danger reject-btn" style="padding: 4px 10px; font-size: 11px;" data-id="${n._id}">Reject</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
        
        tbody.querySelectorAll('.approve-btn').forEach(btn => {
          btn.addEventListener('click', () => handleModeration(btn.getAttribute('data-id'), 'approve'));
        });
        
        tbody.querySelectorAll('.reject-btn').forEach(btn => {
          btn.addEventListener('click', () => handleModeration(btn.getAttribute('data-id'), 'reject'));
        });
      }
    }

    // 2. Fetch user list (Restricted to Role: Admin only)
    if (currentUser.role === 'admin') {
      const usersRes = await fetch(`${API_BASE}/admin/users`, {
        headers: getHeaders()
      });
      if (usersRes.ok) {
        const usersJson = await usersRes.json();
        const usersList = usersJson.data.users || [];
        const tbodyUsers = document.getElementById('admin-users-tbody');
        
        tbodyUsers.innerHTML = usersList.map(u => {
          const statusText = u.isActive ? 'Active' : 'Disabled';
          const statusColor = u.isActive ? '#34d399' : '#ef4444';
          const toggleText = u.isActive ? 'Disable' : 'Enable';
          
          return `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <img src="${u.avatar}" class="author-avatar" style="width: 28px; height: 28px;" />
                  <span style="font-weight: 700; color: white;">${u.name}</span>
                </div>
              </td>
              <td>${u.email}</td>
              <td>
                <select class="role-select admin-role-change" data-id="${u._id}">
                  <option value="user" ${u.role === 'user' ? 'selected' : ''}>User</option>
                  <option value="moderator" ${u.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                  <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
              </td>
              <td style="color: ${statusColor}; font-weight: 700;">${statusText}</td>
              <td>
                <button class="btn btn-secondary toggle-status-btn" style="padding: 4px 10px; font-size: 11px;" data-id="${u._id}">${toggleText}</button>
              </td>
            </tr>
          `;
        }).join('');

        // Listeners for role updates
        tbodyUsers.querySelectorAll('.admin-role-change').forEach(select => {
          select.addEventListener('change', async () => {
            const userId = select.getAttribute('data-id');
            const targetRole = select.value;
            try {
              const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ role: targetRole })
              });
              if (res.ok) {
                alert('User role updated!');
                loadAdminDashboard();
              }
            } catch (err) {
              console.error(err);
            }
          });
        });

        // Listeners for account status toggles
        tbodyUsers.querySelectorAll('.toggle-status-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const userId = btn.getAttribute('data-id');
            try {
              const res = await fetch(`${API_BASE}/admin/users/${userId}/disable`, {
                method: 'PUT',
                headers: getHeaders()
              });
              if (res.ok) {
                loadAdminDashboard();
              }
            } catch (err) {
              console.error(err);
            }
          });
        });
      }
    }
  } catch (err) {
    console.error('Failed to load admin stats:', err);
  }
}

// --------------------------------------------------------------------------
// 14. EVENT BINDINGS & INITIALIZERS
// --------------------------------------------------------------------------

// Main login submit event
// Main login submit event
document.getElementById('form-login').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  const btn = document.getElementById('btn-login-submit');
  const btnSpan = btn.querySelector('span');
  const btnIcon = btn.querySelector('svg') || btn.querySelector('.lucide');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  
  // Start loading state
  btn.disabled = true;
  emailInput.disabled = true;
  passwordInput.disabled = true;
  btnSpan.innerText = 'Verifying credentials...';
  if (btnIcon) btnIcon.style.display = 'none';
  const spinner = document.createElement('span');
  spinner.className = 'btn-spinner';
  btn.appendChild(spinner);

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (res.ok) {
      // Store token on device disk
      localStorage.setItem('tv_token', json.data.accessToken);
      currentUser = json.data.user;
      
      document.getElementById('login-email').value = '';
      document.getElementById('login-password').value = '';
      
      syncNavProfile();
      await fetchNotes(); // Reload notes with role scope
      navigateTo('notes');
    } else {
      alert(json.message || 'Login failed.');
    }
  } catch (err) {
    console.error('Login action error:', err);
    alert('Failed to connect to the authentication server. Please check your connection.');
  } finally {
    // End loading state
    btn.disabled = false;
    emailInput.disabled = false;
    passwordInput.disabled = false;
    btnSpan.innerText = 'Sign In';
    if (btnIcon) btnIcon.style.display = 'inline-block';
    const spinnerEl = btn.querySelector('.btn-spinner');
    if (spinnerEl) spinnerEl.remove();
  }
});

// Main registration submit event
document.getElementById('form-register').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const rollNumber = document.getElementById('reg-roll').value.trim();
  const branch = document.getElementById('reg-branch').value;
  const semester = parseInt(document.getElementById('reg-semester').value);
  const campusBlock = document.getElementById('reg-block').value;
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  const btn = document.getElementById('btn-register-submit');
  const btnSpan = btn.querySelector('span');
  const btnIcon = btn.querySelector('svg') || btn.querySelector('.lucide');
  const inputs = [
    document.getElementById('reg-name'),
    document.getElementById('reg-roll'),
    document.getElementById('reg-branch'),
    document.getElementById('reg-semester'),
    document.getElementById('reg-block'),
    document.getElementById('reg-email'),
    document.getElementById('reg-password')
  ];

  // Start loading state
  btn.disabled = true;
  inputs.forEach(input => input.disabled = true);
  btnSpan.innerText = 'Creating account...';
  if (btnIcon) btnIcon.style.display = 'none';
  const spinner = document.createElement('span');
  spinner.className = 'btn-spinner';
  btn.appendChild(spinner);

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, rollNumber, branch, semester, campusBlock })
    });
    const json = await res.json();
    if (res.ok) {
      localStorage.setItem('tv_token', json.data.accessToken);
      currentUser = json.data.user;
      
      document.getElementById('reg-name').value = '';
      document.getElementById('reg-roll').value = '';
      document.getElementById('reg-email').value = '';
      document.getElementById('reg-password').value = '';
      
      syncNavProfile();
      navigateTo('notes');
    } else {
      alert(json.message || 'Registration failed.');
    }
  } catch (err) {
    console.error('Register action error:', err);
    alert('Failed to connect to the authentication server. Please check your connection.');
  } finally {
    // End loading state
    btn.disabled = false;
    inputs.forEach(input => input.disabled = false);
    btnSpan.innerText = 'Register Profile';
    if (btnIcon) btnIcon.style.display = 'inline-block';
    const spinnerEl = btn.querySelector('.btn-spinner');
    if (spinnerEl) spinnerEl.remove();
  }
});

// Logout action binding
document.getElementById('btn-logout-nav').addEventListener('click', handleLogoutAction);
function handleLogoutAction() {
  localStorage.removeItem('tv_token');
  currentUser = null;
  syncNavProfile();
  fetchNotes();
  navigateTo('landing');
}

// Navigation links listeners
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navigateTo(link.getAttribute('data-target'));
  });
});
document.getElementById('btn-login-nav').addEventListener('click', () => navigateTo('auth'));
document.getElementById('img-nav-avatar').addEventListener('click', () => navigateTo('dashboard'));
document.getElementById('nav-logo').addEventListener('click', () => navigateTo('landing'));
document.getElementById('hero-btn-explore').addEventListener('click', () => navigateTo('notes'));
document.getElementById('hero-btn-signin').addEventListener('click', () => navigateTo('auth'));

// Dashboard Tab triggers
document.querySelectorAll('.dashboard-menu-item').forEach(btn => {
  btn.addEventListener('click', () => {
    switchDashboardTab(btn.getAttribute('data-tab'));
  });
});

// Settings uploads shortcuts
document.getElementById('dash-btn-upload-notes').addEventListener('click', () => {
  openUploadModal('notes');
});
document.getElementById('dash-btn-browse-notes').addEventListener('click', () => {
  navigateTo('notes');
});

// Modal triggers
document.getElementById('btn-upload-notes-modal').addEventListener('click', () => openUploadModal('notes'));
document.getElementById('btn-upload-pyq-modal').addEventListener('click', () => openUploadModal('pyqs'));
document.getElementById('btn-upload-modal-close').addEventListener('click', () => {
  document.getElementById('modal-upload').classList.remove('active');
  document.getElementById('upload-status-message').innerText = '';
});

// File upload submission pipeline
document.getElementById('form-upload-material').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById('upload-file-input');
  const statusDiv = document.getElementById('upload-status-message');
  
  if (fileInput.files.length === 0) {
    alert('Please select a PDF file.');
    return;
  }
  
  const file = fileInput.files[0];
  if (!file.name.endsWith('.pdf')) {
    alert('Only PDF files are supported.');
    return;
  }
  
  statusDiv.style.color = '#fbbf24';
  statusDiv.innerText = 'Uploading binary PDF to server...';

  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload file
    const upRes = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('tv_token')}`
      },
      body: formData
    });
    
    if (!upRes.ok) {
      throw new Error('PDF file upload chunk rejected.');
    }
    
    const upJson = await upRes.json();
    const fileName = upJson.data.fileName;
    const fileUrl = upJson.data.fileUrl;
    
    statusDiv.innerText = 'Saving document meta records...';
    
    const title = document.getElementById('upload-title').value.trim();
    const description = document.getElementById('upload-desc').value.trim();
    
    if (uploadTypeMode === 'notes') {
      const subject = document.getElementById('upload-subject').value;
      const tags = document.getElementById('upload-tags').value;
      const semester = parseInt(document.getElementById('upload-semester').value);
      const syllabusCode = document.getElementById('upload-syllabus-code').value.trim();
      const campusBlock = document.getElementById('upload-campus-block').value;
      
      const payloadRes = await fetch(`${API_BASE}/notes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ title, description, subject, tags, fileName, fileUrl, semester, syllabusCode, campusBlock })
      });
      
      if (payloadRes.ok) {
        statusDiv.style.color = '#34d399';
        statusDiv.innerText = 'Lecture Notes successfully uploaded for moderation!';
        await fetchNotes();
        setTimeout(() => {
          document.getElementById('modal-upload').classList.remove('active');
          document.getElementById('form-upload-material').reset();
          navigateTo('notes');
        }, 1500);
      }
    } else {
      const university = document.getElementById('upload-pyq-university').value;
      const year = parseInt(document.getElementById('upload-pyq-year').value);
      const difficultyLevel = document.getElementById('upload-pyq-difficulty').value;
      const semester = parseInt(document.getElementById('upload-pyq-semester').value);
      const syllabusCode = document.getElementById('upload-pyq-syllabus-code').value.trim();
      const campusBlock = document.getElementById('upload-pyq-campus-block').value;
      
      const payloadRes = await fetch(`${API_BASE}/pyqs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ year, subject: title, university, difficultyLevel, fileName, fileUrl, semester, syllabusCode, campusBlock })
      });
      
      if (payloadRes.ok) {
        statusDiv.style.color = '#34d399';
        statusDiv.innerText = 'Question Paper published successfully!';
        await fetchPYQs();
        setTimeout(() => {
          document.getElementById('modal-upload').classList.remove('active');
          document.getElementById('form-upload-material').reset();
          navigateTo('pyqs');
        }, 1500);
      }
    }
  } catch (err) {
    statusDiv.style.color = '#ef4444';
    statusDiv.innerText = err.message || 'Upload operation failed.';
  }
});

// Setup dynamic search pills
function initializeSubjectPills() {
  const container = document.getElementById('notes-subject-pills');
  container.innerHTML = subjects.map(sub => {
    const activeClass = sub === currentNotesSubject ? 'active' : '';
    return `<button class="filter-pill ${activeClass}" data-subject="${sub}">${sub}</button>`;
  }).join('');
  
  container.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      currentNotesSubject = btn.getAttribute('data-subject');
      container.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderNotesGrid();
    });
  });
}

// Setup PYQ search dropdown menus
function initializePYQFilters() {
  const uni = document.getElementById('pyq-university-select');
  uni.innerHTML = universities.map(u => `<option value="${u}">${u}</option>`).join('');
  uni.addEventListener('change', renderPYQsGrid);

  const sem = document.getElementById('pyq-semester-select');
  if (sem) {
    const semestersOptions = ['All', '1', '2', '3', '4', '5', '6', '7', '8'];
    sem.innerHTML = semestersOptions.map(s => `<option value="${s}">${s === 'All' ? 'All Semesters' : 'Semester ' + s}</option>`).join('');
    sem.addEventListener('change', renderPYQsGrid);
  }

  const yearsOptions = ['All', '2024', '2023', '2022', '2021', '2020'];
  const yr = document.getElementById('pyq-year-select');
  yr.innerHTML = yearsOptions.map(y => `<option value="${y}">${y}</option>`).join('');
  yr.addEventListener('change', renderPYQsGrid);

  const diff = document.getElementById('pyq-difficulty-select');
  diff.innerHTML = difficulties.map(d => `<option value="${d}">${d}</option>`).join('');
  diff.addEventListener('change', renderPYQsGrid);
}

// Input search queries change triggers
document.getElementById('notes-search-input').addEventListener('input', renderNotesGrid);
document.getElementById('pyq-search-input').addEventListener('input', renderPYQsGrid);

// Doc details back triggers
document.getElementById('btn-doc-back-link').addEventListener('click', () => {
  const type = pyqs.some(p => p._id === viewingDoc._id) ? 'pyqs' : 'notes';
  navigateTo(type);
});

// Document bookmark toggle trigger
document.getElementById('detail-btn-bookmark').addEventListener('click', async () => {
  if (pyqs.some(p => p._id === viewingDoc._id)) return;
  await toggleBookmark(viewingDoc._id);
  const bookmarked = currentUser && (currentUser.bookmarks || []).includes(viewingDoc._id);
  document.getElementById('detail-btn-bookmark').innerHTML = `<i data-lucide="bookmark" class="${bookmarked ? 'fill-current' : ''}"></i>`;
  lucide.createIcons();
});

// PDF viewer navigation clicks
document.getElementById('pdf-btn-zoomin').addEventListener('click', () => {
  if (pdfZoom < 150) {
    pdfZoom += 10;
    document.getElementById('pdf-zoom-label').innerText = `${pdfZoom}%`;
    renderSimulatedPDF();
  }
});
document.getElementById('pdf-btn-zoomout').addEventListener('click', () => {
  if (pdfZoom > 70) {
    pdfZoom -= 10;
    document.getElementById('pdf-zoom-label').innerText = `${pdfZoom}%`;
    renderSimulatedPDF();
  }
});
document.getElementById('pdf-btn-rotate').addEventListener('click', () => {
  pdfRotation = (pdfRotation + 90) % 360;
  renderSimulatedPDF();
});
document.getElementById('pdf-btn-prev').addEventListener('click', () => {
  if (pdfPage > 1) {
    pdfPage -= 1;
    renderSimulatedPDF();
  }
});
document.getElementById('pdf-btn-next').addEventListener('click', () => {
  if (pdfPage < 3) {
    pdfPage += 1;
    renderSimulatedPDF();
  }
});
document.getElementById('pdf-btn-download').addEventListener('click', () => {
  if (!viewingDoc) return;
  fetch(`${API_BASE}/notes/${viewingDoc._id}`);
  const link = document.createElement('a');
  link.href = viewingDoc.fileUrl;
  link.setAttribute('download', viewingDoc.fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// AI assistant overlays openers
document.getElementById('detail-btn-ai-assistant').addEventListener('click', async () => {
  if (!currentUser) {
    navigateTo('auth');
    return;
  }
  const modal = document.getElementById('modal-ai-assistant');
  const summaryBox = document.getElementById('ai-summary-text');
  modal.classList.add('active');
  summaryBox.innerText = 'AI model analyzing document context...';
  try {
    const res = await fetch(`${API_BASE}/ai/${viewingDoc._id}`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      aiData = json.data;
      switchAITab('summary');
    } else {
      summaryBox.innerText = 'AI failed to construct summaries.';
    }
  } catch (err) {
    summaryBox.innerText = 'Service temporarily offline.';
  }
});
document.getElementById('btn-ai-modal-close').addEventListener('click', () => {
  document.getElementById('modal-ai-assistant').classList.remove('active');
});

// AI sub tabs
document.querySelectorAll('.ai-sidebar-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchAITab(btn.getAttribute('data-tab'));
  });
});

// Flashcard transitions
document.getElementById('flashcard-box').addEventListener('click', () => {
  document.getElementById('flashcard-box').classList.toggle('flipped');
});
document.getElementById('btn-flashcard-prev').addEventListener('click', () => {
  if (currentCardIdx > 0) {
    currentCardIdx -= 1;
    showFlashcard();
  }
});
document.getElementById('btn-flashcard-next').addEventListener('click', () => {
  if (currentCardIdx < aiData.flashcards.length - 1) {
    currentCardIdx += 1;
    showFlashcard();
  }
});

// Quiz Answer checks
document.getElementById('btn-quiz-submit').addEventListener('click', () => {
  if (selectedQuizOption === null) {
    alert('Please select an option.');
    return;
  }
  const quiz = aiData.quiz[currentQuizIdx];
  const optionsBox = document.getElementById('quiz-options-container');
  optionsBox.querySelectorAll('.quiz-option').forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === quiz.correctAnswer) {
      btn.classList.add('correct');
    } else if (idx === selectedQuizOption) {
      btn.classList.add('incorrect');
    }
  });
  if (selectedQuizOption === quiz.correctAnswer) {
    quizScore += 1;
    document.getElementById('quiz-feedback-success').style.display = 'block';
  } else {
    document.getElementById('quiz-feedback-error').style.display = 'block';
  }
  document.getElementById('btn-quiz-submit').style.display = 'none';
  document.getElementById('btn-quiz-next').style.display = 'block';
});

document.getElementById('btn-quiz-next').addEventListener('click', () => {
  if (currentQuizIdx < aiData.quiz.length - 1) {
    currentQuizIdx += 1;
    showQuizQuestion();
  } else {
    document.getElementById('quiz-question-container').style.display = 'none';
    document.getElementById('quiz-results-container').style.display = 'block';
    document.getElementById('quiz-score-badge').innerText = quizScore;
    document.getElementById('quiz-total-badge').innerText = aiData.quiz.length;
    lucide.createIcons();
  }
});
document.getElementById('btn-quiz-retry').addEventListener('click', () => {
  switchAITab('quiz');
});

// Global Spotlight searches triggers
document.getElementById('btn-search-trigger').addEventListener('click', () => {
  document.getElementById('search-spotlight-overlay').classList.add('active');
  document.getElementById('search-spotlight-input').value = '';
  document.getElementById('search-spotlight-input').focus();
  renderSpotlightSuggestions('');
});
document.getElementById('btn-spotlight-close').addEventListener('click', () => {
  document.getElementById('search-spotlight-overlay').classList.remove('active');
});

// Spotlight input key listeners
document.getElementById('search-spotlight-input').addEventListener('input', (e) => {
  const query = e.target.value.trim();
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (query.length === 0) {
      renderSpotlightSuggestions('');
      return;
    }
    executeSpotlightSearch(query);
  }, 200);
});

// Setup semester clicks filters for both Landing page and Notes page
function initializeSemesterFilters() {
  // 1. Landing Page Semester Directory click triggers
  document.querySelectorAll('#sec-landing .semester-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sem = btn.getAttribute('data-sem');
      currentNotesSemester = sem;
      
      // Update active state in Notes page filter list
      document.querySelectorAll('#notes-semester-filters .semester-btn').forEach(nBtn => {
        if (nBtn.getAttribute('data-sem') === sem) {
          nBtn.classList.add('active');
        } else {
          nBtn.classList.remove('active');
        }
      });
      
      navigateTo('notes');
    });
  });

  // 2. Notes Page Semester Filter Clicks
  const notesFilters = document.getElementById('notes-semester-filters');
  if (notesFilters) {
    notesFilters.querySelectorAll('.semester-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sem = btn.getAttribute('data-sem');
        currentNotesSemester = sem;
        
        notesFilters.querySelectorAll('.semester-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        renderNotesGrid();
      });
    });
  }
}

// Profile settings update submission
const profileForm = document.getElementById('form-profile-update');
if (profileForm) {
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('profile-update-name').value.trim();
    const rollNumber = document.getElementById('profile-update-roll').value.trim();
    const branch = document.getElementById('profile-update-branch').value;
    const semester = parseInt(document.getElementById('profile-update-semester').value);
    const campusBlock = document.getElementById('profile-update-block').value;
    const avatarSeed = document.getElementById('profile-update-avatar').value.trim();
    
    let avatar = currentUser.avatar;
    if (avatarSeed) {
      avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(avatarSeed)}`;
    }
    
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name, avatar, rollNumber, branch, semester, campusBlock })
      });
      const json = await res.json();
      if (res.ok) {
        currentUser = json.data.user;
        alert('JECRC Student Profile updated successfully!');
        syncNavProfile();
        switchDashboardTab('overview');
      } else {
        alert(json.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Profile update action failed:', err);
    }
  });
}

// Bind general elements on page startup loader
window.addEventListener('DOMContentLoaded', () => {
  initializeSubjectPills();
  initializePYQFilters();
  initializeSemesterFilters();
  initializeAuthPage();
  checkAuthSession();
});

// Setup auth page toggle views and visibility switches
function initializeAuthPage() {
  const linkToRegister = document.getElementById('link-to-register');
  const linkToLogin = document.getElementById('link-to-login');
  const loginState = document.getElementById('auth-login-state');
  const registerState = document.getElementById('auth-register-state');
  
  if (linkToRegister && linkToLogin && loginState && registerState) {
    linkToRegister.addEventListener('click', (e) => {
      e.preventDefault();
      loginState.style.display = 'none';
      registerState.style.display = 'block';
      registerState.classList.add('form-fade-in');
      setTimeout(() => registerState.classList.remove('form-fade-in'), 300);
    });
    
    linkToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      registerState.style.display = 'none';
      loginState.style.display = 'block';
      loginState.classList.add('form-fade-in');
      setTimeout(() => loginState.classList.remove('form-fade-in'), 300);
    });
  }
  
  // Forgot password handler
  const linkForgot = document.getElementById('link-forgot-password');
  if (linkForgot) {
    linkForgot.addEventListener('click', (e) => {
      e.preventDefault();
      alert('Password reset link has been requested. Standard campus recovery protocols are executing in the background.');
    });
  }
  
  // Password show/hide toggle
  const toggleLoginPassBtn = document.getElementById('btn-toggle-login-password');
  const loginPassInput = document.getElementById('login-password');
  if (toggleLoginPassBtn && loginPassInput) {
    toggleLoginPassBtn.addEventListener('click', () => {
      const isPass = loginPassInput.type === 'password';
      loginPassInput.type = isPass ? 'text' : 'password';
      toggleLoginPassBtn.innerHTML = `<i data-lucide="${isPass ? 'eye-off' : 'eye'}" style="width: 16px; height: 16px;"></i>`;
      lucide.createIcons();
    });
  }
  
  const toggleRegPassBtn = document.getElementById('btn-toggle-reg-password');
  const regPassInput = document.getElementById('reg-password');
  if (toggleRegPassBtn && regPassInput) {
    toggleRegPassBtn.addEventListener('click', () => {
      const isPass = regPassInput.type === 'password';
      regPassInput.type = isPass ? 'text' : 'password';
      toggleRegPassBtn.innerHTML = `<i data-lucide="${isPass ? 'eye-off' : 'eye'}" style="width: 16px; height: 16px;"></i>`;
      lucide.createIcons();
    });
  }
}
