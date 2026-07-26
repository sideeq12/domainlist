import { useMemo, useState, useCallback } from 'react';
import type { Domain, SortOption } from '../types';
import { MOCK_DOMAINS, filterDomains } from '../data/domains';

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
  exactMatch: string;
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
  exactMatch: '',
  sortBy: 'newest',
};

export function useDomainStore() {
  const [filters, setFilters] = useState<DomainFilters>(defaultFilters);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [detailDomain, setDetailDomain] = useState<Domain | null>(null);

  const filteredDomains = useMemo(() => {
    let domains = MOCK_DOMAINS;

    // Apply search query globally
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      domains = domains.filter(d => d.domain.toLowerCase().includes(q));
    }

    return filterDomains(domains, {
      extension: filters.extension || undefined,
      lengthMin: filters.lengthMin,
      lengthMax: filters.lengthMax,
      keyword: filters.keyword || undefined,
      noNumbers: filters.noNumbers || undefined,
      noHyphens: filters.noHyphens || undefined,
      startsWith: filters.startsWith || undefined,
      endsWith: filters.endsWith || undefined,
      contains: filters.contains || undefined,
      exactMatch: filters.exactMatch || undefined,
      sortBy: filters.sortBy,
    });
  }, [filters, searchQuery]);

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

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(filteredDomains.map(d => d.id)));
  }, [filteredDomains]);

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
    totalDomains: MOCK_DOMAINS.length,
  };
}