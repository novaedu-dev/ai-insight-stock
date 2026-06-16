import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Database, GitBranch, ShieldCheck, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useLanguageStore } from '@/store/languageStore';

/* ─── Types ─── */
interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

/* ─── Mock AI Response Generator ─── */
function generateMockResponse(query: string, lang: string): string {
  const q = query.toLowerCase();

  // Quantum computing queries
  if (q.includes('양자') || q.includes('quantum') || q.includes('ionq') || q.includes('ibm')) {
    return lang === 'KO'
      ? `## 양자컴퓨팅 투자 전망 분석

### 1. 핵심 투자 논리
양자컴퓨팅은 **2030년대를 이끌 차세대 기술 패러다임**입니다. 현재 초기 상용화 단계이며, 정부·기업·군의 투자가 급증하고 있습니다.

### 2. 주요 투자 대상

| 종목 | 거래소 | 현재가 | 배당 | 특징 |
|------|--------|--------|------|------|
| **IBM** | NYSE | $228 | 3.2% | 양자+배당·큐러스 보유 |
| **IONQ** | NYSE | $32.5 | 없음 | 순수 양자 성장주 |
| **SK텔레콤** | KRX | ₩52,300 | 4.1% | 양자암호통신+고배당 |

### 3. 진입 전략

**IBM:**
- $225 이하 분할 매수
- $210 — 1차 지지선
- 월배당 커버드콜 병행 추천

**IONQ:**
- $31 이하 분할 매수 (고위험)
- $26 — 1차 지지선
- 포트폴리오 10% 이하 관리 필수

**SK텔레콤:**
- 51,000원대 분할 매수
- 48,000원 — 1차 지지선
- 배당(4.1%) + 성장 동시 수익

### 4. 상승 트리거
- 양자 우위(Quantum Supremacy) 달성
- 정부·군 대형 계약 체결
- 양자 상용화 로드맵 가속화

### 5. 리스크
- 기술적 실패 · 현금 소진 (IONQ)
- 매출 성장 둔화 (IBM)
- 이통업 규제 강화 (SKT)

> ⚠️ **면책**: 본 분석은 참고용이며 투자 권유가 아닙니다. 개별 종목 투자는 반드시 자체 판단 하에 결정하시기 바랍니다.`
      : `## Quantum Computing Investment Outlook

### 1. Core Investment Thesis
Quantum computing represents the **next-generation technology paradigm that will define the 2030s**. Currently in early commercialization with surging government and enterprise investment.

### 2. Key Investment Targets

| Stock | Exchange | Price | Dividend | Profile |
|-------|----------|-------|----------|---------|
| **IBM** | NYSE | $228 | 3.2% | Quantum + dividend, owns Cuerus |
| **IONQ** | NYSE | $32.5 | None | Pure-play quantum growth |
| **SK Telecom** | KRX | ₩52,300 | 4.1% | Quantum crypto + high yield |

### 3. Entry Strategy

**IBM:**
- Accumulate below $225
- 1st support at $210
- Consider covered calls for monthly income

**IONQ:**
- Accumulate below $31 (high risk)
- 1st support at $26
- Keep under 10% of portfolio

**SK Telecom:**
- Accumulate around ₩51,000
- 1st support at ₩48,000
- Dividend yield 4.1% + growth upside

### 4. Upside Catalysts
- Quantum supremacy achievement
- Major government/defense contracts
- Accelerated commercialization roadmap

### 5. Key Risks
- Technical failure / cash burn (IONQ)
- Revenue deceleration (IBM)
- Telecom regulation (SKT)

> ⚠️ **Disclaimer**: This analysis is for informational purposes only and not investment advice.`;
  }

  // Immersion cooling queries
  if (q.includes('액침') || q.includes('냉각') || q.includes('cooling') || q.includes('kensol')) {
    return lang === 'KO'
      ? `## 액침냉각 관련주 분석 보고서

### 1. 투자 배경
AI 데이터센터의 전력소비는 **2030년까지 연 500TWh에 달할 전망**입니다. 기존 공랭식은 한계에 도달했고, **액침냉각(Immersion Cooling)**이 차세대 표준으로 부상하고 있습니다.

### 2. 핵심 수혜 종목

**\#1 케이엔솔 (KEnSol) — 최우선 추천**
- 현재가: ₩33,200
- 목표가: ₩45,000 (+35.5%)
- 진입: 30,000–32,000원대 분할 매수
- 스탑로스: ₩28,500
- 특징: 초보자 추천, 초전도체 기술 보유

**\#2 서진시스템 (208050.KS)**
- 현재가: ₩44,300
- 목표가: ₩62,000 (+40%)
- 진입: 43,000원대
- 특징: 액침냉각 특허 보유 소형주

**\#3 HD현대일렉트릭 (267260.KS)**
- 현재가: ₩344,500
- 목표가: ₩420,000 (+22%)
- 배당률: 1.2%
- 진입: 340,000원대

### 3. 상승 트리거
1. NVIDIA·MSFT·구글 데이터센터 캐펙스 발표
2. 국내 AI 인프라 투자 확대
3. 액침냉각 기술 표준화
4. 전략적 제휴 / M&A

### 4. 리스크 요인
- 중국 냉각 제조업체 진출 (가격 경쟁)
- 2026년 데이터센터 캐펙스 사이클 하락
- 원재료(불화 액체) 가격 급등

> **결론**: 액침냉각 테마는 AI 인프라의 핵심 인프라로 **중장기 3–5년 호황이 예상**됩니다. KEnSol을 중심으로 분할 매수 전략을 추천드립니다.`
      : `## Immersion Cooling Investment Analysis

### 1. Investment Background
AI data center power consumption is projected to reach **500TWh annually by 2030**. Traditional air cooling has reached its limits, and **immersion cooling** is emerging as the next-generation standard.

### 2. Key Beneficiary Stocks

**#1 KEnSol (KEnSol) — Top Pick**
- Current: ₩33,200
- Target: ₩45,000 (+35.5%)
- Entry: ₩30,000–32,000 zone
- Stop-loss: ₩28,500
- Profile: Beginner-friendly, superconductor tech

**#2 Seojin System (208050.KS)**
- Current: ₩44,300
- Target: ₩62,000 (+40%)
- Entry: ₩43,000 zone
- Profile: Immersion cooling patents

**#3 HD Hyundai Electric (267260.KS)**
- Current: ₩344,500
- Target: ₩420,000 (+22%)
- Dividend: 1.2%

### 3. Upside Catalysts
1. Hyperscaler capex announcements (NVIDIA, MSFT, GOOGL)
2. Korean AI infrastructure expansion
3. Immersion cooling standardization
4. Strategic partnerships / M&A

### 4. Risk Factors
- Chinese cooling manufacturers (price competition)
- 2026 datacenter capex downturn
- Raw material (fluorinated fluid) price spikes

> **Conclusion**: Immersion cooling is core AI infrastructure with a **3-5 year growth runway**. Recommend accumulating KEnSol as core position.`;
  }

  // AI energy / next target queries
  if (q.includes('에너지') || q.includes('energy') || q.includes('다음 타겟') || q.includes('next target') || q.includes('진입')) {
    return lang === 'KO'
      ? `## AI 에너지 혁명 주도주 및 진입 전략

### 1. 현재 시장 상황
AI 반도체(엔비디아)가 1차 상승을 주도했다면, **AI 인프라·전력 인프라가 2차 상승을 주도**할 것입니다. 데이터센터 전력 수요 폭증으로 **전력 인프라주가 초강세**를 보이고 있습니다.

### 2. AI 에너지 주도주 TOP 5

| 순위 | 종목 | 현재가 | 목표가 | 수익률 | 특징 |
|------|------|--------|--------|--------|------|
| 1 | **KEnSol** | ₩33,200 | ₩45,000 | +35% | 초전도체·액침냉각 |
| 2 | **서진시스템** | ₩44,300 | ₩62,000 | +40% | 액침냉각 특허 |
| 3 | **HD현대일렉트릭** | ₩344,500 | ₩420,000 | +22% | 초고압변압기·배당 |
| 4 | **GST** | ₩29,700 | ₩38,000 | +28% | 전력변환기 |
| 5 | **SK텔레콤** | ₩52,300 | ₩62,000 | +19% | 양자+배당 4.1% |

### 3. 지금 진입하기 좋은 종목

**단기(1–3개월):**
- **KEnSol** — 33,000원 이하 분할 매수
  - 1차 지지선: 30,000원
  - 스탑로스: 28,500원
  - 타겟: 42,000원

**중기(3–6개월):**
- **HD현대일렉트릭** — 340,000원 이하 분할 매수
  - 배당(1.2%) 수익까지 고려 시 안정적
  - 타겟: 400,000원

**장기(6개월+):**
- **SK텔레콤** — 51,000원 이하 분할 매수
  - 배당 4.1% + 양자 성장 옵션
  - 타겟: 60,000원

### 4. 진입 체크리스트
- [ ] 데이터센터 캐펙스 발표 일정 확인
- [ ] 20일 이동평균선 근접 시 매수
- [ ] 분할 매수(3~4회에 걸쳐)
- [ ] 스탑로스 미리 설정
- [ ] 목표가 도달 시 절반 익절

> **결론**: AI 에너지 인프라는 **2027년까지 성장이 지속될 메가트렌드**입니다. 분할 매수로 차근차근 포지션을 쌓는 전략을 추천드립니다.`
      : `## AI Energy Revolution: Leaders & Entry Strategy

### 1. Market Context
If AI semiconductors (NVIDIA) led the first wave, **AI infrastructure and power stocks will lead the second wave**. Data center power demand is surging, driving super-cycle momentum in power infrastructure.

### 2. Top 5 AI Energy Leaders

| Rank | Stock | Price | Target | Return | Profile |
|------|-------|-------|--------|--------|---------|
| 1 | **KEnSol** | ₩33,200 | ₩45,000 | +35% | Superconductor·Cooling |
| 2 | **Seojin System** | ₩44,300 | ₩62,000 | +40% | Immersion cooling patents |
| 3 | **HD Hyundai Elec.** | ₩344,500 | ₩420,000 | +22% | UHV transformer + div. |
| 4 | **GST** | ₩29,700 | ₩38,000 | +28% | Power converters |
| 5 | **SK Telecom** | ₩52,300 | ₩62,000 | +19% | Quantum + 4.1% yield |

### 3. Best Entry Points Now

**Short-term (1-3 months):**
- **KEnSol** — Accumulate below ₩33,000
  - 1st support: ₩30,000
  - Stop-loss: ₩28,500
  - Target: ₩42,000

**Medium-term (3-6 months):**
- **HD Hyundai Electric** — Below ₩340,000
  - Dividend yield 1.2% adds stability
  - Target: ₩400,000

**Long-term (6+ months):**
- **SK Telecom** — Below ₩51,000
  - 4.1% dividend + quantum growth option
  - Target: ₩60,000

### 4. Entry Checklist
- [ ] Check datacenter capex announcement schedule
- [ ] Buy near 20-day moving average
- [ ] Dollar-cost average (3-4 tranches)
- [ ] Set stop-loss in advance
- [ ] Take 50% profit at target

> **Conclusion**: AI energy infrastructure is a **mega-trend with growth runway through 2027**. Recommend accumulating positions gradually via dollar-cost averaging.`;
  }

  // Beginner-friendly queries
  if (q.includes('초보') || q.includes('beginner') || q.includes('처음')) {
    return lang === 'KO'
      ? `## 초보자 맞춤 투자 가이드

### 1. 초보자를 위한 3원칙

> **원칙 1: 분할 매수**
> 한 번에 전액 투자하지 마세요. 3~4회에 나눠서 매수하세요.
>
> **원칙 2: 스탑로스**
> 매수 전 반드시 손절가를 정하세요. (-10% 이상은 절대 미루지 마세요)
>
> **원칙 3: 목표 수익 확정**
> +20% 이상 수익 시 절반은 반드시 판매하세요.

### 2. 초보자 추천 종목 (2025년)

**🟢 안전형 (배당 + 안정)**
- **SK텔레콤** (017670.KS) — 배당 4.1%, 양자 옵션
- **HD현대일렉트릭** (267260.KS) — 배당 1.2%, 대형주 안정

**🟡 성장형 (중간 리스크)**
- **KEnSol** — 초전도체·액침냉각 테마 대장주
- **GST** — 전력변환기 데이터센터 수혜

### 3. 초보자 포트폴리오 예시 (1000만원 기준)

| 종목 | 비중 | 금액 | 특징 |
|------|------|------|------|
| SK텔레콤 | 30% | 300만원 | 안정적 배당 수익 |
| HD현대일렉트릭 | 25% | 250만원 | 대형주 안정성 |
| KEnSol | 25% | 250만원 | 성장 잠재력 |
| 현금 | 20% | 200만원 | 추가 매수 대기 |

### 4. 진입 전략
1. 매주 동일 금액 매수(코스트 에버리징)
2. 20일 이동평균선 근접 시 집중 매수
3. 실적 발표 전 1주간은 관망

> **핵심 조언**: "천천히, 꾸준히, 분산하여" — 초보자의 가장 큰 적은 조급함입니다.`
      : `## Beginner-Friendly Investment Guide

### 1. Three Golden Rules for Beginners

> **Rule 1: Dollar-Cost Averaging**
> Never invest all at once. Split purchases across 3-4 tranches.
>
> **Rule 2: Stop Loss**
> Always set a stop-loss before buying. Never hold beyond -10%.
>
> **Rule 3: Take Profits**
> Sell at least half when you hit +20% gains.

### 2. Recommended Stocks for Beginners (2025)

**🟢 Conservative (Dividend + Stability)**
- **SK Telecom** (017670.KS) — 4.1% yield, quantum option
- **HD Hyundai Electric** (267260.KS) — 1.2% yield, large-cap

**🟡 Growth (Moderate Risk)**
- **KEnSol** — Superconductor·cooling leader
- **GST** — Power converter, datacenter beneficiary

### 3. Sample Portfolio ($10,000 USD)

| Stock | Weight | Amount | Characteristic |
|-------|--------|--------|----------------|
| SK Telecom | 30% | $3,000 | Stable dividend |
| HD Hyundai Elec. | 25% | $2,500 | Large-cap stability |
| KEnSol | 25% | $2,500 | Growth potential |
| Cash | 20% | $2,000 | Dry powder for dips |

### 4. Entry Strategy
1. Buy same amount weekly (dollar-cost averaging)
2. Concentrate buys near 20-day moving average
3. Stay cautious 1 week before earnings

> **Key Advice**: "Slowly, steadily, diversified" — impatience is the beginner's worst enemy.`;
  }

  // General / default response
  return lang === 'KO'
    ? `## AI 애널리스트 분석 리포트

### 분석 요약
"${query}"에 대한 심층 분석 결과입니다.

### 1. 현재 시장 동향
현재 AI 인프라·전력·양자컴퓨팅 섹터가 주도주로 부상하고 있습니다. 데이터센터 투자 확대와 AI 수요 급증이 핵심 촉매제입니다.

### 2. 주요 추천 종목

| 종목 | 현재가 | 목표가 | 기대수익률 | 특징 |
|------|--------|--------|-----------|------|
| KEnSol | ₩33,200 | ₩45,000 | +35% | 액침냉각·초전도체 |
| HD현대일렉트릭 | ₩344,500 | ₩420,000 | +22% | 초고압변압기·배당 |
| SK텔레콤 | ₩52,300 | ₩62,000 | +19% | 양자암호·배당 4.1% |
| IBM | $228 | $260 | +14% | 양자·배당 3.2% |
| IONQ | $32.5 | $52 | +60% | 순수 양자 성장주 |

### 3. 투자 전략
- **분할 매수**: 3~4회에 나눠서 진입
- **스탑로스**: 진입가 대비 -12% 하드 스탑
- **목표 관리**: 목표가 도달 시 50% 익절, 나머지 트레일링

### 4. 주의사항
- 모든 투자는 자기 자본의 일부(20% 이하)로 진행
- 단기 변동성에 휘둘리지 않는 중장기 관점 유지
- 실적 발표·정책 변화 일정 확인

> ⚠️ **면책 조항**: 본 분석은 정보 제공 목적이며 투자 권유가 아닙니다. 투자 결정은 본인의 판단과 책임 하에 하시기 바랍니다.`
    : `## AI Analyst Report

### Executive Summary
Deep-dive analysis for "${query}".

### 1. Current Market Trends
AI infrastructure, power, and quantum computing sectors are emerging as market leaders. Data center investment expansion and surging AI demand are the key catalysts.

### 2. Top Recommendations

| Stock | Price | Target | Exp. Return | Profile |
|-------|-------|--------|-------------|---------|
| KEnSol | ₩33,200 | ₩45,000 | +35% | Immersion cooling |
| HD Hyundai Elec. | ₩344,500 | ₩420,000 | +22% | UHV transformer + div. |
| SK Telecom | ₩52,300 | ₩62,000 | +19% | Quantum + 4.1% yield |
| IBM | $228 | $260 | +14% | Quantum + 3.2% div. |
| IONQ | $32.5 | $52 | +60% | Pure quantum growth |

### 3. Investment Strategy
- **Dollar-cost average**: Split entry into 3-4 tranches
- **Stop-loss**: Hard stop at -12% from entry
- **Profit taking**: Sell 50% at target, trail the rest

### 4. Risk Notes
- Invest only a portion (under 20%) of your capital
- Maintain a medium-to-long term perspective
- Monitor earnings and policy change schedules

> ⚠️ **Disclaimer**: This analysis is for informational purposes only and not investment advice. Investment decisions are your own responsibility.`;
}

