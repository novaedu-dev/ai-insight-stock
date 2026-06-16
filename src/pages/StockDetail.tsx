import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Zap,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useT } from '@/i18n';
import { useStockStore } from '@/store/stockStore';
import { useLanguageStore } from '@/store/languageStore';
// Types used via inference from store hooks
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
} from 'recharts';
import { StockPriceCard } from '@/components/StockPriceCard';

/* ─── mock chart data generator ─── */
function generateChartData(
  basePrice: number,
  points: number,
  volatility: number,
  trend: number,
) {
  const data: { date: string; price: number; target?: number }[] = [];
  let price = basePrice * 0.85;
  const now = new Date();
  for (let i = 0; i < points; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (points - i));
    price =
      price +
      (Math.random() - 0.48) * volatility +
      trend * (basePrice / 1000);
    if (i === points - 1) price = basePrice;
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      price: Math.round(price * 100) / 100,
    });
  }
  return data;
}

/* ─── dividend data generator ─── */
function generateDividendData(yield_: number) {
  const quarters = ['2023 Q3', '2023 Q4', '2024 Q1', '2024 Q2', '2024 Q3', '2024 Q4', '2025 Q1', '2025 Q2'];
  const base = yield_ * 0.25;
  return quarters.map((q) => ({
    quarter: q,
    amount: Math.round((base + (Math.random() - 0.5) * base * 0.2) * 100) / 100,
  }));
}

/* ─── stock-specific analyst content ─── */
const analystContent: Record<
  string,
  {
    entry: string[];
    upside: string[];
    exitRisk: string[];
    entryBadge: string;
    catalystBadge: string;
    riskBadge: string;
  }
