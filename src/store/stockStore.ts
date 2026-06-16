import { create } from 'zustand';

export type ThemeKey = 'power' | 'robotics' | 'quantum' | 'bio';

export interface StockData {
  ticker: string;
  nameKo: string;
  nameEn: string;
  theme: ThemeKey;
  exchange: 'KRX' | 'NASDAQ' | 'NYSE';
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
  stocks: string[]; // ticker symbols
}

export const themes: ThemeData[] = [
  {
    key: 'power',
    titleKo: 'AI 인프라·전력',
    titleEn: 'AI Infrastructure & Power',
    descriptionKo: '액침냉각, 초고압 변압기, ESS는 AI 데이터센터의 생명선입니다.',
    descriptionEn: 'Liquid cooling, ultra-high-voltage transformers, and ESS are the lifelines of AI data centers.',
    accentColor: '#06b6d4',
    stocks: ['KEnSol', 'GST', '267260.KS', '208050.KS'],
  },
  {
    key: 'robotics',
    titleKo: '온디바이스 AI·로봇',
    titleEn: 'On-Device AI & Robotics',
    descriptionKo: '자율주행에서 공장자동화까지, AI 물리적 계층이 형성되고 있습니다.',
    descriptionEn: 'From autonomous driving to factory automation, the AI physical layer is forming.',
    accentColor: '#6366f1',
    stocks: ['005380.KS', 'RBOT', 'QCOM'],
  },
  {
    key: 'quantum',
    titleKo: '양자컴퓨팅',
    titleEn: 'Quantum Computing',
    descriptionKo: '양자 혁명이 가속화됩니다. IBM의 배당부터 IONQ의 순수 성장주까지.',
    descriptionEn: 'The quantum revolution is accelerating. From IBM\'s dividends to pure-play growth in IONQ.',
    accentColor: '#10b981',
    stocks: ['IBM', 'IONQ', '017670.KS'],
  },
  {
    key: 'bio',
    titleKo: '바이오·장수',
    titleEn: 'Bio Longevity',
    descriptionKo: '비만치료제, CDMO, 바이오테크가 헬스케어와 장수를 재정의합니다.',
    descriptionEn: 'Obesity drugs, CDMO, and biotech are redefining healthcare and longevity.',
    accentColor: '#f43f5e',
    stocks: ['LLY', 'NVO', '207940.KS'],
  },
];