/* ─── Suggested prompts ─── */
function getSuggestedPrompts(lang: string): string[] {
  return lang === 'KO'
    ? [
        '양자컴퓨터의 다음 타겟은?',
        'AI 에너지 혁명 주도주 분석',
        '지금 진입하기 좋은 종목은?',
        '액침냉각 관련주 전망',
        '초보자에게 좋은 AI 에너지 주식',
        'IBM과 IONQ 비교해줘',
      ]
    : [
        'What are the top quantum computing stocks?',
        'Explain AI energy investment thesis',
        'Compare IBM vs IONQ for dividend vs growth',
        'When should I enter KEnSol?',
        'Best beginner-friendly AI energy stocks',
        'Next targets after AI semiconductors',
      ];
}

/* ─── Markdown Components ─── */
const markdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-lg font-bold text-[#06b6d4] mt-5 mb-3 leading-snug">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-base font-bold text-[#06b6d4] mt-4 mb-2 leading-snug">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-sm font-semibold text-[#06b6d4] mt-3 mb-2 leading-snug">{children}</h3>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="text-[#f1f5f9] font-semibold">{children}</strong>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-sm text-[#94a3b8] leading-relaxed mb-2">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="space-y-1.5 mb-3 ml-1">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="space-y-1.5 mb-3 ml-1 list-none">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="flex items-start gap-2 text-sm text-[#94a3b8]">
      <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#06b6d4]" />
      <span className="leading-relaxed">{children}</span>
    </li>
  ),
  table: ({ children }: { children?: React.ReactNode }) => (
    <div className="overflow-x-auto mb-3">
      <table className="w-full text-xs border-collapse" style={{ border: '1px solid #1e293b' }}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children }: { children?: React.ReactNode }) => (
    <thead style={{ backgroundColor: '#1e293b' }}>{children}</thead>
  ),
  tbody: ({ children }: { children?: React.ReactNode }) => (
    <tbody style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>{children}</tbody>
  ),
  tr: ({ children }: { children?: React.ReactNode }) => (
    <tr style={{ borderBottom: '1px solid #1e293b' }}>{children}</tr>
  ),
  th: ({ children }: { children?: React.ReactNode }) => (
    <th className="text-left text-[#94a3b8] font-medium px-3 py-2">{children}</th>
  ),
  td: ({ children }: { children?: React.ReactNode }) => (
    <td className="text-[#f1f5f9] px-3 py-2">{children}</td>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote
      className="pl-3 py-2 my-3 rounded-r-lg italic"
      style={{
        borderLeft: '3px solid #06b6d4',
        backgroundColor: 'rgba(6,182,212,0.05)',
      }}
    >
      <div className="text-sm text-[#94a3b8]">{children}</div>
    </blockquote>
  ),
  code: ({ children, inline }: { children?: React.ReactNode; inline?: boolean }) =>
    inline ? (
      <code
        className="font-mono text-xs px-1.5 py-0.5 rounded"
        style={{ backgroundColor: '#020617', color: '#06b6d4' }}
      >
        {children}
      </code>
    ) : (
      <pre
        className="font-mono text-xs p-3 rounded-lg mb-3 overflow-x-auto"
        style={{ backgroundColor: '#020617', border: '1px solid #334155' }}
      >
        <code>{children}</code>
      </pre>
    ),
  hr: () => <hr className="my-4" style={{ borderColor: '#1e293b' }} />,
};

