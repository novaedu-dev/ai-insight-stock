import { create } from 'zustand';

export type ThemeKey = 'power' | 'robotics' | 'quantum' | 'bio';

export interface StockData {
  ticker: string;
  nameKo: string;
  nameEn: string;
  theme: ThemeKey;
  exchange: 'KRX' | 'KOSDAQ' | 'NASDAQ' | 'NYSE';
  currentPrice: number;
  previousClose: number;
  targetPrice: number;
  expectedReturn: number;
  isBeginnerFriendly: boolean;
  tags: string[];
  entryStrategy: string[];
  upsideTriggers: string[];
  exitRiskFactors: string[];
  dividendYield?: number;
}

export interface ThemeData {
  key: ThemeKey;
  titleKo: string;
  titleEn: string;
  descriptionKo: string;
  descriptionEn: string;
  accentColor: string;
  stocks: string[];
}

export const themes: ThemeData[] = [
  {
    key: 'power',
    titleKo: 'AI 인프라·전력·냉각',
    titleEn: 'AI Infrastructure, Power & Cooling',
    descriptionKo: '데이터센터 액침냉각, 초고압 변압기, ESS는 AI 시대의 핵심 인프라입니다.',
    descriptionEn: 'Data center liquid cooling, ultra-high-voltage transformers, and ESS are the core infrastructure of the AI era.',
    accentColor: '#06b6d4',
    stocks: ['053080.KQ', '083450.KQ', '267260.KS', '178320.KQ'],
  },
  {
    key: 'robotics',
    titleKo: '온디바이스 AI·로봇·모빌리티',
    titleEn: 'On-Device AI, Robotics & Mobility',
    descriptionKo: '자율주행, 공장자동화, 온디바이스 AI 칩 — AI의 물리적 계층이 형성됩니다.',
    descriptionEn: 'Autonomous driving, factory automation, on-device AI chips — the AI physical layer is forming.',
    accentColor: '#6366f1',
    stocks: ['005380.KS', '078340.KQ', 'QCOM'],
  },
  {
    key: 'quantum',
    titleKo: '양자컴퓨팅',
    titleEn: 'Quantum Computing',
    descriptionKo: '양자 혁명이 가속화됩니다. IBM의 배당 수익부터 IONQ의 고성장까지.',
    descriptionEn: 'The quantum revolution is accelerating. From IBM dividend income to IONQ high growth.',
    accentColor: '#10b981',
    stocks: ['IBM', 'IONQ', '017670.KS'],
  },
  {
    key: 'bio',
    titleKo: '바이오·장수',
    titleEn: 'Bio Longevity',
    descriptionKo: '비만치료제, CDMO, 바이오테크가 헬스케어와 인류 장수를 재정의합니다.',
    descriptionEn: 'Obesity drugs, CDMO, and biotech are redefining healthcare and human longevity.',
    accentColor: '#f43f5e',
    stocks: ['LLY', 'NVO', '207940.KS'],
  },
];

// ============================================================
// 주가 데이터 - 기준일: 2026년 6월 17일
// 하드코딩 = 폴드백용, 실제로는 서버 API에서 실시간 데이터로 대첸됨
// ============================================================

