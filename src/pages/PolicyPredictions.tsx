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
  RefreshCw,
} from 'lucide-react';

const CARD_BG = 'rgba(15,23,42,0.6)';
const CARD_BORDER = 'rgba(51,65,85,0.4)';

const PRESET_QUESTIONS = [
  { icon: Cpu, label: 'K-반도체 수혜주', query: '2025년 K-반도체 특화단지 정책의 주식 수혜 종목과 투자 전략을 알려줘.' },
  { icon: Zap, label: 'AI 전력 인프라', query: 'AI 데이터센터 전력 인프라 관련 수혜 종목과 전망을 알려줘.' },
  { icon: TrendingUp, label: 'K-로봇·모빌리티', query: 'K-로봇 정책의 수혜 종목과 투자 전략을 알려줘.' },
  { icon: Dna, label: 'K-바이오', query: 'K-바이오 글로벌 확장 정책의 수혜 종목과 전망을 알려줘.' },
  { icon: Sparkles, label: '양자컴퓨팅', query: 'K-퀀텀 얼라이스 정책의 수혜 종목과 투자 전략을 알려줘.' },
  { icon: BookOpen, label: '정책 총정리', query: '2025-2027년 한국 정부정책 중 가장 수혜가 큰 종목 3개와 투자 전략을 알려줘.' },
];

const GEMINI_API_KEY = 'AIzaSyA6dCjcHO7y1XlBXPCFMWjxzW1hLIKJwuU';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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

/** Gemini API 직접 호출 (프론트엔드에서 allorigins 프록시 경유) */
async function askGemini(message: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);

  try {
    const targetUrl = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(targetUrl)}`;

    const res = await fetch(proxyUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: '당신은 20년 경력 주식 애널리스트입니다. 한국어로 간결하게 답변하세요.' }] },
          { role: 'user', parts: [{ text: message }] },
        ],
      }),
    });

    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text();
      console.error('[Gemini] HTTP error:', res.status, text.substring(0, 200));
      return `⚠️ API 오류 (HTTP ${res.status}): 잠시 후 다시 시도해 주세요.`;
    }

    const data = await res.json();
    console.log('[Gemini] Response keys:', Object.keys(data));

    if (data.error) {
      return `⚠️ API 오류: ${data.error.message || '알 수 없는 오류'}`;
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;

    // candidates가 없는 경우 (block 등)
    if (data.candidates?.[0]?.finishReason === 'SAFETY') {
      return '⚠️ 안전 정책으로 인해 응답이 차단되었습니다. 다른 질문을 시도해 주세요.';
    }

    return '⚠️ 응답을 파싱하지 못했습니다. 다시 시도해 주세요.';
  } catch (err: any) {
    clearTimeout(timer);
    console.error('[Gemini] Fetch error:', err.name, err.message);
    if (err.name === 'AbortError') {
      return '⏱️ 요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해 주세요.';
    }
    return `⚠️ 네트워크 오류: ${err.message}`;
  }
}

export function PolicyPredictions() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasAutoRun, setHasAutoRun] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // 페이지 로드 시 자동 분석
  useEffect(() => {
    if (hasAutoRun) return;
    setHasAutoRun(true);

    const autoPrompt = '2025-2027년 한국 정부정책(반도체, 로봇, 바이오, 양자, 에너지) 중 주식에 가장 큰 영향을 미칠 정책 3개와 수혜 종목, 진입 전략을 간결히 알려줘. 표 형식으로.';

    setLoading(true);
    askGemini(autoPrompt).then(text => {
      setMessages([{ role: 'ai', text, timestamp: Date.now() }]);
      setLoading(false);
    });
  }, [hasAutoRun]);

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

  const handleRetry = () => {
    if (messages.length === 0) return;
    // 마지막 user 메시지를 다시 본냄
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
      handleSend(lastUser.text);
    } else {
      // user 메시지가 없으면 (자동 분석 실패 시) 자동 프롬프트로 재시도
      setLoading(true);
      const autoPrompt = '2025-2027년 한국 정부정책 중 주식에 가장 큰 영향을 미칠 정책 3개와 수혜 종목, 진입 전략을 간결히 알려줘.';
      askGemini(autoPrompt).then(text => {
        setMessages(prev => {
          // 기존 ai 메시지를 새 메시지로 교체
          const filtered = prev.filter(m => m.role !== 'ai');
          return [...filtered, { role: 'ai', text, timestamp: Date.now() }];
        });
        setLoading(false);
      });
    }
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-indigo-400" />
            <h1 className="text-xl font-bold text-slate-100">정부정책 테마 예측</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
              AI 실시간 분석
            </span>
          </div>
          {messages.some(m => m.role === 'ai' && m.text.startsWith('⚠️')) && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              style={{ backgroundColor: 'rgba(99,102,241,0.15)' }}
            >
              <RefreshCw size={14} />
              재시도
            </button>
          )}
        </div>
        <p className="text-sm text-slate-400">
          Gemini AI가 정부정책을 실시간 분석합니다. 아래 질문을 선택하거나 직접 입력하세요.
        </p>
      </motion.div>

      {/* 프리셋 질문 버튼들 */}
      {!loading && messages.length <= 1 && (
        <motion.div variants={itemVariants} className="shrink-0 px-4 lg:px-6 pb-4">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {PRESET_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.query)}
                disabled={loading}
                className="flex items-center gap-2 p-3 rounded-xl text-left transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
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
                msg.role === 'user' ? 'bg-indigo-600 text-white' : ''
              }`}
              style={msg.role === 'ai' ? { backgroundColor: CARD_BG, border: `1px solid ${CARD_BORDER}` } : {}}
            >
              {msg.role === 'ai' ? (
                <div className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {msg.text}
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
              <p className="text-sm text-slate-400">AI가 정책을 분석하는 중... (최대 25초 소요)</p>
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
            placeholder="정부정책에 대해 질문하세요..."
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
