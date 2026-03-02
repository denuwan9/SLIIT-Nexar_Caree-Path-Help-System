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
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="card max-w-lg w-full flex flex-col items-center text-center p-8 md:p-12 lg:p-16 relative overflow-hidden">
                {/* Decorative blurs */}
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>

                <div className="w-18 h-18 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-xl shadow-purple-500/20 mb-7 relative z-10 p-4">
                    <Construction size={32} className="text-white" />
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter mb-4 relative z-10 leading-tight">
                    {title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Coming Soon</span>
                </h1>

                <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed mb-8 max-w-sm relative z-10">
                    {description}
                </p>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-primary flex items-center gap-2.5 group relative z-10 text-sm"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </button>

                <div className="mt-8 inline-flex items-center gap-2 glass-pill">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Under Development</span>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
