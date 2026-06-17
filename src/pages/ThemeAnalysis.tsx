import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Cpu,
  Atom,
  HeartPulse,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { useAllStocks } from '@/api/stockApi';

/* ─── Theme config ─── */
const THEME_CONFIG: Record<string, { icon: typeof Zap; color: string; label: string; desc: string }> = {
  power: { icon: Zap, color: '#06b6d4', label: 'AI 인프라·전력·냉각', desc: '데이터센터 액침냉각, 초고압 변압기, ESS — AI 시대의 핵심 인프라' },
  robotics: { icon: Cpu, color: '#6366f1', label: '온디바이스 AI·로봇·모빌리티', desc: '자율주행, 공장자동화, 온디바이스 AI 칩 — AI의 물리적 계층' },
  quantum: { icon: Atom, color: '#10b981', label: '양자컴퓨팅', desc: 'IBM의 배당 수익부터 IONQ의 고성장까지 — 양자 혁명 가속화' },
  bio: { icon: HeartPulse, color: '#f43f5e', label: '바이오·장수', desc: '비만치료제, CDMO, 바이오테크가 헬스케어와 인류 장수를 재정의' },
};

/* ─── Korean market colors ─── */
const UP_RED = '#f87171';
const DOWN_BLUE = '#60a5fa';
const CARD_BG = 'rgba(15,23,42,0.6)';
const CARD_BORDER = 'rgba(51,65,85,0.4)';

