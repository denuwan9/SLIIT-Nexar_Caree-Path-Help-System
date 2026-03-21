import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface SplitAuthLayoutProps {
  children: React.ReactNode;
}

export const SplitAuthLayout: React.FC<SplitAuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4 md:p-8">
      {/* Main Container - max width and rounded corners like the image */}
      <div className="w-full max-w-[1200px] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        
        {/* Left Side: Form Area */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16 relative">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </div>

        {/* Right Side: Image/Illustration Area */}
        <div className="w-full md:w-1/2 relative hidden md:block">
          <div 
            className="absolute inset-2 rounded-[1.5rem] overflow-hidden"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1506744626753-233989701281?q=80&w=2000&auto=format&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Overlay Gradient (optional, to match the aesthetic) */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
            
            {/* Content over image */}
            <div className="absolute bottom-16 left-12 right-12 text-white">
              <h3 className="text-3xl font-medium leading-tight mb-6">
                Finally, all your work in one place.
              </h3>
              
              {/* Carousel Indicators */}
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <button className="w-10 h-10 rounded-full border border-white/40 flex items-center justify-center hover:bg-white/10 transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
