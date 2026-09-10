import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Image as ImageIcon } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  imageUrl?: string;
  imageTitle?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  imageUrl,
  imageTitle,
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageTitle || `qa-screenshot-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 transition-all duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-800/90 border-b border-slate-700/70 text-white">
          <div className="flex items-center gap-2.5 truncate max-w-md">
            <ImageIcon className="w-5 h-5 text-blue-400 shrink-0" />
            <span className="font-medium text-sm text-slate-200 truncate">
              {imageTitle || 'Issue Screenshot'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              title="Zoom out"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 min-w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
              title="Zoom in"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              title="Reset Zoom"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-700 mx-1" />

            <button
              onClick={handleDownload}
              title="Download Screenshot"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>

            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-1.5 ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center min-h-[360px] bg-slate-950/60 select-none">
          <img
            src={imageUrl}
            alt={imageTitle || 'Screenshot'}
            style={{
              transform: `scale(${zoom})`,
              transition: 'transform 0.15s ease-out',
            }}
            className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-2 bg-slate-900 border-t border-slate-800 text-center text-xs text-slate-400">
          Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-700">ESC</kbd> to close. Click and drag or zoom to inspect details.
        </div>
      </div>
    </div>
  );
};
