import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, ArrowRight } from 'lucide-react';
import { useT } from '@/i18n';
import { themes, useStockStore } from '@/store/stockStore';
import { ThemeCard } from '@/components/ThemeCard';
import { StockPriceCard } from '@/components/StockPriceCard';
import { useMarketIndices } from '@/hooks/useMarketIndices';

export function Dashboard() {
  const { t, lang } = useT();
  const navigate = useNavigate();
  const { stocks: allStocks } = useStockStore();
  const marketIndices = useMarketIndices(30000);

  // Get featured stocks (updated tickers)
  const featuredStocks = allStocks.filter((s) =>
    ['178320.KQ', '083450.KQ', '267260.KS', '208050.KQ', '005380.KS', '078340.KQ', 'IONQ', 'LLY'].includes(s.ticker)
  );

  // Market indices (실시간 데이터 우선)
  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const indices = [
    {
      name: 'KOSPI',
      value: marketIndices.kospi ? fmt(marketIndices.kospi.price) : '2,847.3',
      change: marketIndices.kospi ? `${marketIndices.kospi.change >= 0 ? '+' : ''}${marketIndices.kospi.changePercent.toFixed(1)}%` : '+0.4%',
      isUp: marketIndices.kospi ? marketIndices.kospi.change >= 0 : true,
    },
    {
      name: 'NASDAQ',
      value: marketIndices.nasdaq ? fmt(marketIndices.nasdaq.price) : '17,234.1',
      change: marketIndices.nasdaq ? `${marketIndices.nasdaq.change >= 0 ? '+' : ''}${marketIndices.nasdaq.changePercent.toFixed(1)}%` : '-0.2%',
      isUp: marketIndices.nasdaq ? marketIndices.nasdaq.change >= 0 : false,
    },
    {
      name: 'S&P500',
      value: marketIndices.sp500 ? fmt(marketIndices.sp500.price) : '5,432.7',
      change: marketIndices.sp500 ? `${marketIndices.sp500.change >= 0 ? '+' : ''}${marketIndices.sp500.changePercent.toFixed(1)}%` : '+0.1%',
      isUp: marketIndices.sp500 ? marketIndices.sp500.change >= 0 : true,
    },
  ];

  // Hero title characters for animation
  const title1 = lang === 'KO' ? 'AI 혁명 이후' : 'AI Revolution';
  const title2 = lang === 'KO' ? '차세대 유망주 발굴' : 'Post-AI Tenbagger Stocks';

  const titleChars1 = title1.split('');
  const titleChars2 = title2.split('');

  return (
    <div>
      {/* ====== HERO SECTION ====== */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          height: '340px',
          backgroundImage: 'url(/hero-bg-gradients.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Decorative orbs */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-50px',
            left: '-50px',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(99,102,241,0.20), transparent 70%)',
            borderRadius: '50%',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-80px',
            right: '-80px',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(6,182,212,0.15), transparent 70%)',
            borderRadius: '50%',
          }}
        />

        <div className="relative z-10 h-full flex flex-col justify-center px-6 lg:px-10 max-w-[1400px] mx-auto">
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-4"
          >
            <span
              className="text-[11px] uppercase tracking-[0.1em] font-medium px-3 py-1 rounded"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                color: '#06b6d4',
                border: '1px solid rgba(6,182,212,0.2)',
              }}
            >
              {t('hero.label')}
            </span>
          </motion.div>

          {/* Title Line 1 */}
          <div className="flex flex-wrap mb-1">
            {titleChars1.map((char, i) => (
              <motion.span
                key={`t1-${i}`}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.35 + i * 0.025,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="text-[32px] lg:text-[48px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#f1f5f9]"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </div>

          {/* Title Line 2 */}
          <div className="flex flex-wrap mb-5">
            {titleChars2.map((char, i) => (
              <motion.span
                key={`t2-${i}`}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.35 + titleChars1.length * 0.025 + i * 0.025,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="text-[32px] lg:text-[48px] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#f1f5f9]"
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.9 }}
            className="text-sm text-[#94a3b8] max-w-[540px] leading-relaxed mb-6"
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: 1.1,
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
            className="flex flex-wrap gap-3"
          >
            <button
              onClick={() => navigate('/themes')}
              className="flex items-center gap-2 h-11 px-6 rounded-[10px] text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              }}
            >
              {t('hero.ctaPrimary')}
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => navigate('/ai-agent')}
              className="flex items-center gap-2 h-11 px-6 rounded-[10px] text-sm font-semibold transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                color: '#06b6d4',
                border: '1px solid rgba(6,182,212,0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {t('hero.ctaSecondary')}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ====== MARKET STATUS BAR ====== */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="w-full h-12 flex items-center justify-between px-4 lg:px-6"
        style={{
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
        }}
      >
        {/* Left: Market status */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full"
              style={{ backgroundColor: '#10b981' }}
            />
            <span
              className="relative inline-flex rounded-full h-2 w-2"
              style={{ backgroundColor: '#10b981' }}
            />
          </span>
          <span className="text-xs text-[#94a3b8]">{t('market.open')}</span>
          <span className="hidden sm:inline font-mono text-[11px] text-[#64748b] ml-2">
            {t('market.updated')}: 14:32 KST
          </span>
        </div>

        {/* Right: Quick stats */}
        <div className="flex items-center gap-3 lg:gap-6">
          {indices.map((idx) => (
            <div
              key={idx.name}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
            >
              <span className="font-mono text-[11px] text-[#64748b]">{idx.name}:</span>
              <span className="font-mono text-[11px] font-medium text-[#f1f5f9]">{idx.value}</span>
              <span
                className="font-mono text-[11px] font-medium"
                style={{ color: idx.isUp ? '#10b981' : '#f43f5e' }}
              >
                {idx.change}
              </span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ====== THEME SUMMARY CARDS ====== */}
      <section className="px-4 lg:px-6 py-6 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          <h2 className="text-2xl font-bold text-[#f1f5f9] mb-1">{t('themes.title')}</h2>
          <p className="text-sm text-[#94a3b8]">{t('themes.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {themes.map((theme, i) => (
            <ThemeCard key={theme.key} theme={theme} index={i} />
          ))}
        </div>
      </section>

      {/* ====== FEATURED STOCKS GRID ====== */}
      <section className="px-4 lg:px-6 py-6 max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-5"
        >
          <h2 className="text-2xl font-bold text-[#f1f5f9]">{t('stocks.title')}</h2>
          <button
            onClick={() => navigate('/themes')}
            className="flex items-center gap-1 text-xs font-medium text-[#06b6d4] hover:underline"
          >
            {t('stocks.viewAll')}
            <ArrowRight size={12} />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredStocks.map((stock, i) => (
            <StockPriceCard key={stock.ticker} stock={stock} index={i} />
          ))}
        </div>
      </section>

      {/* ====== AI AGENT CTA ====== */}
      <section
        className="w-full py-12 px-4"
        style={{
          borderTop: '1px solid #1e293b',
          borderBottom: '1px solid #1e293b',
          background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.04), transparent 70%)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4 }}
          className="max-w-[600px] mx-auto text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-bold text-[#f1f5f9] mb-3"
          >
            {t('aiCta.title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-sm text-[#94a3b8] mb-6 max-w-[480px] mx-auto"
          >
            {t('aiCta.subtitle')}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.3, delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            onClick={() => navigate('/ai-agent')}
            className="inline-flex items-center gap-2 h-11 px-6 rounded-[10px] text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            }}
          >
            <Bot size={16} />
            {t('aiCta.button')}
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
