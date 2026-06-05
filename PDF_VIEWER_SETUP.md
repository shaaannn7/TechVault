# TechVault PDF Viewer - Complete Setup & Debugging Guide

## 🎯 Current Status

**PDF Upload**: ✅ Working  
**PDF Storage**: ✅ Files saved locally in `/uploads`  
**PDF Viewing**: ⚠️ Needs implementation  

---

## 📋 What We Need to Fix/Setup

### 1. Install PDF.js Dependencies

```bash
cd frontend
npm install react-pdf pdfjs-dist
npm install --save-dev @types/react-pdf
```

---

## 2. Create PDF Viewer Component

### Step 1: Create `/frontend/components/PDFViewer.tsx`

```typescript
'use client';

import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// ⚠️ CRITICAL: Configure worker BEFORE using Document
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
}

export default function PDFViewer({ pdfUrl, title = 'PDF Document' }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('✅ PDF loaded:', numPages, 'pages');
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: any) => {
    console.error('❌ PDF load error:', error);
    setError(error.message);
    setLoading(false);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h2 className="text-lg font-bold mb-4">{title}</h2>

      {loading && <div className="text-center py-8">Loading PDF...</div>}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 mb-4">
          Error: {error}
        </div>
      )}

      {!error && (
        <div className="border border-gray-300 bg-white p-4">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
          >
            {numPages && <Page pageNumber={pageNumber} scale={1.5} />}
          </Document>

          {numPages && (
            <div className="mt-4 flex gap-2 items-center">
              <button
                onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                disabled={pageNumber === 1}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Previous
              </button>

              <span>
                {pageNumber} / {numPages}
              </span>

              <button
                onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                disabled={pageNumber === numPages}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Step 2: Use in Note Detail Page

Create `/frontend/app/notes/[id]/page.tsx`:

```typescript
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PDFViewer from '@/components/PDFViewer';

interface Note {
  _id: string;
  title: string;
  pdfUrl: string;
  description?: string;
  uploadedBy?: { name: string };
}

export default function NotePage() {
  const params = useParams();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/notes/${params.id}`;
        console.log('Fetching from:', url);

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch note');

        const data = await response.json();
        setNote(data.data.note);
        setError(null);
      } catch (err: any) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchNote();
  }, [params.id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!note) return <div className="p-8">Note not found</div>;

  // Construct full URL for PDF
  const pdfUrl = note.pdfUrl.startsWith('http')
    ? note.pdfUrl
    : `${process.env.NEXT_PUBLIC_API_URL}${note.pdfUrl}`;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">{note.title}</h1>
      <p className="text-gray-600 mb-6">{note.description}</p>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <PDFViewer pdfUrl={pdfUrl} title={note.title} />
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 text-sm">
          <p><strong>Debug:</strong> PDF URL: {pdfUrl}</p>
        </div>
      )}
    </div>
  );
}
```

---

## 3. Configure Backend to Serve PDF Files

### Update `/backend/src/server.ts`

```typescript
// Add this line before other middleware
app.use('/uploads', express.static('uploads'));

// Add CORS headers for PDFs
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/pdf');
  next();
});
```

---

## 4. Update Next.js Config

### Update `/frontend/next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Disable canvas on server-side
    config.resolve.alias.canvas = false;

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },

  // Allow external PDFs
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
      },
    ],
  },
};

export default nextConfig;
```

---

## 🔍 Debugging Checklist

### Console Checks (Browser DevTools - F12)

```javascript
// Check if PDF.js worker is loaded
pdfjs.GlobalWorkerOptions.workerSrc
// Should output: //cdnjs.cloudflare.com/ajax/libs/pdf.js/3.x.x/pdf.worker.min.js

// Check if Document component is working
console.log('PDF.js version:', pdfjs.version)

// Monitor PDF loading
console.log('Attempting to load PDF from:', pdfUrl)
```

### Network Tab Checks (F12 → Network)

1. **PDF File Request**
   - URL: `http://localhost:5000/uploads/filename.pdf`
   - Status: **200** ✅
   - Type: `document` or `application/pdf`
   - Size: Should show file size

2. **Worker File Request**
   - URL: `//cdnjs.cloudflare.com/ajax/libs/pdf.js/X.X.X/pdf.worker.min.js`
   - Status: **200** ✅
   - Type: `application/javascript`

3. **API Request**
   - URL: `http://localhost:5000/api/notes/[id]`
   - Status: **200** ✅
   - Response should include `pdfUrl`

### Common Issues & Fixes

#### Issue 1: "Cannot find name 'Document'"
```
Error: TypeScript error - Document not found
Fix:
1. Run: npm install react-pdf
2. Check import: import { Document, Page } from 'react-pdf'
3. Verify 'react-pdf' in package.json
```

#### Issue 2: PDF Shows Blank/White
```
Error: PDF loads but pages don't render
Fix:
1. Check worker is configured: GlobalWorkerOptions.workerSrc
2. Verify Page component has width prop: width={800}
3. Check scale is > 0: scale={1.5}
4. Ensure PDF URL is correct and accessible
```

#### Issue 3: Worker Load Fails
```
Error: Failed to load pdf worker
Fix:
1. Check CDN is accessible: cdnjs.cloudflare.com
2. Verify URL: //cdnjs.cloudflare.com/ajax/libs/pdf.js/{version}/pdf.worker.min.js
3. Or copy worker locally: cp node_modules/pdfjs-dist/build/pdf.worker.min.js public/
4. Use local: workerSrc = '/pdf.worker.min.js'
```

