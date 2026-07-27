import { useState, useEffect } from 'react';
import { useDomainStore } from './hooks/use-domain-store';
import { Navbar } from './components/Navbar';
import { StatsHeader } from './components/StatsHeader';
import { FilterPanel } from './components/FilterPanel';
import { DomainTable } from './components/DomainTable';
import { DetailDrawer } from './components/DetailDrawer';
import { InsightsPanel } from './components/InsightsPanel';
import { api, type BackendStatistics } from './api/client';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('domaindropper-theme');
      if (stored === 'light' || stored === 'dark') return stored;
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('domaindropper-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  const [stats, setStats] = useState<BackendStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    api.getStatistics().then(s => {
      setStats(s);
      setStatsLoading(false);
    }).catch(() => setStatsLoading(false));
  }, []);

  const {
    filters,
    updateFilter,
    clearFilters,
    domains,
    total,
    page,
    totalPages,
    loading,
    error,
    goToPage,
    selectedIds,
    toggleSelect,
    selectAll,
    deselectAll,
    searchQuery,
    setSearchQuery,
    detailDomain,
    openDetail,
    closeDetail,
  } = useDomainStore();

  const lastUpdated = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalDomains={total}
        lastUpdated={`Updated: ${lastUpdated}`}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="pt-14 flex flex-col h-screen">
        <div className="px-4 pt-3 pb-2">
          <StatsHeader
            todayDrops={stats?.todays_drops ?? 0}
            availableDomains={stats?.available ?? 0}
            averageLength={Math.round(stats?.average_length ?? 0)}
            lastUpdate={lastUpdated}
            totalIndexed={statsLoading ? '...' : `${(total / 1000).toFixed(1)}K`}
          />
        </div>

        <div className="flex flex-1 overflow-hidden">
          <FilterPanel
            filters={filters}
            onFilterChange={updateFilter}
            onClear={clearFilters}
            resultCount={total}
          />

          <DomainTable
            domains={domains}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            onDomainClick={openDetail}
            searchQuery={searchQuery}
            loading={loading}
            error={error}
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={goToPage}
          />

          {detailDomain && (
            <DetailDrawer
              domain={detailDomain}
              onClose={closeDetail}
              onToggleSave={toggleSelect}
              isSaved={selectedIds.has(detailDomain.id)}
            />
          )}

          {!detailDomain && (
            <InsightsPanel domains={domains} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
