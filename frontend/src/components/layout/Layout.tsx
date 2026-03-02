import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 relative">
            {/* Premium White Theme Background Design */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-300/60 blur-[100px] animate-drift"></div>
                <div className="absolute top-[20%] -right-[5%] w-[40%] h-[40%] rounded-full bg-blue-200/70 blur-[110px] animate-breathe"></div>
                <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-200/50 blur-[120px] animate-drift" style={{ animationDuration: '25s' }}></div>
                <div className="absolute top-[40%] left-[40%] w-[35%] h-[35%] rounded-full bg-cyan-200/50 blur-[90px] animate-breathe" style={{ animationDuration: '18s' }}></div>
            </div>

            <Sidebar />
            <main className="
                flex-1 overflow-x-hidden overflow-y-auto relative z-10
                pt-3 pb-5 px-3
                md:pt-4 md:pb-6 md:px-5
                lg:pt-5 lg:pb-7 lg:px-6
                mt-14 mb-20 md:mt-0 md:mb-0
            ">
                <div className="max-w-[1360px] mx-auto w-full min-h-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