> = {
  KEnSol: {
    entry: [
      '현재가 ₩33,200은 목표가 대비 35% 상방으로 유리한 수익/위험 비율을 제공합니다.',
      '20일 이동평균선(₩31,500) 이하 하락 시 분할 매수하세요.',
      '이상적인 진입 구간: ₩30,000–32,000대.',
      '목표 배분의 30%로 초기 포지션 설정 후 확인 시 추가 매수.',
    ],
    upside: [
      '주요 하이퍼스케일러 데이터센터 캐펙스 발표(엔비디아, MSFT, 구글).',
      '정부 AI 인프라 자극 패키지.',
      '냉각 시스템 수주로 견인된 2분기 실적 서프라이즈.',
      '액침냉각 분야 전략적 제휴 또는 M&A.',
    ],
    exitRisk: [
      '₩42,000(목표 인근) — 50% 비중 조절, 나머지는 8% 트레일링 스탑.',
      '₩28,500(진입가 대비 14% 하단) — 하드 스탑.',
      '중국 냉각 제조업체의 국내 시장 진출로 인한 경쟁.',
      '2026년 데이터센터 캐펙스 사이클 하락.',
      '원재료(불화 액체) 가격 급등.',
    ],
    entryBadge: '추천: 2025년 2분기 분할 매수',
    catalystBadge: '다음 촉매제: 2분기 실적(7월)',
    riskBadge: '리스크 수준: 중간',
  },
  GST: {
    entry: [
      '현재가 ₩29,700은 52주 중간 범위이며 매력적인 진입 포인트입니다.',
      '28,000원 이하 분할 매수 전략 추천.',
      '이동평균선 돌파 확인 후 추가 매수.',
      '초기 포지션 25% 배분 후 실적 확인 시 증액.',
    ],
    upside: [
      '데이터센터 전력변환기 대형 수주 기대.',
      '해외(동남아·중동) 시장 진출 확대.',
      'AI 데이터센터 증설로 인한 수요 급증.',
      'ESS 연계 사업 모델 다각화.',
    ],
    exitRisk: [
      '₩38,000(목표 인근) — 절반 비중 매도 후 나머지 트레일링.',
      '₩25,000(하드 스탑) — 손절 라인.',
      '경쟁사 가격 압박으로 인한 마진 하락.',
      '수주 공백 발생 시 주가 조정 가능.',
      '소형주 변동성 리스크.',
    ],
    entryBadge: '추천: 29,000원 이하 분할 매수',
    catalystBadge: '다음 촉매제: 대형 수주 발표',
    riskBadge: '리스크 수준: 중간~높음',
  },
  '267260.KS': {
    entry: [
      '현재가 ₩344,500은 대형주 안정성과 성장성을 동시에 제공합니다.',
      '340,000원대 분할 매수 추천.',
      '1차 지지선 ₩310,000 — 이탈 시 추가 하락 가능.',
      '월배당 커버드 콜 전략 병행 가능.',
    ],
    upside: [
      '미국 초고압 변압기 수출 확대 지속.',
      '초고압 제품 라인업 확대로 고마진 유지.',
      '미국 인프라 투자 확대 수혜.',
      'REPowerEU 정책 수혜.',
    ],
    exitRisk: [
      '₩400,000(목표) — 절반 비중 매도.',
      '₩295,000(하드 스탑) — 원/달러 환율 급등 대비.',
      '원/달러 환율 상승(1,350원 이상) 시 수익성 악화.',
      '미국 보호무역 정책 강화.',
      '대형주 저성장 우려.',
    ],
    entryBadge: '추천: 340,000원 이하 분할 매수',
    catalystBadge: '다음 촉매제: 미국 수출 실적(분기)',
    riskBadge: '리스크 수준: 중간',
  },
  '208050.KS': {
    entry: [
      '현재가 ₩44,300은 액침냉각 테마 대표 소형주입니다.',
      '43,000원대 분할 매수 시작.',
      '1차 지지선 ₩38,000 — 기술적 지지 확인.',
      '소형주 특성상 20% 이하 비중으로 관리.',
    ],
    upside: [
      '액침냉각 특허 승인 및 상용화.',
      '데이터센터 탑재 계약 체결.',
      '정부 데이터센터 에너지 효율 정책 수혜.',
      'M&A 타겟 가능성.',
    ],
    exitRisk: [
      '₩58,000(목표) — 50% 익절.',
      '₩35,000(하드 스탑) — 소형주 변동성 대비.',
      '소형주 변동성 — 일일 10% 이상 하락 가능.',
      '기술 검증 지연 시 주가 급락.',
      '대형사의 자체 기술 개발 경쟁.',
    ],
    entryBadge: '추천: 43,000원 이하 분할 매수',
    catalystBadge: '다음 촉매제: 특허/계약 발표',
    riskBadge: '리스크 수준: 높음',
  },
  '005380.KS': {
    entry: [
      '현재가 ₩271,000은 대형 자동차주 안정적 구간입니다.',
      '270,000원대 분할 매수 추천.',
      '1차 지지선 ₩250,000 — 강력한 지지대.',
      '배당(2.1%) + 성장 동시에 누릴 수 있는 우량주.',
    ],
    upside: [
      '자율주행 상용화 가속화(Robotaxi).',
      '보스턴다이나이믹스 시너지 가시화.',
      '전기차 판매 호조 지속.',
      '주주환원 정책 확대 기대.',
    ],
    exitRisk: [
      '₩310,000(목표) — 절반 익절.',
      '₩235,000(하드 스탑) — 글로벌 리세션 대비.',
      '글로벌 자동차 판매 부진.',
      '환율 리스크(원화 강세).',
      '미국 관세 정책 불확실성.',
    ],
    entryBadge: '추천: 270,000원 이하 분할 매수',
    catalystBadge: '다음 촉매제: 자율주행 로드맵 발표',
    riskBadge: '리스크 수준: 낮음~중간',
  },
  RBOT: {
    entry: [
      '현재가 ₩58,600은 방위·로봇 테마 대표주입니다.',
      '57,000원대 분할 매수 시작.',
      '1차 지지선 ₩50,000 — 기술적 지지 확인 후 추가.',
      '소형주로 20% 이하 비중 관리 필수.',
    ],
    upside: [
      '방위로봇 대형 수주(군 납품).',
      '협동로봇 해외 수출 확대.',
      '삼성·현대차 그룹 로봇 투자 확대 수혜.',
      'K-방위 산업 수출 호조.',
    ],
    exitRisk: [
      '₩78,000(목표) — 50% 익절 후 트레일링.',
      '₩45,000(하드 스탑) — 소형주 변동성 대비.',
      '소형주 변동성 리스크.',
      '수주 불확실성 — 실적 변동 가능.',
      '글로벌 방위비 축소 우려.',
    ],
    entryBadge: '추천: 55,000원 이하 분할 매수',
    catalystBadge: '다음 촉매제: 대형 수주 발표',
    riskBadge: '리스크 수준: 높음',
  },
  QCOM: {
    entry: [
      '현재가 $198.5는 AI 반도체 수혜 대표주입니다.',
      '$195 분할 매수 추천.',
      '1차 지지선 $180 — 강력한 지지대.',
      '배당(1.8%) 수익률까지 고려 시 매력적.',
    ],
    upside: [
      'AI PC 칩 탑재 확대(스냅드래곤 X Elite).',
      '스마트폰 AI 기능 수요 급증.',
      '자동차 반도체 수요 지속.',
      'IoT·XR 시장 성장 동반.',
    ],
    exitRisk: [
      '$230(목표) — 절반 익절.',
      '$170(하드 스탑) — 반도체 사이클 하락 대비.',
      '반도체 사이클 둔화.',
      '중국 수요 감소 리스크.',
      '애플 자체 모뎀 개발 완료 시 타격.',
    ],
    entryBadge: '추천: $195 이하 분할 매수',
    catalystBadge: '다음 촉매제: AI PC 출하량 데이터',
    riskBadge: '리스크 수준: 중간',
  },
  IBM: {
    entry: [
      '현재가 $228.4는 양자컴퓨팅 + 배당 3.2% 우량주입니다.',
      '$225 분할 매수 추천.',
      '1차 지지선 $210 — 안정적 매수 구간.',
      '월배당 커버드콜 전략 병행으로 추가 수익 가능.',
    ],
    upside: [
      '양자컴퓨팅 상용화 로드맵 발표(2029년 목표).',
      '큐러스(Cuorus) 수요 급증.',
      'AI 클라우드(Watsonx) 매출 확대.',
      '레드햇 하이브리드 클라우드 성장.',
    ],
    exitRisk: [
      '$255(목표) — 절반 익절.',
      '$195(하드 스탑) — 양자 사업 지연 대비.',
      '매출 성장 둔화 우려.',
      '양자 사업 적자 지속 가능성.',
      '큐러스 기술적 실패 리스크.',
    ],
    entryBadge: '추천: $225 이하 분할 매수',
    catalystBadge: '다음 촉매제: 양자 상용화 로드맵 업데이트',
    riskBadge: '리스크 수준: 낮음~중간',
  },
  IONQ: {
    entry: [
      '현재가 $32.5는 순수 양자 플레이 성장주입니다.',
      '$31 분할 매수 시작.',
      '1차 지지선 $26 — 기술적 지지 확인.',
      '고위험 고수익 — 포트폴리오 10% 이하 관리.',
    ],
    upside: [
      '양자 우위(Quantum Supremacy) 달성.',
      '큰손 계약(정부·군·금융) 체결.',
      '양자 알고리즘 상용화 돌파.',
      '전략적 인수(M&A)로 기술 확보.',
    ],
    exitRisk: [
      '$48(목표1) — 50% 익절.',
      '$24(하드 스탑) — 기술적 실패 대비.',
      '기술적 실패 — 양자 비트 안정성 문제.',
      '현금 소진 우려 — 지속적 투자 필요.',
      'IBM·구글 등 거대 기업 경쟁.',
    ],
    entryBadge: '추천: $31 이하 분할 매수',
    catalystBadge: '다음 촉매제: 양자 계약 발표',
    riskBadge: '리스크 수준: 매우 높음',
  },
  '017670.KS': {
    entry: [
      '현재가 ₩52,300은 배당(4.1%) + 양자 성장 기대주입니다.',
      '51,000원대 분할 매수 추천.',
      '1차 지지선 ₩48,000 — 배당 매수세로 강력한 지지.',
      '고배당 + 성장 동시에 누릴 수 있는 희소 종목.',
    ],
    upside: [
      '양자암호통신 상용화 가속화.',
      'AI 데이터센터 투자 확대(ADT캐피탈).',
      '5G·6G 네트워크 수요 지속.',
      '주주환원 정책 확대 기대.',
    ],
    exitRisk: [
      '₩60,000(목표) — 절반 익절.',
      '₩44,000(하드 스탑) — 배당 매수세 이탈 대비.',
      '이통업 규제 강화.',
      '양자 사업 수익화 지연.',
      'AI 투자 비용 부담.',
    ],
    entryBadge: '추천: 51,000원 이하 분할 매수',
    catalystBadge: '다음 촉매제: 양자암호통신 실적(분기)',
    riskBadge: '리스크 수준: 낮음~중간',
  },
  LLY: {
    entry: [
      '현재가 $842.3은 비만치료제 대형 제약 대표주입니다.',
      '$835 분할 매수 추천.',
      '1차 지지선 $780 — 강력한 지지대.',
      '장기 보유 전략에 최적화된 우량주.',
    ],
    upside: [
      '비만치료제(Mounjaro·Zepbound) 매출 급증.',
      '신약 파이프라인(FDA 승인 임박).',
      '글로벌 비만 시장 확대.',
      'CDMO·생산 캐파 확대.',
    ],
    exitRisk: [
      '$980(목표) — 절반 익절.',
      '$750(하드 스탑) — FDA 이슈 대비.',
      'FDA 승인 지연.',
      '가격 규제 압력(미국·유럽).',
      '경쟁사(노본디스크) 추격.',
    ],
    entryBadge: '추천: $835 이하 분할 매수',
    catalystBadge: '다음 촉매제: FDA 승인/분기 실적',
    riskBadge: '리스크 수준: 중간',
  },
  NVO: {
    entry: [
      '현재가 $68.4는 비만치료제(위고비) 수혜주입니다.',
      '$67 분할 매수 추천.',
      '1차 지지선 $60 — 기술적 지지 확인.',
      '배당(1.9%) + 성장 동시에 누릴 수 있는 가치주.',
    ],
    upside: [
      '위고비 매출 확대 지속.',
      'CagriSema FDA 승인 임박.',
      '글로벌 비만 시장 선점.',
      '주주환원 정책 확대.',
    ],
    exitRisk: [
      '$82(목표) — 절반 익절.',
      '$56(하드 스탑) — 규제 리스크 대비.',
      '유럽·미국 가격 규제 강화.',
      '미국 의회 약가 인하 압박.',
      'LLY와의 경쟁 심화.',
    ],
    entryBadge: '추천: $67 이하 분할 매수',
    catalystBadge: '다음 촉매제: CagriSema FDA 승인',
    riskBadge: '리스크 수준: 중간',
  },
  '207940.KS': {
    entry: [
      '현재가 ₩789,000은 CDMO 글로벌 1위 대형주입니다.',
      '780,000원대 분할 매수 추천.',
      '1차 지지선 ₩720,000 — 강력한 지지대.',
      '장기 보유 전략에 최적화된 대형 바이오주.',
    ],
    upside: [
      '대형 CDMO 계약 추가 체결.',
      '5공장 가동으로 캐파 확대.',
      '글로벌 바이오 의약품 수요 지속.',
      'FDA Complete Response Letter 해결.',
    ],
    exitRisk: [
      '₩880,000(목표) — 절반 익절.',
      '₩680,000(하드 스탑) — FDA 이슈 대비.',
      'FDA 제재·감사 이슈.',
      '원/달러 환율 하락.',
      '글로벌 경기 둔화로 의약품 수요 감소.',
    ],
    entryBadge: '추천: 780,000원 이하 분할 매수',
    catalystBadge: '다음 촉매제: 대형 계약 발표',
    riskBadge: '리스크 수준: 중간',
  },
};

