import { useT } from '@/i18n';

export function Footer() {
  const { t } = useT();

  return (
    <footer
      className="w-full py-6 px-4 text-center"
      style={{
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1e293b',
      }}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium text-[#64748b]">AI Insight</span>
        <p className="text-[11px] text-[#64748b]">{t('footer.disclaimer')}</p>
        <p className="font-mono text-[11px] text-[#64748b] mt-1">
          {t('footer.lastUpdated')}: {new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </footer>
  );
}
