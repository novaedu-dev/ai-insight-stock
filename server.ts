/**
 * AI Insight Stock Dashboard - Express Backend Server
 * =====================================================
 * 실시간 주가 캐싱 + 인포스탁 스타일 API + 정부정책 테마예측
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// ───────────────────────────────────────────────
// 종목 데이터베이스 (정부정책 테마 분류 포함)
// ───────────────────────────────────────────────

interface StockInfo {
  ticker: string;
  yahooTicker: string;
  nameKo: string;
  nameEn: string;
  theme: string;
  sector: string;
  exchange: string;
  googleUrl: string;
  beginnerFriendly: boolean;
  dividendYield?: number;
  policyDrivers: string[]; // 정부정책 촉매요인
}

const STOCKS: StockInfo[] = [
  {
    ticker: '053080', yahooTicker: '053080.KQ', nameKo: '케이엔솔', nameEn: 'K-ENSOL',
    theme: 'AI인프라·전력·냉각', sector: '액침냉각/소재', exchange: 'KOSDAQ',
    googleUrl: 'https://www.google.com/finance/quote/053080:KOSDAQ',
    beginnerFriendly: false, policyDrivers: ['K-반도체 특화단지', 'AI 데이터센터 캐펙스 확대', '액침냉각 의무화 검토'],
  },
  {
    ticker: '083450', yahooTicker: '083450.KQ', nameKo: 'GST', nameEn: 'GST',
    theme: 'AI인프라·전력·냉각', sector: '전력변환기/ESS', exchange: 'KOSDAQ',
    googleUrl: 'https://www.google.com/finance/quote/083450:KOSDAQ',
    beginnerFriendly: true, policyDrivers: ['재생에너지 3020 정책', 'ESS 의무설치 확대', '그린뉴드얼 인프라 투자'],
  },
  {
    ticker: '267260', yahooTicker: '267260.KS', nameKo: 'HD현대일렉트릭', nameEn: 'HD Hyundai Electric',
    theme: 'AI인프라·전력·냉각', sector: '초고압변압기', exchange: 'KRX',
    googleUrl: 'https://www.google.com/finance/quote/267260:KRX',
    beginnerFriendly: false, dividendYield: 1.8, policyDrivers: ['미국 IRA 수혜', '전력망 현대화 사업', '초고압변압기 수출 확대'],
  },
  {
    ticker: '178320', yahooTicker: '178320.KQ', nameKo: '서진시스템', nameEn: 'Seojin System',
    theme: 'AI인프라·전력·냉각', sector: '반도체장비/ESS', exchange: 'KOSDAQ',
    googleUrl: 'https://www.google.com/finance/quote/178320:KOSDAQ',
    beginnerFriendly: false, policyDrivers: ['K-반도체 특화단지', '2차전지·ESS 산업육성', '디스플레이 장비 국산화'],
  },
  {
    ticker: '005380', yahooTicker: '005380.KS', nameKo: '현대차', nameEn: 'Hyundai Motor',
    theme: '온디바이스AI·로봇·모빌리티', sector: '자율주행/전기차', exchange: 'KRX',
    googleUrl: 'https://www.google.com/finance/quote/005380:KRX',
    beginnerFriendly: false, dividendYield: 2.2, policyDrivers: ['K-모빌리티 수출 확대', '로보틱스 산업 육성', '자율주행 상용화 로드맵'],
  },
  {
    ticker: '277810', yahooTicker: '277810.KQ', nameKo: '레인보우로보틱스', nameEn: 'Rainbow Robotics',
    theme: '온디바이스AI·로봇·모빌리티', sector: '협동로봇/방위', exchange: 'KOSDAQ',
    googleUrl: 'https://www.google.com/finance/quote/277810:KOSDAQ',
    beginnerFriendly: false, policyDrivers: ['K-로봇 종합발전계획', '방위산업 수출 지원', '스마트제조혁신 사업'],
  },
  {
    ticker: 'QCOM', yahooTicker: 'QCOM', nameKo: '퀄컴', nameEn: 'Qualcomm',
    theme: '온디바이스AI·로봇·모빌리티', sector: '온디바이스AI/반도체', exchange: 'NASDAQ',
    googleUrl: 'https://www.google.com/finance/quote/QCOM:NASDAQ',
    beginnerFriendly: false, dividendYield: 1.7, policyDrivers: ['미국 CHIPS법 수혜', 'AI PC 수요 확대', '자동차 반도체 성장'],
  },
  {
    ticker: 'IBM', yahooTicker: 'IBM', nameKo: 'IBM', nameEn: 'IBM',
    theme: '양자컴퓨팅', sector: '양자컴퓨팅/큐러스', exchange: 'NYSE',
    googleUrl: 'https://www.google.com/finance/quote/IBM:NYSE',
    beginnerFriendly: false, dividendYield: 3.0, policyDrivers: ['양자컴퓨팅 R&D 투자 확대', 'K-퀀텀 얼라이스 구축', '공공 클라우드 전환'],
  },
  {
    ticker: 'IONQ', yahooTicker: 'IONQ', nameKo: '아이온큐', nameEn: 'IonQ',
    theme: '양자컴퓨팅', sector: '순수양자플레이', exchange: 'NYSE',
    googleUrl: 'https://www.google.com/finance/quote/IONQ:NYSE',
    beginnerFriendly: false, policyDrivers: ['양자컴퓨팅 상용화 로드맵', '미국 NQI 법안', '국방 양통신망 구축'],
  },
  {
    ticker: '017670', yahooTicker: '017670.KS', nameKo: 'SK텔레콤', nameEn: 'SK Telecom',
    theme: '양자컴퓨팅', sector: '양자암호통신/AI', exchange: 'KRX',
    googleUrl: 'https://www.google.com/finance/quote/017670:KRX',
    beginnerFriendly: true, dividendYield: 3.8, policyDrivers: ['양자암호통신 상용화', 'AI 데이터센터 투자', '6G 선점 전략'],
  },
  {
    ticker: 'LLY', yahooTicker: 'LLY', nameKo: '일라이릴리', nameEn: 'Eli Lilly',
    theme: '바이오·장수', sector: '비만치료제', exchange: 'NYSE',
    googleUrl: 'https://www.google.com/finance/quote/LLY:NYSE',
    beginnerFriendly: false, dividendYield: 0.5, policyDrivers: ['비만치료제 건강보험 급여 검토', 'K-바이오 수출 확대', '바이오 클러스터 지원'],
  },
  {
    ticker: 'NVO', yahooTicker: 'NVO', nameKo: '노볼노디스크', nameEn: 'Novo Nordisk',
    theme: '바이오·장수', sector: '비만치료제', exchange: 'NYSE',
    googleUrl: 'https://www.google.com/finance/quote/NVO:NYSE',
    beginnerFriendly: false, dividendYield: 1.6, policyDrivers: ['비만 관리 정부사업 확대', 'K-바이오 글로벌 확장', 'CDMO 산업 육성'],
  },
  {
    ticker: '207940', yahooTicker: '207940.KS', nameKo: '삼성바이오로직스', nameEn: 'Samsung Biologics',
    theme: '바이오·장수', sector: 'CDMO/바이오대장주', exchange: 'KRX',
    googleUrl: 'https://www.google.com/finance/quote/207940:KRX',
    beginnerFriendly: false, dividendYield: 0.3, policyDrivers: ['K-바이오 수출 200억달러 목표', '송도 바이오 클러스터', 'CDMO 산업경쟁력 강화'],
  },
];

// 테마별 그룹화
const THEMES = [
  { key: 'power', name: 'AI인프라·전력·냉각', icon: 'zap', color: '#06b6d4' },
  { key: 'robotics', name: '온디바이스AI·로봇·모빌리티', icon: 'cpu', color: '#6366f1' },
  { key: 'quantum', name: '양자컴퓨팅', icon: 'atom', color: '#10b981' },
  { key: 'bio', name: '바이오·장수', icon: 'dna', color: '#f43f5e' },
];

// ───────────────────────────────────────────────
// 정부정책 기반 테마 예측 데이터
// ───────────────────────────────────────────────

const POLICY_PREDICTIONS = [
  {
    year: 2025,
    theme: 'K-반도체 특화단지',
    policies: ['용인 반도체 클러스터 622조 투자', '반도체 특별법 통과', '파운드리 R&D 세액공제 25%'],
    beneficiaries: ['케이엔솔', '서진시스템', '삼성바이오로직스'],
    impact: 'high',
  },
  {
    year: 2025,
    theme: 'AI 데이터센터 인프라',
    policies: ['AI 데이터센터 전력인프라 확충', '재생에너지 3020 정책', 'ESS 의무설치 확대'],
    beneficiaries: ['GST', 'HD현대일렉트릭', '서진시스템'],
    impact: 'high',
  },
  {
    year: 2026,
    theme: 'K-로봇·모빌리티',
    policies: ['로봇 종합발전계획 2026', '자율주행 L4 상용화', '로보틱스 R&D 2조 투자'],
    beneficiaries: ['현대차', '레인보우로보틱스'],
    impact: 'high',
  },
  {
    year: 2026,
    theme: 'K-퀀텀 얼라이스',
    policies: ['양자컴퓨팅 5개년 R&D 1조', '양자암호통신 상용화', '국방 양통신망 구축'],
    beneficiaries: ['SK텔레콤', 'IBM', '아이온큐'],
    impact: 'medium',
  },
  {
    year: 2027,
    theme: 'K-바이오 글로벌 확장',
    policies: ['바이오 수출 200억달러 목표', '비만치료제 건강보험 급여', 'CDMO 클러스터 2개 추가'],
    beneficiaries: ['삼성바이오로직스', '일라이릴리', '노볼노디스크'],
    impact: 'high',
  },
  {
    year: 2027,
    theme: '그린에너지 전환',
    policies: ['태양광 ESS 의무설치 상업용 확대', '그린뉴드얼 2.0', '수소경제 활성화'],
    beneficiaries: ['GST', 'HD현대일렉트릭', '현대차'],
    impact: 'medium',
  },
];

// ───────────────────────────────────────────────
// 실시간 주가 캐싱 시스템
// ───────────────────────────────────────────────

interface CachedPrice {
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  name: string;
  timestamp: number;
}

const priceCache: Map<string, CachedPrice> = new Map();
let lastCacheUpdate = 0;

async function fetchYahooPrice(yahooTicker: string): Promise<CachedPrice | null> {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      }
    );
    if (!response.ok) return null;

    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const prev = meta.previousClose || meta.chartPreviousClose;

    return {
      currentPrice: price,
      previousClose: prev,
      change: price - prev,
      changePercent: ((price - prev) / prev) * 100,
      currency: meta.currency || 'KRW',
      name: meta.shortName || yahooTicker,
      timestamp: Date.now(),
    };
  } catch {
    return null;
  }
}

async function updateAllPrices() {
  console.log(`[${new Date().toISOString()}] Updating all prices...`);
  const promises = STOCKS.map(async (stock) => {
    const price = await fetchYahooPrice(stock.yahooTicker);
    if (price) {
      priceCache.set(stock.ticker, price);
    }
  });
  await Promise.all(promises);
  lastCacheUpdate = Date.now();
  console.log(`[${new Date().toISOString()}] Prices updated for ${priceCache.size}/${STOCKS.length} stocks`);
}

// 10초마다 전체 종목 갱신
setInterval(updateAllPrices, 10000);
// 최초 1회 즉시 실행
setTimeout(updateAllPrices, 1000);

// ───────────────────────────────────────────────
// API Routes
// ───────────────────────────────────────────────

// 모든 종목 실시간 데이터 (한 번에)
app.get('/api/stocks/all', (_req, res) => {
  const result = STOCKS.map(stock => {
    const cached = priceCache.get(stock.ticker);
    return {
      ...stock,
      realTime: cached || null,
      isLive: !!cached,
    };
  });
  res.json({
    stocks: result,
    themes: THEMES,
    lastUpdate: lastCacheUpdate,
    count: priceCache.size,
  });
});

// 단일 종목
app.get('/api/stock/:ticker', (req, res) => {
  const stock = STOCKS.find(s => s.ticker === req.params.ticker);
  if (!stock) return res.status(404).json({ error: 'Stock not found' });

  const cached = priceCache.get(stock.ticker);
  res.json({
    ...stock,
    realTime: cached || null,
    isLive: !!cached,
  });
});

// 테마별 종목
app.get('/api/theme/:themeKey', (req, res) => {
  const theme = THEMES.find(t => t.key === req.params.themeKey);
  if (!theme) return res.status(404).json({ error: 'Theme not found' });

  const stocks = STOCKS.filter(s => s.theme === theme.name).map(stock => {
    const cached = priceCache.get(stock.ticker);
    return { ...stock, realTime: cached || null, isLive: !!cached };
  });

  res.json({ theme, stocks });
});

// 정부정책 테마예측
app.get('/api/policy-predictions', (_req, res) => {
  res.json({
    predictions: POLICY_PREDICTIONS,
    summary: {
      totalPolicies: POLICY_PREDICTIONS.reduce((acc, p) => acc + p.policies.length, 0),
      highImpactThemes: POLICY_PREDICTIONS.filter(p => p.impact === 'high').length,
      affectedStocks: [...new Set(POLICY_PREDICTIONS.flatMap(p => p.beneficiaries))].length,
    },
  });
});

// 시장 지수
app.get('/api/market/indices', async (_req, res) => {
  try {
    const [kospiData, nasdaqData, sp500Data] = await Promise.all([
      fetchYahooPrice('^KS11'),
      fetchYahooPrice('^IXIC'),
      fetchYahooPrice('^GSPC'),
    ]);

    res.json({
      kospi: kospiData ? { name: 'KOSPI', price: kospiData.currentPrice, change: kospiData.change, changePercent: kospiData.changePercent } : null,
      nasdaq: nasdaqData ? { name: 'NASDAQ', price: nasdaqData.currentPrice, change: nasdaqData.change, changePercent: nasdaqData.changePercent } : null,
      sp500: sp500Data ? { name: 'S&P500', price: sp500Data.currentPrice, change: sp500Data.change, changePercent: sp500Data.changePercent } : null,
      timestamp: Date.now(),
    });
  } catch {
    res.json({ kospi: null, nasdaq: null, sp500: null });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    cachedStocks: priceCache.size,
    totalStocks: STOCKS.length,
    lastUpdate: new Date(lastCacheUpdate).toISOString(),
  });
});

// Gemini AI
app.post('/api/gemini', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: message }] }],
          systemInstruction: {
            parts: [{ text: '당신은 20년 경력의 프리미엄 주식 애널리스트입니다. 한국어로 답변하며, 진입 전략, 상승 트리거, 리스크를 구체적으로 제시합니다.' }],
          },
        }),
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 정적 파일
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 AI Insight Stock Server running on port ${PORT}`);
  console.log(`📊 /api/stocks/all - 모든 종목 실시간 데이터`);
  console.log(`🔮 /api/policy-predictions - 정부정책 테마예측`);
  console.log(`⏱️  10초마다 자동 캐싱\n`);
});
