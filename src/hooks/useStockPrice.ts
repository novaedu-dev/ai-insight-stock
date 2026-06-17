import { useState, useEffect, useCallback } from 'react';

export interface LiveStockData {
  ticker: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  timestamp: string;
}

// Render 서버 API 사용
const API_BASE = '/api';

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

/** 서버 API로 실시간 주가 조회 */
export async function fetchStockPrice(ticker: string): Promise<LiveStockData | null> {
  try {
    const res = await fetchWithTimeout(`${API_BASE}/stock/${encodeURIComponent(ticker)}`);
    if (!res.ok) {
      console.warn(`[StockPrice] HTTP ${res.status} for ${ticker}`);
      return null;
    }

    const data = await res.json();
    if (data.error || !data.currentPrice) {
      console.warn(`[StockPrice] No data for ${ticker}:`, data.error);
      return null;
    }

    return {
      ticker: data.ticker,
      name: data.name,
      currentPrice: data.currentPrice,
      previousClose: data.previousClose,
      change: data.change,
      changePercent: data.changePercent,
      currency: data.currency || 'KRW',
      timestamp: data.timestamp,
    };
  } catch (err: any) {
    console.warn(`[StockPrice] Fetch failed for ${ticker}:`, err.name);
    return null;
  }
}

/** 훅: 단일 종목 실시간 주가 (20초 갱신) */
export function useLiveStockPrice(ticker: string, intervalMs = 20000) {
  const [live, setLive] = useState<LiveStockData | null>(null);
  const [isLive, setIsLive] = useState(false);

  const fetchData = useCallback(async () => {
    const result = await fetchStockPrice(ticker);
    if (result) {
      setLive(result);
      setIsLive(true);
    }
  }, [ticker]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, intervalMs);
    return () => clearInterval(timer);
  }, [fetchData, intervalMs]);

  return { live, isLive };
}
