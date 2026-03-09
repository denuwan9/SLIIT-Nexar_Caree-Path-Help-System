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

// ── Tab Button ────────────────────────────────────────────────────────────
const TabButton: React.FC<{
    tab: typeof TABS[number];
    isActive: boolean;
    onClick: () => void;
}> = ({ tab, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`
            group flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider
            transition-all duration-300 whitespace-nowrap
            ${isActive
                ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg scale-[1.02]`
                : 'text-slate-500 hover:bg-white/60 hover:text-slate-800 bg-white/30'
            }
        `}
    >
        <tab.icon size={14} className={!isActive ? 'opacity-60' : ''} />
        <span className="hidden sm:inline">{tab.label}</span>
        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
    </button>
);

// ── Page Component ────────────────────────────────────────────────────────
const AiAdvisorPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('chat');

    const current = TABS.find(t => t.id === activeTab)!;
    const ActiveComponent = current.component;

    return (
        <div className="space-y-5 pb-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 tracking-tight">Nexar AI Advisor</h1>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Powered by Grok AI — Profile Loaded</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-slate-400 ml-12">{current.description}</p>
                </div>

                {/* Feature Cards (compact) */}
                <div className="hidden lg:flex gap-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all duration-300 text-center
                                ${tab.id === activeTab
                                    ? `bg-gradient-to-br ${tab.gradient} text-white shadow-md`
                                    : 'bg-white/40 text-slate-500 hover:bg-white/60 border border-white/50'
                                }`}
                        >
                            <tab.icon size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">{tab.label.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Navigation (mobile & tablet) */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-hide bg-white/30 backdrop-blur-sm p-1.5 rounded-2xl border border-white/50">
                {TABS.map(tab => (
                    <TabButton
                        key={tab.id}
                        tab={tab}
                        isActive={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                    />
                ))}
            </div>

            {/* Tab Content */}
            <div key={activeTab} className="animate-in fade-in duration-300">
                <ActiveComponent />
            </div>

            {/* Sprint Roadmap Footer Banner */}
            <div className="mt-8 card bg-gradient-to-r from-slate-800/90 to-slate-900/90 text-white border-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    {[
                        { sprint: 'Sprint 1', status: '✅', task: 'Auth & Profile CRUD' },
                        { sprint: 'Sprint 2', status: '✅', task: 'Grok AI Integration' },
                        { sprint: 'Sprint 3', status: '🔄', task: 'Simulator & Skill Gap' },
                        { sprint: 'Sprint 4', status: '📋', task: 'Resume Tools & Deploy' },
                    ].map(item => (
                        <div key={item.sprint} className="p-3">
                            <p className="text-xl mb-1">{item.status}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.sprint}</p>
                            <p className="text-xs text-slate-300 mt-1 font-medium">{item.task}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AiAdvisorPage;
