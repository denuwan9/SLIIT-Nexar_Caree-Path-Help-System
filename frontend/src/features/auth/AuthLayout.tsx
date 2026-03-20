import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
    mode: 'login' | 'signup';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, mode }) => {
    return (
        <div className="min-h-screen bg-charcoal-deep text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cobalt-electric/10 rounded-full blur-[120px] animate-drift" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px] animate-breathe" />
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                <div className="w-full h-px bg-cobalt-electric animate-scanline" />
                <div className="w-full h-full bg-repeating-linear-gradient(transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)" />
            </div>

            <div className="w-full max-w-[1000px] z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    
                    {/* Left Column: Branding & Info (Bento Style) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5 flex flex-col gap-6"
                    >
                        <div className="glass-dark rounded-[32px] p-8 flex-1 flex flex-col justify-center border-white/5">
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="w-16 h-16 rounded-2xl bg-cobalt-electric/20 border border-cobalt-electric/30 flex items-center justify-center mb-8"
                            >
                                <div className="w-6 h-6 bg-cobalt-electric rounded-sm rotate-45" />
                            </motion.div>
                            <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase italic">
                                Nexar <span className="text-cobalt-electric">Arch</span>
                            </h1>
                            <p className="text-silver-base font-medium leading-relaxed max-w-[280px]">
                                Advanced career architecture and simulation protocols for SLIIT engineers.
                            </p>
                        </div>
                        
                        <div className="glass-dark rounded-[32px] p-6 flex items-center justify-between border-white/5 h-24">
                            <div className="flex -space-x-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full bg-charcoal-deep border-2 border-white/10" />
                                ))}
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">System Status</p>
                                <p className="text-xs text-emerald-400 font-mono tracking-tighter flex items-center justify-end gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    OPERATIONAL
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: Auth Form Container (Bento Style) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-7"
                    >
                        <div className="glass-dark rounded-[40px] p-10 md:p-12 border-white/10 relative overflow-hidden h-full flex flex-col">
                            {/* Accent Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cobalt-electric/20 blur-[60px]" />
                            
                            <div className="relative mb-12">
                                <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">{title}</h2>
                                <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest leading-none">{subtitle}</p>
                                <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-8 h-px bg-cobalt-electric opacity-50" />
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={mode}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="flex-1"
                                >
                                    {children}
                                </motion.div>
                            </AnimatePresence>

                            <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                                <p className="text-[9px] text-slate-600 uppercase tracking-[0.3em] font-black font-mono">
                                    Protocol SL-2026.V4
                                </p>
                                <div className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-white/10" />
                                    <div className="w-2 h-2 rounded-full bg-cobalt-electric/50" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
