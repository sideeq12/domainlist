export interface Domain {
  id: string;
  domain: string;
  extension: string;
  length: number;
  letters: number;
  numbers: number;
  hasHyphen: boolean;
  dropDate: string;
  status: 'available' | 'registered' | 'pending';
  brandScore: number;
  keywordScore: number;
  memorabilityScore: number;
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
  dictionaryWords: boolean;
  brandable: boolean;
  shortDomains: boolean;
  premiumKeywords: boolean;
  startsWith: string;
  endsWith: string;
  contains: string;
  exactMatch: string;
  sortBy: SortOption;
}

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'shortest'
  | 'longest'
  | 'alphabetical'
  | 'highestScore';

export type ViewMode = 'grid' | 'table';