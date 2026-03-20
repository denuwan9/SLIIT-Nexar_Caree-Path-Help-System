import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert, Info } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    actionType?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    actionType = 'warning',
    onConfirm,
    onCancel
}) => {
    // Determine styles based on actionType
    const getStyles = () => {
        switch (actionType) {
            case 'danger':
                return {
                    icon: <ShieldAlert size={28} className="text-rose-500" />,
                    bg: 'bg-rose-50 text-rose-600',
                    btn: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                };
            case 'warning':
                return {
                    icon: <AlertTriangle size={28} className="text-amber-500" />,
                    bg: 'bg-amber-50 text-amber-600',
                    btn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                };
            default:
                return {
                    icon: <Info size={28} className="text-blue-500" />,
                    bg: 'bg-blue-50 text-blue-600',
                    btn: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30'
                };
        }
    };

    const styles = getStyles();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                        onClick={onCancel}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full pointer-events-auto relative overflow-hidden"
                        >
                            <button 
                                onClick={onCancel}
                                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${styles.bg}`}>
                                    {styles.icon}
                                </div>
                                
                                <h3 className="text-2xl font-black text-slate-800 mb-3">{title}</h3>
                                <p className="text-slate-500 mb-8 leading-relaxed">
                                    {description}
                                </p>

                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={onCancel}
                                        className="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        onClick={() => {
                                            onConfirm();
                                            onCancel();
                                        }}
                                        className={`flex-1 px-6 py-3.5 rounded-2xl font-bold shadow-lg transition-all ${styles.btn}`}
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
