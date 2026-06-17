import { useState, useEffect, useCallback } from 'react';

export interface StockWithPrice {
  ticker: string;
  nameKo: string;
  nameEn: string;
  theme: string;
  sector: string;
  exchange: string;
  googleUrl: string;
  beginnerFriendly: boolean;
  dividendYield?: number;
  policyDrivers: string[];
  realTime: {
    currentPrice: number;
    previousClose: number;
    change: number;
    changePercent: number;
    currency: string;
    name: string;
  } | null;
  isLive: boolean;
}

export interface ThemeGroup {
  key: string;
  name: string;
  icon: string;
  color: string;
  stocks: StockWithPrice[];
}

export interface PolicyPrediction {
  id: string;
  year: number;
  policyName: string;
  theme: string;
  themeKey: string;
  relatedStocks: string[];
  impact: 'high' | 'medium' | 'low';
  description: string;
  expectedImplementation: string;
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

// Fetch all stocks with real-time prices
export async function fetchAllStocks(): Promise<StockWithPrice[]> {
  const res = await fetchWithTimeout('/api/stocks/all');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.stocks || [];
}

// Fetch single stock detail
export async function fetchStockDetail(ticker: string): Promise<StockWithPrice | null> {
  try {
    const res = await fetchWithTimeout(`/api/stock/${encodeURIComponent(ticker)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.stock || null;
  } catch {
    return null;
  }
}

// Fetch policy predictions
export async function fetchPolicyPredictions(): Promise<PolicyPrediction[]> {
  try {
    const res = await fetchWithTimeout('/api/policy-predictions');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.predictions || [];
  } catch {
    return [];
  }
}

// Hook: auto-refresh every 10 seconds
export function useAllStocks(intervalMs = 10000) {
  const [stocks, setStocks] = useState<StockWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const data = await fetchAllStocks();
      setStocks(data);
      setLiveCount(data.filter(s => s.isLive).length);
      setError(null);
    } catch {
      setError('데이터 로드 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, intervalMs);
    return () => clearInterval(timer);
  }, [fetchData, intervalMs]);

  return { stocks, loading, error, liveCount, refresh: fetchData };
}

// Hook: single stock detail
export function useStockDetail(ticker: string) {
  const [stock, setStock] = useState<StockWithPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchStockDetail(ticker).then((data) => {
      if (!cancelled) {
        setStock(data);
        setError(data ? null : '데이터를 찾을 수 없습니다');
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [ticker]);

  return { stock, loading, error };
}

// Hook: policy predictions
export function usePolicyPredictions() {
  const [predictions, setPredictions] = useState<PolicyPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPolicyPredictions().then((data) => {
      setPredictions(data);
      setError(data.length === 0 ? '정책 데이터를 불러올 수 없습니다' : null);
      setLoading(false);
    });
  }, []);

  return { predictions, loading, error };
}
