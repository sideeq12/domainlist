import type { Domain } from '../types';

// Expanded word list for generating enough unique domains
const prefixes = [
  'cloud', 'orbit', 'nexus', 'peak', 'forge', 'spark', 'pulse', 'vault', 'apex',
  'cove', 'drift', 'flux', 'grid', 'halo', 'iris', 'jolt', 'kite', 'lume',
  'mint', 'node', 'oasis', 'prime', 'quad', 'rift', 'sage', 'tide', 'undo',
  'volt', 'wave', 'xeno', 'yarn', 'zinc', 'bloom', 'crisp', 'dawn', 'edge',
  'fuse', 'glim', 'haven', 'ikon', 'jade', 'kiwi', 'lens', 'muse', 'nova',
  'onyx', 'pixl', 'qube', 'rise', 'stem', 'trek', 'unit', 'verb', 'wild',
  'axel', 'bayou', 'coral', 'delta', 'ember', 'fjord', 'glade', 'hyve',
  'inlet', 'joule', 'knot', 'lunar', 'maple', 'noble', 'olive', 'pivot',
  'quart', 'raven', 'solar', 'tulip', 'umbra', 'vivid', 'wisp', 'xeric',
  'yield', 'zebra', 'ai', 'lab', 'tech', 'app', 'data', 'web', 'net',
  'dev', 'pro', 'hub', 'soft', 'sync', 'scan', 'link', 'dock', 'flow',
  'chat', 'view', 'code', 'base', 'mind', 'wise',
];

const suffixes = [
  'io', 'ly', 'ify', 'hub', 'lab', 'app', 'pro', 'net', 'io', 'ai',
  'me', 'co', 'zone', 'spot', 'view', 'base', 'core', 'nest', 'deck',
  'keep', 'wise', 'ware', 'soft', 'bird', 'fish', 'path', 'space', 'house',
  'loop', 'work', 'ship', 'mark', 'land', 'link', 'node', 'port', 'side',
  'scale', 'scope', 'craft', 'light', 'board', 'lift', 'rise', 'cast', 'ment',
];

function generateDomainName(id: number): string {
  // Use ID to spread across generation strategies deterministically
  const strategy = id % 10;

  if (strategy < 3) {
    // Two prefixes joined
    const p1 = prefixes[id % prefixes.length];
    const p2 = suffixes[(id * 7) % suffixes.length];
    return p1 + p2;
  } else if (strategy < 6) {
    // Prefix + number
    const p = prefixes[(id * 3) % prefixes.length];
    const num = (id * 13) % 999 + 1;
    return p + num;
  } else if (strategy < 8) {
    // Two prefixes + number
    const p1 = prefixes[(id * 5) % prefixes.length];
    const p2 = prefixes[(id * 11) % prefixes.length];
    const num = (id * 17) % 99 + 1;
    return p1 + p2 + (num > 50 ? String(num) : '');
  } else {
    // Prefix + suffix
    const p = prefixes[(id * 7) % prefixes.length];
    const s = suffixes[(id * 13) % suffixes.length];
    return p + s + ((id * 19) % 3 === 0 ? String((id * 23) % 99 + 1) : '');
  }
}

