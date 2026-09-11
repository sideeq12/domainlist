export interface DomainFilter {
  name: string;
  keywords: string[];
}

export const DOMAIN_FILTERS: DomainFilter[] = [
  {
    name: 'FilterA',
    keywords: [
      'texas', 'durham', 'phoenix', 'scottsdale', 'arizona', 'las', 'vegas',
      'new', 'york', 'city', 'rochester', 'toronto', 'san', 'diego', 'nyc',
      'charleston', 'westchester', 'north', 'carolina', 'maryland', 'indiana',
      'seattle', 'miami', 'beach', 'tx', 'sd', 'detroit', 'oklahoma',
      'sarasota', 'srq', 'connecticut', 'nsb', 'mohave', 'tampa', 'loveland',
      'washington', 'massachusetts',
    ],
  },
  {
    name: 'FilterB',
    keywords: [
      'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado',
      'connecticut', 'delaware', 'florida', 'georgia', 'hawaii', 'idaho',
      'illinois', 'indiana', 'iowa', 'kansas', 'kentucky', 'louisiana', 'maine',
      'maryland', 'massachusetts', 'michigan', 'minnesota', 'mississippi',
      'missouri', 'montana', 'nebraska', 'nevada', 'new', 'hampshire', 'jersey',
      'mexico', 'york', 'north', 'carolina', 'dakota', 'ohio', 'oklahoma',
      'oregon', 'pennsylvania', 'rhode', 'island', 'south', 'tennessee', 'texas',
      'utah', 'vermont', 'virginia', 'washington', 'west', 'wisconsin',
      'wyoming',
    ],
  },
  {
    name: 'FilterC',
    keywords: [
      'dallas', 'ottawa', 'raleigh', 'charlotte', 'rochester', 'miami',
      'henderson', 'asheville', 'las', 'vegas', 'tuscaloosa', 'roseville',
      'greenville', 'sarasota', 'indianapolis', 'orange', 'county', 'saint',
      'louis', 'southshore', 'wetlands',
    ],
  },
  {
    name: 'FilterD',
    keywords: [
      'kayaking', 'windshield', 'repair', 'financial', 'advisors', 'interior',
      'design', 'ppf', 'private', 'lessons', 'venture', 'capital', 'water',
      'treatment', 'public', 'adjusting', 'workers', 'comp', 'law', 'firm',
      'attorney', 'msp', 'restroom', 'trailers', 'trailer', 'dent', 'junk',
      'removal', 'mold', 'inspection', 'carpet', 'cleaning', 'hockey',
      'advisor', 'weight', 'loss', 'disability', 'lawyers', 'printing', 'signs',
      'tree', 'service', 'wedding', 'officiant', 'cash', 'home', 'buyers',
      'roofing', 'injury', 'spray', 'foam', 'car', 'accident', 'learning',
      'osteopath',
    ],
  },
  {
    name: 'FilterE',
    keywords: [
      'criminal', 'defense', 'lawyer', 'retirement', 'planner', 'landscaping',
      'peptides', 'hvac', 'digital', 'aba', 'chimney', 'sweep', 'water',
      'damage', 'restoration', 'collision', 'center', 'drain', 'cleaning',
      'smart', 'homes', 'power', 'wash', 'house', 'painting', 'vault', 'cash',
      'printers', 'black', 'car', 'managed', 'it', 'lawyers', 'electrolysis',
      'academy', 'overhead', 'doors', 'elk', 'hunting', 'dream', 'auto',
      'glass', 'notary', 'public',
    ],
  },
  {
    name: 'FilterF',
    keywords: [
      'mechanical', 'wellness', 'consulting', 'health', 'electric',
      'construction', 'pest', 'control', 'tree', 'service', 'homes', 'home',
      'care', 'bookkeeping', 'studio', 'arena', 'automation', 'auto', 'auction',
      'logistics', 'warehousing', 'cleaning', 'cleaners', 'laundry', 'impact',
      'chiropractor', 'chiro', 'store', 'world', 'realty', 'park', 'partner',
      'sphere',
    ],
  },
  {
    name: 'FilterG',
    keywords: [
      'plumbing', 'hvac', 'towing', 'dentist', 'roofing', 'plumber',
      'electrician', 'foundation', 'repair', 'pest', 'control', 'locksmith',
      'auto', 'glass', 'junk', 'removal', 'cleaning', 'landscaping',
    ],
  },
  {
    name: 'FilterH',
    keywords: [
      'group', 'solutions', 'services', 'partners', 'ventures', 'capital',
      'holdings', 'global', 'systems', 'technologies', 'tech', 'labs', 'works',
      'studio', 'network', 'edge',
    ],
  },
  {
    name: 'FilterI',
    keywords: [
      'ai', 'data', 'cloud', 'digital', 'analytics', 'logic', 'automation',
      'robotics', 'cyber', 'quantum', 'plumbing', 'roofing', 'hvac', 'electric',
      'electrical', 'landscaping', 'tree', 'service', 'pest', 'control',
      'restoration', 'cleaning', 'dental', 'dentist', 'orthodontics', 'oral',
      'surgery', 'dermatology', 'medical', 'health', 'wellness', 'care',
      'clinic',
    ],
  },
  {
    name: 'FilterJ',
    keywords: [
      'capital', 'funding', 'finance', 'wealth', 'lending', 'mortgage', 'tax',
      'insurance', 'credit', 'investments', 'realty', 'homes', 'property',
      'properties', 'estates', 'housing', 'commercial', 'development',
      'rentals', 'living', 'logistics',
    ],
  },
  {
    name: 'FilterK',
    keywords: [
      'auto', 'car', 'truck', 'motors', 'garage', 'collision', 'towing',
      'detailing', 'laundry', 'law', 'legal', 'injury', 'accident', 'defense',
      'attorneys', 'life', 'home', 'house', 'club', 'shop', 'store', 'market',
      'plus', 'direct', 'best',
    ],
  },
];

export function matchesFilter(domain: string, keywords: string[]): boolean {
  const d = domain.toLowerCase();
  return keywords.some(k => d.includes(k));
}
