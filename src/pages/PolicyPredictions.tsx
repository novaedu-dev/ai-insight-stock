import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Target,
  Layers,
  ChevronRight,
  TrendingUp,
  Shield,
  Lightbulb,
} from 'lucide-react';
import { usePolicyPredictions } from '@/api/stockApi';

const CARD_BG = 'rgba(15,23,42,0.6)';
const CARD_BORDER = 'rgba(51,65,85,0.4)';

const IMPACT_CONFIG = {
  high: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', label: '높음', icon: Target },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: '중간', icon: Shield },
  low: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', label: '낮음', icon: Shield },
};

const THEME_ROUTE_MAP: Record<string, string> = {
  power: '/themes',
  robotics: '/themes',
  quantum: '/themes',
  bio: '/themes',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export function PolicyPredictions() {
  const navigate = useNavigate();
  const { predictions, loading } = usePolicyPredictions();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  /* Group by year */
  const yearGroups = predictions.reduce<Record<number, typeof predictions>>((acc, p) => {
    if (!acc[p.year]) acc[p.year] = [];
    acc[p.year].push(p);
    return acc;
  }, {});

  const years = Object.keys(yearGroups).map(Number).sort((a, b) => a - b);
  const displayYears = selectedYear ? [selectedYear] : years;

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
          <BookOpen size={20} className="text-indigo-400" />
          <h1 className="text-xl font-bold text-slate-100">정부정책 테마 예측</h1>
        </div>
        <p className="text-sm text-slate-400">
          연도별 정부정책 발표와 관련 메가테마 종목을 미리 분석합니다. 예상 시행 시점과 영향도를 확인하세요.
        </p>
      </motion.div>

      {/* Year Filter */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedYear(null)}
          className="text-xs px-4 py-2 rounded-lg transition-all duration-200 font-medium"
          style={{
            backgroundColor: selectedYear === null ? 'rgba(99,102,241,0.15)' : CARD_BG,
            color: selectedYear === null ? '#818cf8' : '#64748b',
            border: selectedYear === null ? '1px solid rgba(99,102,241,0.3)' : `1px solid ${CARD_BORDER}`,
          }}
        >
          전체
        </button>
        {years.map((year) => (
          <button
            key={year}
            onClick={() => setSelectedYear(year === selectedYear ? null : year)}
            className="text-xs px-4 py-2 rounded-lg transition-all duration-200 font-medium"
            style={{
              backgroundColor: selectedYear === year ? 'rgba(99,102,241,0.15)' : CARD_BG,
              color: selectedYear === year ? '#818cf8' : '#64748b',
              border: selectedYear === year ? '1px solid rgba(99,102,241,0.3)' : `1px solid ${CARD_BORDER}`,
            }}
          >
            {year}년
          </button>
        ))}
      </motion.div>

      {/* Loading */}
      {loading && predictions.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-16 text-slate-500 text-sm">
          정책 데이터 로드 중...
        </motion.div>
      )}

      {/* Empty */}
      {!loading && predictions.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl p-8 text-center"
          style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
        >
          <Lightbulb size={28} className="text-slate-500 mx-auto mb-3" />
          <div className="text-sm text-slate-400 mb-2">정책 예측 데이터가 준비 중입니다.</div>
          <div className="text-xs text-slate-500">서버 API 연동 후 자동으로 표시됩니다.</div>
        </motion.div>
      )}

      {/* Timeline */}
      {displayYears.map((year) => (
        <motion.section key={year} variants={itemVariants} className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={16} className="text-indigo-400" />
            <h2 className="text-base font-bold text-slate-100">{year}년</h2>
            <span className="text-xs text-slate-500">({yearGroups[year]?.length || 0}개 정책)</span>
          </div>

          <div className="relative pl-6">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-0 bottom-0 w-[2px] rounded-full" style={{ backgroundColor: 'rgba(99,102,241,0.2)' }} />

            <div className="space-y-3">
              {(yearGroups[year] || []).map((policy) => {
                const impactCfg = IMPACT_CONFIG[policy.impact] || IMPACT_CONFIG.medium;
                const ImpactIcon = impactCfg.icon;
                const themeRoute = THEME_ROUTE_MAP[policy.themeKey] || '/themes';

                return (
                  <motion.div
                    key={policy.id}
                    variants={itemVariants}
                    className="relative rounded-xl p-4 lg:p-5"
                    style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}`, backdropFilter: 'blur(8px)' }}
                  >
                    {/* Timeline dot */}
                    <div
                      className="absolute left-[-21px] top-5 w-3 h-3 rounded-full border-2"
                      style={{ borderColor: impactCfg.color, backgroundColor: '#0f172a' }}
                    />

                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div className="flex-1">
                        {/* Title row */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-sm font-bold text-slate-100">{policy.policyName}</h3>
                          <span
                            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded"
                            style={{ backgroundColor: impactCfg.bg, color: impactCfg.color }}
                          >
                            <ImpactIcon size={10} />
                            영향도 {impactCfg.label}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-400 mb-3 leading-relaxed">{policy.description}</p>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Calendar size={11} />
                            예상 시행: {policy.expectedImplementation}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Layers size={11} />
                            테마: {policy.theme}
                          </span>
                        </div>

                        {/* Related stocks */}
                        {policy.relatedStocks.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] text-slate-500 mr-1">관련종목:</span>
                            {policy.relatedStocks.map((ticker) => (
                              <button
                                key={ticker}
                                onClick={() => navigate(`/stock/${encodeURIComponent(ticker)}`)}
                                className="text-[11px] font-mono px-2 py-0.5 rounded transition-colors hover:bg-slate-700/50"
                                style={{ backgroundColor: 'rgba(51,65,85,0.3)', color: '#94a3b8' }}
                              >
                                {ticker}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => navigate(themeRoute)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all duration-200 hover:opacity-90 whitespace-nowrap"
                        style={{ backgroundColor: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}
                      >
                        이 테마의 종목 보기
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.section>
      ))}
    </motion.div>
  );
}
