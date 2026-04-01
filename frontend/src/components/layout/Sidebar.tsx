import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Sparkles,
    Calendar,
    BookOpen,
    Briefcase,
    ClipboardList,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

import logoImg from '../../assets/logo.png';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/advisor', icon: Sparkles, label: 'AI Advisor' },
    { to: '/interviews', icon: Calendar, label: 'Interviews' },
    { to: '/study', icon: BookOpen, label: 'Study' },
    { to: '/job-postings', icon: ClipboardList, label: 'Job Posts' },
];

const adminNavItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Command Center' },
    { to: '/admin/profiles', icon: Briefcase, label: 'Career Profiles' },
    { to: '/admin/job-posts', icon: ClipboardList, label: 'Job Posts' },
    { to: '/interviews', icon: Calendar, label: 'Interviews' },
];

const SidebarItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        end
        className={({ isActive }) => `
            group flex items-center gap-4 px-5 py-3.5 mx-4 rounded-2xl transition-all duration-300 font-semibold text-[14px]
            ${isActive
                ? 'bg-[#0A0F1C] text-white shadow-md'
                : 'text-[#64748B] hover:bg-slate-50 hover:text-slate-900'}
        `}
    >
        {({ isActive }) => (
            <>
                <Icon size={20} className={isActive ? 'text-white' : 'text-[#94A3B8] group-hover:text-slate-600 transition-colors'} />
                <span>{label}</span>
            </>
        )}
    </NavLink>
);

const MobileNavItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        end
        className={({ isActive }) => `
            flex flex-col items-center gap-1.5 px-3 py-2 transition-all duration-300
            ${isActive ? 'text-purple-600 scale-110' : 'text-slate-400'}
        `}
    >
        {({ isActive }) => (
            <>
                <div className={`p-2.5 rounded-2xl transition-all duration-500 ${isActive ? 'bg-purple-100 shadow-sm' : ''}`}>
                    <Icon size={20} />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest leading-none ${isActive ? 'opacity-100' : 'opacity-40'}`}>{label}</span>
            </>
        )}
    </NavLink>
);

export const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const currentNavItems = user?.role === 'admin' ? adminNavItems : navItems;

    return (
        <>
            {/* ─── Desktop Sidebar (md+) ───────────────────── */}
            <aside className="hidden md:flex w-64 lg:w-[260px] h-screen flex-col py-8 bg-white border-r border-[#F1F5F9] z-40 flex-shrink-0 relative overflow-visible">
                <div className="flex flex-col h-full w-full">
                    {/* Logo */}
                    <div className="px-8 cursor-pointer mb-8 shrink-0">
                        <img src={logoImg} alt="Nexar Logo" className="h-12 w-auto object-contain" onError={(e) => (e.currentTarget.src = "/logo.png")} />
                    </div>

                    {/* MENU Subtitle */}
                    <div className="px-9 mb-3 shrink-0">
                        <span className="text-[10px] font-black tracking-[0.15em] text-[#94A3B8] uppercase">Menu</span>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 flex flex-col gap-1 w-full overflow-y-auto scrollbar-hide">
                        {currentNavItems.map(item => (
                            <SidebarItem key={item.to} {...item} />
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="flex flex-col gap-1 mt-auto pt-6 shrink-0 w-full pb-4">
                        <SidebarItem to="/settings" icon={Settings} label="Settings" />
                        <button
                            onClick={logout}
                            title="Logout"
                            className="group flex items-center gap-4 px-5 py-3.5 mx-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all duration-300 font-semibold text-[14px]"
                        >
                            <LogOut size={20} className="text-rose-400 group-hover:text-rose-500 transition-transform group-hover:rotate-12" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ─── Mobile Header Bar ─── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-2xl border-b border-slate-200/50">
                <div className="flex items-center justify-between px-6 h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center shadow-md">
                            <span className="text-white font-black text-lg">N</span>
                        </div>
                        <span className="font-black text-slate-900 tracking-widest text-base uppercase">Nexar</span>
                    </div>
                    <button
                        onClick={() => setMobileOpen(v => !v)}
                        className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 active:scale-90 transition-transform"
                    >
                        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile dropdown nav */}
                {mobileOpen && (
                    <nav className="px-5 pb-6 pt-4 grid grid-cols-3 gap-3 border-t border-slate-100 bg-white/95 backdrop-blur-3xl animate-in slide-in-from-top duration-300">
                        {[...currentNavItems, { to: '/settings', icon: Settings, label: 'Settings' }].map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-2.5 p-4 rounded-[1.5rem] text-center transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-purple-600 to-cyan-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-50'}`
                                }
                            >
                                <item.icon size={22} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                            </NavLink>
                        ))}
                        <button
                            onClick={logout}
                            className="flex flex-col items-center gap-2.5 p-4 rounded-[1.5rem] text-center text-rose-500 hover:bg-rose-50 transition-all duration-300"
                        >
                            <LogOut size={22} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                        </button>
                    </nav>
                )}
            </div>

            {/* ─── Mobile Bottom Nav Bar ─── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-white/50 pb-safe">
                <nav className="flex items-center justify-around px-2 py-2.5">
                    {currentNavItems.map(item => (
                        <MobileNavItem key={item.to} {...item} />
                    ))}
                </nav>
            </div>
        </>
    );
};
