import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import accountService from '../services/accountService';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
    emailChangeSchema, 
    passwordChangeSchema, 
    deleteAccountSchema,
    type EmailChangeInput,
    type PasswordChangeInput,
    type DeleteAccountInput
} from '../features/profile/settingsSchemas';
import {
    Loader2, Lock, Trash2, Eye, EyeOff, AlertTriangle,
    CheckCircle, Shield, User, Key,
    MailCheck, Fingerprint, LogOut
} from 'lucide-react';

/* ── Shared confirmation modal ───────────────────────────────────── */
interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    isDanger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen, title, description, confirmLabel, isDanger = false, onConfirm, onCancel
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity" onClick={onCancel} />
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-md w-full animate-in fade-in zoom-in-95 duration-300 border border-slate-100">
                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-lg ${
                    isDanger ? 'bg-rose-50 text-rose-500 shadow-rose-100' : 'bg-blue-50 text-blue-600 shadow-blue-100'
                }`}>
                    {isDanger ? <AlertTriangle size={36} /> : <CheckCircle size={36} />}
                </div>
                <h3 className="text-2xl font-black text-slate-900 text-center mb-3 tracking-tight">{title}</h3>
                <p className="text-slate-500 text-sm text-center mb-10 leading-relaxed font-medium">{description}</p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={onConfirm}
                        className={`w-full py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl ${
                            isDanger 
                            ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200 hover:scale-[1.02] active:scale-95' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:scale-[1.02] active:scale-95'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                    <button
                        onClick={onCancel}
                        className="w-full py-4 rounded-2xl bg-slate-50 text-slate-400 font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Section Card wrapper ────────────────────────────────────────── */
const SectionCard: React.FC<{ icon: React.ElementType; title: string; subtitle: string; iconColor: string; iconBg: string; children: React.ReactNode }> =
    ({ icon: Icon, title, subtitle, iconColor, iconBg, children }) => (
        <div className="group relative overflow-hidden bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-10 transition-all hover:shadow-2xl hover:shadow-slate-300/50">
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-slate-50/50 blur-3xl group-hover:bg-blue-50/50 transition-colors" />
            
            <div className="relative flex items-center gap-6 mb-10">
                <div className={`p-4 rounded-3xl shadow-lg transition-transform group-hover:scale-110 ${iconBg} ${iconColor}`}>
                    <Icon size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 mt-0.5">{subtitle}</p>
                </div>
            </div>
            <div className="relative">
                {children}
            </div>
        </div>
    );

/* ── Main Settings Page ──────────────────────────────────────────── */
const SettingsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /* ── Change Email Form ───────────────────────────────────── */
    const [emailModal, setEmailModal] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [pendingEmailData, setPendingEmailData] = useState<EmailChangeInput | null>(null);

    const emailForm = useForm<EmailChangeInput>({
        resolver: zodResolver(emailChangeSchema),
        defaultValues: { newEmail: '', password: '' }
    });

    const onEmailSubmit = (data: EmailChangeInput) => {
        setPendingEmailData(data);
        setEmailModal(true);
    };

    const confirmEmailChange = async () => {
        if (!pendingEmailData) return;
        setEmailModal(false);
        setEmailLoading(true);
        try {
            await accountService.changeEmail(pendingEmailData.newEmail, pendingEmailData.password);
            toast.success('Email updated! Please log in again.');
            emailForm.reset();
            logout();
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update email.');
        } finally {
            setEmailLoading(false);
        }
    };

    /* ── Change Password Form ────────────────────────────────── */
    const [pwModal, setPwModal] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pendingPwData, setPendingPwData] = useState<PasswordChangeInput | null>(null);
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    const passwordForm = useForm<PasswordChangeInput>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
    });

    const onPasswordSubmit = (data: PasswordChangeInput) => {
        setPendingPwData(data);
        setPwModal(true);
    };

    const confirmPasswordChange = async () => {
        if (!pendingPwData) return;
        setPwModal(false);
        setPwLoading(true);
        try {
            await accountService.changePassword(pendingPwData.currentPassword, pendingPwData.newPassword);
            toast.success('Password updated successfully!');
            passwordForm.reset();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setPwLoading(false);
        }
    };

    /* ── Delete Account Form ─────────────────────────────────── */
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [showDeletePw, setShowDeletePw] = useState(false);
    const [pendingDeleteData, setPendingDeleteData] = useState<DeleteAccountInput | null>(null);

    const deleteForm = useForm<DeleteAccountInput>({
        resolver: zodResolver(deleteAccountSchema),
        defaultValues: { password: '' }
    });

    const onDeleteSubmit = (data: DeleteAccountInput) => {
        if (!deleteConfirm) {
            toast.error('Please check the confirmation box first.');
            return;
        }
        setPendingDeleteData(data);
        setDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!pendingDeleteData) return;
        setDeleteModal(false);
        setDeleteLoading(true);
        try {
            await accountService.deleteAccount(pendingDeleteData.password);
            toast.success('Account permanently deleted.');
            logout();
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete account.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
            {/* Header Area */}
            <div className="relative group overflow-hidden rounded-[3rem] bg-slate-950 p-12 mb-12 shadow-2xl shadow-slate-900/20">
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
                <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl animate-pulse delay-700" />
                
                <div className="relative space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-3xl bg-blue-500/20 text-blue-400 shadow-lg border border-blue-500/20">
                            <Shield size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Command Center</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">Operational Security & Identity</p>
                        </div>
                    </div>

                    {/* Operational Overview Card */}
                    <div className="bg-white/5 backdrop-blur-md rounded-[2rem] border border-white/10 p-8">
                        <div className="flex items-center gap-6">
                            <div className="relative group/avatar">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur group-hover/avatar:blur-md transition-all" />
                                <div className="relative w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white/20 shadow-xl transition-transform group-hover/avatar:scale-105">
                                    {user?.avatarUrl ? (
                                        <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={32} className="text-blue-400" />
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className="text-xl font-black text-white tracking-tight">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">{user?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-10">
                {/* ── Change Email Segment ──────────────────────────────── */}
                <SectionCard icon={MailCheck} title="Update Email" subtitle="Primary communication vector" iconColor="text-blue-500" iconBg="bg-blue-50">
                    <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Relay Endpoint (@sliit.lk)</label>
                            <input
                                type="email"
                                {...emailForm.register('newEmail')}
                                placeholder="name@sliit.lk"
                                className={`w-full bg-slate-50 border rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 shadow-inner ${
                                    emailForm.formState.errors.newEmail ? 'border-rose-300' : 'border-slate-100'
                                }`}
                            />
                            {emailForm.formState.errors.newEmail && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">{emailForm.formState.errors.newEmail.message}</p>}
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Authentication Passcode</label>
                            <input
                                type="password"
                                {...emailForm.register('password')}
                                placeholder="Verify your current credentials"
                                className={`w-full bg-slate-50 border rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 shadow-inner ${
                                    emailForm.formState.errors.password ? 'border-rose-300' : 'border-slate-100'
                                }`}
                            />
                            {emailForm.formState.errors.password && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">{emailForm.formState.errors.password.message}</p>}
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-50">
                            <button 
                                type="submit" 
                                disabled={emailLoading} 
                                className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                            >
                                {emailLoading ? <Loader2 className="animate-spin" size={16} /> : <Fingerprint size={16} />}
                                {emailLoading ? 'Processing...' : 'Sync Relay'}
                            </button>
                        </div>
                    </form>
                </SectionCard>

                {/* ── Change Password Segment ───────────────────────────── */}
                <SectionCard icon={Key} title="Update Password" subtitle="Credential sequence management" iconColor="text-emerald-500" iconBg="bg-emerald-50">
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-8">
                        {[
                            { key: 'currentPassword', label: 'Existing Sequence', placeholder: '••••••••', showKey: 'current' as const },
                            { key: 'newPassword', label: 'Next Generation Key', placeholder: 'Entropy: high required', showKey: 'new' as const },
                            { key: 'confirmPassword', label: 'Verify Sequence', placeholder: '••••••••', showKey: 'confirm' as const },
                        ].map(field => (
                            <div key={field.key} className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">{field.label}</label>
                                <div className="relative">
                                    <input
                                        type={showPw[field.showKey] ? 'text' : 'password'}
                                        {...passwordForm.register(field.key as keyof PasswordChangeInput)}
                                        placeholder={field.placeholder}
                                        className={`w-full bg-slate-50 border rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-emerald-100/50 focus:border-emerald-400 outline-none transition-all placeholder:text-slate-300 shadow-inner ${
                                            passwordForm.formState.errors[field.key as keyof PasswordChangeInput] ? 'border-rose-300' : 'border-slate-100'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(s => ({ ...s, [field.showKey]: !s[field.showKey] }))}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-500 transition-colors"
                                    >
                                        {showPw[field.showKey] ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordForm.formState.errors[field.key as keyof PasswordChangeInput] && (
                                    <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">
                                        {passwordForm.formState.errors[field.key as keyof PasswordChangeInput]?.message}
                                    </p>
                                )}
                            </div>
                        ))}
                        <div className="flex justify-end pt-4 border-t border-slate-50">
                            <button 
                                type="submit" 
                                disabled={pwLoading} 
                                className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                            >
                                {pwLoading ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
                                {pwLoading ? 'Processing...' : 'Hardening System'}
                            </button>
                        </div>
                    </form>
                </SectionCard>

                {/* ── Danger Zone: System Purge ────────────────────────────── */}
                <div className="relative group overflow-hidden rounded-[2.5rem] bg-white border-2 border-rose-100 shadow-xl shadow-rose-100/20 p-10 transition-all hover:shadow-2xl">
                    <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-rose-50/50 blur-3xl" />
                    
                    <div className="relative flex items-center gap-6 mb-10">
                        <div className="p-4 rounded-3xl bg-rose-50 text-rose-500 shadow-lg shadow-rose-100 group-hover:scale-110 transition-transform">
                            <Trash2 size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-rose-600 tracking-tight">Terminal Breach</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Destructive System Decommission</p>
                        </div>
                    </div>

                    <div className="group/alert relative overflow-hidden bg-rose-50 border border-rose-100 rounded-3xl p-6 mb-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-100/0 via-rose-100/30 to-rose-100/0 translate-x-[-100%] group-hover/alert:translate-x-[100%] transition-transform duration-1000" />
                        <div className="relative flex gap-4">
                            <AlertTriangle size={20} className="text-rose-500 flex-shrink-0" />
                            <p className="text-xs font-bold text-rose-700 leading-relaxed uppercase tracking-tighter">
                                CRITICAL WARNING: This sequence is non-reversible. All profile data, skill architectures, and academic history will be permanently decentralized and deleted.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={deleteForm.handleSubmit(onDeleteSubmit)} className="relative space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Terminal Authentication</label>
                            <div className="relative">
                                <input
                                    type={showDeletePw ? 'text' : 'password'}
                                    {...deleteForm.register('password')}
                                    placeholder="Confirm identity with password"
                                    className={`w-full bg-slate-50 border rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-rose-100/50 focus:border-rose-400 outline-none transition-all placeholder:text-slate-300 shadow-inner ${
                                        deleteForm.formState.errors.password ? 'border-rose-300' : 'border-slate-200'
                                    }`}
                                />
                                <button type="button" onClick={() => setShowDeletePw(s => !s)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-rose-500 transition-colors">
                                    {showDeletePw ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {deleteForm.formState.errors.password && (
                                <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest mt-2 ml-1">
                                    {deleteForm.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <label className="group/check flex items-start gap-4 cursor-pointer p-4 rounded-2xl hover:bg-rose-50/50 transition-colors">
                            <div className="relative mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={deleteConfirm}
                                    onChange={e => setDeleteConfirm(e.target.checked)}
                                    className="peer h-6 w-6 rounded-lg border-2 border-slate-200 text-rose-500 focus:ring-transparent transition-all cursor-pointer opacity-0 absolute inset-0 z-10"
                                />
                                <div className="h-6 w-6 rounded-lg border-2 border-slate-200 peer-checked:bg-rose-500 peer-checked:border-rose-500 transition-all flex items-center justify-center text-white">
                                    <CheckCircle size={14} className="scale-0 peer-checked:scale-100 transition-transform" />
                                </div>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight leading-relaxed select-none">
                                I verify the operational implications of this system purge. Proceed with permanent decommissioning.
                            </span>
                        </label>

                        <div className="flex justify-end pt-4 border-t border-slate-50">
                            <button
                                type="submit"
                                disabled={deleteLoading || !deleteConfirm}
                                className="px-10 py-5 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-rose-200 hover:bg-rose-600 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all flex items-center gap-3"
                            >
                                {deleteLoading ? <Loader2 className="animate-spin" size={16} /> : <LogOut size={16} />}
                                {deleteLoading ? 'Purging...' : 'Execute Decommission'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={emailModal}
                title="Update Email Address?"
                description={`Your login email will be changed to ${pendingEmailData?.newEmail || 'the new address'}. You will be logged out and need to sign in with the new address.`}
                confirmLabel="Yes, Update Email"
                onConfirm={confirmEmailChange}
                onCancel={() => setEmailModal(false)}
            />
            <ConfirmModal
                isOpen={pwModal}
                title="Update Password?"
                description="Your password will be updated. You will remain logged in with the new password."
                confirmLabel="Yes, Update Password"
                onConfirm={confirmPasswordChange}
                onCancel={() => setPwModal(false)}
            />
            <ConfirmModal
                isOpen={deleteModal}
                title="Delete Account Forever?"
                description="This cannot be undone. Your SLIIT Nexar account, profile, and all associated data will be permanently deleted."
                confirmLabel="Yes, Delete My Account"
                isDanger
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal(false)}
            />
        </div>
    );
};

export default SettingsPage;
