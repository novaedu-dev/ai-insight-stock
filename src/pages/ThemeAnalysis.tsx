import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Cpu,
  Atom,
  Dna,
  Download,
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle,
  Shield,
  ChevronRight,
  BarChart3,
  FileText,
} from 'lucide-react';
import { useT } from '@/i18n';
import type { ThemeKey } from '@/store/stockStore';
import { useStockStore } from '@/store/stockStore';

/* ─────────────────────── easing ─────────────────────── */
const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

const easeOut = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

/* ─────────────────────── icon map ─────────────────────── */
const themeIcons: Record<ThemeKey, typeof Flame> = {
  power: Flame,
  robotics: Cpu,
  quantum: Atom,
  bio: Dna,
};

/* ─────────────────────── i18n content ─────────────────────── */
const themeContent: Record<ThemeKey, {
  titleKo: string; titleEn: string;
  descKo: string; descEn: string;
  insight: { titleKo: string; titleEn: string; bodyKo: string; bodyEn: string; metrics: { labelKo: string; labelEn: string; value: string }[] };
  risk: { titleKo: string; titleEn: string; bodyKo: string; bodyEn: string; level: 1 | 2 | 3 | 4 };
  action: { titleKo: string; titleEn: string; items: { titleKo: string; titleEn: string; descKo: string; descEn: string }[]; timingKo: string; timingEn: string };
}> = {
  power: {
    titleKo: 'AI 인프라 & 전력/냉각',
    titleEn: 'AI Infra & Power/Cooling',
    descKo: 'AI 데이터센터는 무한한 전력을 필요로 합니다. 액침냉각, 초고압변압기, ESS가 핵심입니다.',
    descEn: 'AI data centers need infinite power. Liquid cooling, transformers, and ESS are the core.',
    insight: {
      titleKo: 'AI 데이터센터는 무한한 전력을 필요로 합니다',
      titleEn: 'AI Data Centers Need Infinite Power',
      bodyKo: '엔비디아 GPU 클러스터가 기하급수적으로 확장되면서 데이터센터 전력 밀도는 2년마다 2배로 증가할 것으로 예상됩니다. 액침냉각은 선택이 아닌 필수가 되고 있으며, 케이엔솔과 GST는 이 전환의 최전선에 있습니다. HD현대일렉트릭의 초고압 변압기는 그리드 확장의 핵심이며, 서진시스템의 ESS 기술은 전력 수요가 급증하는 시설의 피크 쉐이빙을 가능하게 합니다.',
      bodyEn: "As NVIDIA's GPU clusters scale exponentially, data center power density is projected to double every 2 years. Liquid cooling (especially immersion cooling) is becoming mandatory. KEnSol and GST are at the forefront. HD Hyundai Electric's ultra-high-voltage transformers are the backbone of grid expansion, while SJ System's ESS enables peak shaving.",
      metrics: [
        { labelKo: '글로벌 DC 전력 CAGR', labelEn: 'Global DC Power CAGR', value: '18.5%' },
        { labelKo: '액침냉각 TAM', labelEn: 'Immersion Cooling TAM', value: '$12.8B' },
        { labelKo: '국내 ESS TAM', labelEn: 'ESS Korea TAM', value: '\u20a98.2T' },
      ],
    },
    risk: {
      titleKo: '규제 및 실행 리스크',
      titleEn: 'Regulatory and Execution Risk',
      bodyKo: '전력망 확장은 님비 현상과 규제 지연에 직면해 있습니다. ESS 수익성은 리튬 등 원재료 가격 변동성에 의존합니다. 변압기 업체는 비용 우위를 가진 중국 제조업체와의 경쟁에 직면해 있습니다.',
      bodyEn: 'Power grid expansion faces NIMBYism and regulatory delays. ESS profitability depends on raw material (lithium) price volatility. Transformer makers face competition from Chinese manufacturers with cost advantages.',
      level: 2,
    },
    action: {
      titleKo: '전략적 진입 계획',
      titleEn: 'Strategic Entry Plan',
      items: [
        { titleKo: '20일 이동평균선 아래 하락 시 분할 매수', titleEn: 'Accumulate on dips below 20-day MA', descKo: '단기 조정을 기회로 삼아 점진적으로 포지션을 구축합니다.', descEn: 'Use short-term corrections as opportunities to build position gradually.' },
        { titleKo: '실적 시즌 변동성을 진입 시점으로 활용', titleEn: 'Use earnings volatility for entry timing', descKo: '실적 발표 전후 변동성이 높아질 때 기회를 포착합니다.', descEn: 'Capture opportunities around heightened volatility during earnings season.' },
        { titleKo: '인프라 사이클 플레이로 최소 6\u201312개월 홀딩', titleEn: 'Hold 6\u201312 months for infrastructure cycle', descKo: '인프라 투자 사이클은 중장기 흐름이므로 단기 변동에 휘둘리지 않습니다.', descEn: 'Infrastructure investment cycles are medium-to-long term; do not be swayed by short-term volatility.' },
      ],
      timingKo: '2025년 2분기까지 점진적 분할 매수',
      timingEn: 'Accumulate gradually through Q2 2025',
    },
  },
  robotics: {
    titleKo: '온디바이스 AI & 로봇',
    titleEn: 'On-Device AI & Robotics',
    descKo: '물리적 AI 계층이 형성되고 있습니다. 엣지 AI 칩부터 로보틱스까지.',
    descEn: 'The physical AI layer is forming. From edge AI chips to humanoid robotics.',
    insight: {
      titleKo: '물리적 AI 계층이 형성되고 있습니다',
      titleEn: 'The Physical AI Layer is Forming',
      bodyKo: 'AI가 클라우드에서 엣지로 이동하면서 온디바이스 추론 칩과 물리적 AI 에이전트(로봇)가 다음 프론티어입니다. 현대차의 통합 로보틱스 + 수소 + EV 생태계는 독특한 해자를 만듭니다. 레인보우로보틱스는 방산과 산업용을 모두 서비스하며, 퀄컴의 Snapdragon AI 칩은 수십억 개의 엣지 기기를 구동합니다.',
      bodyEn: "As AI moves from cloud to edge, on-device inference chips and physical AI agents (robots) are the next frontier. Hyundai's integrated robotics + hydrogen + EV ecosystem creates a unique moat. Rainbow Robotics serves both defense and industrial applications. Qualcomm's Snapdragon AI chips power billions of edge devices.",
      metrics: [
        { labelKo: '엣지 AI 시장 CAGR', labelEn: 'Edge AI Market CAGR', value: '31.2%' },
        { labelKo: '서비스 로봇 TAM', labelEn: 'Service Robot TAM', value: '$45B' },
        { labelKo: '현대차 로보틱스 R&D', labelEn: 'Hyundai Robotics R&D', value: '\u20a93.2T' },
      ],
    },
    risk: {
      titleKo: '기술 채택 불확실성',
      titleEn: 'Technology Adoption Uncertainty',
      bodyKo: '통합 비용으로 인해 산업 현장의 로봇 도입이 예상보다 느립니다. 애플, 미디어텍, 중국 업체들의 온디바이스 AI 칩 경쟁이 심화되고 있습니다.',
      bodyEn: 'Robot adoption in industrial settings is slower than expected due to integration costs. On-device AI chip competition from Apple, MediaTek, and Chinese vendors is intensifying.',
      level: 3,
    },
    action: {
      titleKo: '선별적 포지션 구축',
      titleEn: 'Selective Position Building',
      items: [
        { titleKo: '현대차를 방어적 앵커로 시작', titleEn: 'Start with Hyundai as a defensive anchor', descKo: '로보틱스, 수소, 배터리 3각 펀더멘털로 안정적입니다.', descEn: 'Stable with robotics, hydrogen, and battery三角 fundamentals.' },
        { titleKo: '방산 계약 발표 시 레인보우로보틱스 추가', titleEn: 'Add Rainbow Robotics on defense contracts', descKo: '방위사업 수주가 주가 촉매제가 됩니다.', descEn: 'Defense contracts serve as price catalysts.' },
        { titleKo: '퀄컴을 안정적 배당 + 성장 조합으로', titleEn: 'Qualcomm as a dividend + growth combo', descKo: '온디바이스 AI 시장의 확고한 리더입니다.', descEn: 'A firm leader in the on-device AI market.' },
      ],
      timingKo: '기술주 섹터 조정 시 기회주의적 진입',
      timingEn: 'Opportunistic entries on tech sector corrections',
    },
  },
  quantum: {
    titleKo: '양자컴퓨터 혁명',
    titleEn: 'Quantum Computing Revolution',
    descKo: '양자 혁명이 가속화됩니다. IBM의 배당부터 IONQ의 순수 성장주까지.',
    descEn: 'The quantum revolution is accelerating. From IBM\'s dividends to pure-play IONQ growth.',
    insight: {
      titleKo: '양자 혁명이 가속화되고 있습니다',
      titleEn: 'The Quantum Revolution is Accelerating',
      bodyKo: '양자컴퓨팅이 연구실에서 상업 현실로 전환되고 있습니다. IBM은 양자 리더십과 확고한 배당(수익률 4.5%)을 결합하여 보수적 투자자에게 이상적입니다. IONQ는 지수적 상방 잠재력을 가진 순수 양자 성장주입니다. SK텔레콤은 정부 지원 하에 국내 양자 분야를 선도합니다.',
      bodyEn: 'Quantum computing is transitioning from research labs to commercial reality. IBM combines quantum leadership with a rock-solid dividend (4.5% yield), making it ideal for conservative investors. IONQ is the pure-play quantum growth stock with exponential upside potential. SK Telecom leads Korea\'s quantum efforts with government backing.',
      metrics: [
        { labelKo: 'IBM 배당수익률', labelEn: 'IBM Dividend Yield', value: '4.52%' },
        { labelKo: '양자 시장 CAGR', labelEn: 'Quantum Market CAGR', value: '32.7%' },
        { labelKo: '국내 양자 예산', labelEn: 'Korea Quantum Budget', value: '\u20a91.2T' },
      ],
    },
    risk: {
      titleKo: '상용화까지 장기간 소요',
      titleEn: 'Long Timeline to Commercialization',
      bodyKo: '결함 허용 양자컴퓨터는 여전히 수년 이상 먼 미래입니다. IONQ는 수익이 없고 현금을 소진하고 있습니다. SK텔레콤의 양자 매출은 아직 미미한 수준입니다.',
      bodyEn: 'Fault-tolerant quantum computers remain years away. IONQ has no profits and burns cash. SK Telecom\'s quantum revenue is still negligible.',
      level: 3,
    },
    action: {
      titleKo: '균형 잡힌 양자 포트폴리오',
      titleEn: 'Balanced Quantum Portfolio',
      items: [
        { titleKo: 'IBM을 방어적 배당 + 양자 콜옵션으로', titleEn: 'IBM as defensive dividend + quantum call option', descKo: '배당 수익을 받으며 양자 상용화 옵션을 물림니다.', descEn: 'Earn dividend income while holding a quantum commercialization option.' },
        { titleKo: 'IONQ 소규모 포지션(투기적, 포트폴리오 3% 내)', titleEn: 'Small IONQ position (speculative, max 3%)', descKo: '고위험 고수익 순수 플레이로 소액 분산 투자합니다.', descEn: 'A high-risk, high-reward pure play; invest a small dispersed amount.' },
        { titleKo: '국내 양자 노출 + 배당 소득을 위한 SK텔레콤', titleEn: 'SK Telecom for Korea quantum + dividend income', descKo: '국내 양자 생태계의 수혜주이며 배당도 안정적입니다.', descEn: 'Beneficiary of the domestic quantum ecosystem with stable dividends.' },
      ],
      timingKo: '기술주 약세장에서 분할 매수',
      timingEn: 'Accumulate during tech downturns',
    },
  },
  bio: {
    titleKo: '바이오 생명연장',
    titleEn: 'Bio Longevity',
    descKo: '비만치료제가 헬스케어를 재정의합니다. GLP-1 혁명의 최전선.',
    descEn: 'Obesity drugs are redefining healthcare. The forefront of the GLP-1 revolution.',
    insight: {
      titleKo: '비만치료제가 헬스케어를 재정의합니다',
      titleEn: 'Obesity Drugs Redefine Healthcare',
      bodyKo: '일라이릴리(Mounjaro/Zepbound)와 노볼노디스크(Wegovy/Ozempic)가 이끄는 GLP-1 혁명은 역사상 가장 큰 제약 기회입니다. 삼성바이오로직스는 생산 수요를 포착하는 글로벌 1위 CDMO로 수혜를 받습니다. 글로벌 비만치료제 매출은 2030년까지 $1,500억을 초과할 것으로 예상됩니다.',
      bodyEn: 'The GLP-1 revolution led by Lilly (Mounjaro/Zepbound) and Novo Nordisk (Wegovy/Ozempic) is the largest pharmaceutical opportunity in history. Samsung Biologics benefits as the world\'s top CDMO capturing production demand. Global obesity drug sales are projected to exceed $150B by 2030.',
      metrics: [
        { labelKo: 'GLP-1 글로벌 매출', labelEn: 'GLP-1 Global Sales', value: '$150B+' },
        { labelKo: '삼성바이오 캐펙스', labelEn: 'Samsung Bio CapEx', value: '\u20a97.5T' },
        { labelKo: '비만치료제 CAGR', labelEn: 'Obesity Drug CAGR', value: '28.5%' },
      ],
    },
    risk: {
      titleKo: '규제 및 경쟁 압박',
      titleEn: 'Regulatory and Competitive Pressure',
      bodyKo: '2035년 이후 GLP-1 의약품의 특허 절벽과 바이오시밀러 경쟁이 다가오고 있습니다. 부작용에 대한 규제 심사가 강화되고 있으며, CDMO 마진은 신규 진입자들의 압박을 받고 있습니다.',
      bodyEn: 'Patent cliffs and biosimilar competition loom for GLP-1 drugs by 2035+. Regulatory scrutiny on side effects is intensifying. CDMO margins face pressure from new entrants.',
      level: 2,
    },
    action: {
      titleKo: '헬스케어 메가트렌드 플레이',
      titleEn: 'Healthcare Mega-Trend Play',
      items: [
        { titleKo: '일라이릴리를 핵심 보유주로 \u2014 비만치료제 선도 기업', titleEn: 'Lilly as a core holding \u2014 the obesity drug leader', descKo: 'Mounjaro/Zepbound 매출 급증이 가장 확실한 모멘텀입니다.', descEn: 'Mounjaro/Zepbound revenue surge is the clearest momentum driver.' },
        { titleKo: '유럽 제약 다각화를 위한 노볼노디스크', titleEn: 'Novo Nordisk for European pharma diversification', descKo: '위고비 글로벌 판매 확대와 CagriSema 파이프라인이 기대됩니다.', descEn: 'Wegovy global expansion and CagriSema pipeline are key catalysts.' },
        { titleKo: '국내 바이오 노출 + CDMO 성장을 위한 삼성바이오로직스', titleEn: 'Samsung Biologics for Korea bio + CDMO growth', descKo: '글로벌 CDMO 1위로 바이오 생산 인프라 수혜가 확실합니다.', descEn: 'Global #1 CDMO clearly benefits from biotech production infrastructure.' },
      ],
      timingKo: 'FDA 승인 후 조정 시 분할 매수',
      timingEn: 'Accumulate on FDA approval pullbacks',
    },
  },
};

