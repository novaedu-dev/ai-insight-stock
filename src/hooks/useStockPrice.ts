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

// Render 서버의 API 사용 (CORS 제약 없음)
const API_BASE = '/api';

/** 서버 API로 실시간 주가 조회 */
export async function fetchStockPrice(ticker: string): Promise<LiveStockData | null> {
  try {
    const res = await fetch(`${API_BASE}/stock/${encodeURIComponent(ticker)}`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.error || !data.currentPrice) return null;

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
  } catch {
    return null;
  }
}

/** 훅: 단일 종목 실시간 주가 */
export function useLiveStockPrice(ticker: string, intervalMs = 15000) {
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