type SortKey = 'change' | 'price' | 'sector';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function ThemeAnalysis() {
  const navigate = useNavigate();
  const { stocks, loading } = useAllStocks(10000);
  const [activeTheme, setActiveTheme] = useState<string>('power');
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set(['power']));
  const [sortBy, setSortBy] = useState<SortKey>('change');

  const toggleTheme = (key: string) => {
    setExpandedThemes((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const themeStocks = useMemo(() => {
    const filtered = stocks.filter((s) => s.theme === activeTheme);
    return [...filtered].sort((a, b) => {
      if (sortBy === 'change') {
        const ca = a.realTime?.changePercent ?? 0;
        const cb = b.realTime?.changePercent ?? 0;
        return cb - ca;
      }
      if (sortBy === 'price') {
        const pa = a.realTime?.currentPrice ?? 0;
        const pb = b.realTime?.currentPrice ?? 0;
        return pb - pa;
      }
      return (a.sector || '').localeCompare(b.sector || '');
    });
  }, [stocks, activeTheme, sortBy]);

  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
  const fmtPrice = (n: number, exchange: string) => {
    if (exchange === 'KRX' || exchange === 'KOSDAQ') return `${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}원`;
    return `$${n.toFixed(2)}`;
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
          <Layers size={20} className="text-indigo-400" />
          <h1 className="text-xl font-bold text-slate-100">테마 분석</h1>
          <span className="text-[11px] text-slate-500 ml-1">인포스탁 섹터그룹별 [0659]</span>
        </div>
        <p className="text-sm text-slate-400">
          4대 메가테마별 종목을 실시간 등락률, 섹터, 정부정책 촉매요인과 함께 분석합니다.
        </p>
      </motion.div>

      {/* Theme Tabs */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex flex-wrap gap-2">
          {Object.entries(THEME_CONFIG).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const active = activeTheme === key;
            return (
              <button
                key={key}
                onClick={() => setActiveTheme(key)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: active ? `${cfg.color}15` : CARD_BG,
                  border: active ? `1px solid ${cfg.color}40` : `1px solid ${CARD_BORDER}`,
                  color: active ? cfg.color : '#94a3b8',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Icon size={16} />
                {cfg.label}
                <span className="text-[11px] opacity-60">({stocks.filter((s) => s.theme === key).length})</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Sort Controls */}
      <motion.div variants={itemVariants} className="flex items-center gap-2 mb-4">
        <span className="text-xs text-slate-500">정렬:</span>
        {([['change', '등락률'], ['price', '가격'], ['sector', '섹터']] as [SortKey, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSortBy(key)}
            className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              backgroundColor: sortBy === key ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: sortBy === key ? '#818cf8' : '#64748b',
              border: sortBy === key ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
      </motion.div>

      {/* Active Theme Detail */}
      <motion.div variants={itemVariants}>
        {Object.entries(THEME_CONFIG)
          .filter(([key]) => key === activeTheme)
          .map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isExpanded = expandedThemes.has(key);
            const themeStockList = themeStocks;

            return (
              <div
                key={key}
                className="rounded-xl overflow-hidden"
                style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, backdropFilter: 'blur(8px)' }}
              >
                {/* Theme Header */}
                <button
                  onClick={() => toggleTheme(key)}
                  className="w-full flex items-center justify-between p-4 lg:p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cfg.color}18` }}>
                      <Icon size={20} style={{ color: cfg.color }} />
                    </div>
                    <div>
                      <div className="text-base font-bold text-slate-100">{cfg.label}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{cfg.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">{themeStockList.length}개 종목</span>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                  </div>
                </button>

                {/* Stock Table */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                        {/* Table Header */}
                        <div className="hidden lg:grid lg:grid-cols-[1fr_100px_120px_100px_120px_1fr_140px] gap-3 px-5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wider" style={{ backgroundColor: 'rgba(15,23,42,0.4)' }}>
                          <span>종목명</span>
                          <span>티커</span>
                          <span className="text-right">실시간가격</span>
                          <span className="text-right">등락률</span>
                          <span>섹터</span>
                          <span>정부정책촉매</span>
                          <span className="text-right">액션</span>
                        </div>

                        {loading && themeStockList.length === 0 ? (
                          <div className="px-5 py-8 text-center text-sm text-slate-500">데이터 로드 중...</div>
                        ) : (
                          themeStockList.map((stock) => {
                            const rt = stock.realTime;
                            const isUp = (rt?.changePercent ?? 0) >= 0;

                            return (
                              <div
                                key={stock.ticker}
                                className="grid grid-cols-1 lg:grid-cols-[1fr_100px_120px_100px_120px_1fr_140px] gap-2 lg:gap-3 px-4 lg:px-5 py-3 items-center transition-colors hover:bg-slate-800/30"
                                style={{ borderTop: `1px solid ${CARD_BORDER}` }}
                              >
                                {/* 종목명 */}
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => navigate(`/stock/${encodeURIComponent(stock.ticker)}`)}
                                    className="text-sm font-semibold text-slate-100 hover:text-indigo-400 transition-colors text-left"
                                  >
                                    {stock.nameKo}
                                  </button>
                                  {stock.beginnerFriendly && (
                                    <span className="text-[9px] text-emerald-400 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>초보</span>
                                  )}
                                </div>

                                {/* 티커 */}
                                <span className="text-xs font-mono text-slate-500">{stock.ticker}</span>

                                {/* 실시간가격 */}
                                <div className="text-right">
                                  {rt ? (
                                    <span className="text-sm font-bold font-mono text-slate-100">
                                      {fmtPrice(rt.currentPrice, stock.exchange)}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-500">수신 중...</span>
                                  )}
                                </div>

                                {/* 등락률 */}
                                <div className="text-right">
                                  {rt ? (
                                    <span
                                      className="text-sm font-mono font-medium px-2 py-0.5 rounded"
                                      style={{
                                        color: isUp ? UP_RED : DOWN_BLUE,
                                        backgroundColor: isUp ? 'rgba(248,113,113,0.08)' : 'rgba(96,165,250,0.08)',
                                      }}
                                    >
                                      {fmtPct(rt.changePercent)}
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-500">-</span>
                                  )}
                                </div>

                                {/* 섹터 */}
                                <span className="text-xs text-slate-400">{stock.sector || '-'}</span>

                                {/* 정부정책촉매 */}
                                <div className="flex flex-wrap gap-1">
                                  {stock.policyDrivers?.slice(0, 2).map((driver) => (
                                    <span key={driver} className="text-[10px] text-slate-400 px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(51,65,85,0.3)' }}>
                                      {driver}
                                    </span>
                                  )) || <span className="text-xs text-slate-600">-</span>}
                                </div>

                                {/* Google Finance */}
                                <div className="flex items-center lg:justify-end gap-2">
                                  <a
                                    href={stock.googleUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 hover:opacity-90"
                                    style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                                  >
                                    <ExternalLink size={11} />
                                    Google
                                  </a>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
      </motion.div>
    </motion.div>
  );
}
