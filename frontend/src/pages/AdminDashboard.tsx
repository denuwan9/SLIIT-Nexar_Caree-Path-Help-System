import React, { useState } from 'react';
import { ManageUsers } from '../features/admin/components/ManageUsers';
import { StudentAnalytics } from '../features/admin/components/StudentAnalytics';
import { Users, BarChart3 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'analytics'>('users');

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto relative min-h-[calc(100vh-80px)]">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-400/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 uppercase tracking-tighter mb-2 drop-shadow-sm">
                        Command Center
                    </h1>
                    <p className="text-slate-500 font-medium tracking-wide">Platform Administration & Analytics</p>
                </div>
                
                <div className="flex bg-white/60 backdrop-blur-md border border-white p-1.5 rounded-2xl shadow-sm w-fit">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                            activeTab === 'users' 
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                        }`}
                    >
                        <Users size={16} />
                        Members
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 ${
                            activeTab === 'analytics' 
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                        }`}
                    >
                        <BarChart3 size={16} />
                        Analytics
                    </button>
                </div>
            </div>

            <div className="curated-glass rounded-[2rem] p-2 md:p-6 shadow-xl shadow-slate-200/40 border border-white/50 min-h-[600px] relative overflow-hidden bg-white/40 backdrop-blur-xl">
                {activeTab === 'users' ? <ManageUsers /> : <StudentAnalytics />}
            </div>
        </div>
    );
};

export default AdminDashboard;