export const stocks: StockData[] = [
  // Power Theme
  {
    ticker: 'KEnSol',
    nameKo: '케이엔솔',
    nameEn: 'KEnSol',
    theme: 'power',
    exchange: 'KRX',
    currentPrice: 33300,
    previousClose: 32500,
    targetPrice: 45000,
    expectedReturn: 35,
    isBeginnerFriendly: true,
    tags: ['초전도체', '전력인프라'],
    entryStrategy: ['33,000원대 분할 매수', '1차 지지선 30,000원', '2차 지지선 27,500원'],
    upsideTriggers: ['초전도체 상용화 발표', '국내 ESS 대형 계약'],
    exitRiskFactors: ['원자재 가격 급등', '기술 상용화 지연'],
  },
  {
    ticker: 'GST',
    nameKo: 'GST',
    nameEn: 'GST',
    theme: 'power',
    exchange: 'KRX',
    currentPrice: 29700,
    previousClose: 30200,
    targetPrice: 38000,
    expectedReturn: 28,
    isBeginnerFriendly: true,
    tags: ['전력변환기', '데이터센터'],
    entryStrategy: ['29,000원대 분할 매수', '1차 지지선 26,000원'],
    upsideTriggers: ['데이터센터 대형 수주', '해외 시장 진출'],
    exitRiskFactors: ['수주 공백', '경쟁사 가격 압박'],
  },
  {
    ticker: '267260.KS',
    nameKo: 'HD현대일렉트릭',
    nameEn: 'HD Hyundai Electric',
    theme: 'power',
    exchange: 'KRX',
    currentPrice: 344500,
    previousClose: 338000,
    targetPrice: 420000,
    expectedReturn: 22,
    isBeginnerFriendly: false,
    tags: ['초고압변압기', '대형주'],
    entryStrategy: ['340,000원대 분할 매수', '1차 지지선 310,000원'],
    upsideTriggers: ['미국 변압기 수출 확대', '초고압 제품 라인업 확대'],
    exitRiskFactors: ['원/달러 환율 상승', '미국 보호무역 정책'],
    dividendYield: 1.2,
  },
  {
    ticker: '208050.KS',
    nameKo: '서진시스템',
    nameEn: 'Seojin System',
    theme: 'power',
    exchange: 'KRX',
    currentPrice: 44300,
    previousClose: 42800,
    targetPrice: 62000,
    expectedReturn: 40,
    isBeginnerFriendly: true,
    tags: ['액침냉각', '소형주'],
    entryStrategy: ['43,000원대 분할 매수', '1차 지지선 38,000원'],
    upsideTriggers: ['액침냉각 특허 승인', '데이터센터 탑재 계약'],
    exitRiskFactors: ['소형주 변동성', '기술 검증 지연'],
  },
  // Robotics Theme
  {
    ticker: '005380.KS',
    nameKo: '현대차',
    nameEn: 'Hyundai Motor',
    theme: 'robotics',
    exchange: 'KRX',
    currentPrice: 271000,
    previousClose: 265000,
    targetPrice: 320000,
    expectedReturn: 18,
    isBeginnerFriendly: false,
    tags: ['자율주행', '로보틱스', '대형주'],
    entryStrategy: ['270,000원대 분할 매수', '1차 지지선 250,000원'],
    upsideTriggers: ['자율주행 상용화', '보스턴다이내믹스 시너지'],
    exitRiskFactors: ['글로벌 판매 부진', '환율 리스크'],
    dividendYield: 2.1,
  },
  {
    ticker: 'RBOT',
    nameKo: '레인보우로보틱스',
    nameEn: 'Rainbow Robotics',
    theme: 'robotics',
    exchange: 'KRX',
    currentPrice: 58600,
    previousClose: 56200,
    targetPrice: 85000,
    expectedReturn: 45,
    isBeginnerFriendly: false,
    tags: ['협동로봇', '방위산업'],
    entryStrategy: ['57,000원대 분할 매수', '1차 지지선 50,000원'],
    upsideTriggers: ['방위로봇 대형 수주', '협동로봇 해외 수출'],
    exitRiskFactors: ['소형주 변동성', '수주 불확실성'],
  },
  {
    ticker: 'QCOM',
    nameKo: '퀄컴',
    nameEn: 'Qualcomm',
    theme: 'robotics',
    exchange: 'NASDAQ',
    currentPrice: 198.5,
    previousClose: 195.2,
    targetPrice: 235.0,
    expectedReturn: 18,
    isBeginnerFriendly: false,
    tags: ['온디바이스AI', '반도체'],
    entryStrategy: ['$195 분할 매수', '1차 지지선 $180'],
    upsideTriggers: ['AI PC 칩 탑재 확대', '스마트폰 AI 기능 수요'],
    exitRiskFactors: ['반도체 사이클 둔화', '중국 수요 감소'],
    dividendYield: 1.8,
  },
  // Quantum Theme
  {
    ticker: 'IBM',
    nameKo: 'IBM',
    nameEn: 'IBM',
    theme: 'quantum',
    exchange: 'NYSE',
    currentPrice: 228.4,
    previousClose: 226.8,
    targetPrice: 260.0,
    expectedReturn: 14,
    isBeginnerFriendly: false,
    tags: ['양자컴퓨팅', '배당주'],
    entryStrategy: ['$225 분할 매수', '1차 지지선 $210'],
    upsideTriggers: ['양자컴퓨팅 상용화 로드맵', '큐러스 수요 증가'],
    exitRiskFactors: ['매출 성정 둔화', '양자 사업 적자 지속'],
    dividendYield: 3.2,
  },
  {
    ticker: 'IONQ',
    nameKo: '아이온큐',
    nameEn: 'IonQ',
    theme: 'quantum',
    exchange: 'NYSE',
    currentPrice: 32.5,
    previousClose: 31.2,
    targetPrice: 52.0,
    expectedReturn: 60,
    isBeginnerFriendly: false,
    tags: ['순수양자플레이', '성장주'],
    entryStrategy: ['$31 분할 매수', '1차 지지선 $26'],
    upsideTriggers: ['양자 우위 달성', '큰손 계약 체결'],
    exitRiskFactors: ['기술적 실패', '현금 소진'],
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
    expectedReturn: 19,
    isBeginnerFriendly: true,
    tags: ['양자암호통신', '배당주'],
    entryStrategy: ['51,000원대 분할 매수', '1차 지지선 48,000원'],
    upsideTriggers: ['양자암호통신 상용화', 'AI 데이터센터 투자'],
    exitRiskFactors: ['이통업 규제 강화', '양자 사업 수익화 지연'],
    dividendYield: 4.1,
  },
  // Bio Theme
  {
    ticker: 'LLY',
    nameKo: '일라이릴리',
    nameEn: 'Eli Lilly',
    theme: 'bio',
    exchange: 'NYSE',
    currentPrice: 842.3,
    previousClose: 838.5,
    targetPrice: 1050.0,
    expectedReturn: 25,
    isBeginnerFriendly: false,
    tags: ['비만치료제', '대형제약'],
    entryStrategy: ['$835 분할 매수', '1차 지지선 $780'],
    upsideTriggers: ['비만치료제 매출 급증', '신약 승인'],
    exitRiskFactors: ['FDA 승인 지연', '가격 규제 압력'],
    dividendYield: 0.7,
  },
  {
    ticker: 'NVO',
    nameKo: '노보노디스크',
    nameEn: 'Novo Nordisk',
    theme: 'bio',
    exchange: 'NYSE',
    currentPrice: 68.4,
    previousClose: 67.2,
    targetPrice: 88.0,
    expectedReturn: 29,
    isBeginnerFriendly: false,
    tags: ['비만치료제', '위고비'],
    entryStrategy: ['$67 분할 매수', '1차 지지선 $60'],
    upsideTriggers: ['위고비 매출 확대', 'CagriSema 승인'],
    exitRiskFactors: ['유럽 가격 규제', '미국 의회 압박'],
    dividendYield: 1.9,
  },
  {
    ticker: '207940.KS',
    nameKo: '삼성바이오로직스',
    nameEn: 'Samsung Biologics',
    theme: 'bio',
    exchange: 'KRX',
    currentPrice: 789000,
    previousClose: 775000,
    targetPrice: 920000,
    expectedReturn: 17,
    isBeginnerFriendly: false,
    tags: ['CDMO', '바이오대장주'],
    entryStrategy: ['780,000원대 분할 매수', '1차 지지선 720,000원'],
    upsideTriggers: ['대형 CDMO 계약', '5공장 가동'],
    exitRiskFactors: ['FDA 제재', '원/달러 환율 하락'],
    dividendYield: 0.3,
  },
];

interface StockState {
  stocks: StockData[];
  themes: ThemeData[];
  getStocksByTheme: (theme: ThemeKey) => StockData[];
  getStockByTicker: (ticker: string) => StockData | undefined;
}

export const useStockStore = create<StockState>((set, get) => ({
  stocks,
  themes,
  getStocksByTheme: (theme) => stocks.filter((s) => s.theme === theme),
  getStockByTicker: (ticker) => stocks.find((s) => s.ticker === ticker),
}));
