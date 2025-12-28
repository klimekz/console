import type { ResearchConfig, ResearchReport, PaginatedResponse, TodayResponse } from '../types';

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
};
