export type ResearchMode = 'deep' | 'lite';

export interface ResearchConfig {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'papers' | 'news' | 'markets';
  topics: string[];
  enabled: boolean;
  schedule: string; // cron expression
  researchMode: ResearchMode; // 'deep' = o4-mini-deep-research, 'lite' = gpt-4o-mini with web search
  createdAt: string;
  updatedAt: string;
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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DeepResearchRequest {
  configId: string;
  prompt: string;
  topics: string[];
}

export interface DeepResearchResponse {
  items: Array<{
    title: string;
    source: string;
    url: string;
    summary: string;
    relevanceScore: number;
    publishedAt: string | null;
    tags: string[];
  }>;
  summary: string;
}
