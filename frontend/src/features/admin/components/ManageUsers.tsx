import React, { useEffect, useState } from 'react';
import adminService from '../adminService';
import type { UserDTO } from '../adminService';
import { Loader2, UserX, Shield, User as UserIcon, Trash2, Power, PowerOff, Key, ChevronDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from '../../../components/ui/ConfirmModal';
import { InputModal } from '../../../components/ui/InputModal';

export const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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
        return (
            user.firstName.toLowerCase().includes(query) ||
            user.lastName.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            user.role.toLowerCase().includes(query)
        );
    });

    return (
        <div className="pb-10">
            <div className="flex justify-between items-center mb-6 px-2">
                <h3 className="text-xl font-black text-slate-800">System Members</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[250px] transition-shadow shadow-sm"
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500 border-separate border-spacing-y-3">
                <thead className="text-xs uppercase text-slate-400 font-bold tracking-widest px-4">
                    <tr>
                        <th className="px-6 py-2">System Member</th>
                        <th className="px-6 py-2">Identifier</th>
                        <th className="px-6 py-2">Access Level</th>
                        <th className="px-6 py-2">Status</th>
                        <th className="px-6 py-2 text-right">Administrative Actions</th>
                    </tr>
                </thead>
                <tbody className="mt-2">
                    {filteredUsers.map((user) => (
                        <tr key={user._id} className="bg-white hover:bg-slate-50/80 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl group border border-slate-100">
                            <td className="px-6 py-5 font-bold text-slate-800 flex items-center gap-4 rounded-l-2xl">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105 ${user.role === 'admin' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/30' : 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-500/30'}`}>
                                    {user.role === 'admin' ? <Shield size={14} /> : <UserIcon size={14} />}
                                </div>
                                {user.firstName} {user.lastName}
                            </td>
                            <td className="px-6 py-5 font-medium text-slate-600">{user.email}</td>
                            <td className="px-6 py-5 relative">
                                <div className="relative inline-block w-32">
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        disabled={actionLoading !== null}
                                        className={`w-full px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase cursor-pointer appearance-none transition-all duration-300 border focus:ring-2 focus:ring-offset-1 focus:outline-none disabled:opacity-50
                                            ${user.role === 'admin' 
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100 focus:ring-indigo-500' 
                                                : 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100 focus:ring-cyan-500'}`}
                                    >
                                        <option value="student" className="text-slate-800 bg-white font-bold">STUDENT</option>
                                        <option value="admin" className="text-slate-800 bg-white font-bold">ADMIN</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown size={14} className={user.role === 'admin' ? 'text-indigo-500' : 'text-cyan-500'} />
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                {user.isActive ? (
                                    <span className="text-emerald-500 font-bold flex items-center gap-1.5 before:w-1.5 before:h-1.5 before:bg-emerald-500 before:rounded-full">Active</span>
                                ) : (
                                    <span className="text-rose-500 font-bold flex items-center gap-1.5 before:w-1.5 before:h-1.5 before:bg-rose-500 before:rounded-full">Inactive</span>
                                )}
                            </td>
                            <td className="px-6 py-5 rounded-r-2xl">
                                <div className="flex justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openConfirmStatus(user)}
                                        disabled={actionLoading !== null}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                                            user.isActive 
                                                ? 'bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-lg hover:shadow-rose-500/30' 
                                                : 'bg-emerald-50 border border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/30'
                                        }`}
                                        title={user.isActive ? 'Suspend Access' : 'Restore Access'}
                                    >
                                        {actionLoading === `status-${user._id}` ? <Loader2 size={18} className="animate-spin" /> : (
                                            user.isActive ? <PowerOff size={18} /> : <Power size={18} />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setPasswordModal({ isOpen: true, userId: user._id })}
                                        disabled={actionLoading !== null}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-500 hover:bg-amber-500 hover:border-amber-500 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30"
                                        title="Force Password Reset"
                                    >
                                        {actionLoading === `password-${user._id}` ? <Loader2 size={18} className="animate-spin" /> : <Key size={18} />}
                                    </button>
                                    <button
                                        onClick={() => openConfirmDelete(user)}
                                        disabled={actionLoading !== null}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-red-600/30"
                                        title="Permanently Delete Profil"
                                    >
                                        {actionLoading === `delete-${user._id}` ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center py-10 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                <UserX size={40} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 font-medium">No users found matching "{searchQuery}"</p>
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
