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

/** 10초 타임아웃 fetch */
async function fetchWithTimeout(url: string, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchFromServer(): Promise<MarketIndices | null> {
  try {
    const res = await fetchWithTimeout('/api/market/indices');
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
