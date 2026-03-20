import React from 'react';
import { ParticleNet } from '../../components/ui/ParticleNet';

interface LightAuthLayoutProps {
  children: React.ReactNode;
}

export const LightAuthLayout: React.FC<LightAuthLayoutProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-sky-foundation">
      
      {/* Interactive Cyber-Net Background */}
      <ParticleNet />

      {/* Main Responsive Card Container */}
      <main className="relative z-10 w-full max-w-[480px] px-6">
        {children}
      </main>

      {/* Ambient Text Decoration */}
      <div className="fixed right-10 top-1/2 -translate-y-1/2 writing-vertical hidden xl:block text-slate-300/30 font-black text-2xl tracking-[1em] select-none pointer-events-none uppercase z-0">
        SLIIT NEXAR ECOSYSTEM
      </div>
    </div>
  );
};
