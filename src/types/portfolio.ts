export interface Holding {
  id: string;
  ticker: string;
  shares: number;
  sector?: string;
  industry?: string;
  name?: string;
  addedAt: number;
}

export interface SectorGroup {
  sector: string;
  holdings: Holding[];
  totalHoldings: number;
}

export interface PortfolioSummary {
  totalHoldings: number;
  totalPositions: number;
  sectors: string[];
  industries: string[];
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url?: string;
  relatedTickers: string[];
  relatedSectors: string[];
  publishedAt: string;
}

export interface SectorInsight {
  sector: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  summary: string;
  relevantNews: NewsItem[];
}