const fallbackAnalyst = {
  entry: [
    '현재가는 목표가 대비 유리한 수익/위험 비율을 제공합니다.',
    '분할 매수 전략으로 진입하세요.',
    '이동평균선 돌파 확인 후 추가 매수.',
    '초기 포지션 30% 배분 후 확인 시 증액.',
  ],
  upside: [
    '업종 특화 촉매제 확인 중입니다.',
    '실적 개선 기대.',
    '시장 점유율 확대.',
    '신규 사업 확장.',
  ],
  exitRisk: [
    '목표가 도달 시 절반 익절 후 트레일링 스탑.',
    '하드 스탑 설정 필수.',
    '시장 변동성 리스크.',
    '경쟁 심화 우려.',
    '원재료 가격 변동성.',
  ],
  entryBadge: '추천: 분할 매수',
  catalystBadge: '다음 촉매제: 실적 발표',
  riskBadge: '리스크 수준: 중간',
};

/* ─── animation variants ─── */
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
};

const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  },
};

/* ─── format helpers ─── */
function formatPrice(price: number, exchange: string) {
  if (exchange === 'KRX') return `₩${price.toLocaleString('ko-KR')}`;
  return `$${price.toFixed(2)}`;
}

function formatMarketCap(price: number, exchange: string) {
  if (exchange === 'KRX') {
    const cap = Math.round((price * 25000000) / 100000000);
    return `₩${cap >= 10000 ? (cap / 10000).toFixed(1) + '조' : cap + '억'}`;
  }
  const cap = Math.round((price * 900000000) / 1000000000);
  return `$${cap}B`;
}

