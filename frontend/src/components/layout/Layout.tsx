import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../auth/AuthProvider';

export const Layout: React.FC = () => {
    const { user } = useAuth();
    const fullName = user ? `${user.firstName} ${user.lastName}` : 'Student Demo';
    const roleLabel = user?.role === 'admin' ? 'Administrator' : 'Student';
    const avatarUrl = user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=1e293b&color=fff`;

    return (
        <div className="flex h-screen overflow-hidden bg-[#F4F6F8] font-sans text-slate-900">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
                {/* Global Top Header */}
                <header className="h-[88px] w-full flex items-center justify-end px-8 shrink-0">
                    <div className="flex items-center gap-6">
                        <button className="relative w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow transition-shadow">
                            <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></div>
                            <svg className="w-[22px] h-[22px] text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                        </button>
                        <div className="flex items-center gap-3 bg-white p-1.5 pr-6 rounded-full shadow-sm border border-slate-100/50 cursor-pointer hover:shadow transition-all group">
                            <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                            <div className="flex flex-col">
                                <span className="text-[13px] font-bold text-slate-800 leading-[1.2] group-hover:text-purple-600 transition-colors">{fullName}</span>
                                <span className="text-[11px] font-medium text-slate-400 capitalize">{roleLabel}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="w-full flex-1 p-6 lg:p-8 pt-0">
                    <div className="max-w-[1500px] mx-auto w-full h-full">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};
