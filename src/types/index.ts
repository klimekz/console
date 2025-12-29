export interface ResearchConfig {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'papers' | 'news' | 'markets';
  topics: string[];
  preferredSources: string[]; // Domains to prioritize (e.g., arxiv.org)
  blockedSources: string[]; // Domains to avoid
  enabled: boolean;
  schedule: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResearchItem {
  id: string;
  reportId: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  relevanceScore: number;
  publishedAt: string | null;
  category: string;
  tags: string[];
}

export interface ResearchReport {
  id: string;
  configId: string;
  configName: string;
  category: string;
  generatedAt: string;
  summary: string;
  items: ResearchItem[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TodayResponse {
  data: ResearchReport[];
  isLatest: boolean;
  message?: string;
}

export type CategoryType = 'papers' | 'news' | 'markets';

export const CATEGORY_LABELS: Record<CategoryType, string> = {
  papers: 'Research Papers',
  news: 'Tech News',
  markets: 'Markets',
};


export interface AuditEntry {
  id: string;
  eventType: string;
  configId?: string;
  configName?: string;
  reportId?: string;
  model?: string;
  inputTokens: number;
  outputTokens: number;
  webSearchCalls: number;
  estimatedCostCents: number;
  runtimeMs: number;
  status: 'started' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

export interface AuditStatus {
  running: AuditEntry[];
  recentCompleted: AuditEntry[];
}
