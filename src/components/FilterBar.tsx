import React from 'react';
import { Search, X, Plus, LayoutList, LayoutGrid } from 'lucide-react';
import { FilterOptions } from '../types/issue';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onResetFilters: () => void;
  onOpenNewIssueModal: () => void;
  filteredCount: number;
  totalCount: number;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
  availableModules?: string[];
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onOpenNewIssueModal,
  filteredCount,
  totalCount,
  viewMode,
  onViewModeChange,
  availableModules = [],
  searchInputRef,
}) => {
  const isFiltered =
    filters.search !== '' ||
    filters.module !== 'ALL' ||
    filters.status !== 'ALL' ||
    filters.severity !== 'ALL';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 mb-4 shadow-xs transition-colors duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search and Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Search Input with / shortcut */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={filters.search}
              onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
              placeholder="Search issues, errors, expected, remarks..."
              className="w-full pl-9 pr-14 py-1.5 bg-slate-50 dark:bg-slate-800/90 hover:bg-slate-100/80 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {filters.search ? (
                <button
                  type="button"
                  onClick={() => onFilterChange({ ...filters, search: '' })}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block px-1.5 py-0.2 bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded text-[10px] font-mono select-none">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Module Filter (if modules exist) */}
          {availableModules.length > 0 && (
            <select
              value={filters.module || 'ALL'}
              onChange={(e) => onFilterChange({ ...filters, module: e.target.value })}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
            >
              <option value="ALL">All Modules</option>
              {availableModules.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          )}

          {/* Status Dropdown */}
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Blocked">Blocked</option>
            <option value="Reopened">Reopened</option>
          </select>

          {/* Severity Dropdown */}
          <select
            value={filters.severity}
            onChange={(e) => onFilterChange({ ...filters, severity: e.target.value })}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">🔴 Critical</option>
            <option value="High">🟠 High</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Low">🔵 Low</option>
          </select>

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-xl transition"
            >
              <X className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>

        {/* Right side: View Switcher (Table vs Card Grid) + Count + CTA */}
        <div className="flex items-center justify-between lg:justify-end gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
          {/* View Mode Toggle: Table vs Cards */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              title="Table View (Press 'T' to toggle)"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('cards')}
              title="Card Grid View (Press 'T' to toggle)"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
            <strong className="text-slate-800 dark:text-slate-200">{filteredCount}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong>
          </span>

          <button
            onClick={onOpenNewIssueModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 rounded-xl shadow-xs transition shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Issue</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};
