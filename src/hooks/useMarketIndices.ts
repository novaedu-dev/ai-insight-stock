import { useState, useEffect, useCallback } from 'react';

export interface MarketIndex {
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

async function fetchIndex(symbol: string): Promise<MarketIndex | null> {
  const target = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;

  for (const proxy of PROXIES) {
    try {
      const res = await fetch(`${proxy}${encodeURIComponent(target)}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;

      const data = await res.json();
      if (!data.chart?.result?.[0]) continue;

      const meta = data.chart.result[0].meta;
      const price = meta.regularMarketPrice;
      const prev = meta.previousClose || meta.chartPreviousClose;

      return {
        name: symbol === '^KS11' ? 'KOSPI' : symbol === '^IXIC' ? 'NASDAQ' : 'S&P500',
        price,
        change: price - prev,
        changePercent: ((price - prev) / prev) * 100,
      };
    } catch {
      continue;
    }
  }
  return null;
}

export function useMarketIndices(intervalMs = 30000) {
  const [indices, setIndices] = useState<{ kospi: MarketIndex | null; nasdaq: MarketIndex | null; sp500: MarketIndex | null }>({
    kospi: null, nasdaq: null, sp500: null,
  });

  const fetchData = useCallback(async () => {
    const [kospi, nasdaq, sp500] = await Promise.all([
      fetchIndex('^KS11'),
      fetchIndex('^IXIC'),
      fetchIndex('^GSPC'),
    ]);
    setIndices({ kospi, nasdaq, sp500 });
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, intervalMs);
    return () => clearInterval(timer);
  }, [fetchData, intervalMs]);

  return indices;
}
