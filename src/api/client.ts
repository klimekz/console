import type { ResearchConfig, ResearchReport, PaginatedResponse, TodayResponse, DayReportsResponse, AuditEntry, AuditStatus } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Configs API
export const configsApi = {
  getAll: () => fetchApi<ResearchConfig[]>('/api/configs'),

  getById: (id: string) => fetchApi<ResearchConfig>(`/api/configs/${id}`),

  create: (config: Omit<ResearchConfig, 'id' | 'createdAt' | 'updatedAt'>) =>
    fetchApi<ResearchConfig>('/api/configs', {
      method: 'POST',
      body: JSON.stringify(config),
    }),

  update: (id: string, updates: Partial<ResearchConfig>) =>
    fetchApi<ResearchConfig>(`/api/configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  delete: (id: string) =>
    fetchApi<{ success: boolean }>(`/api/configs/${id}`, {
      method: 'DELETE',
    }),
};

// Reports API
export const reportsApi = {
  getToday: () => fetchApi<TodayResponse>('/api/reports/today'),

  getLatest: () => fetchApi<ResearchReport[]>('/api/reports/latest'),

  getHistory: (page = 1, pageSize = 10) =>
    fetchApi<PaginatedResponse<ResearchReport>>(`/api/reports/history?page=${page}&pageSize=${pageSize}`),

  getByDay: (days = 3, offset = 0) =>
    fetchApi<DayReportsResponse>(`/api/reports/by-day?days=${days}&offset=${offset}`),

  getAll: (page = 1, pageSize = 10, category?: string) => {
    let url = `/api/reports?page=${page}&pageSize=${pageSize}`;
    if (category) url += `&category=${category}`;
    return fetchApi<PaginatedResponse<ResearchReport>>(url);
  },

  getById: (id: string) => fetchApi<ResearchReport>(`/api/reports/${id}`),

  runConfig: (configId: string) =>
    fetchApi<ResearchReport>(`/api/reports/run/${configId}`, {
      method: 'POST',
    }),

  runAll: () =>
    fetchApi<{ success: boolean; count: number }>('/api/reports/run-all', {
      method: 'POST',
    }),

  clearAll: () =>
    fetchApi<{ success: boolean; deleted: number }>('/api/reports/clear', {
      method: 'DELETE',
    }),

  deleteItem: (itemId: string) =>
    fetchApi<{ success: boolean }>(`/api/reports/items/${itemId}`, {
      method: 'DELETE',
    }),

  deleteReport: (reportId: string) =>
    fetchApi<{ success: boolean }>(`/api/reports/${reportId}`, {
      method: 'DELETE',
    }),
};

// Audit API
export const auditApi = {
  getStatus: () => fetchApi<AuditStatus>('/api/audit/status'),

  getEntry: (id: string) => fetchApi<AuditEntry>(`/api/audit/${id}`),

  getRecent: (limit = 50) =>
    fetchApi<{ entries: AuditEntry[]; totals: { totalCostCents: number; totalInputTokens: number; totalOutputTokens: number; totalWebSearches: number } }>(
      `/api/audit?limit=${limit}`
    ),
};

// Sources API (feedback and curation)
export const sourcesApi = {
  submitFeedback: (feedback: { sourceDomain: string; itemId: string; rating: 1 | -1 }) =>
    fetchApi<{ success: boolean }>('/api/sources/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    }),

  getTopSources: (category?: string) =>
    fetchApi<Array<{ domain: string; name: string; trustScore: number; upvotes: number; downvotes: number }>>(
      `/api/sources${category ? `?category=${category}` : ''}`
    ),
};
