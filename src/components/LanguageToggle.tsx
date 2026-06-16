import { useLanguageStore } from '@/store/languageStore';
import type { Language } from '@/store/languageStore';
import { motion } from 'framer-motion';

export function LanguageToggle() {
  const { lang, setLang } = useLanguageStore();

  const options: Language[] = ['KO', 'EN'];

  return (
    <div
      className="relative flex items-center h-[32px] w-[120px] rounded-full"
      style={{ backgroundColor: '#1e293b' }}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => setLang(option)}
          className="relative z-10 flex-1 flex items-center justify-center h-full text-xs font-medium transition-colors duration-200"
          style={{
            color: lang === option ? '#ffffff' : '#94a3b8',
          }}
        >
          {option === 'KO' ? 'KO' : 'EN'}
        </button>
      ))}
      <motion.div
        className="absolute top-1 bottom-1 rounded-full"
        style={{
          backgroundColor: '#6366f1',
          width: '56px',
        }}
        animate={{
          left: lang === 'KO' ? '4px' : '60px',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
    </div>
  );
}
