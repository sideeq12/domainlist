import { useState, useEffect } from 'react';
import { useDomainStore } from './hooks/use-domain-store';
import { Navbar } from './components/Navbar';
import { StatsHeader } from './components/StatsHeader';
import { FilterPanel } from './components/FilterPanel';
import { DomainTable } from './components/DomainTable';
import { DetailDrawer } from './components/DetailDrawer';
import { InsightsPanel } from './components/InsightsPanel';

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

  const {
    filters,
    updateFilter,
    clearFilters,
    filteredDomains,
    selectedIds,
    toggleSelect,
    selectAll,
    deselectAll,
    searchQuery,
    setSearchQuery,
    detailDomain,
    openDetail,
    closeDetail,
    totalDomains,
  } = useDomainStore();

  const lastUpdated = '2 minutes ago';

  // Stats calculations
  const todayDrops = filteredDomains.length;
  const availableDomains = filteredDomains.filter(d => d.status === 'available').length;
  const avgLength = filteredDomains.length > 0
    ? Math.round(filteredDomains.reduce((sum, d) => sum + d.length, 0) / filteredDomains.length)
    : 0;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalDomains={totalDomains}
        lastUpdated={lastUpdated}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="pt-14 flex flex-col h-screen">
        {/* Stats Header */}
        <div className="px-4 pt-3 pb-2">
          <StatsHeader
            todayDrops={todayDrops}
            availableDomains={availableDomains}
            averageLength={avgLength}
            lastUpdate="02:14 UTC"
            totalIndexed="170M+"
          />
        </div>

        {/* Main 3-column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Filter Panel */}
          <FilterPanel
            filters={filters}
            onFilterChange={updateFilter}
            onClear={clearFilters}
            resultCount={filteredDomains.length}
          />

          {/* Domain Table */}
          <DomainTable
            domains={filteredDomains}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
            onDomainClick={openDetail}
            searchQuery={searchQuery}
          />

          {/* Detail Drawer (when open) */}
          {detailDomain && (
            <DetailDrawer
              domain={detailDomain}
              onClose={closeDetail}
              onToggleSave={toggleSelect}
              isSaved={selectedIds.has(detailDomain.id)}
            />
          )}

          {/* Insights Panel (when detail is not open) */}
          {!detailDomain && (
            <InsightsPanel domains={filteredDomains} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;