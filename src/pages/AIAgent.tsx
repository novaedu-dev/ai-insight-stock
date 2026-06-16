import { useT } from '@/i18n';

export function AIAgent() {
  const { t } = useT();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <img src="/ai-agent-avatar.svg" alt="" className="w-24 h-auto mb-6" />
      <h2 className="text-xl font-bold text-[#f1f5f9] mb-2">{t('nav.aiAgent')}</h2>
      <p className="text-sm text-[#94a3b8] text-center">AI 에이전트가 곧 제공됩니다.</p>
    </div>
  );
}
