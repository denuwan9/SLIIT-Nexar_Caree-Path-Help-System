import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

interface ComingSoonProps {
    title: string;
    description: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] animate-float">
            <div className="card max-w-2xl w-full flex flex-col items-center text-center p-16 relative overflow-hidden">
                {/* Decorative background blur */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-xl shadow-purple-500/20 mb-10 relative z-10">
                    <Construction size={40} className="text-white" />
                </div>

                <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-6 relative z-10">
                    {title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Coming Soon</span>
                </h1>

                <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12 max-w-md relative z-10">
                    {description}
                </p>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-primary flex items-center gap-3 group relative z-10"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                {/* Status Pill */}
                <div className="mt-12 inline-flex items-center gap-2 glass-pill">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Under Development</span>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
