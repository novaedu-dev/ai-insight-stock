import { useLanguageStore } from '@/store/languageStore';

export const translations = {
  KO: {
    // Navbar
    'nav.search': '종목 검색...',
    'nav.live': '실시간',
    'nav.dashboard': '대시보드',
    'nav.themes': '테마 분석',
    'nav.aiAgent': 'AI 에이전트',
    'nav.stockDeepDive': '종목 분석',
    'nav.marketOverview': '시장 개요',
    'nav.policy': '정부정책 테마 예측',
    'nav.settings': '설정',

    // Hero
    'hero.label': '차세대 주도주 발굴',
    'hero.title1': 'AI 혁명 이후',
    'hero.title2': '차세대 유망주 발굴',
    'hero.subtitle': 'AI 인프라·에너지·로봇·양자컴퓨터 분야의 차세대 유망주를 실시간 주가와 애널리스트 진입 전략과 함께 발굴합니다.',
    'hero.ctaPrimary': '테마 분석 보기',
    'hero.ctaSecondary': 'AI 에이전트에게 묻기',

    // Market Status
    'market.open': '장중',
    'market.afterHours': '시간외',
    'market.updated': '업데이트',

    // Theme Section
    'themes.title': '투자 테마',
    'themes.subtitle': '향후 10년 성장을 이끌 4대 메가트렌드',
    'themes.viewAnalysis': '분석 보기',

    // Featured Stocks
    'stocks.title': '주요 종목',
    'stocks.viewAll': '전첳보기',
    'stocks.target': '목표가',
    'stocks.expectedReturn': '기대수익률',
    'stocks.beginnerFriendly': '초보추천',
    'stocks.highDividend': '고배당',
    'stocks.growth': '성장주',

    // AI Agent CTA
    'aiCta.title': '맞춤 분석이 필요하신가요?',
    'aiCta.subtitle': 'AI 에이전트에게 종목, 테마, 시장 흐름에 대해 질문하세요.',
    'aiCta.button': 'AI 에이전트 실행',

    // Footer
    'footer.disclaimer': '제공되는 정보는 참고용이며 투자 권유가 아닙니다.',
    'footer.lastUpdated': '마지막 업데이트',

    // Market Overview
    'marketOverview.title': '시장 개요',
    'marketOverview.subtitle': '실시간 테마별 시장 동향과 인기 종목을 확인하세요',
    'marketOverview.themeHeatmap': '테마 히트맵',
    'marketOverview.mostViewed': '인기 조회 순위',
    'marketOverview.gainersLosers': '급등·급락',
    'marketOverview.topVolume': '거래대금 상위',
    'marketOverview.sectorGroups': '섹터 그룹별',
    'marketOverview.rank': '순위',
    'marketOverview.stockName': '종목명',
    'marketOverview.ticker': '티커',
    'marketOverview.currentPrice': '현재가',
    'marketOverview.changePercent': '등락률',
    'marketOverview.views': '조회수',
    'marketOverview.change': '등락',
    'marketOverview.volume': '거래량',
    'marketOverview.tradingValue': '거래대금',
    'marketOverview.targetPrice': '목표가',
    'marketOverview.return': '수익률',
    'marketOverview.topGainers': '급등',
    'marketOverview.topLosers': '급락',
    'marketOverview.noGainers': '상승 종목 없음',
    'marketOverview.noLosers': '하락 종목 없음',
    'marketOverview.sort': '정렬',
    'marketOverview.stockCount': '종목',
    'marketOverview.rising': '상승',
    'marketOverview.falling': '하락',
    'marketOverview.marketStatus': '전체 상승/하락 현황',
    'marketOverview.popularity': '인기',

    // Common
    'common.ko': '한국어',
    'common.en': 'English',
    'common.won': '원',
    'common.usd': '$',
  },
  EN: {
    // Navbar
    'nav.search': 'Search stocks...',
    'nav.live': 'LIVE',
    'nav.dashboard': 'Dashboard',
    'nav.themes': 'Theme Analysis',
    'nav.aiAgent': 'AI Agent',
    'nav.stockDeepDive': 'Stock Deep Dive',
    'nav.marketOverview': 'Market Overview',
    'nav.policy': 'Policy Theme Predictions',
    'nav.settings': 'Settings',

    // Hero
    'hero.label': 'NEXT-GEN LEADER DISCOVERY',
    'hero.title1': 'AI Revolution',
    'hero.title2': 'Post-AI Tenbagger Stocks',
    'hero.subtitle': 'We identify the next-generation leader stocks across AI infrastructure, energy, robotics, and quantum computing \u2014 with real-time prices and analyst entry strategies.',
    'hero.ctaPrimary': 'View Theme Analysis',
    'hero.ctaSecondary': 'Ask AI Agent',

    // Market Status
    'market.open': 'Market Open',
    'market.afterHours': 'After Hours',
    'market.updated': 'Updated',

    // Theme Section
    'themes.title': 'Investment Themes',
    'themes.subtitle': 'Four mega-trends driving the next decade of growth',
    'themes.viewAnalysis': 'View Analysis',

    // Featured Stocks
    'stocks.title': 'Featured Stocks',
    'stocks.viewAll': 'View All',
    'stocks.target': 'Target',
    'stocks.expectedReturn': 'Expected Return',
    'stocks.beginnerFriendly': 'Beginner Friendly',
    'stocks.highDividend': 'High Dividend',
    'stocks.growth': 'Growth',

    // AI Agent CTA
    'aiCta.title': 'Need a Custom Analysis?',
    'aiCta.subtitle': 'Ask our AI agent about any stock, theme, or market trend.',
    'aiCta.button': 'Launch AI Agent',

    // Footer
    'footer.disclaimer': 'Data provided for informational purposes only. Not financial advice.',
    'footer.lastUpdated': 'Last updated',

    // Market Overview
    'marketOverview.title': 'Market Overview',
    'marketOverview.subtitle': 'Real-time theme-based market trends and popular stocks',
    'marketOverview.themeHeatmap': 'Theme Heatmap',
    'marketOverview.mostViewed': 'Most Viewed',
    'marketOverview.gainersLosers': 'Gainers & Losers',
    'marketOverview.topVolume': 'Top Volume',
    'marketOverview.sectorGroups': 'Sector Groups',
    'marketOverview.rank': 'Rank',
    'marketOverview.stockName': 'Name',
    'marketOverview.ticker': 'Ticker',
    'marketOverview.currentPrice': 'Price',
    'marketOverview.changePercent': 'Change%',
    'marketOverview.views': 'Views',
    'marketOverview.change': 'Change',
    'marketOverview.volume': 'Volume',
    'marketOverview.tradingValue': 'Value',
    'marketOverview.targetPrice': 'Target',
    'marketOverview.return': 'Return',
    'marketOverview.topGainers': 'Gainers',
    'marketOverview.topLosers': 'Losers',
    'marketOverview.noGainers': 'No gainers',
    'marketOverview.noLosers': 'No losers',
    'marketOverview.sort': 'Sort',
    'marketOverview.stockCount': 'stocks',
    'marketOverview.rising': 'Rising',
    'marketOverview.falling': 'Falling',
    'marketOverview.marketStatus': 'Market Status',
    'marketOverview.popularity': 'Pop.',

    // Common
    'common.ko': 'Korean',
    'common.en': 'English',
    'common.won': 'KRW',
    'common.usd': '$',
  },
} as const;

export type TranslationKey = keyof typeof translations.KO;

export function useT() {
  const lang = useLanguageStore((s) => s.lang);
  const t = (key: TranslationKey) => translations[lang][key] || key;
  return { t, lang };
}
