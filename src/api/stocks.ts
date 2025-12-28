import type { DailyPrice, PriceHistory } from '../types/stocks';

const API_KEY = import.meta.env.VITE_ALPHAVANTAGE_API_KEY || '';
const BASE_URL = 'https://www.alphavantage.co/query';
const CACHE_KEY_PREFIX = 'stock_prices_';
const CACHE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

interface AlphaVantageDaily {
  'Time Series (Daily)': Record<string, {
    '1. open': string;
    '2. high': string;
    '3. low': string;
    '4. close': string;
    '5. adjusted close': string;
    '6. volume': string;
  }>;
  'Meta Data'?: {
    '2. Symbol': string;
  };
  Note?: string;
  'Error Message'?: string;
}

function getCacheKey(ticker: string): string {
  return `${CACHE_KEY_PREFIX}${ticker.toUpperCase()}`;
}

function getCachedPrices(ticker: string): PriceHistory | null {
  try {
    const cached = localStorage.getItem(getCacheKey(ticker));
    if (!cached) return null;

    const parsed: PriceHistory = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - parsed.lastUpdated < CACHE_DURATION_MS) {
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

function setCachedPrices(ticker: string, prices: DailyPrice[]): void {
  try {
    const priceHistory: PriceHistory = {
      ticker: ticker.toUpperCase(),
      prices,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(getCacheKey(ticker), JSON.stringify(priceHistory));
  } catch (error) {
    console.warn('Failed to cache prices:', error);
  }
}

export async function fetchDailyPrices(ticker: string): Promise<PriceHistory> {
  const normalizedTicker = ticker.toUpperCase();

  // Check cache first
  const cached = getCachedPrices(normalizedTicker);
  if (cached) {
    return cached;
  }

  if (!API_KEY) {
    return {
      ticker: normalizedTicker,
      prices: [],
      lastUpdated: Date.now(),
      error: 'No API key configured. Set VITE_ALPHAVANTAGE_API_KEY in .env',
    };
  }

  try {
    const url = `${BASE_URL}?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${normalizedTicker}&outputsize=compact&apikey=${API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: AlphaVantageDaily = await response.json();

    // Check for API errors
    if (data.Note) {
      return {
        ticker: normalizedTicker,
        prices: [],
        lastUpdated: Date.now(),
        error: 'API rate limit reached. Try again later.',
      };
    }

    if (data['Error Message']) {
      return {
        ticker: normalizedTicker,
        prices: [],
        lastUpdated: Date.now(),
        error: `Invalid ticker: ${normalizedTicker}`,
      };
    }

    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      return {
        ticker: normalizedTicker,
        prices: [],
        lastUpdated: Date.now(),
        error: 'No data available',
      };
    }

    // Parse prices
    const prices: DailyPrice[] = Object.entries(timeSeries)
      .map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        adjustedClose: parseFloat(values['5. adjusted close']),
        volume: parseInt(values['6. volume'], 10),
      }))
      .sort((a, b) => a.date.localeCompare(b.date)); // Oldest first

    // Cache the results
    setCachedPrices(normalizedTicker, prices);

    return {
      ticker: normalizedTicker,
      prices,
      lastUpdated: Date.now(),
    };
  } catch (error) {
    return {
      ticker: normalizedTicker,
      prices: [],
      lastUpdated: Date.now(),
      error: error instanceof Error ? error.message : 'Failed to fetch prices',
    };
  }
}

export async function fetchMultiplePrices(tickers: string[]): Promise<Map<string, PriceHistory>> {
  const results = new Map<string, PriceHistory>();

  // Fetch sequentially to respect rate limits (5/min on free tier)
  for (const ticker of tickers) {
    const priceHistory = await fetchDailyPrices(ticker);
    results.set(ticker.toUpperCase(), priceHistory);

    // Small delay between requests to avoid rate limiting
    if (tickers.indexOf(ticker) < tickers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return results;
}

export function clearPriceCache(ticker?: string): void {
  if (ticker) {
    localStorage.removeItem(getCacheKey(ticker));
  } else {
    // Clear all price caches
    Object.keys(localStorage)
      .filter(key => key.startsWith(CACHE_KEY_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }
}

export function getCacheStatus(): { ticker: string; lastUpdated: Date }[] {
  return Object.keys(localStorage)
    .filter(key => key.startsWith(CACHE_KEY_PREFIX))
    .map(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        return {
          ticker: key.replace(CACHE_KEY_PREFIX, ''),
          lastUpdated: new Date(data.lastUpdated || 0),
        };
      } catch {
        return null;
      }
    })
    .filter((item): item is { ticker: string; lastUpdated: Date } => item !== null);
}
