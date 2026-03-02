import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Calendar,
    BookOpen,
    Briefcase,
    Settings,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/profile', icon: User, label: 'Profile' },
    { to: '/interviews', icon: Calendar, label: 'Interviews' },
    { to: '/study', icon: BookOpen, label: 'Study' },
    { to: '/careers', icon: Briefcase, label: 'Careers' },
];

// Desktop sidebar icon item with tooltip
const SidebarItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        title={label}
        className={({ isActive }) => `
            group relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300
            ${isActive
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'text-slate-400 hover:bg-white/50 hover:text-slate-700'}
        `}
    >
        <Icon size={22} />
        {/* Tooltip */}
        <span className="pointer-events-none absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl">
            {label}
        </span>
    </NavLink>
);

// Mobile bottom nav item
const MobileNavItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
            flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 min-w-[56px]
            ${isActive
                ? 'text-purple-600'
                : 'text-slate-400 hover:text-slate-700'}
        `}
    >
        {({ isActive }) => (
            <>
                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-purple-100' : ''}`}>
                    <Icon size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider leading-none">{label}</span>
            </>
        )}
    </NavLink>
);

export const Sidebar: React.FC = () => {
    const { logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <>
            {/* ─── Desktop Sidebar (md+) ───────────────────── */}
            <aside className="hidden md:flex w-20 lg:w-24 h-screen sticky top-0 flex-col items-center py-6 glass border-r border-white/30 z-40 flex-shrink-0">
                {/* Logo */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-10">
                    <span className="text-white font-black text-xl">C</span>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 flex flex-col gap-3">
                    {navItems.map(item => (
                        <SidebarItem key={item.to} {...item} />
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="flex flex-col gap-3 mt-auto">
                    <SidebarItem to="/settings" icon={Settings} label="Settings" />
                    <button
                        onClick={logout}
                        title="Logout"
                        className="flex items-center justify-center w-12 h-12 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
                    >
                        <LogOut size={22} />
                    </button>
                </div>
            </aside>

            {/* ─── Mobile Header Bar ────────────────────────── */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/40">
                <div className="flex items-center justify-between px-5 h-16">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-black text-base">C</span>
                        </div>
                        <span className="font-black text-slate-900 tracking-tight text-lg">Nexar</span>
                    </div>
                    <button
                        onClick={() => setMobileOpen(v => !v)}
                        className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-600"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mobile dropdown nav */}
                {mobileOpen && (
                    <nav className="px-4 pb-4 pt-2 grid grid-cols-3 gap-2 border-t border-white/30 bg-white/20 backdrop-blur-xl">
                        {[...navItems, { to: '/settings', icon: Settings, label: 'Settings' }].map(item => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center transition-all duration-200 ${isActive ? 'bg-purple-600 text-white shadow-md' : 'text-slate-600 hover:bg-white/60'}`
                                }
                            >
                                <item.icon size={20} />
                                <span className="text-[10px] font-black uppercase tracking-wide">{item.label}</span>
                            </NavLink>
                        ))}
                        <button
                            onClick={logout}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center text-red-500 hover:bg-red-50 transition-all duration-200"
                        >
                            <LogOut size={20} />
                            <span className="text-[10px] font-black uppercase tracking-wide">Logout</span>
                        </button>
                    </nav>
                )}
            </div>

            {/* ─── Mobile Bottom Nav Bar ────────────────────── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/40">
                <nav className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
                    {navItems.map(item => (
                        <MobileNavItem key={item.to} {...item} />
                    ))}
                </nav>
            </div>
        </>
    );
};
