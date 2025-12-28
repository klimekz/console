import { useState, useEffect, useCallback } from 'react';
import type { Holding, SectorGroup, PortfolioSummary } from '../types/portfolio';
import { getTickerInfo } from '../data/sectorMappings';

const STORAGE_KEY = 'console_portfolio';

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load holdings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHoldings(parsed);
      }
    } catch (error) {
      console.error('Failed to load portfolio from localStorage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save holdings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
      } catch (error) {
        console.error('Failed to save portfolio to localStorage:', error);
      }
    }
  }, [holdings, isLoaded]);

  const addHolding = useCallback((ticker: string, shares: number) => {
    const normalizedTicker = ticker.toUpperCase().trim();
    const tickerInfo = getTickerInfo(normalizedTicker);

    const newHolding: Holding = {
      id: `${normalizedTicker}-${Date.now()}`,
      ticker: normalizedTicker,
      shares,
      name: tickerInfo?.name,
      sector: tickerInfo?.sector,
      industry: tickerInfo?.industry,
      addedAt: Date.now(),
    };

    setHoldings(prev => {
      // Check if holding already exists, if so, update shares
      const existingIndex = prev.findIndex(h => h.ticker === normalizedTicker);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          shares: updated[existingIndex].shares + shares,
        };
        return updated;
      }
      return [...prev, newHolding];
    });
  }, []);

  const updateHolding = useCallback((id: string, updates: Partial<Pick<Holding, 'shares'>>) => {
    setHoldings(prev =>
      prev.map(h => h.id === id ? { ...h, ...updates } : h)
    );
  }, []);

  const removeHolding = useCallback((id: string) => {
    setHoldings(prev => prev.filter(h => h.id !== id));
  }, []);

  const clearPortfolio = useCallback(() => {
    setHoldings([]);
  }, []);

  // Group holdings by sector
  const holdingsBySector: SectorGroup[] = holdings.reduce((groups, holding) => {
    const sector = holding.sector || 'Unknown';
    const existingGroup = groups.find(g => g.sector === sector);

    if (existingGroup) {
      existingGroup.holdings.push(holding);
      existingGroup.totalHoldings += 1;
    } else {
      groups.push({
        sector,
        holdings: [holding],
        totalHoldings: 1,
      });
    }

    return groups;
  }, [] as SectorGroup[]);

  // Sort sectors by number of holdings (descending)
  holdingsBySector.sort((a, b) => b.totalHoldings - a.totalHoldings);

  // Calculate portfolio summary
  const summary: PortfolioSummary = {
    totalHoldings: holdings.reduce((sum, h) => sum + h.shares, 0),
    totalPositions: holdings.length,
    sectors: [...new Set(holdings.map(h => h.sector).filter(Boolean) as string[])],
    industries: [...new Set(holdings.map(h => h.industry).filter(Boolean) as string[])],
  };

  return {
    holdings,
    holdingsBySector,
    summary,
    isLoaded,
    addHolding,
    updateHolding,
    removeHolding,
    clearPortfolio,
  };
}
