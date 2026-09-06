import { Globe, Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown, Database, SearchX, ExternalLink } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from './api/client';
import type { BackendDomain, BackendExpiringDomain } from './api/client';

const LENGTH_OPTIONS_MIN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const LENGTH_OPTIONS_MAX = [5, 6, 7, 8, 9, 10, 15, 20, 30];
const PAGE_SIZE_OPTIONS = [50, 100, 200, 500];

function getPageItems(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const delta = 1;
  const items: (number | 'gap')[] = [1];
  const left = Math.max(2, page - delta);
  const right = Math.min(totalPages - 1, page + delta);
  if (left > 2) items.push('gap');
  for (let i = left; i <= right; i++) items.push(i);
  if (right < totalPages - 1) items.push('gap');
  items.push(totalPages);
  return items;
}

function highlight(text: string, query: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-[var(--primary)]/25 text-[var(--primary)] rounded px-0.5">{part}</mark>
      : part
  );
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function App() {
  const [domains, setDomains] = useState<BackendDomain[]>([]);
  const [expiring, setExpiring] = useState<BackendExpiringDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [minLen, setMinLen] = useState(1);
  const [maxLen, setMaxLen] = useState(30);
  const [sort, setSort] = useState('alpha_asc');
  const [limit, setLimit] = useState(200);
  const [view, setView] = useState<'expired' | 'expiring'>('expired');
  const [availability, setAvailability] = useState<'available' | 'taken' | 'both'>('available');

  // Debounce search input to avoid spamming the API
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Focus search with "/"
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);

    const finish = (res: { total: number; pages: number }) => {
      if (id !== requestId.current) return;
      setTotal(res.total);
      setTotalPages(res.pages);
      setLoading(false);
      if (listRef.current) listRef.current.scrollTop = 0;
    };

    const onError = (e: unknown) => {
      if (id !== requestId.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load');
      setLoading(false);
    };

    if (view === 'expiring') {
      api.getExpiringDomains({
        page, limit, sort,
        search: debouncedSearch || undefined,
        min_length: minLen > 1 ? minLen : undefined,
        max_length: maxLen < 30 ? maxLen : undefined,
        has_hyphen: false,
        has_numbers: false,
      }).then(res => {
        if (id !== requestId.current) return;
        setExpiring(res.items);
        finish(res);
      }).catch(onError);
    } else {
      api.searchDomains({
        page, limit, sort,
        search: debouncedSearch || undefined,
        available: availability === 'both' ? undefined : availability === 'available',
        min_length: minLen > 1 ? minLen : undefined,
        max_length: maxLen < 30 ? maxLen : undefined,
        has_hyphen: false,
        has_numbers: false,
      }).then(res => {
        if (id !== requestId.current) return;
        setDomains(res.items);
        finish(res);
      }).catch(onError);
    }
  }, [page, debouncedSearch, minLen, maxLen, sort, limit, view, availability]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setPage(1);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center px-5">
        <div className="text-center space-y-4 max-w-sm">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--danger)]/10 flex items-center justify-center">
            <SearchX className="w-6 h-6 text-[var(--danger)]" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-[var(--text-primary)]">Something went wrong</div>
            <div className="text-xs text-[var(--text-muted)]">{error}</div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 h-9 text-xs font-medium rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 h-14 sm:h-16 flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block leading-tight">
              <span className="font-bold text-sm tracking-tight block">DomainDropper</span>
              <span className="block text-[10px] text-[var(--text-muted)] font-medium">Expiring domain tracker</span>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search domains..."
              className="w-full h-10 pl-10 pr-14 text-sm bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)] transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {search ? (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setPage(1); searchRef.current?.focus(); }}
                  className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="hidden sm:flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-muted)] rounded-md bg-[var(--bg-elevated)] border border-[var(--border)]">
                  /
                </span>
              )}
            </div>
          </form>

          <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-xl bg-[var(--bg-panel)] border border-[var(--border)]">
            <Database className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              {total.toLocaleString()}<span className="text-[var(--text-faint)]"> domains</span>
            </span>
          </div>
        </div>
      </header>

      {/* View tabs */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-panel)]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 flex items-center gap-1">
          <button
            onClick={() => { setView('expired'); setPage(1); }}
            className={`relative h-11 px-4 text-xs font-semibold transition-colors ${
              view === 'expired'
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Expired Domains
            {view === 'expired' && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--primary)]" />
            )}
          </button>
          <button
            onClick={() => { setView('expiring'); setPage(1); }}
            className={`relative h-11 px-4 text-xs font-semibold transition-colors ${
              view === 'expiring'
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Expiring (Redemption)
            {view === 'expiring' && (
              <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[var(--warning)]" />
            )}
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-panel)]/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 py-2.5 sm:py-0 sm:h-12 flex flex-wrap sm:flex-nowrap items-center gap-x-5 sm:gap-6 gap-y-2.5">
          <div className="flex items-center gap-2.5">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Length</label>
            <div className="flex items-center gap-1.5">
              <Select value={minLen} onChange={v => { setMinLen(v); setPage(1); }} options={LENGTH_OPTIONS_MIN} />
              <span className="text-[11px] text-[var(--text-faint)]">to</span>
              <Select value={maxLen} onChange={v => { setMaxLen(v); setPage(1); }} options={LENGTH_OPTIONS_MAX} />
            </div>
          </div>

          <div className="w-px h-5 bg-[var(--border)] hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <label className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Sort</label>
            <div className="relative">
              <select
                value={sort}
                onChange={e => { setSort(e.target.value); setPage(1); }}
                className="appearance-none h-8 pl-3 pr-8 text-xs font-medium bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)] hover:border-[var(--border-strong)] cursor-pointer transition-colors"
              >
                <option value="alpha_asc">A – Z</option>
                <option value="alpha_desc">Z – A</option>
                <option value="length_asc">Shortest</option>
                <option value="length_desc">Longest</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          <div className="w-px h-5 bg-[var(--border)] hidden sm:block" />

          {view === 'expired' && (
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)]">
              {([
                ['available', 'Available'],
                ['taken', 'Taken'],
                ['both', 'Both'],
              ] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => { setAvailability(val); setPage(1); }}
                  className={`h-7 px-3 text-xs font-medium rounded-md transition-colors ${
                    availability === val
                      ? 'bg-[var(--primary)] text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div className="ml-auto hidden sm:flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            {view === 'expiring' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                Redemption period
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                Available
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-faint)] ml-2" />
                Taken
              </>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div ref={listRef} className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--primary)] animate-spin" />
            </div>
          ) : (view === 'expiring' ? expiring.length === 0 : domains.length === 0) ? (
            <div className="flex items-center justify-center py-24">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border)] flex items-center justify-center">
                  <Search className="w-5 h-5 text-[var(--text-faint)]" />
                </div>
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {search ? `No results for "${search}"` : 'No domains match your filters'}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">Try adjusting the search or length range</div>
                </div>
                {search && (
                  <button
                    onClick={() => { setSearch(''); setPage(1); }}
                    className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div className="grid grid-cols-12 gap-3 px-4 sm:px-5 py-3 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border)] bg-[var(--bg-primary)]/40">
                <div className="col-span-9 sm:col-span-6">Domain</div>
                <div className="col-span-3 sm:col-span-2 text-right">Length</div>
                <div className="col-span-2 text-right hidden sm:block">Letters</div>
                <div className="col-span-2 text-right hidden sm:block">{view === 'expiring' ? 'Drops' : 'Status'}</div>
              </div>

              {/* Table rows */}
              {view === 'expiring' ? (
                expiring.map(d => (
                  <div
                    key={d.id}
                    className="grid grid-cols-12 gap-3 px-4 sm:px-5 py-3 border-b border-[var(--border)]/40 hover:bg-[var(--bg-panel)]/70 transition-colors items-center"
                  >
                    <div className="col-span-9 sm:col-span-6 min-w-0 flex items-center gap-2">
                      <span className="sm:hidden w-1.5 h-1.5 rounded-full shrink-0 bg-[var(--warning)]" />
                      <a
                        href={`https://${d.domain}.${d.tld}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/domain inline-flex items-center gap-1.5 max-w-full text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
                        title={`Visit ${d.domain}.${d.tld}`}
                      >
                        <span className="truncate">
                          {highlight(d.domain, debouncedSearch)}<span className="text-[var(--text-muted)]">.{d.tld}</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)] opacity-40 sm:opacity-0 sm:group-hover/domain:opacity-100 transition-opacity" />
                      </a>
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <span className="inline-block min-w-[1.5rem] px-1.5 py-0.5 text-xs tabular-nums text-[var(--text-muted)] rounded-md bg-[var(--bg-elevated)] border border-[var(--border)]/60">{d.length}</span>
                    </div>
                    <div className="col-span-2 text-right hidden sm:block">
                      <span className="text-xs tabular-nums text-[var(--text-muted)]">{d.letters}</span>
                    </div>
                    <div className="col-span-2 text-right hidden sm:block">
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-full border bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                        {formatDate(d.estimated_drop_date ?? d.pending_delete_date)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                domains.map(d => (
                  <div
                    key={d.id}
                    className="grid grid-cols-12 gap-3 px-4 sm:px-5 py-3 border-b border-[var(--border)]/40 hover:bg-[var(--bg-panel)]/70 transition-colors items-center"
                  >
                    <div className="col-span-9 sm:col-span-6 min-w-0 flex items-center gap-2">
                      <span className={`sm:hidden w-1.5 h-1.5 rounded-full shrink-0 ${d.available ? 'bg-[var(--success)]' : 'bg-[var(--text-faint)]'}`} />
                      <a
                        href={`https://${d.domain}.${d.tld}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/domain inline-flex items-center gap-1.5 max-w-full text-sm font-medium text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
                        title={`Visit ${d.domain}.${d.tld}`}
                      >
                        <span className="truncate">
                          {highlight(d.domain, debouncedSearch)}<span className="text-[var(--text-muted)]">.{d.tld}</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)] opacity-40 sm:opacity-0 sm:group-hover/domain:opacity-100 transition-opacity" />
                      </a>
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <span className="inline-block min-w-[1.5rem] px-1.5 py-0.5 text-xs tabular-nums text-[var(--text-muted)] rounded-md bg-[var(--bg-elevated)] border border-[var(--border)]/60">{d.length}</span>
                    </div>
                    <div className="col-span-2 text-right hidden sm:block">
                      <span className="text-xs tabular-nums text-[var(--text-muted)]">{d.letters}</span>
                    </div>
                    <div className="col-span-2 text-right hidden sm:block">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-medium rounded-full border ${
                        d.available
                          ? 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20'
                          : d.status === 'pending_delete'
                            ? 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20'
                            : 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--text-muted)]/15'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          d.available ? 'bg-[var(--success)]' : d.status === 'pending_delete' ? 'bg-[var(--warning)]' : 'bg-[var(--text-faint)]'
                        }`} />
                        {d.available ? 'Available' : d.status === 'pending_delete' ? 'Pending' : 'Registered'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="border-t border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl sticky bottom-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-5 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="hidden sm:block text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap">
              Showing <span className="text-[var(--text-primary)] font-medium">{total === 0 ? 0 : (page - 1) * limit + 1}–{Math.min(page * limit, total)}</span> of <span className="text-[var(--text-primary)] font-medium">{total.toLocaleString()}</span>
            </span>
            <span className="sm:hidden text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap">
              <span className="text-[var(--text-primary)] font-medium">{page}</span> / {totalPages}
            </span>
            <div className="hidden sm:flex items-center gap-1.5">
              <label className="text-[11px] text-[var(--text-muted)]">per page</label>
              <div className="relative">
                <select
                  value={limit}
                  onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                  className="appearance-none h-7 pl-2.5 pr-7 text-xs font-medium bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--primary)] hover:border-[var(--border-strong)] cursor-pointer transition-colors"
                >
                  {PAGE_SIZE_OPTIONS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)] pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <PageButton onClick={() => setPage(1)} disabled={page <= 1} title="First page" className="hidden sm:flex">
              <ChevronsLeft className="w-4 h-4" />
            </PageButton>
            <PageButton onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} title="Previous page">
              <ChevronLeft className="w-4 h-4" />
            </PageButton>

            <div className="hidden sm:flex items-center gap-1">
              {getPageItems(page, totalPages).map((item, i) =>
                item === 'gap' ? (
                  <span key={`gap-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-[var(--text-faint)] select-none">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all ${
                      item === page
                        ? 'bg-[var(--primary)] text-white shadow-md shadow-indigo-500/30'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <PageButton onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} title="Next page">
              <ChevronRight className="w-4 h-4" />
            </PageButton>
            <PageButton onClick={() => setPage(totalPages)} disabled={page >= totalPages} title="Last page" className="hidden sm:flex">
              <ChevronsRight className="w-4 h-4" />
            </PageButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageButton({ children, onClick, disabled, title, className = '' }: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded-lg bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] disabled:opacity-30 disabled:cursor-not-allowed transition-all ${className}`}
    >
      {children}
    </button>
  );
}

function Select({ value, onChange, options }: {
  value: number;
  onChange: (v: number) => void;
  options: number[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="appearance-none h-8 pl-3 pr-7 text-xs font-medium bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)] hover:border-[var(--border-strong)] cursor-pointer transition-colors"
      >
        {options.map(n => (
          <option key={n} value={n}>{n}{n >= 30 ? '+' : ''}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
    </div>
  );
}

export default App;
