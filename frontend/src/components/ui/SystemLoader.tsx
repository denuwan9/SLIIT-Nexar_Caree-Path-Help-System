import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Shield, Database, Wifi } from 'lucide-react';

export const SystemLoader: React.FC = () => {
    const [statusIndex, setStatusIndex] = useState(0);
    const statuses = [
        "Initializing Neural Link...",
        "Syncing Institutional Identity...",
        "Provisioning Career Simulation...",
        "Decrypting Profile Data...",
        "Establishing Secure Protocol..."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStatusIndex((prev) => (prev + 1) % statuses.length);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 bg-charcoal-deep flex flex-col items-center justify-center z-[100] font-sans overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cobalt-electric/10 rounded-full blur-[120px] animate-breathe" />
            
            <div className="relative">
                {/* Outer Progress Ring */}
                <svg className="w-56 h-56 rotate-[-90deg]">
                    <circle 
                        cx="112" cy="112" r="100" 
                        className="stroke-white/5 fill-none" 
                        strokeWidth="2" 
                    />
                    <motion.circle 
                        cx="112" cy="112" r="100" 
                        className="stroke-cobalt-electric fill-none" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                </svg>

                {/* Inner Core Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 90, 0]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md"
                    >
                        <Cpu className="text-cobalt-electric" size={32} />
                    </motion.div>
                </div>
            </div>

            {/* Status Messages */}
            <div className="mt-16 text-center space-y-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={statusIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center gap-2"
                    >
                        <p className="text-cobalt-electric font-mono text-[10px] tracking-[0.4em] uppercase font-black">
                            {statuses[statusIndex]}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Sub-status Matrix-like Stream */}
                <div className="flex gap-4 opacity-30">
                    {[Shield, Database, Wifi].map((Icon, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                            <Icon size={14} className="text-white" />
                            <div className="h-12 w-px bg-gradient-to-b from-cobalt-electric to-transparent" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Matrix Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="w-full h-px bg-cobalt-electric animate-scanline" />
            </div>
        </div>
    );
};