function generateDropDate(id: number): string {
  const daysAgo = (id * 7) % 31;
  const d = new Date(Date.now() - daysAgo * 86400000);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function generateStatus(id: number): 'available' | 'registered' | 'pending' {
  const mod = (id * 13) % 10;
  if (mod < 6) return 'available';
  if (mod < 8) return 'registered';
  return 'pending';
}

function countLetters(s: string): number {
  return (s.match(/[a-zA-Z]/g) || []).length;
}

function countNumbers(s: string): number {
  return (s.match(/[0-9]/g) || []).length;
}

function generateDomain(id: number): Domain {
  const name = generateDomainName(id);
  const extension = '.com';
  const fullDomain = name + extension;
  const hasHyphen = name.includes('-');
  const letters = countLetters(name);
  const numbers = countNumbers(name);
  const brandScore = Math.min(99, 35 + (id * 7) % 64);
  const keywordScore = Math.min(99, 20 + (id * 11) % 75);
  const memorabilityScore = Math.min(99, 40 + (id * 13) % 59);

  return {
    id: `domain-${id}`,
    domain: fullDomain,
    extension,
    length: name.length,
    letters,
    numbers,
    hasHyphen,
    dropDate: generateDropDate(id),
    status: generateStatus(id),
    brandScore,
    keywordScore,
    memorabilityScore,
    firstSeen: new Date(Date.now() - ((id * 3) % 14) * 86400000).toISOString().split('T')[0],
    lastChecked: new Date(Date.now() - ((id * 5) % 4) * 3600000).toISOString(),
  };
}

export function generateDomains(count: number): Domain[] {
  const domains: Domain[] = [];
  const seen = new Set<string>();

  for (let id = 1; domains.length < count; id++) {
    const d = generateDomain(id);
    if (!seen.has(d.domain)) {
      seen.add(d.domain);
      domains.push(d);
    }
    // Safety: if we've tried too many times, break
    if (id > count * 10) {
      console.warn(`Ran out of unique names after ${domains.length} domains`);
      break;
    }
  }
  return domains;
}

// Pre-generate a large dataset
export const MOCK_DOMAINS = generateDomains(100);

export function filterDomains(domains: Domain[], filter: {
  extension?: string;
  lengthMin?: number;
  lengthMax?: number;
  keyword?: string;
  noNumbers?: boolean;
  noHyphens?: boolean;
  startsWith?: string;
  endsWith?: string;
  contains?: string;
  exactMatch?: string;
  sortBy?: string;
}): Domain[] {
  let result = [...domains];

  if (filter.extension) {
    result = result.filter(d => d.extension === filter.extension);
  }
  const lengthMin = filter.lengthMin;
  if (lengthMin !== undefined) {
    result = result.filter(d => d.length >= lengthMin);
  }
  const lengthMax = filter.lengthMax;
  if (lengthMax !== undefined) {
    result = result.filter(d => d.length <= lengthMax);
  }
  if (filter.keyword) {
    const kw = filter.keyword.toLowerCase();
    result = result.filter(d => d.domain.toLowerCase().includes(kw));
  }
  if (filter.noNumbers) {
    result = result.filter(d => d.numbers === 0);
  }
  if (filter.noHyphens) {
    result = result.filter(d => !d.hasHyphen);
  }
  const startsWith = filter.startsWith;
  if (startsWith) {
    result = result.filter(d => d.domain.toLowerCase().startsWith(startsWith.toLowerCase()));
  }
  if (filter.endsWith) {
    result = result.filter(d => {
      const name = d.domain.replace('.com', '');
      return name.toLowerCase().endsWith(filter.endsWith!.toLowerCase());
    });
  }
  if (filter.contains) {
    result = result.filter(d => d.domain.toLowerCase().includes(filter.contains!.toLowerCase()));
  }
  if (filter.exactMatch) {
    result = result.filter(d => d.domain.toLowerCase() === filter.exactMatch!.toLowerCase());
  }

  switch (filter.sortBy) {
    case 'newest':
      result.sort((a, b) => new Date(b.dropDate).getTime() - new Date(a.dropDate).getTime());
      break;
    case 'oldest':
      result.sort((a, b) => new Date(a.dropDate).getTime() - new Date(b.dropDate).getTime());
      break;
    case 'shortest':
      result.sort((a, b) => a.length - b.length);
      break;
    case 'longest':
      result.sort((a, b) => b.length - a.length);
      break;
    case 'alphabetical':
      result.sort((a, b) => a.domain.localeCompare(b.domain));
      break;
    case 'highestScore':
      result.sort((a, b) => b.brandScore - a.brandScore);
      break;
    default:
      result.sort((a, b) => new Date(b.dropDate).getTime() - new Date(a.dropDate).getTime());
  }

  return result;
}