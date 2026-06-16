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

// 여러 CORS 프록시 (fallback 순서)
const PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

/** Yahoo Finance 실시간 주가 조회 (CORS 프록시 경유) */
export async function fetchStockPrice(ticker: string): Promise<LiveStockData | null> {
  const target = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;

  for (const proxy of PROXIES) {
    try {
      const res = await fetch(`${proxy}${encodeURIComponent(target)}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;

      const data = await res.json();
      if (!data.chart?.result?.[0]) continue;

      const { meta } = data.chart.result[0];
      const price = meta.regularMarketPrice;
      const prev = meta.previousClose || meta.chartPreviousClose;

      return {
        ticker,
        name: meta.shortName || ticker,
        currentPrice: price,
        previousClose: prev,
        change: price - prev,
        changePercent: ((price - prev) / prev) * 100,
        currency: meta.currency || 'KRW',
        timestamp: new Date().toISOString(),
      };
    } catch {
      continue;
    }
  }
  return null;
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
