import React from 'react';
import { motion } from 'framer-motion';

export const DashboardSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-silver-ultra p-8 font-main">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-12">
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-200 animate-pulse rounded" />
                    <div className="h-8 w-64 bg-slate-100 animate-pulse rounded-lg" />
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-200 animate-pulse" />
            </div>

            {/* Bento Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 h-64 bg-white border border-slate-100 rounded-3xl p-8 space-y-4 shadow-sm">
                    <div className="h-4 w-1/4 bg-slate-200 rounded" />
                    <div className="h-32 bg-slate-50 rounded-xl" />
                </div>
                <div className="h-64 bg-white border border-slate-100 rounded-3xl p-8 space-y-4 shadow-sm">
                    <div className="h-4 w-1/2 bg-slate-200 rounded" />
                    <div className="h-24 bg-slate-50 rounded-xl" />
                </div>
                <div className="h-64 bg-white border border-slate-100 rounded-3xl p-8 space-y-4 shadow-sm">
                    <div className="h-4 w-1/3 bg-slate-200 rounded" />
                    <div className="flex flex-col gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-8 bg-slate-50 rounded-lg w-full" />
                        ))}
                    </div>
                </div>
                
                {/* Bottom Row */}
                <div className="md:col-span-3 h-80 bg-white border border-slate-100 rounded-3xl p-8 space-y-6 shadow-sm">
                    <div className="flex justify-between">
                        <div className="h-6 w-48 bg-slate-200 rounded" />
                        <div className="h-6 w-24 bg-slate-100 rounded" />
                    </div>
                    <div className="h-48 bg-slate-50 rounded-2xl w-full" />
                </div>
                <div className="h-80 bg-white border border-slate-100 rounded-3xl p-8 space-y-6 shadow-sm">
                    <div className="h-40 w-40 mx-auto rounded-full border-8 border-slate-50 animate-pulse" />
                    <div className="h-4 w-3/4 mx-auto bg-slate-100 rounded" />
                </div>
            </div>

            {/* Boot Status Indicator */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-200 shadow-xl flex items-center gap-3">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-cobalt-sliit border-t-transparent rounded-full"
                />
                <span className="text-[10px] font-black text-cobalt-sliit uppercase tracking-widest">
                    Initializing System Handshake...
                </span>
            </div>
        </div>
    );
};
