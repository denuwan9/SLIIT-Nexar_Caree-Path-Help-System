import React, { useState } from 'react';
import { ManageUsers } from '../features/admin/components/ManageUsers';
import { StudentAnalytics } from '../features/admin/components/StudentAnalytics';
import { Users, BarChart3, Shield } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'analytics'>('users');

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto relative min-h-[calc(100vh-80px)] pb-32">
            {/* Ultra-premium background glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-400/5 rounded-full blur-[150px] pointer-events-none animate-pulse delay-1000" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8 bg-slate-950/90 backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl shadow-slate-950/40 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-50" />
                
                <div className="relative flex items-center gap-6">
                    <div className="p-5 rounded-3xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform">
                        <Shield size={36} className="animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-1 drop-shadow-md">
                            Command Center
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] opacity-70">Strategic Platform Administration</p>
                    </div>
                </div>
                
                <div className="relative flex bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-[2rem] shadow-2xl min-w-[320px]">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group/tab ${
                            activeTab === 'users' 
                                ? 'text-white' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {activeTab === 'users' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 animate-in fade-in zoom-in duration-500" />
                        )}
                        <Users size={18} className="relative z-10 group-hover/tab:scale-110 transition-all shadow-sm" />
                        <span className="relative z-10">Members</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden group/tab ${
                            activeTab === 'analytics' 
                                ? 'text-white' 
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        {activeTab === 'analytics' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 animate-in fade-in zoom-in duration-500" />
                        )}
                        <BarChart3 size={18} className="relative z-10 group-hover/tab:scale-110 transition-all shadow-sm" />
                        <span className="relative z-10">Analytics</span>
                    </button>
                </div>
            </div>

            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {activeTab === 'users' ? <ManageUsers /> : <StudentAnalytics />}
            </div>
        </div>
    );
};

export default AdminDashboard;
