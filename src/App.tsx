import { Globe, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from './api/client';
import type { BackendDomain } from './api/client';

function App() {
  const [domains, setDomains] = useState<BackendDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);

  const [search, setSearch] = useState('');
  const [minLen, setMinLen] = useState(1);
  const [maxLen, setMaxLen] = useState(30);
  const [sort, setSort] = useState('alpha_asc');

  const limit = 200;

  useEffect(() => {
    setLoading(true);
    api.searchDomains({
      page, limit, sort,
      search: search || undefined,
      min_length: minLen > 1 ? minLen : undefined,
      max_length: maxLen < 30 ? maxLen : undefined,
      has_hyphen: false,
      has_numbers: false,
    }).then(res => {
      setDomains(res.items);
      setTotal(res.total);
      setTotalPages(res.pages);
      setLoading(false);
      if (listRef.current) listRef.current.scrollTop = 0;
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, [page, search, minLen, maxLen, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-[var(--danger)] text-sm">{error}</div>
          <button onClick={() => window.location.reload()} className="text-xs text-[var(--primary)] hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center gap-4">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <span className="font-semibold text-base tracking-tight hidden sm:inline">DomainDropper</span>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search domains..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition-colors"
            />
          </form>

          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span>{total.toLocaleString()} domains</span>
          </div>
        </div>
      </header>

      {/* Filters bar */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-panel)]/50">
        <div className="max-w-5xl mx-auto px-5 h-10 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Len</label>
            <select
              value={minLen}
              onChange={e => { setMinLen(Number(e.target.value)); setPage(1); }}
              className="h-7 px-2 text-[11px] bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <span className="text-[10px] text-[var(--text-muted)]">to</span>
            <select
              value={maxLen}
              onChange={e => { setMaxLen(Number(e.target.value)); setPage(1); }}
              className="h-7 px-2 text-[11px] bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
            >
              {[5,6,7,8,9,10,15,20,30].map(n => (
                <option key={n} value={n}>{n === 30 ? '30+' : n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-medium">Sort</label>
            <select
              value={sort}
              onChange={e => { setSort(e.target.value); setPage(1); }}
              className="h-7 px-2 text-[11px] bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
            >
              <option value="alpha_asc">A-Z</option>
              <option value="alpha_desc">Z-A</option>
              <option value="length_asc">Shortest</option>
              <option value="length_desc">Longest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div ref={listRef} className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : domains.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center space-y-1">
                <div className="text-sm text-[var(--text-muted)]">No domains match your filters</div>
                <div className="text-[10px] text-[var(--text-muted)]/60">Try adjusting the search or length range</div>
              </div>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-3 px-5 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)]">
                <div className="col-span-7 sm:col-span-6">Domain</div>
                <div className="col-span-2 sm:col-span-2 text-right">Length</div>
                <div className="col-span-2 sm:col-span-2 text-right">Letters</div>
                <div className="col-span-1 sm:col-span-2 text-right hidden sm:block">Status</div>
              </div>

              {/* Table rows */}
              {domains.map(d => (
                  <div
                    key={d.id}
                    className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[var(--border)]/30 hover:bg-[var(--bg-panel)] transition-colors items-center"
                  >
                    <div className="col-span-7 sm:col-span-6 min-w-0">
                      <span className="text-sm font-medium text-[var(--text-primary)] truncate block">
                        {d.domain}<span className="text-[var(--text-muted)]">.{d.tld}</span>
                      </span>
                    </div>
                    <div className="col-span-2 sm:col-span-2 text-right">
                      <span className="text-xs tabular-nums text-[var(--text-muted)]">{d.length}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-2 text-right">
                      <span className="text-xs tabular-nums text-[var(--text-muted)]">{d.letters}</span>
                    </div>
                    <div className="col-span-1 sm:col-span-2 text-right hidden sm:block">
                      <span className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded-full ${
                        d.available
                          ? 'bg-[var(--success)]/10 text-[var(--success)]'
                          : 'bg-[var(--text-muted)]/10 text-[var(--text-muted)]'
                      }`}>
                        {d.available ? 'Free' : 'Taken'}
                      </span>
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="border-t border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur-sm sticky bottom-0">
        <div className="max-w-5xl mx-auto px-5 h-12 flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-muted)]">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex items-center gap-1 px-3 h-8 text-xs font-medium rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 text-xs font-medium rounded-lg transition-all ${
                      p === page
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-3 h-8 text-xs font-medium rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;