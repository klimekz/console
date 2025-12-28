import { useState, useEffect, useCallback } from 'react';
import type { PriceHistory, PortfolioValue, ChartData } from '../types/stocks';
import type { Holding } from '../types/portfolio';
import { fetchDailyPrices, clearPriceCache } from '../api/stocks';

interface UsePriceHistoryResult {
  priceHistories: Map<string, PriceHistory>;
  portfolioValues: PortfolioValue[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

export function usePriceHistory(holdings: Holding[]): UsePriceHistoryResult {
  const [priceHistories, setPriceHistories] = useState<Map<string, PriceHistory>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tickers = holdings.map(h => h.ticker);

  const fetchPrices = useCallback(async () => {
    if (tickers.length === 0) {
      setPriceHistories(new Map());
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newHistories = new Map<string, PriceHistory>();

      for (const ticker of tickers) {
        const history = await fetchDailyPrices(ticker);
        newHistories.set(ticker.toUpperCase(), history);
      }

      setPriceHistories(newHistories);

      // Check for any errors
      const errors = Array.from(newHistories.values())
        .filter(h => h.error)
        .map(h => `${h.ticker}: ${h.error}`);

      if (errors.length > 0) {
        setError(errors.join('; '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  }, [tickers.join(',')]);

  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Calculate portfolio value over time
  const portfolioValues: PortfolioValue[] = (() => {
    if (holdings.length === 0 || priceHistories.size === 0) {
      return [];
    }

    // Get all unique dates across all holdings
    const allDates = new Set<string>();
    priceHistories.forEach(history => {
      history.prices.forEach(p => allDates.add(p.date));
    });

    const sortedDates = Array.from(allDates).sort();

    // For each date, calculate total portfolio value
    return sortedDates.map(date => {
      let totalValue = 0;

      holdings.forEach(holding => {
        const history = priceHistories.get(holding.ticker.toUpperCase());
        if (!history) return;

        // Find the price for this date (or most recent before)
        const priceData = history.prices
          .filter(p => p.date <= date)
          .pop();

        if (priceData) {
          totalValue += holding.shares * priceData.adjustedClose;
        }
      });

      return { date, value: totalValue };
    }).filter(pv => pv.value > 0);
  })();

  const refresh = useCallback(async () => {
    clearPriceCache();
    await fetchPrices();
  }, [fetchPrices]);

  const clearCache = useCallback(() => {
    clearPriceCache();
    setPriceHistories(new Map());
  }, []);

  return {
    priceHistories,
    portfolioValues,
    isLoading,
    error,
    refresh,
    clearCache,
  };
}

// Helper to convert price history to chart data format
export function toChartData(history: PriceHistory): ChartData[] {
  return history.prices.map(p => ({
    time: p.date,
    value: p.adjustedClose,
  }));
}

// Helper to convert portfolio values to chart data format
export function portfolioToChartData(values: PortfolioValue[]): ChartData[] {
  return values.map(v => ({
    time: v.date,
    value: v.value,
  }));
}
