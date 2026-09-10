import React, { useRef, useState } from 'react';
import {
  Bug,
  FolderKanban,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  ChevronDown,
  Edit3,
  Trash2,
  Cloud,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Keyboard,
  Menu,
  X,
  Database,
} from 'lucide-react';
import { Project, Issue } from '../types/issue';
import { exportIssuesToCSV, exportProjectToJSON } from '../utils/export';

interface HeaderProps {
  projects: Project[];
  activeProject: Project | null;
  issues: Issue[];
  onSelectProject: (projectId: string) => void;
  onOpenNewProjectModal: () => void;
  onOpenEditProjectModal: () => void;
  onDeleteProject: () => void;
  onOpenNewIssueModal: () => void;
  onImportJSON: (file: File) => void;
  onOpenCloudinaryModal: () => void;
  isCloudinaryActive: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  onOpenShortcutsModal: () => void;
  isBackendOnline?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  projects,
  activeProject,
  issues,
  onSelectProject,
  onOpenNewProjectModal,
  onOpenEditProjectModal,
  onDeleteProject,
  onOpenNewIssueModal,
  onImportJSON,
  onOpenCloudinaryModal,
  isCloudinaryActive,
  isDarkMode,
  onToggleDarkMode,
  isSoundEnabled,
  onToggleSound,
  onOpenShortcutsModal,
  isBackendOnline = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJSON(file);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* App Brand Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 active:scale-95 transition-transform">
              <Bug className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-sm sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  QA Issue Logger
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-bold tracking-wider uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-md">
                  Pro
                </span>
                {/* Live Backend Indicator Badge */}
                <div
                  title={
                    isBackendOnline
                      ? 'Connected to Java Spring Boot & H2 Database (port 3001)'
                      : 'Offline Mode: Saving to browser IndexedDB'
                  }
                  className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border transition cursor-default ${
                    isBackendOnline
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isBackendOnline
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>{isBackendOnline ? 'Java Spring Boot Live' : 'Offline (Local)'}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden lg:block">
                Defect Tracking & Test Management Workspace
              </p>
            </div>
          </div>

          {/* Center: Project Switcher Dropdown */}
          <div className="flex items-center">
            <div className="relative group">
              <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-300/80 dark:border-slate-700 rounded-xl p-0.5 sm:p-1 transition shadow-xs">
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 cursor-pointer">
                  <FolderKanban className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
                  <div className="text-left">
                    <span className="text-[9px] sm:text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 block leading-none">
                      Project
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 max-w-[100px] sm:max-w-[200px] truncate">
                        {activeProject?.name || 'Select'}
                      </span>
                      {activeProject?.prefix && (
                        <span className="hidden sm:inline-block px-1.5 py-0.2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono font-bold">
                          {activeProject.prefix}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
                </div>

                {/* Dropdown Menu */}
                <div className="absolute left-0 top-full mt-1.5 w-64 sm:w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 hidden group-hover:block z-40 animate-fadeIn">
                  <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Switch Project
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => onSelectProject(proj.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition ${
                          proj.id === activeProject?.id
                            ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{proj.name}</span>
                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                          {proj.prefix}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1 space-y-1">
                    <button
                      onClick={onOpenNewProjectModal}
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create New Project
                    </button>
                    {activeProject && (
                      <button
                        onClick={onOpenEditProjectModal}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Project Settings
                      </button>
                    )}
                    {projects.length > 1 && (
                      <button
                        onClick={onDeleteProject}
                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Current Project
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Bar (Desktop) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Cloudinary Settings Button */}
            <button
              onClick={onOpenCloudinaryModal}
              title={
                isCloudinaryActive
                  ? 'Cloudinary CDN Connected'
                  : 'Configure Cloudinary CDN for Screenshots'
              }
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition shadow-xs active:scale-95 ${
                isCloudinaryActive
                  ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800 hover:bg-sky-100'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              <Cloud
                className={`w-3.5 h-3.5 ${
                  isCloudinaryActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'
                }`}
              />
              <span className="hidden xl:inline">Cloudinary</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isCloudinaryActive
                    ? 'bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            </button>

            {/* Export CSV Button */}
            {activeProject && (
              <button
                onClick={() => exportIssuesToCSV(activeProject, issues)}
                title="Export Issues to CSV (Excel format)"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-xl transition shadow-xs active:scale-95"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Export CSV</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={isSoundEnabled ? 'Sound Effects Enabled (Click to mute)' : 'Sound Effects Muted'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition active:scale-95"
            >
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition active:scale-95"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Keyboard Shortcuts Helper */}
            <button
              onClick={onOpenShortcutsModal}
              title="Keyboard Shortcuts (?)"
              className="hidden sm:flex p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition active:scale-95"
            >
              <Keyboard className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>

            {/* Primary CTA: Log Issue */}
            <button
              type="button"
              onClick={onOpenNewIssueModal}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl shadow-md shadow-blue-500/25 transition shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log Issue</span>
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="More actions"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 dark:border-slate-800 space-y-2 animate-fadeIn">
            {/* Backend status row for mobile */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Database Backend</span>
              <span className={`inline-flex items-center gap-1.5 font-bold ${
                isBackendOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isBackendOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {isBackendOnline ? 'Java Spring Boot (port 3001)' : 'IndexedDB (Offline)'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  onOpenCloudinaryModal();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-200"
              >
                <Cloud className="w-4 h-4 text-sky-500" />
                Cloudinary CDN
              </button>

              {activeProject && (
                <button
                  onClick={() => {
                    exportIssuesToCSV(activeProject, issues);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg font-medium text-emerald-700 dark:text-emerald-300"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  Export CSV
                </button>
              )}

              {activeProject && (
                <button
                  onClick={() => {
                    exportProjectToJSON(activeProject, issues);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-200"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Backup JSON
                </button>
              )}

              <button
                onClick={() => {
                  fileInputRef.current?.click();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg font-medium text-slate-700 dark:text-slate-200"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                Import JSON
              </button>

              <button
                onClick={() => {
                  onOpenShortcutsModal();
                  setIsMobileMenuOpen(false);
                }}
                className="col-span-2 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800/80 rounded-lg font-medium text-slate-700 dark:text-slate-200"
              >
                <Keyboard className="w-4 h-4 text-slate-500" />
                Keyboard Shortcuts Guide
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
