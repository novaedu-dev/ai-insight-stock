import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Eye,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronRight,
  Crown,
  Medal,
  Award,
  ArrowUpDown,
  Sparkles,
  CircleDollarSign,
} from 'lucide-react';
import { useT } from '@/i18n';
import { useStockStore, themes, type StockData, type ThemeKey } from '@/store/stockStore';

/* ═══════════════════════════════════════════════════════════════════════ */
/*                          COLOUR HELPERS                                */
/* ═══════════════════════════════════════════════════════════════════════ */

/** Korean convention: RED = up, BLUE = down */
const UP_RED = '#f87171';
const DOWN_BLUE = '#60a5fa';

/** 6-tier colour system for heatmap backgrounds */
function changeColor(percent: number): string {
  if (percent >= 5) return '#dc2626';
  if (percent >= 2) return '#ef4444';
  if (percent >= 0) return '#fca5a5';
  if (percent >= -2) return '#93c5fd';
  if (percent >= -5) return '#3b82f6';
  return '#2563eb';
}

function changeTextColor(percent: number): string {
  return percent >= 0 ? UP_RED : DOWN_BLUE;
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*                     SIMULATED VOLUME / POPULARITY                      */
/* ═══════════════════════════════════════════════════════════════════════ */

function seededRandom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return (Math.abs(h) % 1000) / 1000;
}

function getSimulatedVolume(stock: StockData): number {
  const base = stock.currentPrice * 1000;
  const r = seededRandom(stock.ticker + '_vol');
  return Math.floor(base * (0.3 + r * 2.5));
}

