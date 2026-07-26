import { X, Copy, ExternalLink, Bookmark, Search as SearchIcon, Archive, Globe } from 'lucide-react';
import type { Domain } from '../types';

interface DetailDrawerProps {
  domain: Domain;
  onClose: () => void;
  onToggleSave: (id: string) => void;
  isSaved: boolean;
}

export function DetailDrawer({ domain, onClose, onToggleSave, isSaved }: DetailDrawerProps) {
  return (
    <div className="w-80 shrink-0 border-l border-[var(--border)] bg-[var(--bg-panel)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <h3 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider">Domain Details</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Domain Name */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">{domain.domain}</h2>
          <div className="mt-2">
            {domain.status === 'available' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                Available
              </span>
            ) : domain.status === 'pending' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--warning)]" />
                Pending
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--text-muted)]/10 text-[var(--text-muted)] border border-[var(--text-muted)]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)]" />
                Registered
              </span>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <InfoItem label="Extension" value={domain.extension} />
          <InfoItem label="Length" value={`${domain.length} characters`} />
          <InfoItem label="Letters" value={`${domain.letters}`} />
          <InfoItem label="Numbers" value={`${domain.numbers}`} />
          <InfoItem label="Hyphen" value={domain.hasHyphen ? 'Yes' : 'No'} />
          <InfoItem label="Drop Date" value={domain.dropDate} />
          <InfoItem label="First Seen" value={domain.firstSeen} />
          <InfoItem label="Last Checked" value={new Date(domain.lastChecked).toLocaleDateString()} />
        </div>

        {/* Quality Scores */}
        <div>
          <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Quality Scores</h4>
          <div className="space-y-2.5">
            <ScoreBar label="Brandability" score={domain.brandScore} />
            <ScoreBar label="Keyword Value" score={domain.keywordScore} />
            <ScoreBar label="Memorability" score={domain.memorabilityScore} />
          </div>
        </div>

        {/* Actions */}
        <div>
          <h4 className="text-xs font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-3">Actions</h4>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton icon={<Copy className="w-3.5 h-3.5" />} label="Copy" onClick={() => navigator.clipboard.writeText(domain.domain)} />
            <ActionButton
              icon={<Bookmark className="w-3.5 h-3.5" />}
              label={isSaved ? 'Saved' : 'Save'}
              onClick={() => onToggleSave(domain.id)}
              active={isSaved}
            />
            <ActionButton icon={<SearchIcon className="w-3.5 h-3.5" />} label="WHOIS" onClick={() => window.open(`https://who.is/whois/${domain.domain}`, '_blank')} />
            <ActionButton icon={<Archive className="w-3.5 h-3.5" />} label="Wayback" onClick={() => window.open(`https://web.archive.org/web/*/${domain.domain}`, '_blank')} />
            <ActionButton icon={<Globe className="w-3.5 h-3.5" />} label="RDAP" onClick={() => window.open(`https://rdap.verisign.com/com/v1/domain/${domain.domain}`, '_blank')} />
            <ActionButton icon={<ExternalLink className="w-3.5 h-3.5" />} label="Registrar" onClick={() => window.open(`https://www.namecheap.com/domains/registration/results/?domain=${domain.domain}`, '_blank')} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider">{label}</div>
      <div className="text-sm text-[var(--text-primary)] mt-0.5">{value}</div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[var(--text-muted)]">{label}</span>
        <span className="text-xs tabular-nums" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, onClick, active }: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors ${
        active
          ? 'bg-[var(--primary)]/10 border-[var(--primary)] text-[var(--primary)]'
          : 'bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}