import { Globe } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from './api/client';
import type { BackendDomain } from './api/client';

function SimpleDomainList() {
  const [domains, setDomains] = useState<BackendDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const listRef = useRef<HTMLDivElement>(null);
  const limit = 200;

  useEffect(() => {
    setLoading(true);
    api.searchDomains({ page, limit, sort: 'alpha_asc' }).then(res => {
      setDomains(res.items);
      setTotal(res.total);
      setTotalPages(res.pages);
      setLoading(false);
      if (listRef.current) listRef.current.scrollTop = 0;
    }).catch(e => {
      setError(e.message);
      setLoading(false);
    });
  }, [page]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="text-red-400 text-sm">{error}</div>
          <button onClick={() => window.location.reload()} className="text-xs text-[#58a6ff] hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#30363d] bg-[#0d1117] px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-md bg-[#58a6ff] flex items-center justify-center">
          <Globe className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-sm text-[#c9d1d9]">DomainDropper</span>
        <span className="ml-auto text-xs text-[#8b949e]">{total.toLocaleString()} .tech domains</span>
      </header>

      {/* List */}
      <div ref={listRef} className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-[#21262d]">
            {domains.map(d => (
              <div key={d.id} className="px-4 py-2.5 hover:bg-[#161b22] transition-colors">
                <span className="text-sm text-[#c9d1d9]">{d.domain}.tech</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 px-4 py-3 border-t border-[#30363d] bg-[#0d1117]">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="px-3 py-1.5 text-xs rounded-md bg-[#21262d] border border-[#30363d] text-[#c9d1d9] disabled:opacity-40 hover:bg-[#30363d] transition-colors"
        >
          Previous
        </button>
        <span className="text-xs text-[#8b949e]">{page} / {totalPages}</span>
        <button
          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-xs rounded-md bg-[#21262d] border border-[#30363d] text-[#c9d1d9] disabled:opacity-40 hover:bg-[#30363d] transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default SimpleDomainList;
