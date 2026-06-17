import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Target,
  Layers,
  ChevronRight,
  Shield,
  Lightbulb,
} from 'lucide-react';

const CARD_BG = 'rgba(15,23,42,0.6)';
const CARD_BORDER = 'rgba(51,65,85,0.4)';

// 하드코딩 정부정책 데이터 (API 호출 없이 즉시 표시)
const POLICY_PREDICTIONS = [
  {
    year: 2025,
    theme: 'K-반도체 특화단지',
    impact: 'high' as const,
    policies: [
      '용인 반도체 클러스터 622조 투자',
      '반도체 특별법 통과 → 파운드리 R&D 세액공제 25%',
      'K-Chips Act 상반기 통과 예고',
    ],
    beneficiaries: ['케이엔솔', '서진시스템', 'HD현대일렉트릭'],
    tickers: ['053080', '178320', '267260'],
    analysis: '액침냉각 및 반도체 인프라 수요 폭증. 케이엔솔이 직접 수혜, 서진시스템은 ESS+반도체 장비로 간접 수혜.',
  },
  {
    year: 2025,
    theme: 'AI 데이터센터 전력 인프라',
    impact: 'high' as const,
    policies: [
      'AI 데이터센터 전력인프라 확충',
      '재생에너지 3020 정책',
      'ESS 의무설치 확대',
    ],
    beneficiaries: ['HD현대일렉트릭', 'GST', '서진시스템'],
    tickers: ['267260', '083450', '178320'],
    analysis: '초고압 변압기 및 ESS 수요 급증. HD현대일렉트릭이 대장주, GST는 전력변환기로 수혜.',
  },
  {
    year: 2026,
    theme: 'K-로봇·모빌리티',
    impact: 'high' as const,
    policies: [
      '로봇 종합발전계획 → R&D 2조 투자',
      '자율주행 L4 상용화 로드맵',
      'K-모빌리티 수출 확대 정책',
    ],
    beneficiaries: ['현대차', '레인보우로보틱스'],
    tickers: ['005380', '277810'],
    analysis: '현대차는 자율주행+로보틱스 융합으로 대장주. 레인보우로보틱스는 협동로봇+방위로 직접 수혜.',
  },
  {
    year: 2026,
    theme: 'K-퀀텀 얼라이스',
    impact: 'medium' as const,
    policies: [
      '양자컴퓨팅 5개년 R&D 1조 투자',
      '양자암호통신 상용화',
      '국방 양통신망 구축',
    ],
    beneficiaries: ['SK텔레콤', 'IBM', '아이온큐'],
    tickers: ['017670', 'IBM', 'IONQ'],
    analysis: 'SK텔레콤은 양자암호통신 상용화로 직접 수혜. IBM과 아이온큐는 양자컴퓨팅 인프라로 수혜.',
  },
  {
    year: 2027,
    theme: 'K-바이오 글로벌 확장',
    impact: 'high' as const,
    policies: [
      '바이오 수출 200억달러 목표',
      '비만치료제 건강보험 급여 검토',
      'CDMO 클러스터 2개 추가',
    ],
    beneficiaries: ['삼성바이오로직스', '일라이릴리', '노볼노디스크'],
    tickers: ['207940', 'LLY', 'NVO'],
    analysis: '삼성바이오로직스는 CDMO 대장주로 수출 확대 직접 수혜. 비만치료제 종목들도 급여 확대로 수혜.',
  },
  {
    year: 2027,
    theme: '그린에너지 전환',
    impact: 'medium' as const,
    policies: [
      '태양광 ESS 의무설치 상업용 확대',
      '그린뉴드얼 2.0',
      '수소경제 활성화',
    ],
    beneficiaries: ['GST', 'HD현대일렉트릭', '현대차'],
    tickers: ['083450', '267260', '005380'],
    analysis: 'GST와 HD현대일렉트릭은 ESS/전력 인프라로 수혜. 현대차는 수소차 사업으로 장기 수혜.',
  },
];

const IMPACT_CONFIG = {
  high: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', label: '높음', icon: Target },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: '중간', icon: Shield },
  low: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', label: '낮음', icon: Shield },
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
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const predictions = POLICY_PREDICTIONS;

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
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium ml-2">
            6개 테마
          </span>
        </div>
        <p className="text-sm text-slate-400">
          연도별 정부정책 발표와 관련 메가테마 종목을 미리 분석합니다. 예상 시행 시점과 영향도를 확인하세요.
        </p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl p-4" style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <p className="text-2xl font-bold text-slate-100 font-mono">{predictions.length}</p>
          <p className="text-xs text-slate-400 mt-1">정책 테마</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{predictions.filter(p => p.impact === 'high').length}</p>
          <p className="text-xs text-slate-400 mt-1">고영향</p>
        </div>
        <div className="rounded-xl p-4" style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
          <p className="text-2xl font-bold text-indigo-400 font-mono">
            {[...new Set(predictions.flatMap(p => p.beneficiaries))].length}
          </p>
          <p className="text-xs text-slate-400 mt-1">수혜 종목</p>
        </div>
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

      {/* Policy Cards */}
      {displayYears.map((year) => (
        <div key={year} className="mb-6">
          <motion.div variants={itemVariants} className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-100">{year}년</h2>
            <span className="text-xs text-slate-500">({yearGroups[year].length}개 테마)</span>
          </motion.div>

          <div className="space-y-3">
            {yearGroups[year].map((prediction, idx) => {
              const impact = IMPACT_CONFIG[prediction.impact];
              const ImpactIcon = impact.icon;

              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="rounded-xl overflow-hidden"
                  style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
                >
                  {/* Theme Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Layers size={16} className="text-indigo-400" />
                        <h3 className="text-base font-bold text-slate-100">{prediction.theme}</h3>
                      </div>
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium"
                        style={{ backgroundColor: impact.bg, color: impact.color }}
                      >
                        <ImpactIcon size={10} />
                        {impact.label}
                      </div>
                    </div>

                    {/* Analysis */}
                    <p className="text-sm text-slate-300 mb-3 leading-relaxed">{prediction.analysis}</p>

                    {/* Policies */}
                    <div className="mb-3">
                      <p className="text-xs text-slate-500 mb-2 font-medium">핵심 정책</p>
                      <div className="space-y-1">
                        {prediction.policies.map((policy, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2">
                            <Lightbulb size={12} className="text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-slate-400">{policy}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Beneficiaries */}
                    <div>
                      <p className="text-xs text-slate-500 mb-2 font-medium">수혜 종목</p>
                      <div className="flex flex-wrap gap-2">
                        {prediction.beneficiaries.map((name, bIdx) => (
                          <button
                            key={bIdx}
                            onClick={() => navigate(`/stock/${prediction.tickers[bIdx]}`)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
                            style={{
                              backgroundColor: 'rgba(16,185,129,0.1)',
                              color: '#10b981',
                              border: '1px solid rgba(16,185,129,0.3)',
                            }}
                          >
                            {name}
                            <ChevronRight size={12} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </motion.div>
  );
}
