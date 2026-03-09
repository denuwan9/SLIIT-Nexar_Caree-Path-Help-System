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

// ── Starter prompts ───────────────────────────────────────────────────────
const STARTERS = [
    '🎯 What career path suits me best?',
    '📈 How can I improve my profile completeness?',
    '💻 What projects should I build next?',
    '🔍 What skills do I need for a Data Science role?',
];

// ── Typing Indicator Sub-Component ────────────────────────────────────────
const TypingIndicator: React.FC = () => (
    <div className="flex items-end gap-3 mb-4">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
            <Sparkles size={13} className="text-white" />
        </div>
        <div className="glass px-4 py-3 rounded-2xl rounded-bl-md">
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
        </div>
    </div>
);

// ── Message Bubble Sub-Component ──────────────────────────────────────────
const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
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
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
                    ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-br-md shadow-lg shadow-purple-500/20'
                    : 'glass text-slate-800 rounded-bl-md'
                    }`}
            >
                {isUser ? (
                    <p>{msg.content}</p>
                ) : (
                    <div className="prose prose-sm prose-slate max-w-none prose-p:my-1 prose-li:my-0.5 prose-headings:text-slate-800 prose-strong:text-slate-900">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────
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
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

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
                            {STARTERS.map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleSend(s)}
                                    className="text-xs px-3 py-2 rounded-xl glass text-slate-700 hover:bg-white/70 transition-all duration-200 font-medium border border-white/60 hover:border-purple-200 hover:text-purple-700"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} />
                ))}

                {isLoading && <TypingIndicator />}

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
