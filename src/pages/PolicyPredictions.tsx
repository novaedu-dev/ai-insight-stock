import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Send,
  Sparkles,
  TrendingUp,
  Cpu,
  Zap,
  Dna,
  User,
  Loader2,
} from 'lucide-react';

const CARD_BG = 'rgba(15,23,42,0.6)';
const CARD_BORDER = 'rgba(51,65,85,0.4)';

const PRESET_QUESTIONS = [
  {
    icon: Cpu,
    label: 'K-반도체 특화단지',
    query: '2025년 K-반도체 특화단지 정책(용인 622조 투자, 반도체 특별법, 파운드리 세액공제)이 주식 시장에 미치는 영향과 수혜 종목(케이엔솔, 서진시스템, 삼성바이오로직스)에 대한 투자 전망을 상세히 분석해줘. 진입 전략, 상승 트리거, 리스크도 포함해줘.',
  },
  {
    icon: Zap,
    label: 'AI 데이터센터 인프라',
    query: '2025년 AI 데이터센터 전력인프라 확충, 재생에너지 3020 정책, ESS 의무설치 확대 등 정책이 관련 종목(GST, HD현대일렉트릭, 서진시스템)에 미치는 영향과 투자 전망을 분석해줘.',
  },
  {
    icon: TrendingUp,
    label: 'K-로봇·모빌리티',
    query: '2026년 K-로봇 종합발전계획, 자율주행 L4 상용화, 로보틱스 R&D 2조 투자 등 정책이 현대차와 레인보우로보틱스에 미치는 영향과 투자 전략을 분석해줘.',
  },
  {
    icon: Dna,
    label: 'K-바이오 글로벌 확장',
    query: '2027년 K-바이오 수출 200억달러 목표, 비만치료제 건강보험 급여, CDMO 클러스터 확대 등 정책이 삼성바이오로직스, 일라이릴리, 노볼노디스크에 미치는 영향을 분석해줘.',
  },
  {
    icon: Sparkles,
    label: 'K-퀀텀 얼라이스',
    query: '2026년 K-퀀텀 얼라이스, 양자컴퓨팅 5개년 R&D 1조, 양자암호통신 상용화 정책이 SK텔레콤, IBM, 아이온큐에 미치는 영향과 투자 전망을 분석해줘.',
  },
  {
    icon: BookOpen,
    label: '2년 정부정책 총정리',
    query: '2025-2027년 한국 정부의 주요 경제정책(반도체, 로봇, 바이오, 양자, 에너지)을 종합적으로 정리하고, 각 정책별 수혜 섹터와 대표 종목, 그리고 단기/중기/장기 투자 전략을 제시해줘.',
  },
];

interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

/** Gemini API 호출 */
async function askGemini(message: string): Promise<string> {
  try {
    const res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Gemini 응답 파싱
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;
    return '죄송합니다. 응답을 생성하지 못했습니다. 다시 시도해 주세요.';
  } catch {
    return '⚠️ AI 서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.';
  }
}

export function PolicyPredictions() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 새 메시지 추가 시 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: text.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const aiText = await askGemini(userMsg.text);

    const aiMsg: ChatMessage = { role: 'ai', text: aiText, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-[calc(100vh-64px)]"
    >
      {/* 헤더 */}
      <motion.div variants={itemVariants} className="shrink-0 px-4 lg:px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen size={20} className="text-indigo-400" />
          <h1 className="text-xl font-bold text-slate-100">정부정책 테마 예측</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium ml-2">
            AI 실시간 분석
          </span>
        </div>
        <p className="text-sm text-slate-400">
          Gemini AI가 정부정책을 실시간 분석합니다. 아래 질문을 선택하거나 직접 입력하세요.
        </p>
      </motion.div>

      {/* 프리셋 질문 버튼들 (처음에만 표시) */}
      {messages.length === 0 && (
        <motion.div variants={itemVariants} className="shrink-0 px-4 lg:px-6 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {PRESET_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.query)}
                className="flex items-center gap-2 p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
              >
                <q.icon size={16} className="text-indigo-400 shrink-0" />
                <span className="text-xs text-slate-300 font-medium">{q.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 채팅 영역 */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 pb-4 space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}>
                <Sparkles size={16} className="text-indigo-400" />
              </div>
            )}
            <div
              className={`max-w-[85%] lg:max-w-[75%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : ''
              }`}
              style={msg.role === 'ai' ? { backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` } : {}}
            >
              {msg.role === 'ai' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }} />
                </div>
              ) : (
                <p className="text-sm">{msg.text}</p>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: 'rgba(16,185,129,0.2)' }}>
                <User size={16} className="text-emerald-400" />
              </div>
            )}
          </motion.div>
        ))}

        {/* 로딩 */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(99,102,241,0.2)' }}>
              <Loader2 size={16} className="text-indigo-400 animate-spin" />
            </div>
            <div className="rounded-2xl p-4" style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}>
              <p className="text-sm text-slate-400">AI가 정책을 분석하는 중...</p>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <motion.div variants={itemVariants} className="shrink-0 px-4 lg:px-6 pb-4 pt-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            placeholder="정부정책에 대해 질문하세요... (예: 2025년 반도체 정책의 주식 영향은?)"
            className="flex-1 px-4 py-3 rounded-xl text-sm text-slate-200 placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500/50"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-3 rounded-xl transition-all duration-200 disabled:opacity-50"
            style={{ backgroundColor: loading || !input.trim() ? '#1e293b' : '#6366f1' }}
          >
            <Send size={18} className="text-white" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** 간단한 마크다운 → HTML 변환 */
function formatMarkdown(text: string): string {
  return text
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-slate-200 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-slate-100 mt-5 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-slate-100 mt-6 mb-4">$1</h1>')
    .replace(/^\* (.*$)/gim, '<li class="ml-4 text-slate-300 text-sm leading-relaxed list-disc">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 text-slate-300 text-sm leading-relaxed list-decimal">$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-200 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-700 text-emerald-400 text-xs font-mono">$1</code>')
    .replace(/\n/g, '<br/>');
}
