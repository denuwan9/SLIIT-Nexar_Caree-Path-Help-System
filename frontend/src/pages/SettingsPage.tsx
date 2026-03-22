import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthProvider';
import accountService from '../services/accountService';
import toast from 'react-hot-toast';
import {
    Mail, Lock, Trash2, Eye, EyeOff, AlertTriangle,
    CheckCircle, Shield, ChevronRight, User
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 mx-auto ${isDanger ? 'bg-rose-100' : 'bg-blue-100'}`}>
                    {isDanger ? <AlertTriangle size={28} className="text-rose-500" /> : <CheckCircle size={28} className="text-blue-600" />}
                </div>
                <h3 className="text-xl font-black text-slate-900 text-center mb-2">{title}</h3>
                <p className="text-slate-500 text-sm text-center mb-8 leading-relaxed">{description}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 rounded-xl text-white font-bold text-sm transition-all ${isDanger ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ── Section Card wrapper ────────────────────────────────────────── */
const SectionCard: React.FC<{ icon: React.ElementType; title: string; subtitle: string; iconColor: string; iconBg: string; children: React.ReactNode }> =
    ({ icon: Icon, title, subtitle, iconColor, iconBg, children }) => (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
            <div className="flex items-center gap-5 mb-8">
                <div className={`p-3.5 rounded-2xl ${iconBg}`}>
                    <Icon size={22} className={iconColor} />
                </div>
                <div>
                    <h2 className="text-lg font-black text-slate-900">{title}</h2>
                    <p className="text-sm text-slate-400 font-medium">{subtitle}</p>
                </div>
            </div>
            {children}
        </div>
    );

/* ── Main Settings Page ──────────────────────────────────────────── */
const SettingsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /* ── Email change state ──────────────────────────────────── */
    const [emailForm, setEmailForm] = useState({ newEmail: '', password: '' });
    const [emailModal, setEmailModal] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailErrors, setEmailErrors] = useState<Record<string, string>>({});

    /* ── Password change state ───────────────────────────────── */
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwModal, setPwModal] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    /* ── Delete account state ────────────────────────────────── */
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeletePw, setShowDeletePw] = useState(false);

    /* ── Email validation ────────────────────────────────────── */
    const validateEmail = () => {
        const errs: Record<string, string> = {};
        if (!emailForm.newEmail) errs.newEmail = 'New email is required';
        else if (!emailForm.newEmail.endsWith('@sliit.lk')) errs.newEmail = 'Only @sliit.lk emails are permitted';
        if (!emailForm.password) errs.password = 'Password is required';
        setEmailErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateEmail()) setEmailModal(true);
    };

    const confirmEmailChange = async () => {
        setEmailModal(false);
        setEmailLoading(true);
        try {
            await accountService.changeEmail(emailForm.newEmail, emailForm.password);
            toast.success('Email updated! Please log in again.');
            setEmailForm({ newEmail: '', password: '' });
            logout();
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update email.');
        } finally {
            setEmailLoading(false);
        }
    };

    /* ── Password validation ─────────────────────────────────── */
    const validatePassword = () => {
        const errs: Record<string, string> = {};
        if (!pwForm.currentPassword) errs.currentPassword = 'Current password is required';
        if (!pwForm.newPassword) errs.newPassword = 'New password is required';
        else if (pwForm.newPassword.length < 8) errs.newPassword = 'Minimum 8 characters';
        else if (!/[A-Z]/.test(pwForm.newPassword)) errs.newPassword = 'Must include an uppercase letter';
        else if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwForm.newPassword)) errs.newPassword = 'Must include a special character';
        else if (!/[0-9]/.test(pwForm.newPassword)) errs.newPassword = 'Must include a number';
        if (pwForm.newPassword !== pwForm.confirmPassword) errs.confirmPassword = 'Passwords do not match';
        setPwErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validatePassword()) setPwModal(true);
    };

    const confirmPasswordChange = async () => {
        setPwModal(false);
        setPwLoading(true);
        try {
            await accountService.changePassword(pwForm.currentPassword, pwForm.newPassword);
            toast.success('Password updated successfully!');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update password.');
        } finally {
            setPwLoading(false);
        }
    };

    /* ── Delete account ──────────────────────────────────────── */
    const handleDeleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deletePassword) { toast.error('Enter your password to confirm deletion.'); return; }
        if (!deleteConfirm) { toast.error('Please check the confirmation box first.'); return; }
        setDeleteModal(true);
    };

    const confirmDelete = async () => {
        setDeleteModal(false);
        setDeleteLoading(true);
        try {
            await accountService.deleteAccount(deletePassword);
            toast.success('Your account has been permanently deleted.');
            logout();
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete account.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-cobalt-sliit/10 flex items-center justify-center">
                        <Shield size={20} className="text-cobalt-sliit" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900">Account Settings</h1>
                </div>
                <p className="text-slate-400 text-sm ml-13 pl-13">Manage your security credentials and account status.</p>
                {/* Current account info */}
                <div className="mt-6 flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-blue-200">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User size={20} className="text-blue-500" />
                        )}
                    </div>
                    <div>
                        <p className="font-black text-slate-900 text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-400 font-medium">{user?.email}</p>
                    </div>
                    <button onClick={() => navigate('/profile')} className="ml-auto flex items-center gap-1 text-xs text-cobalt-sliit font-bold hover:gap-2 transition-all">
                        View Profile <ChevronRight size={14} />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* ── Change Email ──────────────────────────────── */}
                <SectionCard icon={Mail} title="Change Email" subtitle="Update your institutional email address." iconColor="text-blue-600" iconBg="bg-blue-50">
                    <form onSubmit={handleEmailSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">New Email Address</label>
                            <input
                                type="email"
                                value={emailForm.newEmail}
                                onChange={e => setEmailForm(f => ({ ...f, newEmail: e.target.value }))}
                                placeholder="name@sliit.lk"
                                className="input-field"
                            />
                            {emailErrors.newEmail && <p className="text-rose-500 text-xs font-bold mt-1">{emailErrors.newEmail}</p>}
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Confirm with Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={emailForm.password}
                                    onChange={e => setEmailForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="Your current password"
                                    className="input-field"
                                />
                            </div>
                            {emailErrors.password && <p className="text-rose-500 text-xs font-bold mt-1">{emailErrors.password}</p>}
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={emailLoading} className="btn-primary gap-2 px-6">
                                {emailLoading ? 'Updating...' : 'Update Email'}
                            </button>
                        </div>
                    </form>
                </SectionCard>

                {/* ── Change Password ───────────────────────────── */}
                <SectionCard icon={Lock} title="Change Password" subtitle="Choose a strong password for your account." iconColor="text-emerald-600" iconBg="bg-emerald-50">
                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                        {[
                            { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••', showKey: 'current' as const },
                            { key: 'newPassword', label: 'New Password', placeholder: 'Min 8 chars, uppercase, number, symbol', showKey: 'new' as const },
                            { key: 'confirmPassword', label: 'Confirm New Password', placeholder: '••••••••', showKey: 'confirm' as const },
                        ].map(field => (
                            <div key={field.key}>
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">{field.label}</label>
                                <div className="relative">
                                    <input
                                        type={showPw[field.showKey] ? 'text' : 'password'}
                                        value={pwForm[field.key as keyof typeof pwForm]}
                                        onChange={e => setPwForm(f => ({ ...f, [field.key]: e.target.value }))}
                                        placeholder={field.placeholder}
                                        className="input-field pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(s => ({ ...s, [field.showKey]: !s[field.showKey] }))}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                    >
                                        {showPw[field.showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                                {pwErrors[field.key] && <p className="text-rose-500 text-xs font-bold mt-1">{pwErrors[field.key]}</p>}
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <button type="submit" disabled={pwLoading} className="btn-primary gap-2 px-6">
                                {pwLoading ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </SectionCard>

                {/* ── Danger Zone ───────────────────────────────── */}
                <div className="bg-white rounded-3xl border-2 border-rose-100 shadow-sm p-8">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="p-3.5 rounded-2xl bg-rose-50">
                            <Trash2 size={22} className="text-rose-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-rose-600">Danger Zone</h2>
                            <p className="text-sm text-slate-400 font-medium">Permanently delete your account and all data.</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 mb-6">
                        <p className="text-rose-700 text-sm font-medium leading-relaxed">
                            ⚠️ This action is <strong>irreversible</strong>. All your profile data, skills, experience, education records, and projects will be permanently deleted.
                        </p>
                    </div>
                    <form onSubmit={handleDeleteSubmit} className="space-y-5">
                        <div>
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-2">Confirm with Password</label>
                            <div className="relative">
                                <input
                                    type={showDeletePw ? 'text' : 'password'}
                                    value={deletePassword}
                                    onChange={e => setDeletePassword(e.target.value)}
                                    placeholder="Enter your password to confirm"
                                    className="input-field pr-10 border-rose-200 focus:border-rose-400"
                                />
                                <button type="button" onClick={() => setShowDeletePw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                                    {showDeletePw ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={deleteConfirm}
                                onChange={e => setDeleteConfirm(e.target.checked)}
                                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-rose-500"
                            />
                            <span className="text-sm text-slate-600 font-medium">
                                I understand this action is permanent and cannot be undone. All my data will be deleted forever.
                            </span>
                        </label>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={deleteLoading || !deleteConfirm}
                                className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all text-sm"
                            >
                                <Trash2 size={15} />
                                {deleteLoading ? 'Deleting...' : 'Permanently Delete Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modals */}
            <ConfirmModal
                isOpen={emailModal}
                title="Update Email Address?"
                description={`Your login email will be changed to ${emailForm.newEmail}. You will be logged out and need to sign in with the new address.`}
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