/* ─────────────────────── override stock display data ─────────────────────── */
const stockDisplayData: Record<string, {
  currentPrice: number;
  targetPrice: number;
  expectedReturn: number;
  isBeginnerFriendly?: boolean;
  dividendYield?: number;
  whyBuyKo: string;
  whyBuyEn: string;
}> = {
  KEnSol: { currentPrice: 33300, targetPrice: 55000, expectedReturn: 65.2, isBeginnerFriendly: true, whyBuyKo: '액침냉각 기술로 AI 데이터센터 수혜 기대', whyBuyEn: 'Immersion cooling tech beneficiary of AI data center boom' },
  GST: { currentPrice: 29700, targetPrice: 50000, expectedReturn: 68.4, whyBuyKo: '액침냉각 부품 전문 기업으로 수주 확대', whyBuyEn: 'Cooling parts specialist with expanding order book' },
  '267260.KS': { currentPrice: 344500, targetPrice: 500000, expectedReturn: 45.1, dividendYield: 1.2, whyBuyKo: '초고압변압기 글로벌 1위, 인프라 필수', whyBuyEn: 'Global #1 ultra-high-voltage transformer, infra essential' },
  '208050.KS': { currentPrice: 44300, targetPrice: 72000, expectedReturn: 62.5, isBeginnerFriendly: true, whyBuyKo: 'ESS 에너지저장시스템 전문 기업', whyBuyEn: 'ESS energy storage system specialist' },
  '005380.KS': { currentPrice: 271000, targetPrice: 350000, expectedReturn: 29.2, dividendYield: 2.1, whyBuyKo: '로보틱스 + 수소 + 배터리 3각 펀더멘털', whyBuyEn: 'Robotics + hydrogen + battery三角fundamentals' },
  'RBOT': { currentPrice: 58600, targetPrice: 95000, expectedReturn: 62.1, isBeginnerFriendly: true, whyBuyKo: 'AI 로봇 전문 기업, 방산/산업용 겸비', whyBuyEn: 'AI robotics specialist, defense & industrial' },
  QCOM: { currentPrice: 198.5, targetPrice: 270, expectedReturn: 36.0, dividendYield: 1.8, whyBuyKo: '온디바이스 AI 칩 Snapdragon 전문', whyBuyEn: 'On-device AI chip Snapdragon leader' },
  IBM: { currentPrice: 228.4, targetPrice: 310, expectedReturn: 35.7, dividendYield: 4.5, whyBuyKo: '양자컴퓨팅 + 클라우드 + 4.5% 배당 수익률', whyBuyEn: 'Quantum computing + cloud + 4.5% dividend yield' },
  IONQ: { currentPrice: 32.5, targetPrice: 65, expectedReturn: 100.0, isBeginnerFriendly: true, whyBuyKo: '순수 양자컴퓨팅 플레이, 트래픽 급증', whyBuyEn: 'Pure quantum computing play, surging interest' },
  '017670.KS': { currentPrice: 52300, targetPrice: 72000, expectedReturn: 37.7, dividendYield: 4.2, whyBuyKo: '국내 양자컴퓨팅 선도, 안정적 배당', whyBuyEn: 'Korea quantum leader, stable dividend' },
  LLY: { currentPrice: 842.3, targetPrice: 1100, expectedReturn: 30.6, whyBuyKo: '비만치료제 Mounjaro/Zepbound 시장 독주', whyBuyEn: 'Mounjaro/Zepbound market dominance' },
  NVO: { currentPrice: 68.4, targetPrice: 95, expectedReturn: 38.9, whyBuyKo: '위고비 글로벌 판매 확대, 신약 파이프라인', whyBuyEn: 'Wegovy global expansion, strong pipeline' },
  '207940.KS': { currentPrice: 789000, targetPrice: 950000, expectedReturn: 20.4, whyBuyKo: '글로벌 CDMO 1위, 바이오 생산 인프라 확대', whyBuyEn: 'Global #1 CDMO, expanding bio production infra' },
};

