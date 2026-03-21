import React from 'react';
import studentIllustration from '../../assets/student_illustration.png';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const OrangeAuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F4F7FB] p-4 sm:p-8 relative">
      <div className="w-full max-w-[1150px] min-h-[700px] bg-[#E9F3EB] rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] flex flex-col md:flex-row p-3 md:p-4 relative z-10 transition-all duration-300">
        
        {/* Left Green Panel */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 p-8 lg:p-10 relative">
          <div className="w-[110%] max-w-[420px] mb-8">
            <img src={studentIllustration} alt="Student Illustration" className="w-full h-auto object-contain" />
          </div>
          <div className="text-center max-w-[340px]">
            <h2 className="text-[24px] font-bold text-[#1F2937] mb-4 tracking-tight">AI Powered Career System</h2>
            <p className="text-[#6B7280] text-[14px] leading-[1.6] font-medium">
              The centralized career simulation platform for SLIIT students to explore and succeed.
            </p>
            <div className="flex items-center justify-center gap-2 mt-10">
              <div className="w-6 h-1.5 rounded-full bg-[#10B981]"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
              <div className="w-2 h-2 rounded-full bg-gray-300"></div>
            </div>
          </div>
        </div>

        {/* Right White Form Panel */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-14 lg:p-20 relative bg-white rounded-[1.5rem] shadow-sm ml-auto overflow-hidden">
          <div className="w-full max-w-[460px]">
            {children}
          </div>
        </div>

      </div>
    </div>
  );
};
