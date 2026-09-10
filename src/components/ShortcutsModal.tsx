import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: '/', desc: 'Focus Search bar' },
    { key: 'Ctrl + K', desc: 'Command / Search shortcut' },
    { key: 'Ctrl + N', desc: 'Open "Log Issue" modal' },
    { key: 'Ctrl + V', desc: 'Paste screenshot from clipboard inside modal' },
    { key: 'Esc', desc: 'Close any open dialog or full-res screenshot viewer' },
    { key: 'T', desc: 'Toggle between Table View and Responsive Cards' },
    { key: 'D', desc: 'Toggle Dark / Light mode' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tester Keyboard Shortcuts
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800">
          {shortcuts.map((sc) => (
            <div key={sc.key} className="flex items-center justify-between py-2.5 text-xs">
              <span className="text-slate-600 dark:text-slate-300">{sc.desc}</span>
              <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md font-mono text-[11px] font-bold shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400">
          Tip: Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-[10px]">?</kbd> anywhere to bring up this help dialog.
        </div>
      </div>
    </div>
  );
};
