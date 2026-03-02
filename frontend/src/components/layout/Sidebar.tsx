import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    Calendar,
    BookOpen,
    Briefcase,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const SidebarItem: React.FC<{
    to: string;
    icon: React.ElementType;
    label: string;
}> = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        title={label}
        className={({ isActive }) => `
            group relative flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500
            ${isActive
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/40'
                : 'text-slate-400 hover:bg-white/40 hover:text-slate-900'}
        `}
    >
        <Icon size={24} />
        <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50">
            {label}
        </span>
    </NavLink>
);

export const Sidebar: React.FC = () => {
    const { logout } = useAuth();

    return (
        <aside className="w-24 h-screen sticky top-0 flex flex-col items-center py-8 glass border-r-0 z-40">
            {/* Logo */}
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20 mb-12">
                <span className="text-white font-black text-2xl">C</span>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 flex flex-col gap-4">
                <SidebarItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
                <SidebarItem to="/profile" icon={User} label="My Profile" />
                <SidebarItem to="/interviews" icon={Calendar} label="Interviews" />
                <SidebarItem to="/study" icon={BookOpen} label="Study Plan" />
                <SidebarItem to="/careers" icon={Briefcase} label="Careers" />
            </nav>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-4 mt-auto">
                <SidebarItem to="/settings" icon={Settings} label="Settings" />
                <button
                    onClick={logout}
                    title="Logout"
                    className="flex items-center justify-center w-14 h-14 rounded-2xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300"
                >
                    <LogOut size={24} />
                </button>
            </div>
        </aside>
    );
};
