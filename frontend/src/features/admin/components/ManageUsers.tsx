import React, { useEffect, useState } from 'react';
import adminService from '../adminService';
import type { UserDTO } from '../adminService';
import { Loader2, UserX, Shield, User as UserIcon, Trash2, Power, PowerOff, Key, ChevronDown, Search, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { InputModal } from '../../../components/ui/InputModal';
import { generateUserReport } from '../../../utils/reportGenerator';

export const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Modal States
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        actionType: 'danger' | 'warning' | 'info';
        onConfirm: () => void;
    }>({ isOpen: false, title: '', description: '', actionType: 'info', onConfirm: () => {} });

    const [passwordModal, setPasswordModal] = useState<{
        isOpen: boolean;
        userId: string | null;
    }>({ isOpen: false, userId: null });

    const fetchUsers = async () => {
        try {
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const openConfirmStatus = (user: UserDTO) => {
        setConfirmModal({
            isOpen: true,
            title: `${user.isActive ? 'Deactivate' : 'Activate'} User Account`,
            description: `Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} ${user.firstName} ${user.lastName}? ${user.isActive ? 'They will not be able to log in until reactivated.' : 'They will regain access to the platform.'}`,
            actionType: user.isActive ? 'warning' : 'info',
            onConfirm: () => handleToggleStatus(user._id)
        });
    };

    const handleToggleStatus = async (userId: string) => {
        setActionLoading(`status-${userId}`);
        try {
            await adminService.toggleUserStatus(userId);
            toast.success('User status updated');
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update user status');
        } finally {
            setActionLoading(null);
        }
    };

    const openConfirmDelete = (user: UserDTO) => {
        setConfirmModal({
            isOpen: true,
            title: 'Permanently Delete User',
            description: `WARNING: This action cannot be undone. Are you absolutely sure you want to permanently delete the account for ${user.firstName} ${user.lastName} and wipe all associated profile data?`,
            actionType: 'danger',
            onConfirm: () => handleDeleteUser(user._id)
        });
    };

    const handleDeleteUser = async (userId: string) => {
        setActionLoading(`delete-${userId}`);
        try {
            await adminService.deleteUser(userId);
            toast.success('User permanently deleted');
            fetchUsers();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        setConfirmModal({
            isOpen: true,
            title: `Change User Role`,
            description: `You are about to modify administrative privileges. Change this user's role to ${newRole.toUpperCase()}?`,
            actionType: newRole === 'admin' ? 'danger' : 'warning',
            onConfirm: async () => {
                setActionLoading(`role-${userId}`);
                try {
                    await adminService.updateUserRole(userId, newRole);
                    toast.success(`Role updated to ${newRole}`);
                    fetchUsers();
                } catch (err: any) {
                    toast.error(err.response?.data?.message || 'Failed to update user role');
                } finally {
                     setActionLoading(null);
                }
            }
        });
    };

    const handleResetPassword = async (newPassword: string) => {
        if (!passwordModal.userId) return;
        const userId = passwordModal.userId;

        setActionLoading(`password-${userId}`);
        try {
            await adminService.resetUserPassword(userId, newPassword);
            toast.success('Password successfully reset');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to reset password');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-purple-600" size={32} /></div>;
    }

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
            user.firstName.toLowerCase().includes(query) ||
            user.lastName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query)
        );
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        
        return matchesSearch && matchesRole;
    });

    return (
        <div className="pb-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Search & Filter - Tactical Controls */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
                <div>
                    <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Registry</h3>
                        <button
                            onClick={() => generateUserReport(filteredUsers)}
                            className="group/btn flex items-center gap-2 px-5 py-2.5 bg-indigo-50 hover:bg-indigo-600 border border-indigo-100 hover:border-indigo-600 rounded-2xl transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-indigo-500/20 active:scale-95"
                            title="Generate Operational Report"
                        >
                            <FileText className="text-indigo-600 group-hover/btn:text-white transition-colors" size={18} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-700 group-hover/btn:text-white transition-colors">Generate Report</span>
                        </button>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Operational Personnel Management</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative group/search flex-1 sm:min-w-[320px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Filter by name, email or protocol..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-400 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                        />
                    </div>
                    <div className="relative group/filter">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="w-full sm:w-[200px] pl-6 pr-12 py-4 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 appearance-none focus:ring-4 focus:ring-indigo-100/50 focus:border-indigo-400 outline-none cursor-pointer shadow-sm transition-all"
                        >
                            <option value="all">Global Access</option>
                            <option value="student">Student Class</option>
                            <option value="admin">Admin Override</option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 group-hover/filter:text-indigo-500 transition-colors pointer-events-none" size={16} />
                    </div>
                </div>
            </div>
            
            {/* Member Registry - Operational View */}
            <div className="overflow-x-auto pb-4 custom-scrollbar">
                <table className="w-full text-left text-sm border-separate border-spacing-y-4">
                    <thead>
                        <tr className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 whitespace-nowrap">
                            <th className="px-10 py-2">Operator Identity</th>
                            <th className="px-8 py-2">Registry Endpoint</th>
                            <th className="px-8 py-2 text-center">Authorization</th>
                            <th className="px-8 py-2 text-center">Status</th>
                            <th className="px-10 py-2 text-right">Administrative Protocol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user._id} className="group/row transition-all duration-500">
                                <td className="bg-white px-10 py-6 rounded-l-[2rem] border-y border-l border-slate-100 group-hover/row:border-indigo-200 group-hover/row:bg-indigo-50/20 shadow-sm group-hover/row:shadow-lg group-hover/row:shadow-indigo-500/5 transition-all">
                                    <div className="flex items-center gap-5">
                                        <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500 group-hover/row:scale-110 group-hover/row:rotate-3 ${
                                            user.role === 'admin' 
                                                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30' 
                                                : 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-500/30'
                                        }`}>
                                            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover/row:opacity-100 transition-opacity" />
                                            {user.role === 'admin' ? <Shield size={18} /> : <UserIcon size={18} />}
                                        </div>
                                        <div>
                                            <div className="font-black text-slate-900 text-base tracking-tight">{user.firstName} {user.lastName}</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Level {user.role === 'admin' ? '99' : '01'} Personnel</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="bg-white px-8 py-6 border-y border-slate-100 group-hover/row:border-indigo-200 group-hover/row:bg-indigo-50/20 transition-all font-bold text-slate-500">
                                    {user.email}
                                </td>
                                <td className="bg-white px-8 py-6 border-y border-slate-100 group-hover/row:border-indigo-200 group-hover/row:bg-indigo-50/20 transition-all text-center">
                                    <div className="relative inline-block w-36">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            disabled={actionLoading !== null}
                                            className={`w-full px-5 py-2.5 rounded-2xl text-[10px] font-black tracking-[0.2em] uppercase cursor-pointer appearance-none transition-all duration-300 border focus:ring-4 focus:outline-none disabled:opacity-50 text-center
                                                ${user.role === 'admin' 
                                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-200' 
                                                    : 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100 focus:ring-cyan-200'}`}
                                        >
                                            <option value="student">STUDENT</option>
                                            <option value="admin">ADMIN</option>
                                        </select>
                                        <ChevronDown size={14} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${user.role === 'admin' ? 'text-indigo-400' : 'text-cyan-400'}`} />
                                    </div>
                                </td>
                                <td className="bg-white px-8 py-6 border-y border-slate-100 group-hover/row:border-indigo-200 group-hover/row:bg-indigo-50/20 transition-all text-center">
                                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-500 shadow-sm ${
                                        user.isActive 
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 group-hover/row:bg-emerald-500 group-hover/row:text-white group-hover/row:shadow-emerald-500/20' 
                                            : 'bg-rose-50 border-rose-100 text-rose-600 group-hover/row:bg-rose-500 group-hover/row:text-white group-hover/row:shadow-rose-500/20'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-rose-500'} group-hover/row:bg-white animate-pulse`} />
                                        {user.isActive ? 'Active' : 'Suspended'}
                                    </div>
                                </td>
                                <td className="bg-white px-10 py-6 rounded-r-[2rem] border-y border-r border-slate-100 group-hover/row:border-indigo-200 group-hover/row:bg-indigo-50/20 transition-all shadow-sm group-hover/row:shadow-lg group-hover/row:shadow-indigo-500/5">
                                    <div className="flex justify-end gap-3 transition-all duration-500">
                                        <button
                                            onClick={() => openConfirmStatus(user)}
                                            disabled={actionLoading !== null}
                                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-md ${
                                                user.isActive 
                                                    ? 'bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-xl hover:shadow-rose-500/40' 
                                                    : 'bg-emerald-50 border border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-xl hover:shadow-emerald-500/40'
                                            }`}
                                            title={user.isActive ? 'Operational Suspension' : 'Access Restoration'}
                                        >
                                            {actionLoading === `status-${user._id}` ? <Loader2 size={20} className="animate-spin" /> : (
                                                user.isActive ? <PowerOff size={20} /> : <Power size={20} />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setPasswordModal({ isOpen: true, userId: user._id })}
                                            disabled={actionLoading !== null}
                                            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white border border-slate-100 text-slate-500 hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/40 shadow-md"
                                            title="Protocol Hardening"
                                        >
                                            {actionLoading === `password-${user._id}` ? <Loader2 size={20} className="animate-spin" /> : <Key size={20} />}
                                        </button>
                                        <button
                                            onClick={() => openConfirmDelete(user)}
                                            disabled={actionLoading !== null}
                                            className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 hover:bg-rose-600 hover:border-rose-600 hover:text-white transition-all duration-500 hover:shadow-xl hover:shadow-rose-600/40 shadow-md"
                                            title="Registry Purge"
                                        >
                                            {actionLoading === `delete-${user._id}` ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-20 text-center">
                                    <div className="inline-flex flex-col items-center gap-6 p-12 rounded-[3rem] bg-white border border-slate-100 shadow-2xl shadow-slate-200/40">
                                        <div className="p-6 rounded-full bg-slate-50 text-slate-300">
                                            <UserX size={48} strokeWidth={1.5} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xl font-black text-slate-800 tracking-tight">Registry Anomaly Detected</p>
                                            <p className="text-sm font-bold text-slate-400 capitalize whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">No personnel matching metadata "{searchQuery}"</p>
                                        </div>
                                        <button 
                                            onClick={() => {setSearchQuery(''); setRoleFilter('all');}}
                                            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                                        >
                                            Reset Filters
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Global Admin Modals */}
            <ConfirmModal 
                {...confirmModal}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />

            <InputModal 
                isOpen={passwordModal.isOpen}
                title="Force Identity Verification"
                description="Issue a new cryptographic access key for this user. This action cannot be reversed."
                placeholder="New Access Protocol (Min 8 chars)"
                confirmText="Overwrite Credential"
                validator={(val) => val.length < 8 ? 'Access protocol must contain minimum cryptographic length (8 characters).' : null}
                onSubmit={handleResetPassword}
                onCancel={() => setPasswordModal({ isOpen: false, userId: null })}
            />
        </div>
    );
};