/* ─── main component ─── */
export function StockDetail() {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const { t } = useT();
  const lang = useLanguageStore((s) => s.lang);
  const { getStockByTicker, stocks } = useStockStore();
  const [chartPeriod, setChartPeriod] = useState('6M');
  const stock = useMemo(() => getStockByTicker(ticker || ''), [ticker, getStockByTicker]);

  const analyst = useMemo(
    () => (ticker && analystContent[ticker]) || fallbackAnalyst,
    [ticker],
  );

  /* Chart data */
  const chartData = useMemo(() => {
    if (!stock) return [];
    const periods: Record<string, number> = { '1D': 30, '1W': 50, '1M': 60, '3M': 90, '6M': 180, '1Y': 365, All: 730 };
    return generateChartData(stock.currentPrice, periods[chartPeriod] || 180, stock.currentPrice * 0.02, 0.05);
  }, [stock, chartPeriod]);

  /* Dividend data */
  const dividendData = useMemo(() => {
    if (!stock?.dividendYield) return [];
    return generateDividendData(stock.dividendYield);
  }, [stock]);

  /* Related stocks */
  const relatedStocks = useMemo(() => {
    if (!stock) return [];
    return stocks.filter((s) => s.theme === stock.theme && s.ticker !== stock.ticker).slice(0, 4);
  }, [stock, stocks]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [ticker]);

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <img src="/empty-state-search.svg" alt="" className="w-48 h-auto mb-6 opacity-50" />
        <h2 className="text-xl font-bold text-[#f1f5f9] mb-2">{ticker}</h2>
        <p className="text-sm text-[#94a3b8] text-center">
          {lang === 'KO' ? '종목을 찾을 수 없습니다.' : 'Stock not found.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid #06b6d4',
            color: '#06b6d4',
          }}
        >
          <ArrowLeft size={16} />
          {lang === 'KO' ? '대시보드로 돌아가기' : 'Back to Dashboard'}
        </button>
      </div>
    );
  }

  const priceChange = stock.currentPrice - stock.previousClose;
  const priceChangePercent = (priceChange / stock.previousClose) * 100;
  const isUp = priceChange >= 0;
  const themeLabel = useStockStore.getState().themes.find((th) => th.key === stock.theme);

  const periods = ['1D', '1W', '1M', '3M', '6M', '1Y', 'All'];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 lg:px-8">
      {/* ─── Section 1: Stock Hero Header ─── */}
      <div className="py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          {/* Left Column */}
          <motion.div
            className="lg:col-span-3"
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
          >
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 mb-3 text-[11px] text-[#64748b]">
              <button onClick={() => navigate('/')} className="hover:text-[#94a3b8] transition-colors">
                Dashboard
              </button>
              <span>/</span>
              <button onClick={() => navigate('/themes')} className="hover:text-[#94a3b8] transition-colors">
                Themes
              </button>
              <span>/</span>
              <span className="text-[#94a3b8]">{themeLabel?.titleEn}</span>
              <span>/</span>
              <span className="text-[#f1f5f9] font-medium">{stock.ticker}</span>
            </div>

            {/* Company Name */}
            <h1 className="text-2xl lg:text-[2rem] font-bold text-[#f1f5f9] tracking-tight leading-tight">
              {lang === 'KO' ? stock.nameKo : stock.nameEn}
            </h1>

            {/* Ticker Row */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="font-mono text-sm font-semibold uppercase text-[#64748b]">
                {stock.ticker}
              </span>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}
              >
                {stock.exchange}
              </span>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}
              >
                {lang === 'KO' ? themeLabel?.titleKo : themeLabel?.titleEn}
              </span>
              {stock.isBeginnerFriendly && (
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981' }}
                >
                  {t('stocks.beginnerFriendly')}
                </span>
              )}
            </div>

            {/* Price Display */}
            <div className="mt-5">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="font-mono text-[28px] font-bold text-[#f1f5f9] leading-none">
                  {formatPrice(stock.currentPrice, stock.exchange)}
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center gap-1 font-mono text-base font-semibold"
                    style={{ color: isUp ? '#10b981' : '#f43f5e' }}
                  >
                    {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {isUp ? '+' : ''}
                    {formatPrice(Math.abs(priceChange), stock.exchange)}
                  </span>
                  <span
                    className="font-mono text-sm font-medium px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: isUp ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
                      color: isUp ? '#10b981' : '#f43f5e',
                    }}
                  >
                    {isUp ? '+' : ''}
                    {priceChangePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              <p className="mt-1 text-xs text-[#64748b] font-mono">
                {lang === 'KO' ? '전일종가' : 'Prev Close'}: {formatPrice(stock.previousClose, stock.exchange)}
              </p>
            </div>

            {/* Market Cap & Tags Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
              <div>
                <span className="text-[11px] text-[#64748b] uppercase tracking-wider">
                  {lang === 'KO' ? '시가총액' : 'Market Cap'}
                </span>
                <p className="font-mono text-sm text-[#f1f5f9] mt-0.5">
                  {formatMarketCap(stock.currentPrice, stock.exchange)}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#64748b] uppercase tracking-wider">
                  52{lang === 'KO' ? '주 최고' : 'W High'}
                </span>
                <p className="font-mono text-sm text-[#10b981] mt-0.5">
                  {formatPrice(Math.round(stock.currentPrice * 1.18), stock.exchange)}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#64748b] uppercase tracking-wider">
                  52{lang === 'KO' ? '주 최저' : 'W Low'}
                </span>
                <p className="font-mono text-sm text-[#f43f5e] mt-0.5">
                  {formatPrice(Math.round(stock.currentPrice * 0.72), stock.exchange)}
                </p>
              </div>
              {stock.dividendYield ? (
                <div>
                  <span className="text-[11px] text-[#64748b] uppercase tracking-wider">
                    {lang === 'KO' ? '배당률' : 'Div Yield'}
                  </span>
                  <p className="font-mono text-sm text-[#6366f1] mt-0.5">{stock.dividendYield}%</p>
                </div>
              ) : null}
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {stock.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column — Quick Stats Card */}
          <motion.div
            className="lg:col-span-2"
            variants={slideInRight}
            initial="hidden"
            animate="visible"
          >
            <div
              className="rounded-xl p-5"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(51, 65, 85, 0.4)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">
                {lang === 'KO' ? '핵심 지표' : 'Key Stats'}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '목표가' : 'Target'}</span>
                  <p className="font-mono text-sm font-semibold text-[#06b6d4] mt-0.5">
                    {formatPrice(stock.targetPrice, stock.exchange)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '기대수익률' : 'Exp. Return'}</span>
                  <p className="font-mono text-sm font-semibold text-[#10b981] mt-0.5">
                    +{stock.expectedReturn}%
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '애널리스트 등급' : 'Rating'}</span>
                  <p className="font-mono text-sm font-semibold text-[#10b981] mt-0.5">
                    {lang === 'KO' ? '매수' : 'Buy'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '리스크' : 'Risk'}</span>
                  <p className="font-mono text-sm font-semibold text-[#f59e0b] mt-0.5">
                    {stock.isBeginnerFriendly
                      ? lang === 'KO' ? '낮음~중간' : 'Low-Med'
                      : lang === 'KO' ? '중간' : 'Moderate'}
                  </p>
                </div>
              </div>

              {stock.dividendYield ? (
                <div
                  className="mt-4 pt-4"
                  style={{ borderTop: '1px solid #1e293b' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '배당수익률' : 'Div Yield'}</span>
                    <span className="font-mono text-sm font-semibold text-[#6366f1]">{stock.dividendYield}%</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#6366f1' }}
                    >
                      {t('stocks.highDividend')}
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  className="mt-4 pt-4"
                  style={{ borderTop: '1px solid #1e293b' }}
                >
                  <span className="text-[10px] text-[#64748b]">
                    {lang === 'KO' ? '배당 없음 · 성장 중심 기업' : 'No dividend · Growth focused'}
                  </span>
                  <span
                    className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{ backgroundColor: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}
                  >
                    {t('stocks.growth')}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Section 2: Analyst Deep Dive (Three-Block) ─── */}
      <div className="py-6 lg:py-8">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl lg:text-2xl font-bold text-[#f1f5f9]">
            {lang === 'KO' ? '애널리스트 관점' : 'Analyst Perspective'}
          </h2>
          <span
            className="text-[11px] font-semibold px-3 py-1 rounded-full"
            style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#6366f1' }}
          >
            {lang === 'KO' ? '심층' : 'Deep Dive'}
          </span>
        </div>

        {/* Three Blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Block 1: Entry Strategy */}
          <motion.div
            className="relative rounded-2xl p-5 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0f172a 0%, rgba(16,185,129,0.03) 100%)',
              border: '1px solid #334155',
              borderTop: '2px solid #10b981',
            }}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={0}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}
              >
                <TrendingUp size={20} style={{ color: '#10b981' }} />
              </div>
              <h3 className="text-base font-semibold text-[#f1f5f9]">
                {lang === 'KO' ? '진입 전략' : 'Entry Strategy'}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {(lang === 'KO' ? analyst.entry : analyst.entry).map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#10b981' }}
                  />
                  <span className="text-sm text-[#94a3b8] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <span
                className="inline-block text-[11px] font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981' }}
              >
                {analyst.entryBadge}
              </span>
            </div>
          </motion.div>

          {/* Block 2: Upside Trigger */}
          <motion.div
            className="relative rounded-2xl p-5 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0f172a 0%, rgba(6,182,212,0.03) 100%)',
              border: '1px solid #334155',
              borderTop: '2px solid #06b6d4',
            }}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={1}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ backgroundColor: 'rgba(6,182,212,0.12)' }}
              >
                <Zap size={20} style={{ color: '#06b6d4' }} />
              </div>
              <h3 className="text-base font-semibold text-[#f1f5f9]">
                {lang === 'KO' ? '상승 트리거' : 'Upside Triggers'}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {analyst.upside.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#06b6d4' }}
                  />
                  <span className="text-sm text-[#94a3b8] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <span
                className="inline-block text-[11px] font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(6,182,212,0.12)', color: '#06b6d4' }}
              >
                {analyst.catalystBadge}
              </span>
            </div>
          </motion.div>

          {/* Block 3: Exit / Risk */}
          <motion.div
            className="relative rounded-2xl p-5 overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #0f172a 0%, rgba(244,63,94,0.03) 100%)',
              border: '1px solid #334155',
              borderTop: '2px solid #f43f5e',
            }}
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            custom={2}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="flex items-center justify-center w-9 h-9 rounded-lg"
                style={{ backgroundColor: 'rgba(244,63,94,0.12)' }}
              >
                <AlertTriangle size={20} style={{ color: '#f43f5e' }} />
              </div>
              <h3 className="text-base font-semibold text-[#f1f5f9]">
                {lang === 'KO' ? '매도 전략 및 리스크' : 'Exit Strategy & Risks'}
              </h3>
            </div>
            <ul className="space-y-2.5">
              {analyst.exitRisk.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: i < 2 ? '#f43f5e' : '#f59e0b' }}
                  />
                  <span className="text-sm text-[#94a3b8] leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <span
                className="inline-block text-[11px] font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
              >
                {analyst.riskBadge}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Section 3: Price Chart ─── */}
      <motion.div
        className="py-5"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      >
        <div
          className="rounded-2xl p-5"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid rgba(51, 65, 85, 0.4)',
          }}
        >
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-base font-semibold text-[#f1f5f9]">
              {lang === 'KO' ? '가격 추이' : 'Price History'}
            </h3>
            <div className="flex items-center gap-1">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: chartPeriod === p ? '#6366f1' : 'rgba(15, 23, 42, 0.6)',
                    color: chartPeriod === p ? '#ffffff' : '#94a3b8',
                    border: chartPeriod === p ? 'none' : '1px solid rgba(51, 65, 85, 0.4)',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts AreaChart */}
          <div className="w-full" style={{ height: 'clamp(280px, 35vw, 380px)' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#1e293b"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                  width={
                    stock.exchange === 'KRX' && stock.currentPrice > 10000 ? 70 : 55
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    backdropFilter: 'blur(8px)',
                  }}
                  labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                  formatter={(value: number) => [
                    formatPrice(value, stock.exchange),
                    lang === 'KO' ? '종가' : 'Close',
                  ]}
                />
                <ReferenceLine
                  y={stock.targetPrice}
                  stroke="#06b6d4"
                  strokeDasharray="6 3"
                  strokeWidth={1}
                  label={{
                    value: `${lang === 'KO' ? '목표' : 'Target'} ${formatPrice(stock.targetPrice, stock.exchange)}`,
                    fill: '#06b6d4',
                    fontSize: 10,
                    position: 'right',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#6366f1', stroke: '#020617', strokeWidth: 2 }}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6366f1' }} />
              <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '종가' : 'Price'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0 border-t border-dashed" style={{ borderColor: '#06b6d4' }} />
              <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '목표가' : 'Target'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Section 4: Dividend & Financials (Conditional) ─── */}
      {stock.dividendYield ? (
        <motion.div
          className="py-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="rounded-2xl p-5 lg:p-6"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.4)',
            }}
          >
            <div className="flex items-center gap-3 mb-5">
              <h3 className="text-base font-semibold text-[#f1f5f9]">
                {lang === 'KO' ? '배당 및 재무' : 'Dividend & Financials'}
              </h3>
              <span
                className="text-[11px] font-semibold px-3 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#6366f1' }}
              >
                {t('stocks.highDividend')}
              </span>
            </div>

            {/* Dividend Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
              <div>
                <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '배당수익률' : 'Div Yield'}</span>
                <p className="font-mono text-xl font-bold mt-1" style={{ color: '#10b981' }}>
                  {stock.dividendYield}%
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '연간 배당' : 'Annual Div'}</span>
                <p className="font-mono text-base font-semibold text-[#f1f5f9] mt-1">
                  {formatPrice(Math.round(stock.currentPrice * (stock.dividendYield / 100)), stock.exchange)}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '배당성향' : 'Payout Ratio'}</span>
                <p className="font-mono text-base font-semibold text-[#f1f5f9] mt-1">
                  {Math.min(60 + Math.round(stock.dividendYield * 8), 95)}%
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '배당월' : 'Div Month'}</span>
                <p className="font-mono text-sm text-[#94a3b8] mt-1">
                  {stock.exchange === 'KRX' ? (lang === 'KO' ? '분기' : 'Quarterly') : (lang === 'KO' ? '월배당' : 'Monthly')}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '배당성장(5Y)' : 'Div Growth(5Y)'}</span>
                <p className="font-mono text-sm text-[#10b981] mt-1">
                  +{(stock.dividendYield * 0.8).toFixed(1)}% CAGR
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[#64748b]">{lang === 'KO' ? '연속배당' : 'Consecutive'}</span>
                <p className="font-mono text-sm text-[#10b981] mt-1">
                  {stock.dividendYield > 3 ? '20+' : '10+'} {lang === 'KO' ? '년' : 'yrs'}
                </p>
              </div>
            </div>

            {/* Mini Dividend History Bar Chart */}
            <div className="mt-4" style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dividendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" strokeOpacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="quarter"
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                    formatter={(value: number) => [`${value}%`, lang === 'KO' ? '배당률' : 'Yield']}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Non-dividend stock message */
        <motion.div
          className="py-5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.4 }}
        >
          <div
            className="rounded-2xl p-6 text-center"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(51, 65, 85, 0.4)',
            }}
          >
            <TrendingUp size={24} className="mx-auto mb-2" style={{ color: '#06b6d4' }} />
            <p className="text-sm text-[#94a3b8]">
              {lang === 'KO'
                ? '해당 종목은 현재 배당을 지급하지 않습니다. 성장 중심 기업입니다.'
                : 'This stock does not currently pay dividends. Growth-focused.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* ─── Section 5: Related Stocks ─── */}
      {relatedStocks.length > 0 && (
        <motion.div
          className="py-6 lg:py-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-xl lg:text-2xl font-bold text-[#f1f5f9] mb-5">
            {lang === 'KO' ? '관련 종목' : 'Related Stocks'}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedStocks.map((s, i) => (
              <motion.div
                key={s.ticker}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
              >
                <StockPriceCard stock={s} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Section 6: Back to Themes CTA ─── */}
      <div className="flex justify-center py-8 lg:py-10">
        <button
          onClick={() => navigate('/themes')}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid #06b6d4',
            color: '#06b6d4',
            backdropFilter: 'blur(8px)',
          }}
        >
          <ArrowLeft size={16} />
          {lang === 'KO' ? '테마 분석으로 돌아가기' : 'Back to Theme Analysis'}
        </button>
      </div>
    </div>
  );
}
