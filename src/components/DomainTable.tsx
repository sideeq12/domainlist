import { useMemo, useRef, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Copy, Bookmark, ExternalLink, ChevronUp, ChevronDown, GripVertical, CheckSquare, Square, Download } from 'lucide-react';
import type { Domain } from '../types';

interface DomainTableProps {
  domains: Domain[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDomainClick: (domain: Domain) => void;
  searchQuery: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: 'bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20',
    registered: 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--text-muted)]/20',
    pending: 'bg-[var(--warning)]/10 text-[var(--warning)] border-[var(--warning)]/20',
  };
  return (
    <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${styles[status] || styles.registered}`}>
      {status}
    </span>
  );
}

function highlightText(text: string, query: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <span key={i} className="bg-[var(--primary)]/20 text-[var(--primary)] rounded">{part}</span>
      : part
  );
}

export function DomainTable({
  domains,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onDomainClick,
  searchQuery,
}: DomainTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const parentRef = useRef<HTMLDivElement>(null);

  const columns = useMemo<ColumnDef<Domain>[]>(() => [
    {
      id: 'select',
      header: () => {
        const allSelected = domains.length > 0 && domains.every(d => selectedIds.has(d.id));
        return (
          <button
            onClick={() => allSelected ? onDeselectAll() : onSelectAll()}
            className="flex items-center justify-center"
          >
            {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-[var(--primary)]" /> : <Square className="w-3.5 h-3.5 text-[var(--text-muted)]" />}
          </button>
        );
      },
      cell: ({ row }) => (
        <button
          onClick={() => onToggleSelect(row.original.id)}
          className="flex items-center justify-center"
        >
          {selectedIds.has(row.original.id)
            ? <CheckSquare className="w-3.5 h-3.5 text-[var(--primary)]" />
            : <Square className="w-3.5 h-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]" />
          }
        </button>
      ),
      size: 40,
    },
    {
      id: 'drag',
      header: () => null,
      cell: () => (
        <GripVertical className="w-3 h-3 text-[var(--border)]" />
      ),
      size: 24,
    },
    {
      accessorKey: 'domain',
      header: 'Domain',
      cell: ({ row }) => (
        <button
          onClick={() => onDomainClick(row.original)}
          className="text-left"
        >
          <span className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors">
            {highlightText(row.original.domain, searchQuery)}
          </span>
        </button>
      ),
      size: 200,
    },
    {
      accessorKey: 'length',
      header: 'Len',
      cell: ({ row }) => (
        <span className="text-xs text-[var(--text-muted)] tabular-nums">{row.original.length}</span>
      ),
      size: 48,
    },
    {
      accessorKey: 'letters',
      header: 'Ltrs',
      cell: ({ row }) => (
        <span className="text-xs text-[var(--text-muted)] tabular-nums">{row.original.letters}</span>
      ),
      size: 52,
    },
    {
      accessorKey: 'numbers',
      header: 'Nums',
      cell: ({ row }) => (
        <span className="text-xs text-[var(--text-muted)] tabular-nums">{row.original.numbers}</span>
      ),
      size: 52,
    },
    {
      accessorKey: 'hasHyphen',
      header: '-',
      cell: ({ row }) => (
        <span className={`text-xs ${row.original.hasHyphen ? 'text-[var(--warning)]' : 'text-[var(--success)]'}`}>
          {row.original.hasHyphen ? 'Yes' : 'No'}
        </span>
      ),
      size: 40,
    },
    {
      accessorKey: 'dropDate',
      header: 'Drop Date',
      cell: ({ row }) => (
        <span className="text-xs text-[var(--text-muted)]">{row.original.dropDate}</span>
      ),
      size: 140,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      size: 96,
    },
    {
      accessorKey: 'brandScore',
      header: 'Score',
      cell: ({ row }) => {
        const score = row.original.brandScore;
        const color = score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)';
        return (
          <div className="flex items-center gap-1">
            <div className="w-12 h-1.5 rounded-full bg-[#27272A] overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
            </div>
            <span className="text-xs tabular-nums" style={{ color }}>{score}/100</span>
          </div>
        );
      },
      size: 120,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(row.original.domain); }}
            className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="Copy domain"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSelect(row.original.id); }}
            className={`p-1 rounded hover:bg-[var(--border)] transition-colors ${
              selectedIds.has(row.original.id) ? 'text-[var(--primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title="Save domain"
          >
            <Bookmark className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDomainClick(row.original); }}
            className="p-1 rounded hover:bg-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            title="View details"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      ),
      size: 100,
    },
  ], [selectedIds, searchQuery, onToggleSelect, onSelectAll, onDeselectAll, onDomainClick, domains]);

  const table = useReactTable({
    data: domains,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
  });

  const { rows } = table.getRowModel();

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 52,
    overscan: 20,
  });

  if (domains.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="text-lg font-medium text-[var(--text-muted)]">No domains found</div>
          <div className="text-xs text-[var(--text-muted)]">Try removing filters or searching for another keyword</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2 bg-[var(--primary)]/5 border-b border-[var(--primary)]/20">
          <span className="text-xs text-[var(--text-muted)]">
            <span className="text-[var(--text-primary)] font-medium">{selectedIds.size}</span> selected
          </span>
          <button className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Download className="w-3 h-3" />
            Export CSV
          </button>
          <button className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <Copy className="w-3 h-3" />
            Copy domains
          </button>
        </div>
      )}

      {/* Scrollable table container */}
      <div ref={parentRef} className="flex-1 overflow-auto">
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      style={{ width: header.getSize(), minWidth: header.getSize() }}
                      className={`h-10 px-2 text-left text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--bg-primary)] border-b border-[var(--border)] ${
                        header.column.getCanSort() ? 'cursor-pointer select-none hover:text-[var(--text-primary)]' : ''
                      }`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() && (
                          header.column.getIsSorted() === 'asc'
                            ? <ChevronUp className="w-3 h-3" />
                            : <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {virtualizer.getVirtualItems().map((virtualItem) => {
                const row = rows[virtualItem.index];
                return (
                  <tr
                    key={row.id}
                    style={{
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className="group border-b border-[var(--border)]/50 hover:bg-[var(--bg-panel)] transition-colors"
                  >
                    {row.getVisibleCells().map(cell => (
                      <td
                        key={cell.id}
                        style={{ width: cell.column.getSize(), minWidth: cell.column.getSize() }}
                        className="h-13 px-2 text-xs"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}