#### Issue 4: CORS Error
```
Error: Access blocked by CORS policy
Fix:
1. Backend must serve PDFs with CORS headers
2. Add to server.ts:
   app.use('/uploads', (req, res, next) => {
     res.setHeader('Access-Control-Allow-Origin', '*');
     next();
   });
3. Restart backend
```

#### Issue 5: PDF URL Not Found
```
Error: 404 PDF not found
Fix:
1. Check file exists in backend/uploads/
2. Verify URL format: /uploads/filename.pdf or absolute
3. Check database has correct pdfUrl
4. Test URL in browser directly
```

---

## 📊 Testing Steps

### Step 1: Verify PDF Upload Works
```bash
# 1. Register user
POST http://localhost:5000/api/auth/register
{
  "name": "Test User",
  "email": "test@test.com",
  "password": "Password123"
}

# 2. Login
POST http://localhost:5000/api/auth/login
{
  "email": "test@test.com",
  "password": "Password123"
}
# Save the token from response

# 3. Upload PDF
POST http://localhost:5000/api/notes
Authorization: Bearer [TOKEN]
Content-Type: multipart/form-data

file: [Select a PDF file]
title: "Test Note"
semester: 3
branch: "CSE"
category: "Lecture Notes"
```

### Step 2: Check File Exists
```bash
# On Windows PowerShell
Get-ChildItem C:\Users\shaan\Downloads\TechVault\backend\uploads

# On Mac/Linux
ls backend/uploads/
```

### Step 3: Test PDF Display
1. Go to `http://localhost:3000/notes/[NOTE_ID]`
2. Open DevTools (F12)
3. Check Console for logs
4. Check Network tab for PDF request
5. Verify PDF renders on page

### Step 4: Debug PDF Viewer
```javascript
// In browser console
// Check if PDF.js is loaded
typeof pdfjs

// Check worker URL
pdfjs.GlobalWorkerOptions.workerSrc

// Check PDF.js version
pdfjs.version

// Check if react-pdf is working
typeof Document
typeof Page
```

---

## 🛠️ Advanced Configuration

### Custom PDF Viewer with More Features

```typescript
'use client';

import React, { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  pdfUrl: string;
  title?: string;
  defaultScale?: number;
}

export default function AdvancedPDFViewer({
  pdfUrl,
  title = 'Document',
  defaultScale = 1.5,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(defaultScale);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      console.log('✅ PDF loaded:', numPages, 'pages from', pdfUrl);
      setNumPages(numPages);
      setLoading(false);
    },
    [pdfUrl]
  );

  const handleLoadError = useCallback((err: any) => {
    console.error('❌ PDF Error:', err);
    setError(err.message);
    setLoading(false);
  }, []);

  const handleRenderError = useCallback((err: any) => {
    console.error('❌ Render Error:', err.message);
  }, []);

  const goToPage = (page: number) => {
    if (numPages) {
      setPageNumber(Math.max(1, Math.min(page, numPages)));
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    if (direction === 'in') {
      setScale((prev) => Math.min(prev + 0.2, 3));
    } else {
      setScale((prev) => Math.max(prev - 0.2, 0.5));
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-gray-50 rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-lg font-bold">{title}</h2>
        {numPages && (
          <span className="text-sm text-gray-600">
            Page {pageNumber} of {numPages}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => goToPage(pageNumber - 1)}
          disabled={pageNumber === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          ← Prev
        </button>

        <input
          type="number"
          value={pageNumber}
          onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
          min="1"
          max={numPages || 1}
          className="w-16 px-2 py-2 border rounded"
        />

        <button
          onClick={() => goToPage(pageNumber + 1)}
          disabled={pageNumber === numPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next →
        </button>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => handleZoom('out')}
            className="px-3 py-2 bg-gray-500 text-white rounded"
          >
            −
          </button>
          <span className="px-3 py-2 bg-gray-100">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => handleZoom('in')}
            className="px-3 py-2 bg-gray-500 text-white rounded"
          >
            +
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && <div className="h-96 flex items-center justify-center">Loading PDF...</div>}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* PDF Viewer */}
      {!error && (
        <div className="border border-gray-300 bg-white p-4 max-h-96 overflow-auto">
          <Document
            file={pdfUrl}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={<div>Loading...</div>}
          >
            {numPages && (
              <Page
                pageNumber={pageNumber}
                scale={scale}
                onRenderError={handleRenderError}
                renderTextLayer
                renderAnnotationLayer
              />
            )}
          </Document>
        </div>
      )}
    </div>
  );
}
```

---

## ✅ Verification Checklist

- [ ] `npm install react-pdf pdfjs-dist` completed
- [ ] PDFViewer component created
- [ ] Global worker configured
- [ ] Backend serves `/uploads` files
- [ ] CORS headers set
- [ ] Next.js config updated
- [ ] PDF upload working
- [ ] PDF file exists on disk
- [ ] PDF URL accessible in browser
- [ ] PDF renders without errors
- [ ] Pages can be navigated
- [ ] Zoom works
- [ ] No console errors
- [ ] Network requests successful (200)

---

## 🎯 Next Steps

1. **Install dependencies**: `npm install react-pdf pdfjs-dist`
2. **Create PDFViewer component** in frontend/components/
3. **Create notes detail page** in frontend/app/notes/[id]/
4. **Test PDF upload** through UI
5. **Navigate to note** and view PDF
6. **Check DevTools** for any errors
7. **Debug using checklist** above if needed

---

**PDF Viewer Setup Complete!** 📄✨

Backend serving PDFs: http://localhost:5000/uploads/  
Frontend displaying: http://localhost:3000/notes/[id]

