import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const LightAuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen bg-silver-ultra flex items-center justify-center p-6 font-main">
            {/* Ambient Background subtle circles */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cobalt-sliit/5 rounded-full blur-[120px]" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-success/5 rounded-full blur-[120px]" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-width-[480px] soft-glass p-10 relative z-10"
            >
                <div className="text-center mb-10">
                    <motion.h1 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-black text-cobalt-sliit tracking-tight uppercase italic"
                    >
                        {title}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-soft text-sm mt-2 font-medium"
                    >
                        {subtitle}
                    </motion.p>
                </div>

                <AnimatePresence mode="wait">
                    {children}
                </AnimatePresence>
            </motion.div>

            {/* Support Info */}
            <div className="fixed bottom-8 text-center w-full pointer-events-none">
                <p className="text-[10px] font-bold text-slate-soft/40 uppercase tracking-[0.3em]">
                    SLIIT Nexar Core Security Protocol v2.5
                </p>
            </div>
        </div>
    );
};
