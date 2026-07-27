interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-2.5 border-r border-[var(--border)] last:border-r-0">
      <span className="text-[11px] font-medium text-[var(--text-muted)] tracking-wide uppercase">{label}</span>
      <span className={`text-sm font-semibold ${accent ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
        {value}
      </span>
    </div>
  );
}

interface StatsHeaderProps {
  todayDrops: number;
  availableDomains: number;
  averageLength: number;
  totalIndexed: string;
}

export function StatsHeader({
  todayDrops,
  availableDomains,
  averageLength,
  totalIndexed,
}: StatsHeaderProps) {
  return (
    <div className="flex flex-wrap items-stretch border border-[var(--border)] rounded-lg bg-[var(--bg-panel)] overflow-hidden">
      <StatCard label="Today's Drops" value={todayDrops.toLocaleString()} accent />
      <StatCard label="Available" value={availableDomains.toLocaleString()} />
      <StatCard label="Avg Length" value={`${averageLength} chars`} />
      <StatCard label="Total" value={totalIndexed} />
    </div>
  );
}