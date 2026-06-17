/**
 * AI Insight Stock Dashboard - Express Backend Server
 * =====================================================
 * Features:
 * - /api/stock/:ticker  -> Yahoo Finance 실시간 주가
 * - /api/stock/batch    -> 여러 종목 한 번에 조회
 * - /api/gemini         -> Gemini AI 분석 프록시
 * - /api/market/indices -> KOSPI, NASDAQ, S&P500 지수
 * - 정적 파일 서빙      -> dist/ 폴드 (프론트엔드)
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Yahoo Finance v10 API (묣별 인증 필요)
const app = express();
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 미들웨어
app.use(cors());
app.use(express.json());

// ───────────────────────────────────────────────
// Yahoo Finance API 헬퍼
// ───────────────────────────────────────────────

// 티커 매핑: 우리 코드 -> Yahoo Finance
function mapToYahooTicker(ticker: string): string {
  // 한국 종목코드 매핑
  const koreaMap: Record<string, string> = {
    // KRX/KOSDAQ 종목
    '005380.KS': '005380.KS',   // 현대차
    '267260.KS': '267260.KS',   // HD현대일렉트릭
    '017670.KS': '017670.KS',   // SK텔레콤
    '207940.KS': '207940.KS',   // 삼성바이오로직스
    '178320.KQ': '178320.KQ',   // 케이엔솔 (KOSDAQ)
    '083450.KQ': '083450.KQ',   // GST (KOSDAQ)
    '208050.KQ': '208050.KQ',   // 서진시스템 (KOSDAQ)
    '078340.KQ': '078340.KQ',   // 레인보우로보틱스 (KOSDAQ)
    // 미국 종목
    'IBM': 'IBM',
    'IONQ': 'IONQ',
    'QCOM': 'QCOM',
    'LLY': 'LLY',
    'NVO': 'NVO',
  };

  return koreaMap[ticker] || ticker;
}

// Yahoo Finance API 직접 호출 (v10, 묣별 인증)
async function fetchYahooFinance(ticker: string) {
  const yahooTicker = mapToYahooTicker(ticker);

  try {
    // Yahoo Finance v10 chart API (묣별 인증으로 데이터 수신)
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooTicker}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return { error: `Yahoo Finance API error: ${response.status}`, ticker };
    }

    const data = await response.json();

    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      return { error: 'No data available', ticker };
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];

    // 실시간 가격 (정규장 종료 후에는 afterHours 사용)
    const regularPrice = meta.regularMarketPrice;
    const previousClose = meta.previousClose || meta.chartPreviousClose;
    const change = regularPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      ticker,
      yahooTicker,
      name: meta.shortName || meta.symbol || ticker,
      currency: meta.currency,
      exchange: meta.exchangeName,
      currentPrice: regularPrice,
      previousClose: previousClose,
      change: change,
      changePercent: changePercent,
      marketHigh: meta.regularMarketDayHigh,
      marketLow: meta.regularMarketDayLow,
      marketVolume: meta.regularMarketVolume,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
      timestamp: new Date().toISOString(),
    };
  } catch (err: any) {
    return { error: err.message || 'Unknown error', ticker };
  }
}

// 지수 데이터 조회
async function fetchMarketIndex(symbol: string) {
  try {
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      }
    );
    const data = await response.json();
    const result = data.chart?.result?.[0];
    if (!result) return null;
    return {
      symbol,
      price: result.meta.regularMarketPrice,
      previousClose: result.meta.previousClose || result.meta.chartPreviousClose,
      change: result.meta.regularMarketPrice - (result.meta.previousClose || result.meta.chartPreviousClose),
      changePercent: ((result.meta.regularMarketPrice - (result.meta.previousClose || result.meta.chartPreviousClose)) / (result.meta.previousClose || result.meta.chartPreviousClose)) * 100,
    };
  } catch {
    return null;
  }
}

// ───────────────────────────────────────────────
// API Routes
// ───────────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 단일 종목 실시간 주가
app.get('/api/stock/:ticker', async (req, res) => {
  const { ticker } = req.params;
  console.log(`[API] Stock request: ${ticker}`);

  const result = await fetchYahooFinance(ticker);
  res.json(result);
});

// 배치 종목 조회
app.post('/api/stock/batch', async (req, res) => {
  const { tickers } = req.body;
  if (!Array.isArray(tickers)) {
    return res.status(400).json({ error: 'tickers must be an array' });
  }

  console.log(`[API] Batch request: ${tickers.join(', ')}`);

  // 동시에 모든 요청 실행
  const results = await Promise.all(tickers.map(t => fetchYahooFinance(t)));
  res.json(results);
});

// 시장 지수
app.get('/api/market/indices', async (_req, res) => {
  const [kospi, nasdaq, sp500] = await Promise.all([
    fetchMarketIndex('^KS11'),
    fetchMarketIndex('^IXIC'),
    fetchMarketIndex('^GSPC'),
  ]);

  res.json({
    kospi,
    nasdaq,
    sp500,
    timestamp: new Date().toISOString(),
  });
});

// Gemini AI 프록시
app.post('/api/gemini', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: message }],
          }],
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

// ───────────────────────────────────────────────
// 정적 파일 서빙 (프론트엔드)
// ───────────────────────────────────────────────

// 빌드된 프론트엔드 파일 서빙
app.use(express.static(path.join(__dirname, 'dist')));

// SPA: 모든 경로를 index.html로 리다이렉트 (Express 5 compatible)
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ───────────────────────────────────────────────
// 서버 시작
// ───────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 AI Insight Stock Server running on port ${PORT}`);
  console.log(`📊 API Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/stock/:ticker`);
  console.log(`   POST /api/stock/batch`);
  console.log(`   GET  /api/market/indices`);
  console.log(`   POST /api/gemini`);
  console.log(`🌐 Frontend: http://localhost:${PORT}/\n`);
});
