import { useState, useEffect, useCallback } from 'react';

export interface MarketIndex {
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketIndices {
  kospi: MarketIndex | null;
  nasdaq: MarketIndex | null;
  sp500: MarketIndex | null;
}

async function fetchFromServer(): Promise<MarketIndices | null> {
  try {
    const res = await fetch('/api/market/indices', {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function useMarketIndices(intervalMs = 30000) {
  const [indices, setIndices] = useState<MarketIndices>({
    kospi: null, nasdaq: null, sp500: null,
  });

  const fetchData = useCallback(async () => {
    const result = await fetchFromServer();
    if (result) setIndices(result);
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, intervalMs);
    return () => clearInterval(timer);
  }, [fetchData, intervalMs]);

  return indices;
}
