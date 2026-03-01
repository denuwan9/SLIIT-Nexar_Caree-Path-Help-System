import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    UserCircle,
    Calendar,
    BookOpen,
    Briefcase,
    Settings,
    ShieldCheck
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const SidebarLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
      ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
    `}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </NavLink>
);

export const Sidebar: React.FC = () => {
    const { user } = useAuth();

    const links = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/profile', icon: <UserCircle size={20} />, label: 'Profile' },
        { to: '/interviews', icon: <Calendar size={20} />, label: 'Interviews' },
        { to: '/study-plan', icon: <BookOpen size={20} />, label: 'Study Plan' },
        { to: '/jobs', icon: <Briefcase size={20} />, label: 'Job Posts' },
    ];

    const adminLinks = [
        { to: '/admin', icon: <ShieldCheck size={20} />, label: 'Admin Panel' },
        { to: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    ];

    return (
        <aside className="w-64 bg-white border-r border-slate-200 h-[calc(100vh-64px)] overflow-y-auto sticky top-16 p-4 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Main Menu</p>
                <div className="flex flex-col gap-1">
                    {links.map((link) => (
                        <SidebarLink key={link.to} {...link} />
                    ))}
                </div>
            </div>

            {user?.role === 'admin' && (
                <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Admin</p>
                    <div className="flex flex-col gap-1">
                        {adminLinks.map((link) => (
                            <SidebarLink key={link.to} {...link} />
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed text-center">
                    Career Path Simulator<br />System v1.0
                </p>
            </div>
        </aside>
    );
};
