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
import { Send, Sparkles, User, RotateCcw } from 'lucide-react';
import type { ChatMessage } from '../../types/ai';
import { sendChatMessage } from '../../services/aiService';
import profileService from '../../services/profileService';
import type { StudentProfile } from '../../types/profile';

// ── Default starters ───────────────────────────────────────────────────────
const DEFAULT_STARTERS = [
    '🎯 What career path suits me best?',
    '💻 What projects should I build next?',
    '🔍 What skills do I need for a Data Science role?',
    '⚡ Analyse my skill gaps for a Senior SE role.',
];

// ── Typing Indicator Sub-Component ────────────────────────────────────────
const TypingIndicator: React.FC<{ statusText: string }> = ({ statusText }) => (
    <div className="flex items-end gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Sparkles size={13} className="text-white" />
        </div>
        <div className="glass px-4 py-3 rounded-2xl rounded-bl-md flex flex-col gap-2">
            <div className="flex gap-1.5 items-center h-4">
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-purple-400"
                        style={{
                            animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-purple-600/80 animate-pulse">{statusText}</p>
        </div>
    </div>
);

// ── Message Content Parser for [ACTION_CARD] ──────────────────────────────
const renderMessageContent = (content: string, isUser: boolean, onActionClick?: (title: string) => void) => {
    if (isUser) return <p>{content}</p>;

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
                <div key={idx} className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-li:my-0.5 prose-headings:text-slate-800 prose-strong:text-slate-900">
                    <ReactMarkdown>{part.text}</ReactMarkdown>
                </div>
            );
        } else {
            return (
                <div key={idx} className="my-3 bg-white/80 border border-purple-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-100 to-cyan-100 flex items-center justify-center">
                            <Sparkles size={12} className="text-purple-600" />
                        </div>
                        <h4 className="font-black text-slate-800 text-sm group-hover:text-purple-700 transition-colors">{part.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium mb-3">
                        {part.content}
                    </p>
                    <button 
                        onClick={() => onActionClick?.(part.title)}
                        className="text-[10px] cursor-pointer uppercase font-black tracking-widest text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg hover:bg-purple-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 w-full sm:w-auto">
                        Execute Action
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
        <div className={`flex items-end gap-3 mb-4 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${isUser
                    ? 'bg-gradient-to-br from-slate-600 to-slate-800'
                    : 'bg-gradient-to-br from-purple-500 to-cyan-500'
                    }`}
            >
                {isUser
                    ? <User size={13} className="text-white" />
                    : <Sparkles size={13} className="text-white" />
                }
            </div>

            {/* Bubble */}
            <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-md shadow-lg shadow-purple-500/20'
                    : 'glass text-slate-800 rounded-bl-md'
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
            content: `👋 **Ayubowan! I'm NEXAR, your personal AI Career Mentor.**\n\nI've loaded your complete student profile and I'm ready to give you brutally honest, ultra-personalised career guidance.\n\n*What would you like to explore today?*`,
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [thinkingState, setThinkingState] = useState('Analyzing Profile...');
    
    // Dynamic Starters Profile Fetching
    const [starters, setStarters] = useState<string[]>(DEFAULT_STARTERS);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await profileService.getMe();
                if (profile.profileCompleteness < 50) {
                    setStarters([
                        '🚨 Help me complete my profile to unlock advanced analysis.',
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

    // Simulated Thinking State Cycler
    useEffect(() => {
        if (!isLoading) return;
        const states = [
            'Analyzing Profile Data...',
            'Cross-referencing SLIIT Curriculum...',
            'Evaluating Tech Stack...',
            'Checking Sri Lankan Tech Market...',
            'Formulating Brutal Honesty...'
        ];
        let i = 0;
        setThinkingState(states[0]);
        const interval = setInterval(() => {
            i = (i + 1) % states.length;
            setThinkingState(states[i]);
        }, 1200);
        return () => clearInterval(interval);
    }, [isLoading]);

    // Auto-scroll to bottom on new message
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
            const message = err instanceof Error ? err.message : 'An error occurred. Please try again.';
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
            content: `Chat cleared! I still remember your profile. What can I help you with?`,
            timestamp: new Date(),
        }]);
        setError(null);
    };

    return (
        <div className="card flex flex-col h-[70vh] min-h-[500px] p-0 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/50 bg-white/30 backdrop-blur-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">NEXAR AI Mentor</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">● Online — Profile Loaded</p>
                    </div>
                </div>
                <button
                    onClick={handleClear}
                    title="Clear chat"
                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all duration-200"
                >
                    <RotateCcw size={15} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 scrollbar-hide">
                {/* Starter prompts — only shown before user sends anything */}
                {messages.length === 1 && (
                    <div className="mb-6">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-3">Quick Starters</p>
                        <div className="flex flex-wrap gap-2">
                            {starters.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleSend(s)}
                                    className={`text-xs px-3 py-2 rounded-xl glass hover:bg-white/90 transition-all duration-200 font-medium border border-white/60 hover:shadow-sm ${
                                        s.includes('🚨') 
                                        ? 'text-rose-700 hover:border-rose-200 hover:text-rose-800'
                                        : 'text-slate-700 hover:border-purple-200 hover:text-purple-700'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <MessageBubble 
                        key={i} 
                        msg={msg} 
                        onActionClick={(title) => handleSend(`Tell me more about: ${title}. How can I get started?`)} 
                    />
                ))}

                {isLoading && <TypingIndicator statusText={thinkingState} />}

                {error && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                        ⚠️ {error}
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div className="px-4 py-4 border-t border-white/50 bg-white/20 backdrop-blur-sm flex-shrink-0">
                <div className="flex gap-3 items-end">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything about your career… (Enter to send, Shift+Enter for new line)"
                        rows={1}
                        disabled={isLoading}
                        className="flex-1 resize-none rounded-xl px-4 py-3 text-sm bg-white/70 border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 outline-none text-slate-800 placeholder-slate-400 transition-all duration-200 max-h-32 overflow-y-auto scrollbar-hide disabled:opacity-50"
                        style={{ lineHeight: '1.6' }}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={isLoading || !input.trim()}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:scale-100 disabled:shadow-none flex-shrink-0"
                    >
                        <Send size={16} />
                    </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                    AI advice is for guidance only. Always verify with career professionals.
                </p>
            </div>

            {/* Bounce animation style */}
            <style>{`
                @keyframes bounce {
                    0%, 60%, 100% { transform: translateY(0); }
                    30% { transform: translateY(-6px); }
                }
            `}</style>
        </div>
    );
};

export default AiAdvisorChat;
