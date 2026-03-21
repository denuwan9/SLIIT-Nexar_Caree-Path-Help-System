import React from 'react';

interface FullscreenAuthLayoutProps {
  children: React.ReactNode;
}

export const FullscreenAuthLayout: React.FC<FullscreenAuthLayoutProps> = ({ children }) => {
  return (
    <div 
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden"
      style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=2000&auto=format&fit=crop")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark Overlay to make text pop */}
      <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>
      <div className="absolute inset-0 bg-blue-900/40 mix-blend-overlay"></div>



      {/* Main Content Center */}
      <main className="relative z-10 w-full max-w-[400px] px-6 mt-16 md:mt-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 w-full px-8 py-8 flex flex-col md:flex-row justify-center items-center z-20 text-white/70 text-[10px] font-bold tracking-widest uppercase">
        <div>
          &copy; {new Date().getFullYear()}, Engineered by <span className="text-white">SLIIT Nexar Team</span>.
        </div>
      </footer>
    </div>
  );
};
