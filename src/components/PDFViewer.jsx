import { useState } from 'react';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Download, FileText, RotateCw } from 'lucide-react';
import API_BASE_URL from '../config/api';

export default function PDFViewer({ title, subject, author, fileUrl, onDownload }) {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const isIframe = !!(fileUrl && (fileUrl.startsWith('/uploads') || fileUrl.includes('/uploads/')));

  const handleZoom = (type) => {
    if (type === 'in') setZoom(z => Math.min(z + 10, 150));
    if (type === 'out') setZoom(z => Math.max(z - 10, 70));
  };

  const handleRotate = () => {
    setRotation(r => (r + 90) % 360);
  };

  // Mock content generation based on subject/title
  const renderPageContent = () => {
    if (page === 1) {
      return (
        <div className="flex flex-col h-full justify-between p-12 text-slate-800">
          <div className="border-4 border-slate-900 p-6 flex flex-col gap-6 h-full justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-widest border border-slate-900 px-2.5 py-1">TechVault Certified Archive</span>
              <span className="text-xs font-semibold text-slate-500">Ref: TV-{subject.substring(0, 3).toUpperCase()}-99</span>
            </div>
            
            <div className="flex flex-col gap-4 text-center my-auto">
              <span className="text-sm font-bold text-violet-600 uppercase tracking-widest">{subject}</span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight uppercase">{title}</h1>
              <div className="w-20 h-1 bg-slate-900 mx-auto my-4"></div>
              <p className="text-sm text-slate-600 max-w-md mx-auto italic">
                A consensus-driven academic guide compiled for university engineering curriculum. Peer-reviewed by institutional board.
              </p>
            </div>

            <div className="flex justify-between items-end border-t border-slate-200 pt-6">
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Author</span>
                <span className="text-xs font-bold text-slate-800">{author || 'Academic Board'}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Release Year</span>
                <span className="text-xs font-bold text-slate-800">2026</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (page === 2) {
      return (
        <div className="p-10 text-slate-800 text-left flex flex-col gap-6">
          <h2 className="text-xl font-bold text-slate-900 border-b pb-2">1.0 Core Theoretical Framework</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            This module introduces key mathematical formulas, structural components, and processing architectures. The derivation details are aligned with mainstream academic textbooks.
          </p>

          <div className="bg-slate-50 border-l-4 border-violet-500 p-4 my-2">
            <span className="text-xs font-extrabold text-violet-700 uppercase tracking-wide">Key Definition</span>
            <p className="text-xs text-slate-700 mt-1 italic">
              "The system behaves deterministically under boundary conditions. For any given input sequence $x[n]$, the transform $X(z)$ represents the system transfer function."
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <span className="text-xs font-bold text-slate-500">Mathematical Derivation</span>
            <div className="my-3 flex justify-center py-4 bg-white border border-slate-100 rounded text-base font-serif italic text-slate-900">
              f(x) = &int;<sub>a</sub><sup>b</sup> [&psi;(t) &middot; &Phi;(t, x)] dt + &sum; &lambda;<sub>k</sub>
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Figure 1.1: General equation describing linear time-invariant system response under dynamic loads.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1 p-3 border border-slate-200 rounded bg-white">
              <span className="text-xs font-bold text-slate-950 block mb-1">Boundary Condition A</span>
              <span className="text-xs text-slate-500">Normal stress limit: &sigma; &le; 250 MPa</span>
            </div>
            <div className="flex-1 p-3 border border-slate-200 rounded bg-white">
              <span className="text-xs font-bold text-slate-950 block mb-1">Boundary Condition B</span>
              <span className="text-xs text-slate-500">Resonant frequency: f<sub>c</sub> &ge; 4.8 kHz</span>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="p-10 text-slate-800 text-left flex flex-col gap-6">
        <h2 className="text-xl font-bold text-slate-900 border-b pb-2">2.0 Solved Examples & Exam Insights</h2>
        
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs font-bold text-slate-900 block">Question 2.1 (Numerical Analysis)</span>
            <p className="text-xs text-slate-600 mt-1">
              Determine the stability of the system when eigenvalues are given by &lambda;<sub>1</sub> = -2.5 and &lambda;<sub>2</sub> = 0.5 + 3j.
            </p>
            <div className="mt-3 p-3 bg-green-50/50 border-l-2 border-green-500 text-xs">
              <span className="font-bold text-green-800">Detailed Solution:</span>
              <p className="text-slate-700 mt-1 font-mono">
                Real part of &lambda;<sub>1</sub> is negative (-2.5).<br />
                Real part of &lambda;<sub>2</sub> is positive (+0.5).<br />
                Since one eigenvalue lies in the right-half plane, the system is **UNSTABLE**.
              </p>
            </div>
          </div>

          <div className="p-4 bg-violet-50/30 rounded-lg border border-violet-100">
            <span className="text-xs font-bold text-violet-950 block">💡 High-Yield Exam Tip</span>
            <p className="text-xs text-slate-700 mt-1">
              Be prepared for a 15-mark question deriving the stress tensors. Make sure to draw the shear diagrams and state your assumptions before writing equations.
            </p>
          </div>
        </div>

        <div className="mt-auto border-t pt-4 flex justify-between text-xs text-slate-400">
          <span>TechVault study guides © 2026</span>
          <span>End of Document</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-slate-950 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      {/* Viewer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border-b border-white/5 px-4 md:px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200 line-clamp-1">{title}</span>
            <span className="text-[10px] text-slate-500 font-semibold">{subject}</span>
          </div>
        </div>

        {/* Page Nav Controls */}
        {!isIframe && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-300">
              Page {page} of 3
            </span>
            <button
              onClick={() => setPage(p => Math.min(3, p + 1))}
              disabled={page === 3}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2 relative">
          <div className={`relative group flex items-center gap-2 ${isIframe ? 'cursor-not-allowed' : ''}`}>
            {/* Zoom Out */}
            <button
              onClick={() => handleZoom('out')}
              disabled={isIframe || zoom <= 70}
              className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition-colors ${isIframe ? 'pointer-events-none' : ''}`}
              title={isIframe ? undefined : "Zoom Out"}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className={`text-[11px] font-bold text-slate-400 w-10 text-center transition-opacity ${isIframe ? 'opacity-30 pointer-events-none' : ''}`}>
              {zoom}%
            </span>
            {/* Zoom In */}
            <button
              onClick={() => handleZoom('in')}
              disabled={isIframe || zoom >= 150}
              className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition-colors ${isIframe ? 'pointer-events-none' : ''}`}
              title={isIframe ? undefined : "Zoom In"}
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className={`h-6 w-[1px] bg-white/5 mx-1 ${isIframe ? 'pointer-events-none' : ''}`}></div>

            {/* Rotate */}
            <button
              onClick={handleRotate}
              disabled={isIframe}
              className={`p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 transition-colors ${isIframe ? 'pointer-events-none' : ''}`}
              title={isIframe ? undefined : "Rotate Page"}
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {isIframe && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-950 text-slate-200 text-[10px] sm:text-xs py-1.5 px-3 rounded-lg border border-white/10 shadow-xl w-48 text-center sm:w-auto sm:whitespace-nowrap">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-950 border-t border-l border-white/10 rotate-45"></div>
                Zoom and rotation available in enhanced viewer mode.
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-white/5 mx-1 hidden sm:block"></div>

          {/* Download */}
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors cursor-pointer"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* PDF Pages Container */}
      <div className="flex justify-center bg-slate-950 p-4 md:p-6 min-h-[600px] h-[650px] w-full">
        {isIframe ? (
          <iframe
            src={
              fileUrl.startsWith('http')
                ? (() => {
                    try {
                      const parsedUrl = new URL(fileUrl);
                      return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}#toolbar=0&navpanes=0`;
                    } catch {
                      return `${fileUrl}#toolbar=0&navpanes=0`;
                    }
                  })()
                : `${API_BASE_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}#toolbar=0&navpanes=0`
            }
            title={title}
            className="w-full h-full rounded-lg bg-white border border-white/5 shadow-2xl"
          />
        ) : (
          /* The Simulated PDF Sheet */
          <div
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            className="w-full max-w-[620px] aspect-[1/1.4] bg-white rounded-lg shadow-2xl relative overflow-hidden transition-shadow"
          >
            {renderPageContent()}
          </div>
        )}
      </div>
    </div>
  );
}
