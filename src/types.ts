export interface Domain {
  id: string;
  domain: string;
  extension: string;
  length: number;
  letters: number;
  numbers: number;
  hasHyphen: boolean;
  dropDate: string;
  status: 'available' | 'registered' | 'pending' | 'unknown';
  firstSeen: string;
  lastChecked: string;
}

export interface FilterState {
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

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'shortest'
  | 'longest'
  | 'alphabetical';

export type ViewMode = 'grid' | 'table';
