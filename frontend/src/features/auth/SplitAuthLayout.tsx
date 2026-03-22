import React from 'react';

// Use the paths the user specified as imports if possible, otherwise rely on relative string paths

import sideContent from '../../assets/side-content.png';

interface SplitAuthLayoutProps {
  children: React.ReactNode;
}

export const SplitAuthLayout: React.FC<SplitAuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-[#F4F6F8] font-sans items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-[1100px] min-h-[650px] bg-white rounded-[2rem] shadow-xl flex overflow-hidden">
        
        {/* Left Panel - Light Green */}
        <div className="hidden lg:flex w-1/2 bg-[#EEF5F0] flex-col items-center justify-center p-12 relative">
          
          

          {/* Content */}
          <div className="w-full max-w-[320px] mb-10 relative flex justify-center">
            <img 
              src={sideContent} 
              alt="Career Simulation illustration" 
              className="w-full h-auto object-contain"
              onError={(e) => (e.currentTarget.src = "src/assets/side-content.png")}
            />
          </div>

          <div className="text-center space-y-3 px-2">
            <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">AI Powered Career System</h1>
            <p className="text-slate-500 text-[13px] font-medium leading-relaxed max-w-[280px] mx-auto">
              The centralized career simulation platform for SLIIT students to explore and succeed.
            </p>
          </div>

          {/* Pagination dots */}
          <div className="flex items-center gap-2 mt-10 justify-center">
            <div className="w-6 h-1.5 rounded-full bg-[#10B981]" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </div>
        </div>

        {/* Right Panel - White Form Area */}
        <div className="w-full lg:w-1/2 bg-white flex flex-col p-6 sm:p-12 md:p-16 relative">
          {children}
        </div>
      </div>
    </div>
  );
};
