import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Cpu, Atom, Dna, ArrowRight } from 'lucide-react';
import type { ThemeData } from '@/store/stockStore';
import { useStockStore } from '@/store/stockStore';
import { useT } from '@/i18n';

const themeIcons = {
  power: Zap,
  robotics: Cpu,
  quantum: Atom,
  bio: Dna,
};

interface ThemeCardProps {
  theme: ThemeData;
  index?: number;
}

export function ThemeCard({ theme, index = 0 }: ThemeCardProps) {
  const navigate = useNavigate();
  const { t, lang } = useT();
  const { stocks } = useStockStore();

  const Icon = themeIcons[theme.key];
  const themeStocks = stocks.filter((s) => s.theme === theme.key).slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
      whileHover={{
        y: -4,
        borderColor: `${theme.accentColor}4D`,
        boxShadow: `0 8px 32px ${theme.accentColor}1A`,
      }}
      onClick={() => navigate(`/themes?tab=${theme.key}`)}
      className="cursor-pointer rounded-2xl p-5 transition-all duration-250"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #334155',
      }}
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Icon + Title + Description */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-lg"
              style={{ backgroundColor: `${theme.accentColor}14` }}
            >
              <Icon size={24} style={{ color: theme.accentColor }} />
            </div>
            <h3 className="text-xl font-bold text-[#f1f5f9]">
              {lang === 'KO' ? theme.titleKo : theme.titleEn}
            </h3>
          </div>

          <p className="text-sm leading-relaxed mb-4" style={{ color: '#94a3b8' }}>
            {lang === 'KO' ? theme.descriptionKo : theme.descriptionEn}
          </p>

          <div className="flex items-center gap-1 text-sm font-medium" style={{ color: theme.accentColor }}>
            <span>{t('themes.viewAnalysis')}</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Right: Mini stock grid */}
        <div className="grid grid-cols-2 gap-2 lg:w-[180px] flex-shrink-0">
          {themeStocks.map((stock) => {
            const isUSD = stock.exchange === 'NASDAQ' || stock.exchange === 'NYSE';
            const changePercent = ((stock.currentPrice - stock.previousClose) / stock.previousClose) * 100;
            const isUp = changePercent >= 0;

            return (
              <div
                key={stock.ticker}
                className="rounded-lg p-2.5"
                style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)' }}
              >
                <div className="text-[11px] font-semibold text-[#94a3b8] truncate mb-0.5">
                  {lang === 'KO' ? stock.nameKo : stock.nameEn}
                </div>
                <div className="font-mono text-[10px] font-medium uppercase text-[#64748b] mb-1">
                  {stock.ticker}
                </div>
                <div className="font-mono text-[13px] font-semibold text-[#f1f5f9] truncate">
                  {isUSD ? '$' : ''}{stock.currentPrice.toLocaleString()}{!isUSD ? '원' : ''}
                </div>
                <div
                  className="font-mono text-[11px] font-medium"
                  style={{ color: isUp ? '#10b981' : '#f43f5e' }}
                >
                  {isUp ? '+' : ''}{changePercent.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
