import { useState, useCallback, useEffect, useRef } from 'react';
import type { Domain, SortOption } from '../types';
import { api, type SearchParams } from '../api/client';

export interface DomainFilters {
  extension: string;
  lengthMin: number;
  lengthMax: number;
  keyword: string;
  noNumbers: boolean;
  noHyphens: boolean;
  startsWith: string;
  endsWith: string;
  contains: string;
  sortBy: SortOption;
}

const defaultFilters: DomainFilters = {
  extension: '.com',
  lengthMin: 1,
  lengthMax: 30,
  keyword: '',
  noNumbers: false,
  noHyphens: false,
  startsWith: '',
  endsWith: '',
  contains: '',
  sortBy: 'newest',
};

function backendToFrontend(b: {
  id: number;
  domain: string;
  tld: string;
  length: number;
  letters: number;
  numbers: number;
  has_hyphen: boolean;
  drop_date: string;
  status: string;
  available: boolean;
  rdap_checked_at: string | null;
  created_at: string;
  updated_at: string;
}): Domain {
  const statusMap: Record<string, Domain['status']> = {
    available: 'available',
    registered: 'registered',
    pending_delete: 'pending',
    unknown: 'unknown',
  };
  return {
    id: String(b.id),
    domain: `${b.domain}.${b.tld}`,
    extension: `.${b.tld}`,
    length: b.length,
    letters: b.letters,
    numbers: b.numbers,
    hasHyphen: b.has_hyphen,
    dropDate: new Date(b.drop_date).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }),
    status: statusMap[b.status] || 'unknown',
    firstSeen: new Date(b.created_at).toISOString().split('T')[0],
    lastChecked: b.rdap_checked_at
      ? new Date(b.rdap_checked_at).toISOString()
      : new Date(b.updated_at).toISOString(),
  };
}

function filtersToParams(filters: DomainFilters, page: number, limit: number): SearchParams {
  const sortMap: Record<string, string | undefined> = {
    newest: 'newest',
    oldest: 'oldest',
    shortest: 'length_asc',
    longest: 'length_desc',
    alphabetical: 'alpha_asc',
  };
  return {
    page,
    limit,
    search: filters.keyword || undefined,
    min_length: filters.lengthMin > 1 ? filters.lengthMin : undefined,
    max_length: filters.lengthMax < 30 ? filters.lengthMax : undefined,
    starts_with: filters.startsWith || undefined,
    ends_with: filters.endsWith || undefined,
    contains: filters.contains || undefined,
    has_numbers: filters.noNumbers ? false : undefined,
    has_hyphen: filters.noHyphens ? false : undefined,
    sort: sortMap[filters.sortBy],
  };
}

export function useDomainStore() {
  const [filters, setFilters] = useState<DomainFilters>(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [detailDomain, setDetailDomain] = useState<Domain | null>(null);

  const [domains, setDomains] = useState<Domain[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = 50;
  const abortRef = useRef<AbortController | null>(null);

  const fetchDomains = useCallback(async (f: DomainFilters, p: number, sq: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const params = filtersToParams(f, p, limit);
      if (sq) params.search = sq;
      const res = await api.searchDomains(params);
      if (controller.signal.aborted) return;
      setDomains(res.items.map(backendToFrontend));
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.pages);
    } catch (e: unknown) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : 'Failed to load domains');
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains(filters, 1, searchQuery);
  }, [filters, searchQuery, fetchDomains]);

  const updateFilter = useCallback(<K extends keyof DomainFilters>(
    key: K,
    value: DomainFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchQuery('');
  }, []);

  const goToPage = useCallback((p: number) => {
    fetchDomains(filters, p, searchQuery);
  }, [filters, searchQuery, fetchDomains]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(domains.map(d => d.id)));
  }, [domains]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const openDetail = useCallback((domain: Domain) => {
    setDetailDomain(domain);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailDomain(null);
  }, []);

  return {
    filters,
    setFilters,
    updateFilter,
    clearFilters,
    domains,
    total,
    page,
    totalPages,
    limit,
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
  };
}
