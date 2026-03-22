/**
 * AiAdvisorPage.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Main AI hub page with 5 tabs:
 *   AI Advisor | Skill Dashboard | Career Simulator | Skill Gap | Resume
 * Matches the existing glassmorphism white theme.
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { Sparkles, BarChart2, Rocket, Target, FileText } from 'lucide-react';

import AiAdvisorChat from '../features/ai/AiAdvisorChat';
import SkillDashboard from '../features/ai/SkillDashboard';
import CareerSimulator from '../features/ai/CareerSimulator';
import SkillGapAnalyzer from '../features/ai/SkillGapAnalyzer';
import ResumeAnalyzer from '../features/ai/ResumeAnalyzer';

// ── Tab Config ────────────────────────────────────────────────────────────
const TABS = [
    {
        id: 'chat',
        label: 'AI Advisor',
        icon: Sparkles,
        gradient: 'from-purple-500 to-cyan-500',
        component: AiAdvisorChat,
        description: 'Chat with your personal AI career mentor',
    },
    {
        id: 'skills',
        label: 'Skill Dashboard',
        icon: BarChart2,
        gradient: 'from-blue-500 to-indigo-500',
        component: SkillDashboard,
        description: 'Visualise your skills and proficiency levels',
    },
    {
        id: 'simulator',
        label: 'Career Simulator',
        icon: Rocket,
        gradient: 'from-orange-500 to-rose-500',
        component: CareerSimulator,
        description: 'Generate a personalised career roadmap',
    },
    {
        id: 'gap',
        label: 'Skill Gap',
        icon: Target,
        gradient: 'from-amber-500 to-orange-500',
        component: SkillGapAnalyzer,
        description: 'Find what skills you need for any job',
    },
    {
        id: 'resume',
        label: 'Resume Check',
        icon: FileText,
        gradient: 'from-cyan-500 to-blue-600',
        component: ResumeAnalyzer,
        description: 'Get your ATS score and keyword improvements',
    },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Page Component ────────────────────────────────────────────────────────
const AiAdvisorPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('chat');

    const current = TABS.find(t => t.id === activeTab)!;
    const ActiveComponent = current.component;

    return (
        <div className="w-full pb-10 text-[#0F172A] font-sans">
            <div className="flex flex-col gap-8">
                
                {/* ─── Premium Page Header ─── */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F172A] to-slate-700 flex items-center justify-center shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-500">
                                <Sparkles size={22} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Nexar AI Intelligence</h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Enterprise Grok-1.5 Layer — Sync Active</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-[13px] font-bold text-[#64748B] ml-16 max-w-2xl leading-relaxed">
                            {current.description}. Our AI benchmarks your profile against global standards to provide hyper-personalised career strategy.
                        </p>
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[120px] -z-0 opacity-40 group-hover:scale-110 transition-transform duration-700"></div>
                </div>

                {/* ─── Premium Horizontal Navigation ─── */}
                <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-slate-100/50 flex flex-wrap gap-1.5 overflow-x-auto scrollbar-hide">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest transition-all duration-400 whitespace-nowrap ${isActive
                                    ? 'bg-[#0F172A] text-white shadow-xl shadow-slate-200 scale-[1.02]'
                                    : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                                    }`}
                            >
                                <Icon size={16} className={isActive ? 'text-white' : 'text-[#94A3B8]'} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* ─── Content Area ─── */}
                <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <ActiveComponent />
                </div>
            </div>
        </div>
    );
};

export default AiAdvisorPage;
