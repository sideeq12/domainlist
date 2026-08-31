const API_BASE = import.meta.env.VITE_API_URL || 'https://api.agencey.pro/api';

export interface DomainListResponse {
  items: BackendDomain[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface BackendDomain {
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
}

export interface BackendStatistics {
  todays_drops: number;
  available: number;
  average_length: number;
  shortest_domain: string | null;
  longest_domain: string | null;
  most_common_keywords: string[];
}

export interface TrendingKeywordItem {
  keyword: string;
  count: number;
}

export interface BackendTrending {
  top_prefixes: TrendingKeywordItem[];
  top_suffixes: TrendingKeywordItem[];
  top_keywords: TrendingKeywordItem[];
}

export interface BackendBookmark {
  id: number;
  user_session: string;
  domain_id: number;
  domain_name: string;
  created_at: string;
}

export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  available?: boolean;
  min_length?: number;
  max_length?: number;
  starts_with?: string;
  ends_with?: string;
  contains?: string;
  has_numbers?: boolean;
  has_hyphen?: boolean;
  sort?: string;
}

class ApiClient {
  private getSessionId(): string {
    let id = sessionStorage.getItem('domaindropper-session');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('domaindropper-session', id);
    }
    return id;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Session-Id': this.getSessionId(),
      ...(options.headers as Record<string, string> || {}),
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 204) return undefined as T;
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.detail || `API error: ${res.status}`);
    }
    return res.json();
  }

  async searchDomains(params: SearchParams): Promise<DomainListResponse> {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.limit) q.set('limit', String(params.limit));
    if (params.search) q.set('search', params.search);
    if (params.available !== undefined) q.set('available', String(params.available));
    if (params.min_length) q.set('min_length', String(params.min_length));
    if (params.max_length) q.set('max_length', String(params.max_length));
    if (params.starts_with) q.set('starts_with', params.starts_with);
    if (params.ends_with) q.set('ends_with', params.ends_with);
    if (params.contains) q.set('contains', params.contains);
    if (params.has_numbers !== undefined) q.set('has_numbers', String(params.has_numbers));
    if (params.has_hyphen !== undefined) q.set('has_hyphen', String(params.has_hyphen));
    if (params.sort) q.set('sort', params.sort);
    return this.request<DomainListResponse>(`/domains?${q.toString()}`);
  }

  async getLatestDomains(limit = 50): Promise<DomainListResponse> {
    return this.request<DomainListResponse>(`/domains/latest?limit=${limit}`);
  }

  async getDomain(domain: string): Promise<BackendDomain> {
    return this.request<BackendDomain>(`/domains/${encodeURIComponent(domain)}`);
  }

  async getStatistics(): Promise<BackendStatistics> {
    return this.request<BackendStatistics>('/statistics');
  }

  async getTrending(): Promise<BackendTrending> {
    return this.request<BackendTrending>('/trending');
  }

  async addBookmark(domainId: number, domainName: string): Promise<BackendBookmark> {
    return this.request<BackendBookmark>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ domain_id: domainId, domain_name: domainName }),
    });
  }

  async removeBookmark(id: number): Promise<void> {
    return this.request<void>(`/bookmarks/${id}`, { method: 'DELETE' });
  }

  async listBookmarks(): Promise<{ items: BackendBookmark[]; total: number }> {
    return this.request('/bookmarks');
  }
}

export const api = new ApiClient();
