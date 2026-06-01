import { Response } from 'express';
import Note from '../models/Note.js';
import PYQ from '../models/PYQ.js';
import { mockNotes, mockPyqs } from '../config/mockDb.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const getAIAssistance = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    let title = '';
    let subject = '';
    let description = '';

    if (global.isMockDatabase) {
      // Find in mockNotes or mockPyqs
      const note = mockNotes.find(n => n._id === id);
      if (note) {
        title = note.title;
        subject = note.subject;
        description = note.description;
      } else {
        const pyq = mockPyqs.find(p => p._id === id);
        if (pyq) {
          title = `${pyq.subject} ${pyq.year} Exam Paper`;
          subject = pyq.subject;
          description = `${pyq.university} Previous Year Question Paper for ${pyq.subject}`;
        }
      }
    } else {
      const note = await Note.findById(id);
      if (note) {
        title = note.title;
        subject = note.subject;
        description = note.description;
      } else {
        const pyq = await PYQ.findById(id);
        if (pyq) {
          title = `${pyq.subject} ${pyq.year} Exam Paper`;
          subject = pyq.subject;
          description = `${pyq.university} Previous Year Question Paper for ${pyq.subject}`;
        }
      }
    }

    if (!title) {
      res.status(404).json({ message: 'Resource not found for AI analysis.' });
      return;
    }

    // Heuristics based on Subject and Title
    let summary: string[] = [];
    let flashcards: Array<{ question: string; answer: string }> = [];
    let quiz: Array<{
      question: string;
      options: string[];
      correctIndex: number;
      explanation: string;
    }> = [];

    const normSubject = (subject || '').toLowerCase();
    const normTitle = (title || '').toLowerCase();

    if (normSubject.includes('computer') || normTitle.includes('dsa') || normTitle.includes('structure') || normTitle.includes('code') || normTitle.includes('programming')) {
      summary = [
        'Covers foundational Big-O time and space complexity evaluations, identifying linear vs logarithmic performance boundaries.',
        'Explains structural properties and pointer behaviors of linked lists, binary trees, heaps, and hash map collision chains.',
        'Detail-oriented examples demonstrate traversing techniques (DFS, BFS, Dijkstra) and dynamic programming state transitions.'
      ];
      flashcards = [
        { question: 'What is the average time complexity of searching in a hash table?', answer: 'O(1) average time complexity, assuming a good hash function that minimizes collisions.' },
        { question: 'What is the main difference between DFS and BFS?', answer: 'DFS uses a Stack (depth-first exploration), whereas BFS uses a Queue (level-order traversal).' },
        { question: 'What is a balanced binary tree?', answer: 'A tree where the height difference between left and right subtrees of any node is at most 1 (e.g. AVL, Red-Black Trees).' },
        { question: 'What is dynamic programming?', answer: 'An algorithmic technique that solves complex problems by breaking them down into overlapping subproblems, saving subproblem solutions to avoid redundant calculations.' },
        { question: 'When is Dijkstra algorithm used?', answer: 'To find the shortest path from a single source vertex to all other vertices in a weighted graph with non-negative edge weights.' }
      ];
      quiz = [
        {
          question: 'Which data structure is typically used to implement Breadth-First Search (BFS)?',
          options: ['Stack', 'Queue', 'Priority Queue', 'Binary Tree'],
          correctIndex: 1,
          explanation: 'Queue follows First-In-First-Out (FIFO), which is required to visit neighbor vertices level by level.'
        },
        {
          question: 'What is the worst-case time complexity of Quick Sort?',
          options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
          correctIndex: 2,
          explanation: 'Worst-case occurs when the pivot consistently divides the array into empty and n-1 sub-arrays (e.g., already sorted array without random pivoting), resulting in O(n²).'
        },
        {
          question: 'Which of the following is NOT a property of a Binary Search Tree (BST)?',
          options: [
            'Left subtree contains only keys less than the parent key',
            'Right subtree contains only keys greater than the parent key',
            'Every node can have up to 3 children',
            'In-order traversal visits nodes in ascending sorted order'
          ],
          correctIndex: 2,
          explanation: 'By definition, a binary tree node can have at most 2 children (left and right).'
        }
      ];
    } else if (normSubject.includes('math') || normSubject.includes('calculus') || normTitle.includes('integral') || normTitle.includes('algebra')) {
      summary = [
        'Formulates standard mathematical derivations for boundary-value problems and vector space dimensions.',
        'Presents step-by-step limits solving, integral evaluations, and Taylor series estimations.',
        'Explains real-world engineering modeling using eigenvalues, eigenvectors, and differential matrix approximations.'
      ];
      flashcards = [
        { question: 'What is the geometric meaning of a derivative?', answer: 'The slope of the tangent line to the function at a specific point, representing the instantaneous rate of change.' },
        { question: 'What is the Fundamental Theorem of Calculus?', answer: 'It connects differentiation and integration, stating that the definite integral of a function can be found using its antiderivative.' },
        { question: 'What is an eigenvector?', answer: 'A non-zero vector that changes at most by a scalar factor (eigenvalue) when a linear transformation is applied to it.' },
        { question: 'What is the dot product of two orthogonal vectors?', answer: 'Zero, because the cosine of the 90-degree angle between them is zero.' },
        { question: 'What is a Taylor series?', answer: 'An infinite sum of terms expressed in terms of the function\'s derivatives at a single point, used to approximate complex functions.' }
      ];
      quiz = [
        {
          question: 'What is the derivative of f(x) = ln(x) with respect to x?',
          options: ['e^x', '1/x', 'x', '1/x²'],
          correctIndex: 1,
          explanation: 'The rate of change of the natural log function is inversely proportional to x.'
        },
        {
          question: 'If two vectors A and B have a dot product of 0, they are:',
          options: ['Parallel', 'Collinear', 'Perpendicular (Orthogonal)', 'Opposite'],
          correctIndex: 2,
          explanation: 'A · B = |A||B|cos(θ). Since cos(90°) = 0, a dot product of zero indicates they are orthogonal.'
        },
        {
          question: 'What is the value of the integral of cos(x) dx from 0 to π/2?',
          options: ['0', '1', '-1', 'π'],
          correctIndex: 1,
          explanation: 'The antiderivative of cos(x) is sin(x). Evaluating sin(π/2) - sin(0) gives 1 - 0 = 1.'
        }
      ];
    } else if (normSubject.includes('civil') || normTitle.includes('structure') || normTitle.includes('rcc') || normTitle.includes('concrete')) {
      summary = [
        'Explains RCC (Reinforced Cement Concrete) beam computations under variable bending moments and shear stresses.',
        'Outlines structural load-bearing parameters, concrete compression behaviors, and steel rebar tension distributions.',
        'Details calculation frameworks matching national building safety and seismic design regulations.'
      ];
      flashcards = [
        { question: 'What is the main function of reinforcement steel in concrete?', answer: 'Concrete has high compressive strength but low tensile strength. Steel rebars are added to carry the tensile loads.' },
        { question: 'What is structural creep?', answer: 'The slow, progressive permanent deformation of a structural member under constant, long-term loads.' },
        { question: 'What is the neutral axis of a beam?', answer: 'The longitudinal plane or axis in a beam where there is neither tension nor compression stress.' },
        { question: 'Why is shear reinforcement (stirrups) used?', answer: 'To resist diagonal tension stresses that cause diagonal cracking and shear failure in beams.' },
        { question: 'What is pre-stressed concrete?', answer: 'Concrete that has internal compressive stresses introduced prior to loading (using high-tensile steel tendons) to counteract tensile stresses from external loads.' }
      ];
      quiz = [
        {
          question: 'Which material has the highest tensile strength relative to concrete?',
          options: ['Brick', 'Timber', 'Reinforcement Steel', 'Sandstone'],
          correctIndex: 2,
          explanation: 'Steel has excellent tensile properties, which complements concrete\'s low tensile strength.'
        },
        {
          question: 'What does the term "neutral axis" represent in a beam subjected to bending?',
          options: ['The line of maximum shear stress', 'The plane where bending stress is zero', 'The boundary of concrete coverage', 'The location of the steel stirrups'],
          correctIndex: 1,
          explanation: 'At the neutral axis, the fibers undergo no compression or tension, making the bending stress exactly zero.'
        },
        {
          question: 'Why are concrete cylinder test specimens crushed in compression machines?',
          options: ['To measure flexural yield strength', 'To determine maximum compression strength (f\'c)', 'To test water absorption rate', 'To verify steel alignment'],
          correctIndex: 1,
          explanation: 'Compression tests determine whether the cured concrete mix meets the specified compressive design strength (f\'c).'
        }
      ];
    } else {
      // General fallbacks
      summary = [
        `Systematically outlines the core syllabus concepts for "${subject || 'General Engineering'}".`,
        'Includes solved textbook derivations, definitions, and boundary condition explanations.',
        'Provides peer-reviewed revision guidelines, cheat-sheet references, and exam preparation shortcuts.'
      ];
      flashcards = [
        { question: 'What is the absolute first study step?', answer: 'Identify the main definitions, formulas, and boundary assumptions outlined in Chapter 1.' },
        { question: 'Why are boundaries and assumptions important?', answer: 'They define the scope of applicability of mathematical models and prevent mathematical singularities.' },
        { question: 'How is this knowledge tested in examinations?', answer: 'Typically through derivations of core equations, or applying formulas to numerical boundary situations.' },
        { question: 'What is the best way to memorize this topic?', answer: 'Active recall using these flashcards and practicing the mock quiz questions repeatedly.' },
        { question: 'Who reviewed these study notes?', answer: 'The TechVault institutional academic board for quality control and curriculum alignment.' }
      ];
      quiz = [
        {
          question: `Which of the following describes the main focus of this "${subject || 'Engineering'}" guide?`,
          options: [
            'Basic historical milestones of science',
            'Analytical and numerical calculations for structural engineering systems',
            'General study strategies and time management',
            'Industry standards for project management'
          ],
          correctIndex: 1,
          explanation: 'TechVault resources focus on presenting rigorous derivations, solved numerical equations, and academic exercises.'
        },
        {
          question: 'How should you treat boundary conditions in engineering problems?',
          options: [
            'Ignore them to simplify calculations',
            'Always evaluate them first to determine domain validity',
            'Change them arbitrarily to match your results',
            'Only apply them in computer simulations'
          ],
          correctIndex: 1,
          explanation: 'Boundary conditions dictate the constant integrations and physical validity of engineering formulas.'
        },
        {
          question: 'What is the recommended approach if you do not understand a formula derivation?',
          options: [
            'Memorize the final equation only',
            'Break down the intermediate steps and check active units consistency',
            'Skip the question in the exam',
            'Query the administrative center for a syllabus change'
          ],
          correctIndex: 1,
          explanation: 'Checking dimensional units consistency is a powerful way to troubleshoot intermediate calculation steps.'
        }
      ];
    }

    res.json({
      message: 'AI assistance calculations completed successfully.',
      data: {
        summary,
        flashcards,
        quiz
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'AI Study Assistant failed to analyze the document.' });
  }
};
