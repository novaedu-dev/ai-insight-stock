import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap,
  Cpu,
  Atom,
  HeartPulse,
  ArrowRight,
  ExternalLink,
  Activity,
  Globe,
  BarChart3,
} from 'lucide-react';
import { useAllStocks } from '@/api/stockApi';
import { useMarketIndices } from '@/hooks/useMarketIndices';

/* ─── Theme config ─── */
const THEME_CONFIG: Record<string, { icon: typeof Zap; color: string; label: string; desc: string }> = {
  power: { icon: Zap, color: '#06b6d4', label: 'AI 인프라·전력·냉각', desc: '데이터센터, 초고압 변압기, ESS, 액침냉각' },
  robotics: { icon: Cpu, color: '#6366f1', label: '온디바이스 AI·로봇·모빌리티', desc: '자율주행, 공장자동화, 온디바이스 AI 칩' },
  quantum: { icon: Atom, color: '#10b981', label: '양자컴퓨팅', desc: 'IBM, IONQ, 양자암호통신 — 양자 혁명 가속화' },
  bio: { icon: HeartPulse, color: '#f43f5e', label: '바이오·장수', desc: '비만치료제, CDMO, 바이오테크' },
};

/* ─── Korean market colors ─── */
const UP_RED = '#f87171';
const DOWN_BLUE = '#60a5fa';
const CARD_BG = 'rgba(15,23,42,0.6)';
const CARD_BORDER = 'rgba(51,65,85,0.4)';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function Dashboard() {
  const navigate = useNavigate();
  const { stocks, loading, liveCount } = useAllStocks(10000);
  const marketIndices = useMarketIndices(30000);

  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
  const fmtPrice = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  /* Group stocks by theme */
  const themeGroups = Object.entries(THEME_CONFIG).map(([key, cfg]) => ({
    key,
    ...cfg,
    stocks: stocks.filter((s) => s.theme === key),
  }));

  /* Featured stocks: first 2 from each theme = up to 8 */
  const featuredStocks = themeGroups.flatMap((g) => g.stocks.slice(0, 2));

  /* Market indices */
  const indices = [
    {
      name: 'KOSPI',
      value: marketIndices.kospi ? marketIndices.kospi.price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '2,847.3',
      change: marketIndices.kospi ? fmtPct(marketIndices.kospi.changePercent) : '+0.4%',
      isUp: marketIndices.kospi ? marketIndices.kospi.change >= 0 : true,
    },
    {
      name: 'NASDAQ',
      value: marketIndices.nasdaq ? marketIndices.nasdaq.price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '17,234.1',
      change: marketIndices.nasdaq ? fmtPct(marketIndices.nasdaq.changePercent) : '-0.2%',
      isUp: marketIndices.nasdaq ? marketIndices.nasdaq.change >= 0 : false,
    },
    {
      name: 'S&P500',
      value: marketIndices.sp500 ? marketIndices.sp500.price.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '5,432.7',
      change: marketIndices.sp500 ? fmtPct(marketIndices.sp500.changePercent) : '+0.1%',
      isUp: marketIndices.sp500 ? marketIndices.sp500.change >= 0 : true,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 lg:px-6 py-6 max-w-[1400px] mx-auto"
    >
      {/* ====== HERO BANNER ====== */}
      <motion.section
        variants={itemVariants}
        className="relative w-full overflow-hidden rounded-2xl mb-8 p-6 lg:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(6,182,212,0.1) 50%, rgba(15,23,42,0.8) 100%)',
          border: `1px solid ${CARD_BORDER}`,
        }}
      >
        {/* Decorative orbs */}
        <div className="absolute pointer-events-none" style={{ top: '-60px', left: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)', borderRadius: '50%' }} />
        <div className="absolute pointer-events-none" style={{ bottom: '-60px', right: '-40px', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(6,182,212,0.12), transparent 70%)', borderRadius: '50%' }} />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[11px] uppercase tracking-[0.1em] font-semibold px-3 py-1 rounded-md" style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
              AI Revolution · 차세대 주도주
            </span>
            {liveCount > 0 && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 px-2.5 py-1 rounded-md" style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                LIVE {liveCount}개 종목
              </span>
            )}
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-100 mb-2 tracking-tight">
            차세대 주도주 발굴
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            AI 혁명 이후의 4대 메가테마 — 전력·인프라, 로봇·모빌리티, 양자컴퓨팅, 바이오·장수 — 
            Google Finance 연동 실시간 데이터로 핵심 종목을 추적합니다.
          </p>
        </div>
      </motion.section>

      {/* ====== MARKET INDICES BAR ====== */}
      <motion.section variants={itemVariants} className="mb-8">
        <div className="grid grid-cols-3 gap-3">
          {indices.map((idx) => (
            <div
              key={idx.name}
              className="rounded-xl p-4"
              style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, backdropFilter: 'blur(8px)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                {idx.name === 'KOSPI' ? <Activity size={14} className="text-slate-400" /> : <Globe size={14} className="text-slate-400" />}
                <span className="text-xs font-medium text-slate-400">{idx.name}</span>
              </div>
              <div className="text-base lg:text-lg font-bold font-mono text-slate-100">{idx.value}</div>
              <div className="text-xs font-medium mt-0.5" style={{ color: idx.isUp ? UP_RED : DOWN_BLUE }}>
                {idx.change}
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ====== THEME CARDS ====== */}
      <motion.section variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-400" />
            4대 메가테마
          </h2>
          <button
            onClick={() => navigate('/themes')}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            전첵보기 <ArrowRight size={12} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {themeGroups.map((tg) => {
            const Icon = tg.icon;
            return (
              <motion.div
                key={tg.key}
                variants={itemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                onClick={() => navigate('/themes')}
                className="cursor-pointer rounded-xl p-4 transition-all duration-200"
                style={{
                  backgroundColor: CARD_BG,
                  border: `1px solid ${CARD_BORDER}`,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${tg.color}18` }}>
                    <Icon size={18} style={{ color: tg.color }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{tg.label}</div>
                    <div className="text-[11px] text-slate-500">{tg.stocks.length}개 종목</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{tg.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* ====== STOCK CARDS ====== */}
      <motion.section variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Zap size={18} className="text-amber-400" />
            핵심 종목
          </h2>
          <span className="text-[11px] text-slate-500">{stocks.length}개 종목 추적 중</span>
        </div>

        {loading && stocks.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">데이터 로드 중...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {(stocks.length > 0 ? stocks : featuredStocks).map((stock) => {
              const rt = stock.realTime;
              const price = rt?.currentPrice ?? 0;
              const changePct = rt?.changePercent ?? 0;
              const isUp = changePct >= 0;
              const themeCfg = THEME_CONFIG[stock.theme] || { color: '#64748b', label: stock.theme };

              return (
                <motion.div
                  key={stock.ticker}
                  variants={itemVariants}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="rounded-xl p-4 transition-all duration-200"
                  style={{
                    backgroundColor: CARD_BG,
                    border: `1px solid ${CARD_BORDER}`,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-sm font-bold text-slate-100">{stock.nameKo}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{stock.ticker}</div>
                    </div>
                    {stock.isLive ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(100,116,139,0.1)' }}>
                        cached
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-3">
                    {rt ? (
                      <>
                        <div className="text-lg font-bold font-mono text-slate-100">
                          {stock.exchange === 'KRX' || stock.exchange === 'KOSDAQ'
                            ? `${fmtPrice(price)}원`
                            : `$${price.toFixed(2)}`}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span style={{ color: isUp ? UP_RED : DOWN_BLUE }} className="font-mono font-medium">
                            {isUp ? '+' : ''}{rt.change.toFixed(2)}
                          </span>
                          <span
                            className="font-mono font-medium px-1.5 py-0.5 rounded"
                            style={{
                              color: isUp ? UP_RED : DOWN_BLUE,
                              backgroundColor: isUp ? 'rgba(248,113,113,0.08)' : 'rgba(96,165,250,0.08)',
                            }}
                          >
                            {fmtPct(changePct)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-500">데이터 수신 중...</div>
                    )}
                  </div>

                  {/* Theme badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                      style={{ backgroundColor: `${themeCfg.color}15`, color: themeCfg.color }}
                    >
                      {themeCfg.label}
                    </span>
                    {stock.beginnerFriendly && (
                      <span className="text-[10px] font-medium text-emerald-400 px-2 py-0.5 rounded-md" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                        초보추천
                      </span>
                    )}
                  </div>

                  {/* Google Finance button */}
                  <a
                    href={stock.googleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-90"
                    style={{
                      backgroundColor: 'rgba(99,102,241,0.1)',
                      color: '#818cf8',
                      border: '1px solid rgba(99,102,241,0.2)',
                    }}
                  >
                    <ExternalLink size={12} />
                    Google Finance에서 보기
                  </a>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>
    </motion.div>
  );
}
