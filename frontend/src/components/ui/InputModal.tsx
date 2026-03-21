import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, X, Eye, EyeOff } from 'lucide-react';

interface InputModalProps {
    isOpen: boolean;
    title: string;
    description: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
    validator?: (value: string) => string | null; // returns error message if invalid
    onSubmit: (value: string) => void;
    onCancel: () => void;
}

export const InputModal: React.FC<InputModalProps> = ({
    isOpen,
    title,
    description,
    placeholder = 'Enter value...',
    confirmText = 'Submit',
    cancelText = 'Cancel',
    validator,
    onSubmit,
    onCancel
}) => {
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setValue('');
            setError(null);
            setShowPassword(false);
        }
    }, [isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (validator) {
            const validationError = validator(value);
            if (validationError) {
                setError(validationError);
                return;
            }
        }
        
        onSubmit(value);
        onCancel();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40"
                        onClick={onCancel}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md pointer-events-auto border border-white/20 overflow-hidden relative"
                        >
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white text-center relative">
                                <button 
                                    onClick={onCancel}
                                    className="absolute right-4 top-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                                    <Key size={28} className="text-white drop-shadow-md" />
                                </div>
                                <h3 className="text-2xl font-black mb-1 drop-shadow-sm">{title}</h3>
                                <p className="text-indigo-100 text-sm font-medium">{description}</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 md:p-8">
                                <div className="mb-8 relative">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1 block">New Credential</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={value}
                                            onChange={(e) => {
                                                setValue(e.target.value);
                                                if (error) setError(null);
                                            }}
                                            placeholder={placeholder}
                                            autoFocus
                                            className="w-full h-14 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium pr-12"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    <AnimatePresence>
                                        {error && (
                                            <motion.p 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full mt-2 left-1 text-[11px] font-bold text-rose-500"
                                            >
                                                {error}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                    >
                                        {cancelText}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 transition-all"
                                    >
                                        {confirmText}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