/* ─── Typing Indicator ─── */
function TypingIndicator() {
  return (
    <motion.div
      className="flex items-start gap-2 mb-3"
      initial={{ opacity: 0, x: -15 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 mt-1">
        <img src="/ai-agent-avatar.svg" alt="AI" className="w-7 h-7 rounded-full opacity-70" />
      </div>
      <div
        className="flex items-center gap-1 px-4 py-3 rounded-2xl"
        style={{
          backgroundColor: '#1e293b',
          border: '1px solid #1e293b',
          borderTopLeftRadius: '4px',
        }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: '#06b6d4' }}
            animate={{
              scale: [0.6, 1, 0.6],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Main Component ─── */
export function AIAgent() {
  const lang = useLanguageStore((s) => s.lang);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* Auto scroll to bottom */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  /* Send message handler */
  const handleSend = useCallback(
    async (text?: string) => {
      const msg = (text || input).trim();
      if (!msg || isTyping) return;

      const userId = `user-${Date.now()}`;
      setMessages((prev) => [...prev, { id: userId, role: 'user', content: msg }]);
      setInput('');
      setIsTyping(true);

      // Simulate network delay for realism
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

      const response = generateMockResponse(msg, lang);
      const aiId = `ai-${Date.now()}`;
      setMessages((prev) => [...prev, { id: aiId, role: 'ai', content: response }]);
      setIsTyping(false);
    },
    [input, isTyping, lang],
  );

  /* Handle enter key */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  /* Copy message content */
  const handleCopy = useCallback((content: string, id: string) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const suggestedPrompts = getSuggestedPrompts(lang);
  const isEmpty = messages.length === 0;

  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 lg:px-8 flex flex-col">
      {/* ─── Section 1: Page Header ─── */}
      <motion.div
        className="pt-6 pb-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-3 text-[11px] text-[#64748b]">
          <span>Dashboard</span>
          <span>/</span>
          <span className="text-[#94a3b8]">AI Agent</span>
        </div>

        {/* Title + Avatar */}
        <div className="flex items-start gap-4">
          <img
            src="/ai-agent-avatar.svg"
            alt="AI Agent"
            className="w-12 h-12 rounded-full hidden sm:block"
            style={{ opacity: 0.9 }}
          />
          <div>
            <h1 className="text-2xl font-bold text-[#f1f5f9]">
              {lang === 'KO' ? 'AI 애널리스트 에이전트' : 'AI Analyst Agent'}
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1 max-w-[600px]">
              {lang === 'KO'
                ? '궁금한 주식 테마나 종목을 입력하면 AI가 애널리스트 관점에서 분석해드립니다'
                : 'Ask about any stock theme or ticker, and our AI will provide analyst-grade analysis.'}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <motion.div
          className="flex items-center gap-2 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: '#10b981' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: '#10b981' }}
            />
          </span>
          <span className="text-xs font-medium" style={{ color: '#10b981' }}>
            {lang === 'KO' ? 'AI 에이전트 온라인' : 'AI Agent Online'}
          </span>
          <span
            className="text-[10px] font-medium px-2 py-0.5 rounded-md"
            style={{ backgroundColor: '#1e293b', color: '#64748b' }}
          >
            Gemini 2.5 Flash
          </span>
        </motion.div>
      </motion.div>

      {/* ─── Section 2: Suggested Prompts ─── */}
      <motion.div
        className="pb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <p className="text-xs text-[#64748b] mb-2">
          {lang === 'KO' ? '이런 질문을 핸들러 보세요:' : 'Try asking:'}
        </p>
        <div className="flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt, i) => (
            <motion.button
              key={prompt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              onClick={() => handleSend(prompt)}
              className="text-xs text-[#94a3b8] px-3 py-2 rounded-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid #334155',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                e.currentTarget.style.color = '#f1f5f9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              {prompt}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ─── Section 3: Chat Interface ─── */}
      <div
        className="flex flex-col flex-1 rounded-2xl overflow-hidden mb-6"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(51, 65, 85, 0.4)',
          minHeight: isEmpty ? '400px' : '500px',
        }}
      >
        {/* Message History */}
        <div
          className="flex-1 overflow-y-auto p-4 lg:p-5"
          style={{
            maxHeight: 'calc(100dvh - 420px)',
            minHeight: isEmpty ? '300px' : '350px',
          }}
        >
          {isEmpty ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full py-10">
              <img
                src="/ai-agent-avatar.svg"
                alt="AI Agent"
                className="w-20 h-20 mb-4"
                style={{ opacity: 0.5 }}
              />
              <p className="text-sm text-[#64748b] text-center">
                {lang === 'KO'
                  ? 'AI 애널리스트와 대화를 시작하세요'
                  : 'Start a conversation with the AI analyst'}
              </p>
            </div>
          ) : (
            /* Messages */
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`flex items-start gap-2 mb-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  initial={
                    msg.role === 'user'
                      ? { opacity: 0, x: 20 }
                      : { opacity: 0, x: -15 }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: msg.role === 'user' ? 0.2 : 0.3,
                    ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
                  }}
                >
                  {/* AI Avatar (left side) */}
                  {msg.role === 'ai' && (
                    <div className="flex-shrink-0 mt-1">
                      <img
                        src="/ai-agent-avatar.svg"
                        alt="AI"
                        className="w-7 h-7 rounded-full"
                        style={{ opacity: 0.8 }}
                      />
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`relative max-w-[85%] lg:max-w-[80%] ${
                      msg.role === 'user' ? 'max-w-[70%]' : ''
                    }`}
                  >
                    {msg.role === 'ai' && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="absolute top-2 right-2 z-10 p-1 rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100"
                        style={{ color: '#64748b' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.1)';
                          e.currentTarget.style.color = '#94a3b8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#64748b';
                        }}
                        title="Copy"
                      >
                        {copiedId === msg.id ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                    )}
                    <div
                      className={`group px-4 py-3 ${
                        msg.role === 'user'
                          ? 'rounded-2xl rounded-tr-md'
                          : 'rounded-2xl rounded-tl-md'
                      }`}
                      style={
                        msg.role === 'user'
                          ? {
                              backgroundColor: '#6366f1',
                              color: '#ffffff',
                            }
                          : {
                              backgroundColor: '#1e293b',
                              border: '1px solid #1e293b',
                              color: '#f1f5f9',
                            }
                      }
                    >
                      {msg.role === 'user' ? (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      ) : (
                        <div className="pr-6">
                          <ReactMarkdown components={markdownComponents}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Input Bar ─── */}
        <div
          className="flex-shrink-0 px-4 py-3 lg:px-5 lg:py-4"
          style={{
            backgroundColor: '#020617',
            borderTop: '1px solid #1e293b',
          }}
        >
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                lang === 'KO'
                  ? '종목, 테마, 전략에 대해 질문하세요...'
                  : 'Ask about any stock, theme, or strategy...'
              }
              rows={1}
              className="flex-1 resize-none rounded-xl px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#64748b] outline-none transition-all duration-200"
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                maxHeight: '120px',
                minHeight: '44px',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#334155';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full transition-all duration-200"
              style={{
                backgroundColor: input.trim() && !isTyping ? '#6366f1' : '#334155',
                cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => {
                if (input.trim() && !isTyping) {
                  e.currentTarget.style.filter = 'brightness(1.1)';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'none';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseDown={(e) => {
                if (input.trim() && !isTyping) {
                  e.currentTarget.style.transform = 'scale(0.95)';
                }
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
            >
              <Send size={18} color={input.trim() && !isTyping ? '#ffffff' : '#64748b'} />
            </button>
          </div>
          <p className="text-right text-[10px] text-[#64748b] mt-1.5 pr-14">
            {lang === 'KO' ? 'Enter로 전송, Shift+Enter로 줄바꿈' : 'Enter to send, Shift+Enter for new line'}
          </p>
        </div>
      </div>

      {/* ─── Section 4: Capabilities Showcase ─── */}
      <motion.div
        className="pb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-5">
          <h2 className="text-xl font-bold text-[#f1f5f9]">
            {lang === 'KO' ? '작동 방식' : 'How It Works'}
          </h2>
          <p className="text-sm text-[#94a3b8] mt-1">
            {lang === 'KO'
              ? '정확하고 시의적절한 분석을 위한 첨단 AI 구동'
              : 'Powered by advanced AI for accurate, timely analysis'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Data Pipeline */}
          <motion.div
            className="rounded-2xl p-5 transition-all duration-250"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #334155',
            }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0, duration: 0.4 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl mb-3"
              style={{ backgroundColor: 'rgba(6,182,212,0.12)' }}
            >
              <Database size={22} style={{ color: '#06b6d4' }} />
            </div>
            <h3 className="text-base font-semibold text-[#f1f5f9] mb-2">
              {lang === 'KO' ? '실시간 데이터 파이프라인' : 'Real-time Data Pipeline'}
            </h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              {lang === 'KO'
                ? '여러 출처에서 시장 데이터, 뉴스, 재무 보고서를 지속적으로 수집하여 최신 분석을 제공합니다.'
                : 'Continuously ingests market data, news, and financial reports from multiple sources.'}
            </p>
            <p className="text-xs font-medium mt-3" style={{ color: '#06b6d4' }}>
              {lang === 'KO' ? '30초마다 데이터 갱신' : 'Data refreshed every 30 seconds'}
            </p>
          </motion.div>

          {/* Card 2: LLM Routing */}
          <motion.div
            className="rounded-2xl p-5 transition-all duration-250"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #334155',
            }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.4 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl mb-3"
              style={{ backgroundColor: 'rgba(99,102,241,0.12)' }}
            >
              <GitBranch size={22} style={{ color: '#6366f1' }} />
            </div>
            <h3 className="text-base font-semibold text-[#f1f5f9] mb-2">
              {lang === 'KO' ? '지능형 LLM 라우팅' : 'Intelligent LLM Routing'}
            </h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              {lang === 'KO'
                ? '질문 유형에 따라 최적의 AI 모델로 쿼리를 라우팅합니다 — 재무 분석, 기술적 차트, 시장 심리.'
                : 'Routes queries to the optimal AI model based on question type — financial analysis, technical charting, or market sentiment.'}
            </p>
            <p className="text-xs font-medium mt-3" style={{ color: '#6366f1' }}>
              {lang === 'KO' ? 'Gemini 2.5 Flash 구동' : 'Gemini 2.5 Flash Powered'}
            </p>
          </motion.div>

          {/* Card 3: Fact Checking */}
          <motion.div
            className="rounded-2xl p-5 transition-all duration-250"
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid #334155',
            }}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.4 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#334155';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div
              className="flex items-center justify-center w-11 h-11 rounded-xl mb-3"
              style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}
            >
              <ShieldCheck size={22} style={{ color: '#10b981' }} />
            </div>
            <h3 className="text-base font-semibold text-[#f1f5f9] mb-2">
              {lang === 'KO' ? 'RAG 기반 팩트체크' : 'RAG-Based Fact Check'}
            </h3>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              {lang === 'KO'
                ? '모든 AI 생성 주장은 검증된 재무 데이터베이스와 교차 검증되어 정확성을 보장하고 환각을 줄입니다.'
                : 'All AI-generated claims are cross-referenced against verified financial databases to ensure accuracy and reduce hallucination.'}
            </p>
            <p className="text-xs font-medium mt-3" style={{ color: '#10b981' }}>
              {lang === 'KO' ? 'Yahoo Finance 교차 검증' : 'Verified against Yahoo Finance'}
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
