import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { StockData } from '@/store/stockStore';
import { useT } from '@/i18n';
import { fetchStockPrice } from '@/hooks/useStockPrice';

interface StockPriceCardProps {
  stock: StockData;
  index?: number;
}

export function StockPriceCard({ stock, index = 0 }: StockPriceCardProps) {
  const navigate = useNavigate();
  const { t, lang } = useT();

  // 실시간 상태
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [livePrev, setLivePrev] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // 하드코딩 폴드백
  const currentPrice = livePrice ?? stock.currentPrice;
  const previousClose = livePrev ?? stock.previousClose;

  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;
  const isUp = change >= 0;

  const isUSD = stock.exchange === 'NASDAQ' || stock.exchange === 'NYSE';
  const currency = isUSD ? '$' : '원';

  const formatPrice = (price: number) => {
    if (isUSD) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toLocaleString('ko-KR');
  };

  // 실시간 주가 가져오기
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await fetchStockPrice(stock.ticker);
      if (cancelled) return;
      if (result) {
        setLivePrice(result.currentPrice);
        setLivePrev(result.previousClose);
        setIsConnected(true);
      }
    }

    load(); // 최초
    const timer = setInterval(load, 20000); // 20초마다
    return () => { cancelled = true; clearInterval(timer); };
  }, [stock.ticker]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{
        y: -4,
        borderColor: 'rgba(99,102,241,0.3)',
        boxShadow: '0 8px 32px rgba(99,102,241,0.1)',
      }}
      onClick={() => navigate(`/stock/${stock.ticker}`)}
      className="cursor-pointer rounded-xl p-4 transition-colors duration-250"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(51, 65, 85, 0.4)',
      }}
    >
      {/* Top: Company Name + Exchange + Live badge */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-base font-bold text-[#f1f5f9] truncate leading-tight">
          {lang === 'KO' ? stock.nameKo : stock.nameEn}
        </span>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {isConnected && (
            <span className="text-[9px] font-bold text-[#10b981] animate-pulse">LIVE</span>
          )}
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded"
            style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}
          >
            {stock.exchange}
          </span>
        </div>
      </div>

      {/* Ticker */}
      <div className="font-mono text-[11px] font-medium tracking-tight text-[#64748b] uppercase mb-2">
        {stock.ticker}
      </div>

      {/* Current Price */}
      <div className="flex items-baseline gap-2 mb-1">
        <motion.span
          key={currentPrice}
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="font-mono text-[28px] font-bold leading-none text-[#f1f5f9]"
        >
          {isUSD ? currency : ''}{formatPrice(currentPrice)}{!isUSD ? currency : ''}
        </motion.span>
      </div>

      {/* Change % */}
      <div className="flex items-center gap-1 mb-3">
        {isUp ? (
          <TrendingUp size={14} className="text-[#10b981]" />
        ) : (
          <TrendingDown size={14} className="text-[#f43f5e]" />
        )}
        <span
          className="font-mono text-[13px] font-medium"
          style={{ color: isUp ? '#10b981' : '#f43f5e' }}
        >
          {isUp ? '+' : ''}{change.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          {' '}({isUp ? '+' : ''}{changePercent.toFixed(1)}%)
        </span>
      </div>

      {/* Divider */}
      <div className="h-px w-full mb-3" style={{ backgroundColor: '#1e293b' }} />

      {/* Target + Expected Return */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#64748b]">{t('stocks.target')}</span>
          <span className="font-mono text-[13px] font-medium text-[#06b6d4]">
            {isUSD ? '$' : ''}{formatPrice(stock.targetPrice)}{!isUSD ? currency : ''}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: 'rgba(16,185,129,0.12)',
            color: '#10b981',
            border: '1px solid rgba(16,185,129,0.3)',
          }}
        >
          +{stock.expectedReturn}%
        </span>
        {stock.isBeginnerFriendly && (
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'rgba(16,185,129,0.12)',
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            {t('stocks.beginnerFriendly')}
          </span>
        )}
        {stock.dividendYield && (
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'rgba(99,102,241,0.12)',
              color: '#6366f1',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            {stock.dividendYield}% {t('stocks.highDividend')}
          </span>
        )}
      </div>
    </motion.div>
  );
}
