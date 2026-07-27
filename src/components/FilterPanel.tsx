import { RotateCcw } from 'lucide-react';
import type { DomainFilters } from '../hooks/use-domain-store';

interface FilterPanelProps {
  filters: DomainFilters;
  onFilterChange: <K extends keyof DomainFilters>(key: K, value: DomainFilters[K]) => void;
  onClear: () => void;
  resultCount: number;
}

export function FilterPanel({ filters, onFilterChange, onClear, resultCount }: FilterPanelProps) {
  return (
    <div className="w-64 shrink-0 border-r border-[var(--border)] bg-[var(--bg-panel)] overflow-y-auto">
      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Filters</h2>
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear
          </button>
        </div>

        {/* Length Range */}
        <div>
          <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">
            Length: {filters.lengthMin} – {filters.lengthMax}
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min={1}
              max={30}
              value={filters.lengthMin}
              onChange={(e) => {
                const v = Number(e.target.value);
                onFilterChange('lengthMin', Math.min(v, filters.lengthMax));
              }}
              className="w-full h-1 appearance-none bg-[var(--border)] rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)] [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <input
              type="range"
              min={1}
              max={30}
              value={filters.lengthMax}
              onChange={(e) => {
                const v = Number(e.target.value);
                onFilterChange('lengthMax', Math.max(v, filters.lengthMin));
              }}
              className="w-full h-1 appearance-none bg-[var(--border)] rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)] [&::-webkit-slider-thumb]:cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
            <span>Shortest</span>
            <span>Longest</span>
          </div>
        </div>

        {/* Keyword */}
        <div>
          <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">Keyword</label>
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => onFilterChange('keyword', e.target.value)}
            placeholder="e.g. ai, cloud, crypto"
            className="w-full h-8 px-2.5 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

        {/* Pattern Toggles */}
        <div>
          <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">Patterns</label>
          <div className="space-y-2">
            {[
              { key: 'noNumbers' as const, label: 'No Numbers' },
              { key: 'noHyphens' as const, label: 'No Hyphens' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-8 h-4 rounded-full transition-colors relative ${
                  filters[key] ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'
                }`}>
                  <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                    filters[key] ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </div>
                <input
                  type="checkbox"
                  checked={filters[key]}
                  onChange={(e) => onFilterChange(key, e.target.checked)}
                  className="hidden"
                />
                <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Domain Structure */}
        <div>
          <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">Structure</label>
          <div className="space-y-1.5">
            <input
              type="text"
              value={filters.startsWith}
              onChange={(e) => onFilterChange('startsWith', e.target.value)}
              placeholder="Starts with"
              className="w-full h-7 px-2 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition-colors"
            />
            <input
              type="text"
              value={filters.endsWith}
              onChange={(e) => onFilterChange('endsWith', e.target.value)}
              placeholder="Ends with"
              className="w-full h-7 px-2 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition-colors"
            />
            <input
              type="text"
              value={filters.contains}
              onChange={(e) => onFilterChange('contains', e.target.value)}
              placeholder="Contains"
              className="w-full h-7 px-2 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block mb-2">Sort</label>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange('sortBy', e.target.value as typeof filters.sortBy)}
            className="w-full h-8 px-2.5 text-xs bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)] outline-none focus:border-[var(--primary)] transition-colors appearance-none cursor-pointer"
          >
            <option value="newest">Newest Drop</option>
            <option value="oldest">Oldest Drop</option>
            <option value="shortest">Shortest Domain</option>
            <option value="longest">Longest Domain</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        {/* Results count */}
        <div className="pt-2 border-t border-[var(--border)]">
          <div className="text-xs text-[var(--text-muted)]">
            <span className="text-[var(--text-primary)] font-medium">{resultCount.toLocaleString()}</span> domains
          </div>
        </div>
      </div>
    </div>
  );
}
