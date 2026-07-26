import { Sparkles, TrendingUp, BarChart3, Shuffle } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Domain } from '../types';
import { MOCK_DOMAINS } from '../data/domains';

interface InsightsPanelProps {
  domains: Domain[];
}

const trendingKeywords = [
  { word: 'ai', count: 342 },
  { word: 'cloud', count: 287 },
  { word: 'labs', count: 256 },
  { word: 'app', count: 234 },
  { word: 'tech', count: 198 },
  { word: 'data', count: 176 },
  { word: 'crypto', count: 154 },
  { word: 'pulse', count: 142 },
  { word: 'nexus', count: 131 },
  { word: 'peak', count: 118 },
  { word: 'forge', count: 105 },
  { word: 'hub', count: 98 },
];

export function InsightsPanel({ domains }: InsightsPanelProps) {
  const [finding, setFinding] = useState(false);
  const [randomGem, setRandomGem] = useState<Domain | null>(null);

  const bestFinds = useMemo(() => {
    return [...domains]
      .sort((a, b) => b.brandScore - a.brandScore)
      .slice(0, 5);
  }, [domains]);

  const findRandomGem = () => {
    setFinding(true);
    setTimeout(() => {
      const idx = Math.floor(Math.random() * MOCK_DOMAINS.length);
      setRandomGem(MOCK_DOMAINS[idx]);
      setFinding(false);
    }, 300);
  };

  const lengthDistribution = useMemo(() => {
    const buckets: Record<string, number> = {};
    let shortest = Infinity;
    let longest = 0;
    for (const d of domains) {
      const key = d.length <= 5 ? '1-5' : d.length <= 10 ? '6-10' : d.length <= 15 ? '11-15' : '16+';
      buckets[key] = (buckets[key] || 0) + 1;
      if (d.length < shortest) shortest = d.length;
      if (d.length > longest) longest = d.length;
    }
    return { buckets, shortest, longest };
  }, [domains]);

  return (
    <div className="w-72 shrink-0 border-l border-[var(--border)] bg-[var(--bg-panel)] overflow-y-auto">
      <div className="p-4 space-y-5">
        <h2 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Insights</h2>

        {/* Trending Keywords */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-[var(--primary)]" />
            <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Trending Keywords</h3>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {trendingKeywords.map(({ word, count }) => (
              <span
                key={word}
                className="px-2 py-0.5 text-[11px] font-medium rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors cursor-pointer"
              >
                {word}
                <span className="text-[10px] text-[var(--text-muted)]/60 ml-1">{count}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Today's Best Finds */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--warning)]" />
            <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Best Finds</h3>
          </div>
          <div className="space-y-1.5">
            {bestFinds.slice(0, 5).map(domain => (
              <div key={domain.id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-[var(--bg-primary)] transition-colors">
                <span className="text-xs font-medium text-[var(--text-primary)]">{domain.domain}</span>
                <span className="text-[10px] tabular-nums text-[var(--success)]">{domain.brandScore}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Domain Distribution */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-[var(--primary)]" />
            <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Length Distribution</h3>
          </div>
          <div className="space-y-1.5">
            {Object.entries(lengthDistribution.buckets).map(([range, count]) => {
              const maxCount = Math.max(...Object.values(lengthDistribution.buckets));
              const pct = (count / maxCount) * 100;
              return (
                <div key={range} className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)] w-8 shrink-0">{range}</span>
                  <div className="flex-1 h-3 rounded-sm bg-[var(--border)] overflow-hidden">
                    <div className="h-full bg-[var(--primary)]/60 rounded-sm" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] tabular-nums w-8 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Random Discovery */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Shuffle className="w-3.5 h-3.5 text-[var(--success)]" />
            <h3 className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Random Discovery</h3>
          </div>
          <button
            onClick={findRandomGem}
            disabled={finding}
            className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--success)] hover:text-[var(--success)] transition-colors disabled:opacity-50"
          >
            {finding ? 'Finding...' : 'Find Random Gem'}
          </button>
          {randomGem && (
            <div className="mt-2 p-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
              <div className="text-sm font-semibold text-[var(--text-primary)]">{randomGem.domain}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-[var(--text-muted)]">Score: {randomGem.brandScore}/100</span>
                <span className={`text-[10px] px-1 py-0.5 rounded-full ${
                  randomGem.status === 'available' ? 'text-[var(--success)] bg-[var(--success)]/10' : 'text-[var(--text-muted)] bg-[var(--text-muted)]/10'
                }`}>
                  {randomGem.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}