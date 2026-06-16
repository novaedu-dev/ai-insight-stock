import { useT } from '@/i18n';

export function ThemeAnalysis() {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <img src="/empty-state-search.svg" alt="" className="w-48 h-auto mb-6 opacity-50" />
      <h2 className="text-xl font-bold text-[#f1f5f9] mb-2">{t('nav.themes')}</h2>
      <p className="text-sm text-[#94a3b8] text-center">테마 분석 페이지가 곧 제공됩니다.</p>
    </div>
  );
}
