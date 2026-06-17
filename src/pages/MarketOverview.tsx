import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Flame,
  ArrowUpDown,
  BarChart3,
  Activity,
} from 'lucide-react';
import { useAllStocks } from '@/api/stockApi';

const UP_RED = '#f87171';
const DOWN_BLUE = '#60a5fa';
const CARD_BG = 'rgba(15,23,42,0.6)';
const CARD_BORDER = 'rgba(51,65,85,0.4)';

type SortMode = 'changeDesc' | 'changeAsc' | 'name';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function MarketOverview() {
  const navigate = useNavigate();
  const { stocks, loading } = useAllStocks(10000);
  const [sortMode, setSortMode] = useState<SortMode>('changeDesc');

  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
  const fmtPrice = (n: number, exchange: string) => {
    if (exchange === 'KRX' || exchange === 'KOSDAQ') return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}원`;
    return `$${n.toFixed(2)}`;
  };

  /* Sort stocks by change% */
  const sortedStocks = useMemo(() => {
    const withPrice = stocks.filter((s) => s.realTime !== null);
    return [...withPrice].sort((a, b) => {
      if (sortMode === 'changeDesc') return (b.realTime?.changePercent ?? 0) - (a.realTime?.changePercent ?? 0);
      if (sortMode === 'changeAsc') return (a.realTime?.changePercent ?? 0) - (b.realTime?.changePercent ?? 0);
      return a.nameKo.localeCompare(b.nameKo);
    });
  }, [stocks, sortMode]);

  const topGainers = sortedStocks.filter((s) => (s.realTime?.changePercent ?? 0) >= 0).slice(0, 10);
  const topLosers = sortedStocks.filter((s) => (s.realTime?.changePercent ?? 0) < 0).slice(0, 10);

  /* Market mood */
  const upCount = stocks.filter((s) => s.realTime && s.realTime.changePercent >= 0).length;
  const downCount = stocks.filter((s) => s.realTime && s.realTime.changePercent < 0).length;
  const totalWithData = upCount + downCount;
  const moodRatio = totalWithData > 0 ? upCount / totalWithData : 0.5;
  const moodText = moodRatio >= 0.6 ? '강세' : moodRatio >= 0.4 ? '중립' : '약세';
  const moodColor = moodRatio >= 0.6 ? '#f87171' : moodRatio >= 0.4 ? '#f59e0b' : '#60a5fa';

  const toggleSort = () => {
    setSortMode((prev) => {
      if (prev === 'changeDesc') return 'changeAsc';
      if (prev === 'changeAsc') return 'name';
      return 'changeDesc';
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 lg:px-6 py-6 max-w-[1400px] mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 size={20} className="text-indigo-400" />
          <h1 className="text-xl font-bold text-slate-100">시장 동향</h1>
        </div>
        <p className="text-sm text-slate-400">
          전 종목 실시간 등락률 기준 순위. Google Finance 연동 데이터로 업데이트됩니다.
        </p>
      </motion.div>

      {/* Market Mood */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl p-4 mb-6 flex items-center justify-between"
        style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, backdropFilter: 'blur(8px)' }}
      >
        <div className="flex items-center gap-3">
          <Activity size={18} style={{ color: moodColor }} />
          <div>
            <div className="text-xs text-slate-400">시장 분위기</div>
            <div className="text-lg font-bold" style={{ color: moodColor }}>{moodText}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400">상승</div>
            <div className="text-sm font-bold font-mono" style={{ color: UP_RED }}>{upCount}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">하락</div>
            <div className="text-sm font-bold font-mono" style={{ color: DOWN_BLUE }}>{downCount}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">비율</div>
            <div className="text-sm font-bold font-mono text-slate-200">{totalWithData > 0 ? Math.round(moodRatio * 100) : 0}%</div>
          </div>
        </div>
      </motion.div>

      {/* Sort control */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
        <button
          onClick={toggleSort}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
          style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <ArrowUpDown size={12} />
          {sortMode === 'changeDesc' ? '등락률 높은 순' : sortMode === 'changeAsc' ? '등락률 낮은 순' : '이름순'}
        </button>
      </motion.div>

      {/* Top Gainers */}
      <motion.section variants={itemVariants} className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} style={{ color: UP_RED }} />
          <h2 className="text-sm font-bold text-slate-100">급등 종목</h2>
          <span className="text-xs text-slate-500">({topGainers.length})</span>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, backdropFilter: 'blur(8px)' }}>
          {/* Table Header */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_100px_120px_80px_100px_120px_140px] gap-3 px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider" style={{ backgroundColor: 'rgba(15,23,42,0.4)' }}>
            <span>종목명</span>
            <span>티커</span>
            <span className="text-right">현재가</span>
            <span className="text-right">등락(원)</span>
            <span className="text-right">등락률</span>
            <span>테마</span>
            <span className="text-right">액션</span>
          </div>

          {loading && topGainers.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">데이터 로드 중...</div>
          ) : topGainers.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">상승 종목 없음</div>
          ) : (
            topGainers.map((stock) => {
              const rt = stock.realTime!;
              return (
                <div
                  key={stock.ticker}
                  className="grid grid-cols-1 lg:grid-cols-[1fr_100px_120px_80px_100px_120px_140px] gap-2 lg:gap-3 px-4 lg:px-5 py-3 items-center transition-colors hover:bg-slate-800/30"
                  style={{ borderTop: `1px solid ${CARD_BORDER}` }}
                >
                  <button
                    onClick={() => navigate(`/stock/${encodeURIComponent(stock.ticker)}`)}
                    className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-colors text-left"
                  >
                    {stock.nameKo}
                  </button>
                  <span className="text-xs font-mono text-slate-500">{stock.ticker}</span>
                  <span className="text-sm font-bold font-mono text-slate-100 text-right">{fmtPrice(rt.currentPrice, stock.exchange)}</span>
                  <span className="text-sm font-mono text-right" style={{ color: UP_RED }}>+{rt.change.toFixed(0)}</span>
                  <span className="text-sm font-mono font-medium text-right px-2 py-0.5 rounded" style={{ color: UP_RED, backgroundColor: 'rgba(248,113,113,0.08)' }}>
                    {fmtPct(rt.changePercent)}
                  </span>
                  <span className="text-xs text-slate-400">{stock.theme}</span>
                  <a
                    href={stock.googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center lg:justify-end gap-1.5 text-[11px] font-medium transition-all duration-200 hover:opacity-90 px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)' }}
                  >
                    <ExternalLink size={11} /> Google
                  </a>
                </div>
              );
            })
          )}
        </div>
      </motion.section>

      {/* Top Losers */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingDown size={16} style={{ color: DOWN_BLUE }} />
          <h2 className="text-sm font-bold text-slate-100">급락 종목</h2>
          <span className="text-xs text-slate-500">({topLosers.length})</span>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, backdropFilter: 'blur(8px)' }}>
          {/* Table Header */}
          <div className="hidden lg:grid lg:grid-cols-[1fr_100px_120px_80px_100px_120px_140px] gap-3 px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider" style={{ backgroundColor: 'rgba(15,23,42,0.4)' }}>
            <span>종목명</span>
            <span>티커</span>
            <span className="text-right">현재가</span>
            <span className="text-right">등락(원)</span>
            <span className="text-right">등락률</span>
            <span>테마</span>
            <span className="text-right">액션</span>
          </div>

          {loading && topLosers.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">데이터 로드 중...</div>
          ) : topLosers.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-500">하락 종목 없음</div>
          ) : (
            topLosers.map((stock) => {
              const rt = stock.realTime!;
              return (
                <div
                  key={stock.ticker}
                  className="grid grid-cols-1 lg:grid-cols-[1fr_100px_120px_80px_100px_120px_140px] gap-2 lg:gap-3 px-4 lg:px-5 py-3 items-center transition-colors hover:bg-slate-800/30"
                  style={{ borderTop: `1px solid ${CARD_BORDER}` }}
                >
                  <button
                    onClick={() => navigate(`/stock/${encodeURIComponent(stock.ticker)}`)}
                    className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-colors text-left"
                  >
                    {stock.nameKo}
                  </button>
                  <span className="text-xs font-mono text-slate-500">{stock.ticker}</span>
                  <span className="text-sm font-bold font-mono text-slate-100 text-right">{fmtPrice(rt.currentPrice, stock.exchange)}</span>
                  <span className="text-sm font-mono text-right" style={{ color: DOWN_BLUE }}>{rt.change.toFixed(0)}</span>
                  <span className="text-sm font-mono font-medium text-right px-2 py-0.5 rounded" style={{ color: DOWN_BLUE, backgroundColor: 'rgba(96,165,250,0.08)' }}>
                    {fmtPct(rt.changePercent)}
                  </span>
                  <span className="text-xs text-slate-400">{stock.theme}</span>
                  <a
                    href={stock.googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center lg:justify-end gap-1.5 text-[11px] font-medium transition-all duration-200 hover:opacity-90 px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: 'rgba(99,102,241,0.08)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.15)' }}
                  >
                    <ExternalLink size={11} /> Google
                  </a>
                </div>
              );
            })
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
