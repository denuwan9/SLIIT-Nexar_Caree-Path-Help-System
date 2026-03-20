import React from 'react';
import { motion } from 'framer-motion';

interface LightAuthLayoutProps {
  children: React.ReactNode;
}

export const LightAuthLayout: React.FC<LightAuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-sky-foundation">
      
      {/* Visual Keystone: The Red Rising Sun */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sun-red rounded-full blur-[100px] opacity-10 animate-pulse-sun pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-sun-red/10 rounded-full animate-breathe pointer-events-none" />

      {/* Floating Sakura Petals (Simulated with div particles) */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -20, x: Math.random() * 100 - 50 }}
          animate={{ 
            opacity: [0, 0.8, 0], 
            y: ['0vh', '100vh'], 
            x: [Math.random() * 100 - 50, Math.random() * 200 - 100],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 10 + Math.random() * 10, 
            repeat: Infinity, 
            delay: Math.random() * 10,
            ease: "linear"
          }}
          className="absolute top-0 w-2 h-2 bg-pink-200 rounded-full blur-[1px] pointer-events-none"
        />
      ))}

      {/* Sakura Branches (Abstract SVG Elements) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute -left-20 top-0 w-[400px] h-[400px] text-pink-300/20 rotate-45" viewBox="0 0 200 200">
          <path d="M10,100 Q50,50 100,100 T190,100" stroke="currentColor" fill="none" strokeWidth="1" />
          <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.5" />
          <circle cx="150" cy="150" r="3" fill="currentColor" opacity="0.3" />
        </svg>
        <svg className="absolute -right-20 bottom-0 w-[400px] h-[400px] text-pink-300/20 -rotate-12" viewBox="0 0 200 200">
          <path d="M10,100 Q50,150 100,100 T190,100" stroke="currentColor" fill="none" strokeWidth="1" />
          <circle cx="70" cy="140" r="4" fill="currentColor" opacity="0.4" />
        </svg>
      </div>

      {/* Main Responsive Card Container */}
      <main className="relative z-10 w-full max-w-[480px] px-6">
        {children}
      </main>

      {/* Ambient Text / Kanji Decoration */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 writing-vertical hidden xl:block text-slate-300/30 font-black text-2xl tracking-[1em] select-none pointer-events-none uppercase">
        SLIIT NEXAR ECOSYSTEM
      </div>
    </div>
  );
};
