/**
 * AiAdvisorChat.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Full-featured chat interface for the Nexar AI Career Advisor (Grok).
 * Features:
 *  - Animated typing indicator (3-dot bounce)
 *  - Markdown rendering for rich AI responses via react-markdown
 *  - Persistent chat history within the session
 *  - Auto-scroll to latest message
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Sparkles, User, RotateCcw, ArrowRight, ShieldCheck } from 'lucide-react';
import type { ChatMessage } from '../../types/ai';
import { sendChatMessage } from '../../services/aiService';
import profileService from '../../services/profileService';

// ── Default starters ───────────────────────────────────────────────────────
const DEFAULT_STARTERS = [
    '🎯 What career path suits me best?',
    '💻 What projects should I build next?',
    '🔍 What skills do I need for a Data Science role?',
    '⚡ Analyse my skill gaps for a Senior SE role.',
];

// ── Typing Indicator Sub-Component ────────────────────────────────────────
const TypingIndicator: React.FC<{ statusText: string }> = ({ statusText }) => (
    <div className="flex items-end gap-3 mb-6 animate-in fade-in slide-in-from-left-2 duration-300">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0F172A] to-slate-700 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Sparkles size={14} className="text-white" />
        </div>
        <div className="bg-white border border-slate-100 px-5 py-4 rounded-[2rem] rounded-bl-md shadow-sm flex flex-col gap-2">
            <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-[#0F172A]"
                        style={{
                            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B] animate-pulse">{statusText}</p>
        </div>
    </div>
);

// ── Message Content Parser for [ACTION_CARD] ──────────────────────────────
const renderMessageContent = (content: string, isUser: boolean, onActionClick?: (title: string) => void) => {
    if (isUser) return <p className="font-medium leading-relaxed">{content}</p>;

    const cardRegex = /\[ACTION_CARD:\s*([^|]+)\s*\|\s*([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = cardRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
        }
        parts.push({ type: 'card', title: match[1].trim(), content: match[2].trim() });
        lastIndex = cardRegex.lastIndex;
    }

    if (lastIndex < content.length) {
        parts.push({ type: 'text', text: content.slice(lastIndex) });
    }

    return parts.map((part, idx) => {
        if (part.type === 'text') {
            return (
                <div key={idx} className="prose prose-sm prose-slate max-w-none prose-p:my-2 prose-li:my-1 prose-headings:text-[#0F172A] prose-strong:text-[#0F172A] prose-p:leading-relaxed">
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                </div>
            );
        } else {
            return (
                <div key={idx} className="my-5 bg-slate-50 border border-slate-200/60 rounded-[1.5rem] p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                            <Sparkles size={14} className="text-[#0F172A]" />
                        </div>
                        <h4 className="font-black text-[#0F172A] text-[13px] uppercase tracking-wider group-hover:text-blue-700 transition-colors">{part.title}</h4>
                    </div>
                    <p className="text-xs text-[#64748B] leading-relaxed font-bold mb-4">
                        {part.content}
                    </p>
                    <button 
                        onClick={() => part.title && onActionClick?.(part.title)}
                        className="text-[10px] cursor-pointer uppercase font-black tracking-widest text-white bg-[#0F172A] px-5 py-2.5 rounded-xl hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.95] transition-all duration-300 w-full sm:w-auto shadow-lg shadow-slate-200">
                        Execute Strategy
                    </button>
                </div>
            );
        }
    });
};

// ── Message Bubble Sub-Component ──────────────────────────────────────────
const MessageBubble: React.FC<{ msg: ChatMessage, onActionClick?: (title: string) => void }> = ({ msg, onActionClick }) => {
    const isUser = msg.role === 'user';
    return (
        <div className={`flex items-end gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
            {/* Avatar */}
            <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${isUser
                    ? 'bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600'
                    : 'bg-gradient-to-br from-[#0F172A] to-[#1E293B] border border-slate-800'
                    }`}
            >
                {isUser
                    ? <User size={15} className="text-white" />
                    : <Sparkles size={15} className="text-white" />
                }
            </div>

            {/* Bubble */}
            <div
                className={`max-w-[85%] px-6 py-4 rounded-[2rem] text-[14px] leading-relaxed shadow-sm ${isUser
                    ? 'bg-[#0F172A] text-white rounded-br-md shadow-xl shadow-slate-200'
                    : 'bg-white text-[#334155] border border-slate-100 rounded-bl-md'
                    }`}
            >
                {renderMessageContent(msg.content, isUser, onActionClick)}
            </div>
        </div>
    );
};

const AiAdvisorChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'assistant',
            content: `👋 **Ayubowan! I'm NEXAR, your enterprise AI Career Strategist.**\n\nI've integrated your full analytical student profile. We're ready to execute high-impact career planning based on real-time market data.\n\n*What strategic objective shall we address today?*`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [thinkingState, setThinkingState] = useState('Syncing Profile...');
    
    const [starters, setStarters] = useState<string[]>(DEFAULT_STARTERS);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await profileService.getMe();
                if (profile.profileCompleteness < 50) {
                    setStarters([
                        '🚨 Strategic Alert: Profile Incomplete. Initialise Optimisation.',
                        ...DEFAULT_STARTERS.slice(0, 3)
                    ]);
                } else {
                    setStarters(DEFAULT_STARTERS);
                }
            } catch (err) {
                console.error('Failed to load profile for starters', err);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!isLoading) return;
        const states = [
            'Analyzing Professional Trajectory...',
            'Cross-referencing Global Standards...',
            'Evaluating Skill Dominance...',
            'Assessing Market Competitiveness...',
            'Synthesizing Strategy...'
        ];
        let i = 0;
        setThinkingState(states[0]);
        const interval = setInterval(() => {
            i = (i + 1) % states.length;
            setThinkingState(states[i]);
        }, 1200);
        return () => clearInterval(interval);
    }, [isLoading]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, thinkingState]);

    const handleSend = useCallback(async (text?: string) => {
        const payload = (text ?? input).trim();
        if (!payload || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: payload, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const reply = await sendChatMessage(payload, messages);
            setMessages(prev => [...prev, { role: 'assistant', content: reply, timestamp: new Date() }]);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Strategic sync failed. Retry required.';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [input, messages, isLoading]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        setMessages([{
            role: 'assistant',
            content: `Session Reset. Profile context maintained. Awaiting next command.`,
            timestamp: new Date(),
        }]);
        setError(null);
    };

    return (
        <div className="bg-white rounded-[2.5rem] flex flex-col h-[75vh] min-h-[600px] p-0 overflow-hidden shadow-sm border border-slate-100/50">

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 bg-[#F8FAFC]/50 backdrop-blur-md flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-lg shadow-slate-200 border border-slate-800">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[15px] font-black text-[#0F172A] tracking-wider uppercase">NEXAR Intelligence</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em]">Live — Deep Context Active</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleClear}
                    title="Reset Session"
                    className="w-10 h-10 rounded-xl text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 flex items-center justify-center transition-all duration-300"
                >
                    <RotateCcw size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide bg-[#FDFDFD]">
                {/* Starter prompts */}
                {messages.length === 1 && (
                    <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                        <p className="text-[11px] text-[#94A3B8] font-black uppercase tracking-[0.3em] mb-4">Strategic Entry Points</p>
                        <div className="flex flex-wrap gap-2.5">
                            {starters.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleSend(s)}
                                    className={`text-[12px] px-5 py-3 rounded-2xl bg-white border border-slate-100 hover:border-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all duration-400 font-black shadow-sm group ${
                                        s.includes('🚨') 
                                        ? 'border-rose-100 text-rose-700 hover:bg-rose-600 hover:border-rose-600'
                                        : 'text-[#475569]'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {s}
                                        <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {messages.map((msg, i) => (
                        <MessageBubble 
                            key={i} 
                            msg={msg} 
                            onActionClick={(title) => handleSend(`Initialise Deep-Dive: ${title}. Provide implementation roadmap.`)} 
                        />
                    ))}
                </div>

                {isLoading && <TypingIndicator statusText={thinkingState} />}

                {error && (
                    <div className="mb-6 px-6 py-4 rounded-[1.5rem] bg-rose-50 border border-rose-100 text-rose-600 text-[13px] font-bold shadow-sm animate-in shake duration-500">
                        ⚠️ Strategic Exception: {error}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="px-8 py-6 border-t border-slate-50 bg-[#F8FAFC]/30 backdrop-blur-md flex-shrink-0">
                <div className="flex gap-4 items-end max-w-5xl mx-auto w-full">
                    <div className="flex-1 relative group">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Input command or query student dataset..."
                            rows={1}
                            disabled={isLoading}
                            className="w-full resize-none rounded-2xl px-6 py-4 text-[14px] bg-white border border-slate-100 focus:border-[#0F172A] focus:ring-4 focus:ring-slate-100 outline-none text-[#1E293B] font-bold placeholder-[#94A3B8] transition-all duration-400 max-h-40 overflow-y-auto scrollbar-hide disabled:opacity-50 shadow-sm"
                            style={{ lineHeight: '1.6' }}
                        />
                    </div>
                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className="w-14 h-14 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white shadow-xl shadow-slate-200 hover:shadow-slate-300 hover:scale-110 active:scale-90 transition-all duration-500 disabled:opacity-20 disabled:scale-100 disabled:shadow-none flex-shrink-0"
                    >
                        <Send size={20} className={isLoading ? 'animate-pulse' : ''} />
                    </button>
                </div>
                <div className="flex items-center justify-center gap-4 mt-4">
                    <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <ShieldCheck size={12} className="text-emerald-500" /> Professional-Grade Advisory
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-8px); }
                }
                .shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }
            `}</style>
        </div>
    );
};

export default AiAdvisorChat;
