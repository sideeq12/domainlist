import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value: number;
  onChange: (v: number) => void;
  options: number[];
}

export function Select({ value, onChange, options }: SelectProps) {
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
