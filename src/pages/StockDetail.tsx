import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Target,
  Zap,
  Layers,
  Building2,
  Activity,
} from 'lucide-react';
import { useStockDetail, useAllStocks } from '@/api/stockApi';

/* ─── Theme config ─── */
const THEME_CONFIG: Record<string, { color: string; label: string }> = {
  power: { color: '#06b6d4', label: 'AI 인프라·전력·냉각' },
  robotics: { color: '#6366f1', label: '온디바이스 AI·로봇·모빌리티' },
  quantum: { color: '#10b981', label: '양자컴퓨팅' },
  bio: { color: '#f43f5e', label: '바이오·장수' },
};

const UP_RED = '#f87171';
const DOWN_BLUE = '#60a5fa';
const CARD_BG = 'rgba(15,23,42,0.6)';
const CARD_BORDER = 'rgba(51,65,85,0.4)';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const { stock, loading } = useStockDetail(ticker || '');
  const { stocks: allStocks } = useAllStocks(10000);

  const fmtPct = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-500 text-sm">
        데이터 로드 중...
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle size={32} className="text-amber-400 mb-3" />
        <div className="text-slate-300 font-medium mb-1">종목을 찾을 수 없습니다</div>
        <div className="text-slate-500 text-sm mb-4">티커: {ticker}</div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          <ArrowLeft size={14} /> 대시보드로 돌아가기
        </button>
      </div>
    );
  }

  const rt = stock.realTime;
  const isUp = (rt?.changePercent ?? 0) >= 0;
  const themeCfg = THEME_CONFIG[stock.theme] || { color: '#64748b', label: stock.theme };

  /* Related stocks in same theme */
  const relatedStocks = allStocks
    .filter((s) => s.theme === stock.theme && s.ticker !== stock.ticker)
    .slice(0, 4);

  /* Mock analyst data (fallback) */
  const entryStrategies = [
    '분할 매수로 진입 (3~4회에 나눠 매수)',
    '1차 지지선 근처에서 초기 포지션',
    '대형주는 안정성 우선, 소형주는 소액 분산',
  ];
  const upsideTriggers = [
    '관련 정책 발표 및 예산 확대',
    '대형 수주 계약 체결',
    '분기 실적 시즌 양호한 가이던스',
  ];
  const exitRiskFactors = [
    '지지선 이탈 시 손절 검토',
    '정책 방향 전환 또는 규제 강화',
    '글로벌 경기 둔화로 수요 감소',
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="px-4 lg:px-6 py-6 max-w-[1000px] mx-auto"
    >
      {/* Back button */}
      <motion.button
        variants={itemVariants}
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-5"
      >
        <ArrowLeft size={16} /> 뒤로
      </motion.button>

      {/* ====== HEADER CARD ====== */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl p-5 lg:p-6 mb-5"
        style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, backdropFilter: 'blur(8px)' }}
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-100">{stock.nameKo}</h1>
              <span className="text-sm font-mono text-slate-500">{stock.ticker}</span>
              {stock.isLive && (
                <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-md"
                style={{ backgroundColor: `${themeCfg.color}15`, color: themeCfg.color }}
              >
                {themeCfg.label}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Building2 size={11} /> {stock.exchange}
              </span>
              {stock.sector && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Layers size={11} /> {stock.sector}
                </span>
              )}
            </div>
          </div>

          {/* Price Block */}
          <div className="text-left lg:text-right">
            {rt ? (
              <>
                <div className="text-2xl lg:text-3xl font-bold font-mono text-slate-100">
                  {stock.exchange === 'KRX' || stock.exchange === 'KOSDAQ'
                    ? `${rt.currentPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}원`
                    : `$${rt.currentPrice.toFixed(2)}`}
                </div>
                <div className="flex items-center lg:justify-end gap-2 mt-1">
                  <span className="text-sm font-mono" style={{ color: isUp ? UP_RED : DOWN_BLUE }}>
                    {isUp ? '+' : ''}{rt.change.toFixed(2)}
                  </span>
                  <span
                    className="text-sm font-mono font-medium px-2 py-0.5 rounded"
                    style={{
                      color: isUp ? UP_RED : DOWN_BLUE,
                      backgroundColor: isUp ? 'rgba(248,113,113,0.08)' : 'rgba(96,165,250,0.08)',
                    }}
                  >
                    {fmtPct(rt.changePercent)}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-lg text-slate-500">데이터 수신 중...</div>
            )}
          </div>
        </div>

        {/* Google Finance button */}
        <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
          <a
            href={stock.googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
          >
            <ExternalLink size={14} />
            Google Finance에서 상세보기
          </a>
        </div>
      </motion.div>

      {/* ====== TWO COLUMN LAYOUT ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Policy Drivers */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-5"
          style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100">정부정책 촉매요인</h2>
          </div>
          {stock.policyDrivers && stock.policyDrivers.length > 0 ? (
            <div className="space-y-2">
              {stock.policyDrivers.map((driver, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5" style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300 leading-relaxed">{driver}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500">정책 촉매 데이터 수신 중...</div>
          )}
        </motion.div>

        {/* Analyst Deep Dive */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-5"
          style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Target size={16} className="text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-100">애널리스트 전망</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">진입전략</span>
              </div>
              <ul className="space-y-1">
                {entryStrategies.map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 pl-4 relative before:content-['·'] before:absolute before:left-1 before:text-slate-500">{s}</li>
                ))}
              </ul>
            </div>
            <div style={{ borderTop: `1px solid ${CARD_BORDER}` }} className="pt-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <TrendingUp size={12} className="text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400">상승트리거</span>
              </div>
              <ul className="space-y-1">
                {upsideTriggers.map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 pl-4 relative before:content-['·'] before:absolute before:left-1 before:text-slate-500">{s}</li>
                ))}
              </ul>
            </div>
            <div style={{ borderTop: `1px solid ${CARD_BORDER}` }} className="pt-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <AlertTriangle size={12} className="text-rose-400" />
                <span className="text-xs font-semibold text-rose-400">매도타점 / 리스크</span>
              </div>
              <ul className="space-y-1">
                {exitRiskFactors.map((s, i) => (
                  <li key={i} className="text-xs text-slate-300 pl-4 relative before:content-['·'] before:absolute before:left-1 before:text-slate-500">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ====== RELATED STOCKS ====== */}
      {relatedStocks.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-5 mt-4"
          style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, backdropFilter: 'blur(8px)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-slate-400" />
            <h2 className="text-sm font-bold text-slate-100">같은 테마의 관련 종목</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {relatedStocks.map((rs) => {
              const rsRt = rs.realTime;
              const rsIsUp = (rsRt?.changePercent ?? 0) >= 0;
              return (
                <button
                  key={rs.ticker}
                  onClick={() => navigate(`/stock/${encodeURIComponent(rs.ticker)}`)}
                  className="flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 hover:bg-slate-800/40"
                  style={{ border: `1px solid ${CARD_BORDER}` }}
                >
                  <div>
                    <div className="text-sm font-medium text-slate-200">{rs.nameKo}</div>
                    <div className="text-[11px] font-mono text-slate-500">{rs.ticker}</div>
                  </div>
                  {rsRt ? (
                    <div className="text-right">
                      <div className="text-sm font-mono text-slate-100">
                        {rs.exchange === 'KRX' || rs.exchange === 'KOSDAQ'
                          ? `${rsRt.currentPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}원`
                          : `$${rsRt.currentPrice.toFixed(2)}`}
                      </div>
                      <div className="text-xs font-mono" style={{ color: rsIsUp ? UP_RED : DOWN_BLUE }}>
                        {fmtPct(rsRt.changePercent)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">수신 중...</span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