export const stocks: StockData[] = [
  // ====== AI 인프라·전력·냉각 ======
  {
    ticker: '053080.KQ',
    nameKo: '케이엔솔',
    nameEn: 'K-ENSOL',
    theme: 'power',
    exchange: 'KOSDAQ',
    currentPrice: 11570,
    previousClose: 11660,
    targetPrice: 18000,
    expectedReturn: 55.6,
    isBeginnerFriendly: false,
    tags: ['액침냉각', '데이터센터', '소재'],
    entryStrategy: ['11,000원대 분할 매수', '1차 지지선 10,000원', '2차 지지선 9,200원'],
    upsideTriggers: ['액침냉각 대형 수주', '데이터센터 캐펙스 확대', '글로벌 빅테크 인증'],
    exitRiskFactors: ['소형주 변동성', '기술 상용화 지연', '경쟁사 특허 분쟁'],
  },
  {
    ticker: '083450.KQ',
    nameKo: 'GST',
    nameEn: 'GST',
    theme: 'power',
    exchange: 'KOSDAQ',
    currentPrice: 58400,
    previousClose: 59800,
    targetPrice: 80000,
    expectedReturn: 37.0,
    isBeginnerFriendly: true,
    tags: ['전력변환기', 'ESS', '모듈'],
    entryStrategy: ['55,000원대 분할 매수', '1차 지지선 50,000원'],
    upsideTriggers: ['ESS 대형 프로젝트 수주', '미국 ESS 시장 진출', 'AI 데이터센터 전력 수요'],
    exitRiskFactors: ['수주 공백', '원자재 가격 상승', '환율 변동성'],
  },
  {
    ticker: '267260.KS',
    nameKo: 'HD현대일렉트릭',
    nameEn: 'HD Hyundai Electric',
    theme: 'power',
    exchange: 'KRX',
    currentPrice: 344500,
    previousClose: 338000,
    targetPrice: 450000,
    expectedReturn: 30.6,
    isBeginnerFriendly: false,
    tags: ['초고압변압기', '대형주', '배당'],
    entryStrategy: ['330,000원대 분할 매수', '1차 지지선 310,000원'],
    upsideTriggers: ['미국 변압기 대형 수주', 'IRA 수혜', '초고압 제품 수출 확대'],
    exitRiskFactors: ['원/달러 환율 상승', '미국 보호무역 정책', '인걵비 상승'],
    dividendYield: 1.8,
  },
  {
    ticker: '178320.KQ',
    nameKo: '서진시스템',
    nameEn: 'Seojin System',
    theme: 'power',
    exchange: 'KOSDAQ',
    currentPrice: 74400,
    previousClose: 72800,
    targetPrice: 100000,
    expectedReturn: 34.4,
    isBeginnerFriendly: false,
    tags: ['ESS', '반도체장비', '에너지저장', 'AI인프라'],
    entryStrategy: ['70,000원대 분할 매수', '1차 지지선 65,000원', '2차 지지선 58,000원'],
    upsideTriggers: ['북미 ESS 3개 공장 가동', '플루언스 대형 수주', 'NVIDIA 800V DC 아키텍처 수요', '반도체 텍슨 부문 성장'],
    exitRiskFactors: ['소형주 변동성', '실적 부진', 'ESS 수요 둔화', 'BW 신주 발행 희석'],
  },
  // ====== 온디바이스 AI·로봇·모빌리티 ======
  {
    ticker: '005380.KS',
    nameKo: '현대차',
    nameEn: 'Hyundai Motor',
    theme: 'robotics',
    exchange: 'KRX',
    currentPrice: 618000,
    previousClose: 640000,
    targetPrice: 720000,
    expectedReturn: 16.5,
    isBeginnerFriendly: false,
    tags: ['자율주행', '로보틱스', '대형주', '배당'],
    entryStrategy: ['600,000원대 분할 매수', '1차 지지선 570,000원'],
    upsideTriggers: ['자율주행 Robotaxi 상용화', '보스턴다이낵스 시너지', '전기차 글로벌 판매 호조'],
    exitRiskFactors: ['글로벌 경기 둔화', '환율 리스크', '미국 관세 정책'],
    dividendYield: 2.2,
  },
  {
    ticker: '078340.KQ',
    nameKo: '레인보우로보틱스',
    nameEn: 'Rainbow Robotics',
    theme: 'robotics',
    exchange: 'KOSDAQ',
    currentPrice: 25950,
    previousClose: 26500,
    targetPrice: 40000,
    expectedReturn: 54.1,
    isBeginnerFriendly: false,
    tags: ['협동로봇', '방위산업', 'K-로봇'],
    entryStrategy: ['25,000원대 분할 매수', '1차 지지선 22,000원'],
    upsideTriggers: ['방위로봇 대형 수주', '협동로봇 해외 수출', '정부 K-로봇 정책 지원'],
    exitRiskFactors: ['소형주 변동성', '수주 불확실성', '글로벌 방위비 축소'],
  },
  {
    ticker: 'QCOM',
    nameKo: '퀄컴',
    nameEn: 'Qualcomm',
    theme: 'robotics',
    exchange: 'NASDAQ',
    currentPrice: 198.50,
    previousClose: 195.20,
    targetPrice: 240.00,
    expectedReturn: 20.9,
    isBeginnerFriendly: false,
    tags: ['온디바이스AI', '스냅드래곤', '반도체'],
    entryStrategy: ['$195 분할 매수', '1차 지지선 $180'],
    upsideTriggers: ['AI PC 칩 탑재 확대', '스마트폰 AI 기능 수요', '자동차 반도체 성장'],
    exitRiskFactors: ['반도체 사이클 둔화', '중국 수요 감소', '애플 자체 모뎀 개발'],
    dividendYield: 1.7,
  },
  // ====== 양자컴퓨팅 ======
  {
    ticker: 'IBM',
    nameKo: 'IBM',
    nameEn: 'IBM',
    theme: 'quantum',
    exchange: 'NYSE',
    currentPrice: 271.00,
    previousClose: 268.50,
    targetPrice: 310.00,
    expectedReturn: 14.4,
    isBeginnerFriendly: false,
    tags: ['양자컴퓨팅', '큐러스', '배당', '우량주'],
    entryStrategy: ['$268 분할 매수', '1차 지지선 $250'],
    upsideTriggers: ['양자컴퓨팅 상용화 로드맵', '큐러스 수요 급증', 'AI+양자 융합 기술'],
    exitRiskFactors: ['매출 성장 둔화', '양자 사업 적자 지속', '구조조정 리스크'],
    dividendYield: 3.0,
  },
  {
    ticker: 'IONQ',
    nameKo: '아이온큐',
    nameEn: 'IonQ',
    theme: 'quantum',
    exchange: 'NYSE',
    currentPrice: 56.00,
    previousClose: 61.20,
    targetPrice: 85.00,
    expectedReturn: 51.8,
    isBeginnerFriendly: false,
    tags: ['순수양자플레이', '성장주', '양자컴퓨팅'],
    entryStrategy: ['$55 분할 매수', '1차 지지선 $45'],
    upsideTriggers: ['양자 우위 달성', '큰손 정부·군 계약', '양자 알고리즘 상용화'],
    exitRiskFactors: ['기술적 실패', '현금 소진', '실적 부재로 주가 급락'],
  },
  {
    ticker: '017670.KS',
    nameKo: 'SK텔레콤',
    nameEn: 'SK Telecom',
    theme: 'quantum',
    exchange: 'KRX',
    currentPrice: 52300,
    previousClose: 51800,
    targetPrice: 62000,
    expectedReturn: 18.5,
    isBeginnerFriendly: true,
    tags: ['양자암호통신', 'AI데이터센터', '배당', '통신'],
    entryStrategy: ['51,000원대 분할 매수', '1차 지지선 48,000원'],
    upsideTriggers: ['양자암호통신 상용화', 'AI 데이터센터 투자 확대', '6G 기술 선점'],
    exitRiskFactors: ['이통업 규제 강화', '양자 사업 수익화 지연', '5G 투자 회수 지연'],
    dividendYield: 3.8,
  },
  // ====== 바이오·장수 ======
  {
    ticker: 'LLY',
    nameKo: '일라이릴리',
    nameEn: 'Eli Lilly',
    theme: 'bio',
    exchange: 'NYSE',
    currentPrice: 978.50,
    previousClose: 965.00,
    targetPrice: 1150.00,
    expectedReturn: 17.5,
    isBeginnerFriendly: false,
    tags: ['비만치료제', '제피바운드', '대형제약'],
    entryStrategy: ['$960 분할 매수', '1차 지지선 $880'],
    upsideTriggers: ['제피바운드 매출 급증', '신규适응증 확대', '공급 확대로 매출 가속'],
    exitRiskFactors: ['FDA 승인 지연', '가격 규제 압력', '공급 부족 해소 후 성장 둔화'],
    dividendYield: 0.5,
  },
  {
    ticker: 'NVO',
    nameKo: '노볼노디스크',
    nameEn: 'Novo Nordisk',
    theme: 'bio',
    exchange: 'NYSE',
    currentPrice: 78.50,
    previousClose: 77.00,
    targetPrice: 98.00,
    expectedReturn: 24.8,
    isBeginnerFriendly: false,
    tags: ['비만치료제', '위고비', '오젬픽', '제약'],
    entryStrategy: ['$76 분할 매수', '1차 지지선 $68'],
    upsideTriggers: ['위고비·오젬픽 매출 확대', 'CagriSema 승인 기대', '비만 시장 확대'],
    exitRiskFactors: ['유럽 가격 규제', '미국 의회 약가 압박', '경쟁 심화'],
    dividendYield: 1.6,
  },
  {
    ticker: '207940.KS',
    nameKo: '삼성바이오로직스',
    nameEn: 'Samsung Biologics',
    theme: 'bio',
    exchange: 'KRX',
    currentPrice: 856000,
    previousClose: 840000,
    targetPrice: 1000000,
    expectedReturn: 16.8,
    isBeginnerFriendly: false,
    tags: ['CDMO', '바이오대장주', '바이오시밀러'],
    entryStrategy: ['840,000원대 분할 매수', '1차 지지선 780,000원'],
    upsideTriggers: ['대형 CDMO 계약 체결', '5공장 가동', '글로벌 바이오 수주 확대'],
    exitRiskFactors: ['FDA 제재 리스크', '원/달러 환율 하락', '경쟁사 공격적 투자'],
    dividendYield: 0.3,
  },
];

interface StockState {
  stocks: StockData[];
  themes: ThemeData[];
  getStocksByTheme: (theme: ThemeKey) => StockData[];
  getStockByTicker: (ticker: string) => StockData | undefined;
}

export const useStockStore = create<StockState>((_set, _get) => ({
  stocks,
  themes,
  getStocksByTheme: (theme) => stocks.filter((s) => s.theme === theme),
  getStockByTicker: (ticker) => stocks.find((s) => s.ticker === ticker),
}));
