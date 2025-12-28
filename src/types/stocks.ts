export interface DailyPrice {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  adjustedClose: number;
  volume: number;
}

export interface PriceHistory {
  ticker: string;
  prices: DailyPrice[];
  lastUpdated: number;
  error?: string;
}

export interface PortfolioValue {
  date: string;
  value: number;
}

export interface ChartData {
  time: string;
  value: number;
}