/* ─────────────────────── risk labels ─────────────────────── */
const riskLabels: Record<number, { ko: string; en: string; color: string }> = {
  1: { ko: '저위험', en: 'Low Risk', color: '#10b981' },
  2: { ko: '중간', en: 'Moderate', color: '#f59e0b' },
  3: { ko: '고위험', en: 'High Risk', color: '#f43f5e' },
  4: { ko: '극도', en: 'Extreme', color: '#dc2626' },
};

/* ─────────────────────── VIP report HTML generator ─────────────────────── */
function generateVIPReport(theme: ThemeKey, lang: 'KO' | 'EN'): string {
  const content = themeContent[theme];
  const store = useStockStore.getState();
  const themeStocks = store.getStocksByTheme(theme);
  const isKo = lang === 'KO';
  const tf = (ko: string, en: string) => (isKo ? ko : en);

  const risk = content.risk;
  const riskInfo = riskLabels[risk.level];

  const stockRows = themeStocks.map((s) => {
    const override = stockDisplayData[s.ticker];
    const cur = override?.currentPrice ?? s.currentPrice;
    const tgt = override?.targetPrice ?? s.targetPrice;
    const ret = override?.expectedReturn ?? s.expectedReturn;
    const isUSD = s.exchange === 'NASDAQ' || s.exchange === 'NYSE';
    const currency = isUSD ? '$' : '\u20a9';
    const fmt = (n: number) => isUSD ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : n.toLocaleString('ko-KR');
    const bf = override?.isBeginnerFriendly ?? s.isBeginnerFriendly;
    const dy = override?.dividendYield ?? s.dividendYield;

    return `
    <div style="border:1px solid #334155;border-radius:12px;padding:16px;margin-bottom:12px;background:rgba(15,23,42,0.6);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <span style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#64748b;text-transform:uppercase;">${s.ticker}</span>
        <span style="font-size:10px;padding:3px 10px;border-radius:4px;background:#1e293b;color:#94a3b8;">${s.exchange}</span>
      </div>
      <div style="font-size:16px;font-weight:600;color:#f1f5f9;margin-bottom:8px;">${isKo ? s.nameKo : s.nameEn}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:22px;font-weight:700;color:#f1f5f9;margin-bottom:4px;">
        ${isUSD ? currency : ''}${fmt(cur)}${!isUSD ? currency : ''}
      </div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:13px;color:#10b981;font-weight:600;margin-bottom:12px;">
        ${tf('목표가', 'Target')}: ${isUSD ? currency : ''}${fmt(tgt)}${!isUSD ? currency : ''} (+${ret}%)
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        ${bf ? `<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px;background:rgba(16,185,129,0.12);color:#10b981;border:1px solid rgba(16,185,129,0.3);">${tf('\u521d\u00d4\u4e00\u8005 \u00d4\u63a8\u85a6', 'Beginner Friendly')}</span>` : ''}
        ${dy ? `<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:999px;background:rgba(99,102,241,0.12);color:#6366f1;border:1px solid rgba(99,102,241,0.3);">${dy}% ${tf('\uace0\ubc30\ub2f9', 'Dividend')}</span>` : ''}
      </div>
    </div>`;
  }).join('');

  const metricsHtml = content.insight.metrics.map((m) => `
    <div style="border-radius:10px;padding:12px 16px;background:#0f172a;text-align:center;flex:1;">
      <div style="font-size:10px;color:#64748b;margin-bottom:4px;">${isKo ? m.labelKo : m.labelEn}</div>
      <div style="font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:600;color:#f1f5f9;">${m.value}</div>
    </div>
  `).join('');

  const riskBarHtml = [1, 2, 3, 4].map((lvl) => {
    const info = riskLabels[lvl];
    const active = lvl === risk.level;
    return `
    <div style="flex:1;text-align:center;padding:8px 4px;border-radius:8px;background:${active ? `${info.color}20` : 'transparent'};border:1px solid ${active ? info.color : '#334155'};">
      <div style="width:8px;height:8px;border-radius:50%;background:${active ? info.color : '#334155'};margin:0 auto 4px;"></div>
      <div style="font-size:10px;color:${active ? info.color : '#64748b'};">${isKo ? info.ko : info.en}</div>
    </div>`;
  }).join('');

  const actionItemsHtml = content.action.items.map((item, i) => `
    <div style="display:flex;gap:12px;margin-bottom:16px;">
      <div style="width:28px;height:28px;border-radius:50%;background:#6366f1;color:#fff;font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</div>
      <div>
        <div style="font-size:14px;font-weight:600;color:#f1f5f9;margin-bottom:4px;">${isKo ? item.titleKo : item.titleEn}</div>
        <div style="font-size:13px;color:#94a3b8;line-height:1.5;">${isKo ? item.descKo : item.descEn}</div>
      </div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="${isKo ? 'ko' : 'en'}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${isKo ? content.titleKo : content.titleEn} - VIP Report</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Inter','Pretendard',system-ui,sans-serif;background:#020617;color:#f1f5f9;line-height:1.6;padding:24px;max-width:960px;margin:0 auto}
  h1{font-size:28px;font-weight:700;margin-bottom:8px}
  h2{font-size:20px;font-weight:700;margin-bottom:12px}
  h3{font-size:16px;font-weight:600;margin-bottom:8px}
  p{font-size:14px;color:#94a3b8;line-height:1.7;margin-bottom:12px}
  .header{border-bottom:1px solid #1e293b;padding-bottom:20px;margin-bottom:32px}
  .header-date{font-size:12px;color:#64748b;font-family:'JetBrains Mono',monospace}
  .section{background:rgba(15,23,42,0.6);border:1px solid rgba(51,65,85,0.4);border-radius:16px;padding:24px;margin-bottom:24px}
  .badge{font-size:11px;font-weight:600;padding:4px 12px;border-radius:999px;display:inline-block;margin-bottom:12px}
  .grid-3{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:16px}
  .grid-1{display:grid;grid-template-columns:1fr;gap:12px}
  @media(min-width:640px){.grid-1{grid-template-columns:repeat(2,1fr)}}@media(min-width:1024px){.grid-1{grid-template-columns:repeat(3,1fr)}}
  .risk-bar{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}
  .timing-badge{display:inline-block;margin-top:12px;padding:8px 16px;border-radius:999px;background:rgba(16,185,129,0.12);color:#10b981;border:1px solid rgba(16,185,129,0.3);font-size:13px;font-weight:600}
</style>
</head>
<body>
  <div class="header">
    <div class="header-date">${new Date().toLocaleString(isKo ? 'ko-KR' : 'en-US')}</div>
    <h1 style="color:#6366f1;margin-top:8px;">${isKo ? content.titleKo : content.titleEn}</h1>
    <p style="margin-bottom:0;">${isKo ? content.descKo : content.descEn}</p>
  </div>

  <div class="section">
    <div class="badge" style="background:rgba(99,102,241,0.12);color:#6366f1;border:1px solid rgba(99,102,241,0.3);">${tf('\uc2dc\uc7a5 \ud1b5\ucc30', 'Market Insight')}</div>
    <h2>${isKo ? content.insight.titleKo : content.insight.titleEn}</h2>
    <p>${isKo ? content.insight.bodyKo : content.insight.bodyEn}</p>
    <div class="grid-3">${metricsHtml}</div>
  </div>

  <div class="section" style="border-top:2px solid #f59e0b;">
    <div class="badge" style="background:rgba(245,158,11,0.12);color:#f59e0b;border:1px solid rgba(245,158,11,0.3);">${tf('\ub9ac\uc2a4\ud06c \ud3c9\uac00', 'Risk Assessment')}</div>
    <h2>${isKo ? risk.titleKo : risk.titleEn}</h2>
    <p>${isKo ? risk.bodyKo : risk.bodyEn}</p>
    <div class="risk-bar">${riskBarHtml}</div>
  </div>

  <div class="section" style="border-top:2px solid #6366f1;">
    <div class="badge" style="background:rgba(99,102,241,0.12);color:#6366f1;border:1px solid rgba(99,102,241,0.3);">${tf('\ud589\ub3d9 \uac15\ub839', 'Action Code')}</div>
    <h2>${isKo ? content.action.titleKo : content.action.titleEn}</h2>
    ${actionItemsHtml}
    <div class="timing-badge">${tf('\ucd94천 \uc9c4\uc785 \uc2dc\uc810', 'Recommended Entry')}: ${isKo ? content.action.timingKo : content.action.timingEn}</div>
  </div>

  <div class="section">
    <h2>${tf('\uc774 \ud14c\ub9c8\uc758 \uc885\ubaa9', 'Stocks in This Theme')}</h2>
    <div class="grid-1">${stockRows}</div>
  </div>

  <div style="text-align:center;padding:32px;border-top:1px solid #1e293b;margin-top:32px;">
    <p style="font-size:12px;color:#64748b;">${tf('\uc81c\uacf5\ub418\ub294 \uc815\ubcf4\ub294 \ucc38\uace0\uc6a9\uc774\uba70 \ud22c\uc790 \uad8c\uc720\uac00 \uc544\ub2d9\ub2c8\ub2e4.', 'Data provided for informational purposes only. Not financial advice.')}</p>
    <p style="font-size:12px;color:#64748b;margin-top:8px;font-family:'JetBrains Mono',monospace;">AI Insight VIP Report</p>
  </div>
</body>
</html>`;
}

/* ─────────────────────── main component ─────────────────────── */
export default function ThemeAnalysis() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, lang } = useT();
  const { getStocksByTheme } = useStockStore();
  const isKo = lang === 'KO';

  const tabParam = searchParams.get('tab') as ThemeKey | null;
  const validTabs: ThemeKey[] = ['power', 'robotics', 'quantum', 'bio'];
  const initialTab = validTabs.includes(tabParam!) ? tabParam! : 'power';
  const [activeTheme, setActiveTheme] = useState<ThemeKey>(initialTab);

  useEffect(() => {
    if (!tabParam || !validTabs.includes(tabParam)) {
      setSearchParams({ tab: 'power' });
    }
  }, []);

  useEffect(() => {
    setSearchParams({ tab: activeTheme });
  }, [activeTheme, setSearchParams]);

  const handleThemeChange = useCallback((theme: ThemeKey) => {
    setActiveTheme(theme);
  }, []);

  const content = themeContent[activeTheme];
  const themeStocks = useMemo(() => getStocksByTheme(activeTheme), [getStocksByTheme, activeTheme]);

  const handleDownload = useCallback(() => {
    const html = generateVIPReport(activeTheme, lang);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const themeName = activeTheme;
    a.href = url;
    a.download = `${themeName}-vip-report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [activeTheme, lang]);

  const tf = useCallback((ko: string, en: string) => (isKo ? ko : en), [isKo]);

  const tabList: { key: ThemeKey; Icon: typeof Flame }[] = [
    { key: 'power', Icon: Flame },
    { key: 'robotics', Icon: Cpu },
    { key: 'quantum', Icon: Atom },
    { key: 'bio', Icon: Dna },
  ];

  return (
    <div className="min-h-[100dvh]" style={{ backgroundColor: '#020617' }}>
      {/* ── Page Header ── */}
      <div className="max-w-[1400px] mx-auto px-6 pt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeOut }}
        >
          <div className="flex items-center gap-2 text-[11px] mb-3" style={{ color: '#64748b' }}>
            <span
              className="cursor-pointer hover:underline"
              onClick={() => navigate('/')}
            >
              {t('nav.dashboard')}
            </span>
            <ChevronRight size={12} />
            <span style={{ color: '#94a3b8' }}>{t('nav.themes')}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] mb-2">{t('nav.themes')}</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {tf('AI 시대를 형성하는 4대 메가트렌드를 심층 분석합니다.', 'Deep dive into the four mega-trends shaping the AI era.')}
          </p>
        </motion.div>
      </div>

      {/* ── Two-Column Layout ── */}
      <div className="max-w-[1400px] mx-auto px-6 pb-32">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── LEFT: Theme Selector ── */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: easeOut }}
            className="w-full lg:w-[240px] flex-shrink-0"
          >
            <div className="lg:sticky lg:top-[72px] flex flex-col gap-2">
              {tabList.map(({ key, Icon }) => {
                const isActive = activeTheme === key;
                const tc = themeContent[key];
                return (
                  <button
                    key={key}
                    onClick={() => handleThemeChange(key)}
                    className="relative flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-left transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                      border: isActive ? '1px solid rgba(99,102,241,0.25)' : '1px solid transparent',
                    }}
                  >
                    {/* Active left border + glow */}
                    {isActive && (
                      <motion.div
                        layoutId="theme-active-indicator"
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                        style={{
                          backgroundColor: '#6366f1',
                          boxShadow: '0 0 12px rgba(99,102,241,0.5)',
                        }}
                        transition={springTransition}
                      />
                    )}
                    <div
                      className="flex items-center justify-center w-9 h-9 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(30,41,59,0.5)' }}
                    >
                      <Icon size={18} style={{ color: isActive ? '#6366f1' : '#64748b' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-semibold truncate"
                        style={{ color: isActive ? '#f1f5f9' : '#94a3b8' }}
                      >
                        {isKo ? tc.titleKo : tc.titleEn}
                      </div>
                      <div className="text-[11px] truncate" style={{ color: '#64748b' }}>
                        {themeStocks.length} {tf('종목', 'stocks')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.aside>

          {/* ── RIGHT: Theme Detail ── */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTheme}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: easeOut }}
              >
                {/* Theme Hero */}
                <ThemeHero theme={activeTheme} content={content} isKo={isKo} />

                {/* Market Insight */}
                <MarketInsightPanel content={content} isKo={isKo} tf={tf} />

                {/* Risk Assessment */}
                <RiskPanel content={content} isKo={isKo} tf={tf} />

                {/* Action Code */}
                <ActionPanel content={content} isKo={isKo} tf={tf} />

                {/* Stock Grid */}
                <StockGridSection
                  theme={activeTheme}
                  themeStocks={themeStocks}
                  isKo={isKo}
                  tf={tf}
                  onStockClick={(ticker) => navigate(`/stock/${ticker}`)}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── VIP Report Download Bar ── */}
      <VIPDownloadBar onDownload={handleDownload} isKo={isKo} tf={tf} />
    </div>
  );
}

/* ── Named export for compatibility ── */
export { ThemeAnalysis };

/* ═══════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════ */

/* ── Theme Hero ── */
function ThemeHero({ theme, content, isKo }: { theme: ThemeKey; content: typeof themeContent.power; isKo: boolean }) {
  const themeGradients: Record<ThemeKey, string> = {
    power: 'linear-gradient(135deg, #0f172a 0%, #0c2d4a 50%, #0f172a 100%)',
    robotics: 'linear-gradient(135deg, #0f172a 0%, #1a1644 50%, #0f172a 100%)',
    quantum: 'linear-gradient(135deg, #0f172a 0%, #0a3d2e 50%, #0f172a 100%)',
    bio: 'linear-gradient(135deg, #0f172a 0%, #3d0c24 50%, #0f172a 100%)',
  };

  const accentColors: Record<ThemeKey, string> = {
    power: '#06b6d4',
    robotics: '#6366f1',
    quantum: '#10b981',
    bio: '#f43f5e',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.03 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: easeOut }}
      className="relative overflow-hidden rounded-2xl p-6 mb-5"
      style={{ background: themeGradients[theme], minHeight: '160px' }}
    >
      <div className="relative z-10">
        <span
          className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full mb-3"
          style={{ backgroundColor: `${accentColors[theme]}26`, color: accentColors[theme] }}
        >
          {isKo ? content.titleKo : content.titleEn}
        </span>
        <h2 className="text-2xl lg:text-3xl font-bold text-[#f1f5f9] mb-2">
          {isKo ? content.titleKo : content.titleEn}
        </h2>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          {isKo ? content.descKo : content.descEn}
        </p>
      </div>
      {/* Subtle glow orb */}
      <div
        className="absolute -right-20 -top-20 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accentColors[theme]}15, transparent 70%)` }}
      />
    </motion.div>
  );
}

/* ── Market Insight Panel ── */
function MarketInsightPanel({ content, isKo, tf }: { content: typeof themeContent.power; isKo: boolean; tf: (ko: string, en: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="rounded-2xl p-6 mb-5"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(51, 65, 85, 0.4)' }}
    >
      <span
        className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full mb-3"
        style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}
      >
        {tf('시장 통찰', 'Market Insight')}
      </span>
      <h3 className="text-lg font-bold text-[#f1f5f9] mb-3">
        {isKo ? content.insight.titleKo : content.insight.titleEn}
      </h3>
      <p className="text-sm leading-relaxed mb-5" style={{ color: '#94a3b8' }}>
        {isKo ? content.insight.bodyKo : content.insight.bodyEn}
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {content.insight.metrics.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.08, ease: easeOut }}
            className="rounded-xl p-3 text-center"
            style={{ backgroundColor: '#0f172a' }}
          >
            <div className="text-[10px] mb-1" style={{ color: '#64748b' }}>{isKo ? m.labelKo : m.labelEn}</div>
            <div className="font-mono text-sm font-semibold text-[#f1f5f9]">{m.value}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ── Risk Assessment Panel ── */
function RiskPanel({ content, isKo, tf }: { content: typeof themeContent.power; isKo: boolean; tf: (ko: string, en: string) => string }) {
  const risk = content.risk;
  const riskInfo = riskLabels[risk.level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="rounded-2xl p-6 mb-5"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(51, 65, 85, 0.4)',
        borderTop: '2px solid #f59e0b',
      }}
    >
      <span
        className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full mb-3"
        style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
      >
        {tf('리스크 평가', 'Risk Assessment')}
      </span>
      <h3 className="text-lg font-bold text-[#f1f5f9] mb-3">
        {isKo ? risk.titleKo : risk.titleEn}
      </h3>
      <p className="text-sm leading-relaxed mb-5" style={{ color: '#94a3b8' }}>
        {isKo ? risk.bodyKo : risk.bodyEn}
      </p>
      {/* Risk Level Bar */}
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3, 4].map((lvl) => {
          const info = riskLabels[lvl];
          const active = lvl === risk.level;
          return (
            <motion.div
              key={lvl}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: lvl * 0.1 }}
              className="flex flex-col items-center gap-1.5 py-2 px-1 rounded-lg text-center"
              style={{
                backgroundColor: active ? `${info.color}20` : 'transparent',
                border: `1px solid ${active ? info.color : '#334155'}`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: active ? info.color : '#334155' }}
              />
              <span className="text-[10px] font-medium" style={{ color: active ? info.color : '#64748b' }}>
                {isKo ? info.ko : info.en}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Action Code Panel ── */
function ActionPanel({ content, isKo, tf }: { content: typeof themeContent.power; isKo: boolean; tf: (ko: string, en: string) => string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.4, ease: easeOut }}
      className="rounded-2xl p-6 mb-5"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(51, 65, 85, 0.4)',
        borderTop: '2px solid #6366f1',
      }}
    >
      <span
        className="inline-block text-[10px] font-semibold px-3 py-1 rounded-full mb-3"
        style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}
      >
        {tf('행동 강령', 'Action Code')}
      </span>
      <h3 className="text-lg font-bold text-[#f1f5f9] mb-4">
        {isKo ? content.action.titleKo : content.action.titleEn}
      </h3>
      <div className="flex flex-col gap-4 mb-5">
        {content.action.items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.1, ease: easeOut }}
            className="flex gap-3"
          >
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
              style={{ backgroundColor: '#6366f1', color: '#fff' }}
            >
              <span className="font-mono text-[11px] font-semibold">{i + 1}</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#f1f5f9] mb-1">{isKo ? item.titleKo : item.titleEn}</div>
              <div className="text-[13px] leading-relaxed" style={{ color: '#94a3b8' }}>{isKo ? item.descKo : item.descEn}</div>
            </div>
          </motion.div>
        ))}
      </div>
      <span
        className="inline-block text-[11px] font-semibold px-4 py-2 rounded-full"
        style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
      >
        {tf('추천 진입 시점', 'Recommended Entry')}: {isKo ? content.action.timingKo : content.action.timingEn}
      </span>
    </motion.div>
  );
}