function getSimulatedPopularity(stock: StockData): number {
  const r = seededRandom(stock.ticker + '_pop');
  const base = stock.isBeginnerFriendly ? 5000 : 3000;
  return Math.floor(base + r * 15000);
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*                           PRICE HELPERS                                */
/* ═══════════════════════════════════════════════════════════════════════ */

function isUSDStock(stock: StockData): boolean {
  return stock.exchange === 'NASDAQ' || stock.exchange === 'NYSE';
}

function formatPrice(stock: StockData): string {
  if (isUSDStock(stock)) {
    return '$' + stock.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return stock.currentPrice.toLocaleString('ko-KR') + '원';
}

function formatTargetPrice(stock: StockData): string {
  if (isUSDStock(stock)) {
    return '$' + stock.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return stock.targetPrice.toLocaleString('ko-KR') + '원';
}

function formatVolume(vol: number): string {
  if (vol >= 1000000) return (vol / 1000000).toFixed(1) + 'M';
  if (vol >= 1000) return (vol / 1000).toFixed(1) + 'K';
  return vol.toString();
}

function formatValue(price: number, vol: number): string {
  const val = price * vol;
  if (val >= 1e12) return (val / 1e12).toFixed(1) + 'T';
  if (val >= 1e9) return (val / 1e9).toFixed(1) + 'B';
  if (val >= 1e6) return (val / 1e6).toFixed(1) + 'M';
  return val.toLocaleString('ko-KR');
}

function getChange(stock: StockData) {
  const change = stock.currentPrice - stock.previousClose;
  const changePercent = (change / stock.previousClose) * 100;
  return { change, changePercent };
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*                     SHARED: RANK BADGE COMPONENT                       */
/* ═══════════════════════════════════════════════════════════════════════ */

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full"
        style={{ backgroundColor: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)' }}
      >
        <Crown size={12} style={{ color: '#f59e0b' }} />
      </span>
    );
  if (rank === 2)
    return (
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full"
        style={{ backgroundColor: 'rgba(148,163,184,0.2)', border: '1px solid rgba(148,163,184,0.4)' }}
      >
        <Medal size={12} style={{ color: '#94a3b8' }} />
      </span>
    );
  if (rank === 3)
    return (
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full"
        style={{ backgroundColor: 'rgba(180,83,9,0.2)', border: '1px solid rgba(180,83,9,0.4)' }}
      >
        <Award size={12} style={{ color: '#b45309' }} />
      </span>
    );
  return (
    <span
      className="flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs font-medium"
      style={{ backgroundColor: '#1e293b', color: '#64748b' }}
    >
      {rank}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*                     SHARED: GLASS CARD STYLE                           */
/* ═══════════════════════════════════════════════════════════════════════ */

const glassCardStyle: React.CSSProperties = {
  backgroundColor: 'rgba(15,23,42,0.6)',
  border: '1px solid rgba(51,65,85,0.4)',
  backdropFilter: 'blur(8px)',
};

/* ═══════════════════════════════════════════════════════════════════════ */
/*                       TAB 1: THEME HEATMAP                             */
/* ═══════════════════════════════════════════════════════════════════════ */

function ThemeHeatmapTab() {
  const navigate = useNavigate();
  const { t } = useT();
  const { stocks: allStocks } = useStockStore();

  const themeStats = useMemo(() => {
    return themes.map((theme) => {
      const themeStocks = allStocks.filter((s) => s.theme === theme.key);
      const avgChange =
        themeStocks.reduce((sum, s) => sum + getChange(s).changePercent, 0) / (themeStocks.length || 1);
      const upCount = themeStocks.filter((s) => getChange(s).changePercent >= 0).length;
      const downCount = themeStocks.length - upCount;
      return { theme, avgChange, stockCount: themeStocks.length, upCount, downCount };
    });
  }, [allStocks]);

  const totalUp = themeStats.reduce((s, t) => s + t.upCount, 0);
  const totalDown = themeStats.reduce((s, t) => s + t.downCount, 0);
  const total = totalUp + totalDown;
  const upRatio = total > 0 ? (totalUp / total) * 100 : 50;

  return (
    <div className="space-y-6">
      {/* Heatmap Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {themeStats.map(({ theme, avgChange, stockCount }) => (
          <motion.button
            key={theme.key}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/themes?tab=${theme.key}`)}
            className="relative overflow-hidden rounded-xl p-5 text-left transition-shadow duration-200 hover:shadow-lg"
            style={{
              backgroundColor: changeColor(avgChange) + '22',
              border: `1px solid ${changeColor(avgChange)}44`,
              boxShadow: `0 4px 16px ${changeColor(avgChange)}11`,
            }}
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundColor: changeColor(avgChange) }} />
            <div className="relative z-10">
              <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>
                {theme.titleKo}
              </p>
              <p className="font-mono text-2xl font-bold mb-1" style={{ color: changeTextColor(avgChange) }}>
                {avgChange >= 0 ? '+' : ''}
                {avgChange.toFixed(2)}%
              </p>
              <p className="text-[11px]" style={{ color: '#64748b' }}>
                {stockCount}
                {t('marketOverview.stockCount')}
              </p>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Market Status Bar */}
      <div className="rounded-xl p-4" style={glassCardStyle}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#f1f5f9]">{t('marketOverview.marketStatus')}</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: UP_RED }} />
              <span style={{ color: UP_RED }} className="font-mono font-semibold">
                {totalUp}
              </span>
              <span style={{ color: '#64748b' }}>{t('marketOverview.rising')}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DOWN_BLUE }} />
              <span style={{ color: DOWN_BLUE }} className="font-mono font-semibold">
                {totalDown}
              </span>
              <span style={{ color: '#64748b' }}>{t('marketOverview.falling')}</span>
            </span>
          </div>
        </div>
        {/* Animated Bar */}
        <div className="h-3 w-full rounded-full overflow-hidden flex" style={{ backgroundColor: '#1e293b' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${upRatio}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-l-full"
            style={{ backgroundColor: UP_RED }}
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${100 - upRatio}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-r-full"
            style={{ backgroundColor: DOWN_BLUE }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="font-mono text-[11px]" style={{ color: UP_RED }}>
            {upRatio.toFixed(1)}%
          </span>
          <span className="font-mono text-[11px]" style={{ color: DOWN_BLUE }}>
            {(100 - upRatio).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*                    TAB 2: POPULARITY RANKING                           */
/* ═══════════════════════════════════════════════════════════════════════ */

function PopularityTab() {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const { stocks: allStocks } = useStockStore();

  const ranked = useMemo(() => {
    return [...allStocks]
      .map((s) => ({ stock: s, views: getSimulatedPopularity(s), ...getChange(s) }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);
  }, [allStocks]);

  const headers = [
    t('marketOverview.rank'),
    lang === 'KO' ? '종목명' : 'Name',
    t('marketOverview.ticker'),
    t('marketOverview.currentPrice'),
    t('marketOverview.changePercent'),
    t('marketOverview.views'),
  ];

  return (
    <div className="rounded-xl overflow-hidden" style={glassCardStyle}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: '#64748b' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map(({ stock, views, changePercent }, i) => (
              <motion.tr
                key={stock.ticker}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/stock/${stock.ticker}`)}
                className="cursor-pointer transition-colors duration-150 hover:bg-[#1e293b]/40"
                style={{ borderBottom: '1px solid #1e293b' }}
              >
                <td className="px-4 py-3">
                  <RankBadge rank={i + 1} />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[#f1f5f9]">
                  {lang === 'KO' ? stock.nameKo : stock.nameEn}
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: '#64748b' }}>
                  {stock.ticker}
                </td>
                <td className="px-4 py-3 font-mono text-sm font-semibold text-[#f1f5f9]">
                  {formatPrice(stock)}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-medium" style={{ color: changeTextColor(changePercent) }}>
                    {changePercent >= 0 ? '+' : ''}
                    {changePercent.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: '#94a3b8' }}>
                    <Eye size={12} />
                    {views.toLocaleString()}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*                   TAB 3: GAINERS & LOSERS                              */
/* ═══════════════════════════════════════════════════════════════════════ */

function GainersLosersTab() {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const { stocks: allStocks } = useStockStore();

  const sorted = useMemo(() => {
    return [...allStocks]
      .map((s) => ({ stock: s, ...getChange(s) }))
      .sort((a, b) => b.changePercent - a.changePercent);
  }, [allStocks]);

  const gainers = sorted.filter((s) => s.changePercent > 0).slice(0, 5);
  const losers = sorted.filter((s) => s.changePercent < 0).slice(0, 5);

  const renderRow = (item: (typeof sorted)[0], i: number, isGainer: boolean) => {
    const color = isGainer ? UP_RED : DOWN_BLUE;
    return (
      <motion.div
        key={item.stock.ticker}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.06 }}
        onClick={() => navigate(`/stock/${item.stock.ticker}`)}
        className="cursor-pointer rounded-lg p-3 transition-colors duration-150 hover:bg-[#1e293b]/60"
        style={{ borderBottom: '1px solid #1e293b' }}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-[#f1f5f9] truncate">
            {lang === 'KO' ? item.stock.nameKo : item.stock.nameEn}
          </span>
          <span className="font-mono text-xs" style={{ color: '#64748b' }}>
            {item.stock.ticker}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-mono text-sm font-semibold text-[#f1f5f9]">{formatPrice(item.stock)}</span>
          <div className="text-right">
            <span className="font-mono text-xs font-medium block" style={{ color }}>
              {isGainer ? '+' : ''}
              {item.change.toFixed(isUSDStock(item.stock) ? 2 : 0)}
              {isUSDStock(item.stock) ? '' : '원'}
            </span>
            <span className="font-mono text-xs font-medium" style={{ color }}>
              {item.changePercent >= 0 ? '+' : ''}
              {item.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Gainers */}
      <div className="rounded-xl p-4" style={glassCardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} style={{ color: UP_RED }} />
          <h3 className="text-base font-bold text-[#f1f5f9]">{t('marketOverview.topGainers')}</h3>
          <span
            className="font-mono text-xs ml-auto px-2 py-0.5 rounded"
            style={{ backgroundColor: 'rgba(248,113,113,0.1)', color: UP_RED }}
          >
            +{gainers.length}
          </span>
        </div>
        <div className="space-y-1">
          {gainers.map((g, i) => renderRow(g, i, true))}
          {gainers.length === 0 && (
            <p className="text-sm py-8 text-center" style={{ color: '#64748b' }}>
              {t('marketOverview.noGainers')}
            </p>
          )}
        </div>
      </div>

      {/* Losers */}
      <div className="rounded-xl p-4" style={glassCardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown size={18} style={{ color: DOWN_BLUE }} />
          <h3 className="text-base font-bold text-[#f1f5f9]">{t('marketOverview.topLosers')}</h3>
          <span
            className="font-mono text-xs ml-auto px-2 py-0.5 rounded"
            style={{ backgroundColor: 'rgba(96,165,250,0.1)', color: DOWN_BLUE }}
          >
            -{losers.length}
          </span>
        </div>
        <div className="space-y-1">
          {losers.map((l, i) => renderRow(l, i, false))}
          {losers.length === 0 && (
            <p className="text-sm py-8 text-center" style={{ color: '#64748b' }}>
              {t('marketOverview.noLosers')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*                      TAB 4: TOP VOLUME / VALUE                         */
/* ═══════════════════════════════════════════════════════════════════════ */

function VolumeTab() {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const { stocks: allStocks } = useStockStore();

  const ranked = useMemo(() => {
    return [...allStocks]
      .map((s) => {
        const vol = getSimulatedVolume(s);
        const value = s.currentPrice * vol;
        return { stock: s, volume: vol, value, ...getChange(s) };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [allStocks]);

  const headers = [
    t('marketOverview.rank'),
    lang === 'KO' ? '종목명' : 'Name',
    t('marketOverview.currentPrice'),
    t('marketOverview.changePercent'),
    t('marketOverview.volume'),
    t('marketOverview.tradingValue'),
  ];

  return (
    <div className="rounded-xl overflow-hidden" style={glassCardStyle}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid #1e293b' }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider"
                  style={{ color: '#64748b' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map(({ stock, volume, changePercent }, i) => (
              <motion.tr
                key={stock.ticker}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/stock/${stock.ticker}`)}
                className="cursor-pointer transition-colors duration-150 hover:bg-[#1e293b]/40"
                style={{ borderBottom: '1px solid #1e293b' }}
              >
                <td className="px-4 py-3">
                  <RankBadge rank={i + 1} />
                </td>
                <td className="px-4 py-3 text-sm font-medium text-[#f1f5f9]">
                  {lang === 'KO' ? stock.nameKo : stock.nameEn}
                </td>
                <td className="px-4 py-3 font-mono text-sm font-semibold text-[#f1f5f9]">
                  {formatPrice(stock)}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-sm font-medium" style={{ color: changeTextColor(changePercent) }}>
                    {changePercent >= 0 ? '+' : ''}
                    {changePercent.toFixed(2)}%
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: '#94a3b8' }}>
                  {formatVolume(volume)}
                </td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-[#f1f5f9]">
                  {formatValue(stock.currentPrice, volume)}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*                    TAB 5: SECTOR GROUPS (ACCORDION)                    */
/* ═══════════════════════════════════════════════════════════════════════ */

function SectorGroupsTab() {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const { stocks: allStocks } = useStockStore();
  const [expandedTheme, setExpandedTheme] = useState<ThemeKey | null>(null);
  const [sortBy, setSortBy] = useState<'change' | 'price' | 'volume'>('change');

  const toggleTheme = (key: ThemeKey) => {
    setExpandedTheme((prev) => (prev === key ? null : key));
  };

  const getSortedStocks = (themeKey: ThemeKey) => {
    const themeStocks = allStocks.filter((s) => s.theme === themeKey);
    return [...themeStocks].sort((a, b) => {
      if (sortBy === 'change') {
        return getChange(b).changePercent - getChange(a).changePercent;
      }
      if (sortBy === 'price') return b.currentPrice - a.currentPrice;
      return getSimulatedVolume(b) - getSimulatedVolume(a);
    });
  };

  const sortOptions: { key: typeof sortBy; label: string }[] = [
    { key: 'change', label: t('marketOverview.changePercent') },
    { key: 'price', label: t('marketOverview.currentPrice') },
    { key: 'volume', label: t('marketOverview.volume') },
  ];

  return (
    <div className="space-y-3">
      {/* Sort Controls */}
      <div className="flex items-center gap-2 mb-4">
        <ArrowUpDown size={14} style={{ color: '#64748b' }} />
        <span className="text-xs" style={{ color: '#64748b' }}>
          {t('marketOverview.sort')}:
        </span>
        {sortOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
            style={{
              backgroundColor: sortBy === opt.key ? 'rgba(99,102,241,0.2)' : 'rgba(30,41,59,0.5)',
              color: sortBy === opt.key ? '#818cf8' : '#64748b',
              border: `1px solid ${sortBy === opt.key ? 'rgba(99,102,241,0.4)' : '#334155'}`,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Accordion */}
      {themes.map((theme) => {
        const isExpanded = expandedTheme === theme.key;
        const themeStocks = getSortedStocks(theme.key);
        const avgChange =
          themeStocks.reduce((sum, s) => sum + getChange(s).changePercent, 0) / (themeStocks.length || 1);

        return (
          <div key={theme.key} className="rounded-xl overflow-hidden" style={glassCardStyle}>
            {/* Header */}
            <button
              onClick={() => toggleTheme(theme.key)}
              className="w-full flex items-center justify-between px-4 py-4 text-left transition-colors duration-150 hover:bg-[#1e293b]/30"
            >
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                <span className="text-sm font-bold text-[#f1f5f9]">
                  {lang === 'KO' ? theme.titleKo : theme.titleEn}
                </span>
                <span className="font-mono text-xs" style={{ color: '#64748b' }}>
                  {themeStocks.length}
                  {t('marketOverview.stockCount')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold" style={{ color: changeTextColor(avgChange) }}>
                  {avgChange >= 0 ? '+' : ''}
                  {avgChange.toFixed(2)}%
                </span>
                {isExpanded ? (
                  <ChevronDown size={16} style={{ color: '#64748b' }} />
                ) : (
                  <ChevronRight size={16} style={{ color: '#64748b' }} />
                )}
              </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ borderBottom: '1px solid #1e293b', borderTop: '1px solid #1e293b' }}>
                          {[
                            lang === 'KO' ? '종목명' : 'Name',
                            'Ticker',
                            t('marketOverview.currentPrice'),
                            t('marketOverview.changePercent'),
                            t('marketOverview.volume'),
                            t('marketOverview.targetPrice'),
                            t('marketOverview.return'),
                          ].map((h, i) => (
                            <th
                              key={i}
                              className="text-left px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider"
                              style={{ color: '#64748b' }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {themeStocks.map((stock) => {
                          const { changePercent } = getChange(stock);
                          const vol = getSimulatedVolume(stock);
                          return (
                            <tr
                              key={stock.ticker}
                              onClick={() => navigate(`/stock/${stock.ticker}`)}
                              className="cursor-pointer transition-colors duration-150 hover:bg-[#1e293b]/40"
                              style={{ borderBottom: '1px solid #1e293b' }}
                            >
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-[#f1f5f9]">
                                    {lang === 'KO' ? stock.nameKo : stock.nameEn}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {stock.isBeginnerFriendly && (
                                      <span
                                        className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded"
                                        style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981' }}
                                      >
                                        <Sparkles size={8} />
                                        {t('stocks.beginnerFriendly')}
                                      </span>
                                    )}
                                    {stock.dividendYield && (
                                      <span
                                        className="flex items-center gap-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded"
                                        style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#818cf8' }}
                                      >
                                        <CircleDollarSign size={8} />
                                        {stock.dividendYield}%
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#64748b' }}>
                                {stock.ticker}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-sm font-semibold text-[#f1f5f9]">
                                {formatPrice(stock)}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className="font-mono text-sm font-medium"
                                  style={{ color: changeTextColor(changePercent) }}
                                >
                                  {changePercent >= 0 ? '+' : ''}
                                  {changePercent.toFixed(2)}%
                                </span>
                              </td>
                              <td className="px-4 py-2.5 font-mono text-xs" style={{ color: '#94a3b8' }}>
                                {formatVolume(vol)}
                              </td>
                              <td className="px-4 py-2.5 font-mono text-sm font-medium" style={{ color: '#06b6d4' }}>
                                {formatTargetPrice(stock)}
                              </td>
                              <td className="px-4 py-2.5">
                                <span
                                  className="font-mono text-sm font-semibold px-2 py-0.5 rounded"
                                  style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                                >
                                  +{stock.expectedReturn}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*                        MAIN COMPONENT                                  */
/* ═══════════════════════════════════════════════════════════════════════ */

type TabKey = 'heatmap' | 'popularity' | 'movers' | 'volume' | 'sectors';

const tabDefinitions: { key: TabKey; labelKey: string; icon: React.ReactNode }[] = [
  { key: 'heatmap', labelKey: 'marketOverview.themeHeatmap', icon: <Flame size={14} /> },
  { key: 'popularity', labelKey: 'marketOverview.mostViewed', icon: <Eye size={14} /> },
  { key: 'movers', labelKey: 'marketOverview.gainersLosers', icon: <TrendingUp size={14} /> },
  { key: 'volume', labelKey: 'marketOverview.topVolume', icon: <BarChart3 size={14} /> },
  { key: 'sectors', labelKey: 'marketOverview.sectorGroups', icon: <Layers size={14} /> },
];

export default function MarketOverview() {
  const [activeTab, setActiveTab] = useState<TabKey>('heatmap');
  const { t } = useT();

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'heatmap':
        return <ThemeHeatmapTab />;
      case 'popularity':
        return <PopularityTab />;
      case 'movers':
        return <GainersLosersTab />;
      case 'volume':
        return <VolumeTab />;
      case 'sectors':
        return <SectorGroupsTab />;
      default:
        return <ThemeHeatmapTab />;
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#020617' }}>
      {/* Header */}
      <div className="px-4 lg:px-6 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#f1f5f9] mb-1">{t('marketOverview.title')}</h1>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            {t('marketOverview.subtitle')}
          </p>
        </motion.div>

        {/* Tab Bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabDefinitions.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={
                  isActive
                    ? {
                        backgroundColor: '#4f46e5',
                        color: '#ffffff',
                        boxShadow: '0 4px 14px rgba(79,70,229,0.3)',
                      }
                    : {
                        backgroundColor: 'rgba(15,23,42,0.6)',
                        color: '#94a3b8',
                        border: '1px solid rgba(51,65,85,0.4)',
                        backdropFilter: 'blur(8px)',
                      }
                }
              >
                {tab.icon}
                {t(tab.labelKey as Parameters<typeof t>[0])}
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom spacing */}
      <div className="h-12" />
    </div>
  );
}
