import { Search, Command, Clock, Globe, Moon, Sun } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalDomains: number;
  lastUpdated: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Navbar({ searchQuery, onSearchChange, totalDomains, lastUpdated, theme, onToggleTheme }: NavbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '/') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/95 backdrop-blur-sm">
      <div className="flex items-center h-14 px-4 gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-md bg-[var(--primary)] flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm text-[var(--text-primary)] tracking-tight">DomainDropper</span>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search domains..."
            className="w-full h-9 pl-9 pr-10 bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--primary)] transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-medium">
            <Command className="w-3 h-3" />
            <span>/</span>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Clock className="w-3 h-3" />
            <span>Updated: {lastUpdated}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Globe className="w-3 h-3" />
            <span>{totalDomains.toLocaleString()} indexed</span>
          </div>
          <button
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)] transition-colors"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-xs font-medium text-[var(--primary)]">
            U
          </div>
        </div>
      </div>
    </nav>
  );
}