/* ── Stock Grid Section ── */
function StockGridSection({
  theme,
  themeStocks,
  isKo,
  tf,
  onStockClick,
}: {
  theme: ThemeKey;
  themeStocks: ReturnType<ReturnType<typeof useStockStore.getState>['getStocksByTheme']>;
  isKo: boolean;
  tf: (ko: string, en: string) => string;
  onStockClick: (ticker: string) => void;
}) {
  return (
    <div className="mt-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[#f1f5f9] mb-1">
          {tf('이 테마의 종목', 'Stocks in This Theme')}
        </h2>
        <p className="text-sm" style={{ color: '#94a3b8' }}>
          {themeStocks.length}{tf('개 종목이 실시간 주가와 목표가와 함께 분석되었습니다.', ' stocks analyzed with live prices and target projections.')}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {themeStocks.map((stock, index) => (
          <ThemeStockCard
            key={stock.ticker}
            stock={stock}
            index={index}
            isKo={isKo}
            tf={tf}
            onClick={() => onStockClick(stock.ticker)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Theme Stock Card ── */
function ThemeStockCard({
  stock,
  index,
  isKo,
  tf,
  onClick,
}: {
  stock: ReturnType<typeof useStockStore.getState>['stocks'][0];
  index: number;
  isKo: boolean;
  tf: (ko: string, en: string) => string;
  onClick: () => void;
}) {
  const override = stockDisplayData[stock.ticker];
  const currentPrice = override?.currentPrice ?? stock.currentPrice;
  const targetPrice = override?.targetPrice ?? stock.targetPrice;
  const expectedReturn = override?.expectedReturn ?? stock.expectedReturn;
  const isBeginnerFriendly = override?.isBeginnerFriendly ?? stock.isBeginnerFriendly;
  const dividendYield = override?.dividendYield ?? stock.dividendYield;
  const isUSD = stock.exchange === 'NASDAQ' || stock.exchange === 'NYSE';
  const currency = isUSD ? '$' : '\u20a9';
  const change = currentPrice - stock.previousClose;
  const changePercent = (change / stock.previousClose) * 100;
  const isUp = change >= 0;

  const fmtPrice = (price: number) => {
    if (isUSD) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toLocaleString('ko-KR');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: easeOut }}
      whileHover={{
        y: -4,
        borderColor: 'rgba(99,102,241,0.3)',
        boxShadow: '0 8px 32px rgba(99,102,241,0.1)',
      }}
      onClick={onClick}
      className="cursor-pointer rounded-xl p-4 transition-all duration-250"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(51, 65, 85, 0.4)',
      }}
    >
      {/* Top: Ticker + Exchange */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[13px] font-medium tracking-tight text-[#64748b] uppercase">
          {stock.ticker}
        </span>
        <span
          className="text-[10px] font-medium px-2 py-0.5 rounded"
          style={{ backgroundColor: '#1e293b', color: '#94a3b8' }}
        >
          {stock.exchange}
        </span>
      </div>

      {/* Company Name */}
      <div className="text-base font-semibold text-[#f1f5f9] mb-3 truncate">
        {isKo ? stock.nameKo : stock.nameEn}
      </div>

      {/* Current Price */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-mono text-[28px] font-bold leading-none text-[#f1f5f9]">
          {isUSD ? currency : ''}{fmtPrice(currentPrice)}{!isUSD ? currency : ''}
        </span>
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
          {isUp ? '+' : ''}{change.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({isUp ? '+' : ''}{changePercent.toFixed(1)}%)
        </span>
      </div>

      {/* Divider */}
      <div className="h-px w-full mb-3" style={{ backgroundColor: '#1e293b' }} />

      {/* Target + Return */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-[#64748b]">{tf('목표가', 'Target')}</span>
          <span className="font-mono text-[13px] font-medium text-[#06b6d4]">
            {isUSD ? currency : ''}{fmtPrice(targetPrice)}{!isUSD ? currency : ''}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mt-2">
        {/* Expected Return */}
        <span
          className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            backgroundColor: 'rgba(16,185,129,0.12)',
            color: '#10b981',
            border: '1px solid rgba(16,185,129,0.3)',
          }}
        >
          +{expectedReturn}%
        </span>
        {isBeginnerFriendly && (
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'rgba(16,185,129,0.12)',
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.3)',
            }}
          >
            {tf('초보자 추천', 'Beginner Friendly')}
          </span>
        )}
        {dividendYield && (
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: 'rgba(99,102,241,0.12)',
              color: '#6366f1',
              border: '1px solid rgba(99,102,241,0.3)',
            }}
          >
            {dividendYield}% {tf('배당', 'Div')}
          </span>
        )}
      </div>

      {/* Why Buy */}
      {override && (
        <div className="mt-3 text-[12px] leading-relaxed line-clamp-2" style={{ color: '#64748b' }}>
          {isKo ? override.whyBuyKo : override.whyBuyEn}
        </div>
      )}

      {/* Bottom link */}
      <div className="mt-3 flex items-center gap-1 text-[12px] font-medium" style={{ color: '#06b6d4' }}>
        <span>{tf('심층 분석', 'Deep Dive')}</span>
        <ChevronRight size={12} />
      </div>
    </motion.div>
  );
}

/* ── VIP Download Bar ── */
function VIPDownloadBar({ onDownload, isKo, tf }: { onDownload: () => void; isKo: boolean; tf: (ko: string, en: string) => string }) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200, delay: 0.8 }}
      className="fixed bottom-0 left-0 right-0 z-[45] lg:left-[260px]"
      style={{
        background: 'linear-gradient(to top, #0f172a, rgba(2,6,23,0.95))',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid #334155',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-[#f1f5f9]">
            {tf('VIP 마스터 리포트', 'VIP Master Report')}
          </h4>
          <p className="text-[11px]" style={{ color: '#64748b' }}>
            {tf('완전한 분석을 HTML로 다운로드', 'Download the complete analysis as HTML')}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, filter: 'brightness(1.1)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onDownload}
          className="flex items-center gap-2 h-12 px-7 rounded-xl text-sm font-semibold text-white transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            boxShadow: '0 4px 24px rgba(99,102,241,0.3)',
          }}
        >
          <Download size={16} />
          <span>{tf('VIP 리포트 다운로드', 'Download VIP Report')}</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
