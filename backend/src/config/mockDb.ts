export interface MockUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: 'user' | 'admin' | 'moderator';
  isVerified: boolean;
  isActive: boolean;
  bookmarks: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MockNote {
  _id: string;
  title: string;
  description: string;
  subject: string;
  fileUrl: string;
  fileName: string;
  uploadedBy: { _id: string; name: string; email: string };
  fileSize: number;
  downloads: number;
  rating: number;
  reviews: MockReview[];
  tags: string[];
  isPublished: boolean;
  isDraft: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockReview {
  _id: string;
  rating: number;
  comment: string;
  author: string;
  userId: string;
  noteId: string;
  createdAt: string;
}

export interface MockPYQ {
  _id: string;
  year: number;
  subject: string;
  fileUrl: string;
  fileName: string;
  university: string;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  uploadedBy: { _id: string; name: string; email: string };
  downloads: number;
  isFree: boolean;
  createdAt: string;
}

export const mockUsers: MockUser[] = [
  {
    _id: 'user-admin-id',
    name: 'Admin User',
    email: 'admin@techvault.com',
    password: 'Password123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    bookmarks: ['note-1-id', 'note-4-id'],
    isVerified: true,
    isActive: true,
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-05-01T00:00:00Z'
  },
  {
    _id: 'user-student-id',
    name: 'Jane Student',
    email: 'student@example.com',
    password: 'Password123',
    role: 'user',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=student',
    bookmarks: ['note-2-id'],
    isVerified: true,
    isActive: true,
    createdAt: '2026-05-15T00:00:00Z',
    updatedAt: '2026-05-15T00:00:00Z'
  }
];

export const mockNotes: MockNote[] = [
  {
    _id: 'note-1-id',
    title: 'Data Structures & Algorithms - Ultimate Guide',
    description: 'Comprehensive guide to DSA. Covers arrays, trees, graphs, sorting, dynamic programming, and complexity analysis.',
    subject: 'Computer Science',
    uploadedBy: { _id: 'user-admin-id', name: 'Admin User', email: 'admin@techvault.com' },
    fileSize: 4500000,
    downloads: 142,
    rating: 4.8,
    reviews: [
      { _id: 'rev-1', rating: 5, comment: 'Amazing resource! Highly recommend.', author: 'Rohan Mehta', userId: 'user-student-id', noteId: 'note-1-id', createdAt: '2026-05-20T10:00:00Z' },
      { _id: 'rev-2', rating: 4, comment: 'Very detailed. Good explanations.', author: 'Preeti Shah', userId: 'user-student-id', noteId: 'note-1-id', createdAt: '2026-05-21T12:00:00Z' }
    ],
    tags: ['DSA', 'Programming', 'Interview'],
    isPublished: true,
    isDraft: false,
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'dsa_ultimate_guide.pdf',
    createdAt: '2026-05-19T08:00:00Z',
    updatedAt: '2026-05-19T08:00:00Z'
  },
  {
    _id: 'note-2-id',
    title: 'Structural Analysis & RCC Design Manual',
    description: 'Design guidelines for reinforcement concrete structures, beam analysis, column load computations, and shear reinforcement.',
    subject: 'Civil Engineering',
    uploadedBy: { _id: 'user-student-id', name: 'Jane Student', email: 'student@example.com' },
    fileSize: 8200000,
    downloads: 87,
    rating: 5.0,
    reviews: [],
    tags: ['RCC', 'Structural', 'Concrete'],
    isPublished: true,
    isDraft: false,
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'rcc_design_manual.pdf',
    createdAt: '2026-05-20T09:15:00Z',
    updatedAt: '2026-05-20T09:15:00Z'
  },
  {
    _id: 'note-pending-id',
    title: 'Operating Systems - Process Scheduling Cheatsheet',
    description: 'Handwritten cheatsheet covering FIFO, SJF, Round Robin, and Priority scheduling algorithms with gantt chart calculations.',
    subject: 'Computer Science',
    uploadedBy: { _id: 'user-student-id', name: 'Jane Student', email: 'student@example.com' },
    fileSize: 1200000,
    downloads: 0,
    rating: 0,
    reviews: [],
    tags: ['OS', 'Scheduling', 'Exam Prep'],
    isPublished: false,
    isDraft: false,
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'os_scheduling_cheatsheet.pdf',
    createdAt: '2026-05-27T16:00:00Z',
    updatedAt: '2026-05-27T16:00:00Z'
  }
];

export const mockPyqs: MockPYQ[] = [
  {
    _id: 'pyq-1-id',
    year: 2024,
    subject: 'Computer Science',
    university: 'RTU (Rajasthan Technical University)',
    difficultyLevel: 'Hard',
    downloads: 412,
    isFree: true,
    uploadedBy: { _id: 'user-admin-id', name: 'Admin User', email: 'admin@techvault.com' },
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'rtu_dsa_2_sem_2024.pdf',
    createdAt: '2026-05-20T10:00:00Z'
  },
  {
    _id: 'pyq-2-id',
    year: 2023,
    subject: 'Mathematics',
    university: 'RTU (Rajasthan Technical University)',
    difficultyLevel: 'Medium',
    downloads: 301,
    isFree: true,
    uploadedBy: { _id: 'user-student-id', name: 'Jane Student', email: 'student@example.com' },
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'rtu_math_2_endsem_2023.pdf',
    createdAt: '2026-05-21T09:00:00Z'
  },
  {
    _id: 'pyq-3-id',
    year: 2024,
    subject: 'Electronics Engineering',
    university: 'Mumbai University',
    difficultyLevel: 'Medium',
    downloads: 185,
    isFree: true,
    uploadedBy: { _id: 'user-admin-id', name: 'Admin User', email: 'admin@techvault.com' },
    fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    fileName: 'mu_signals_and_systems_2024.pdf',
    createdAt: '2026-05-22T14:30:00Z'
  }
];
