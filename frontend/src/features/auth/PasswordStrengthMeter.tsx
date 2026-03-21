import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface Props {
    password: string;
}

export const PasswordStrengthMeter: React.FC<Props> = ({ password }) => {
    const getStrength = (pass: string) => {
        let score = 0;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        return score;
    };

    const strength = getStrength(password);
    const labels = ['CRYPTO-WEAK', 'UNSAFE', 'STABLE', 'REINFORCED', 'TITANIUM'];
    const colors = ['bg-rose-500', 'bg-orange-500', 'bg-yellow-500', 'bg-cobalt-electric', 'bg-emerald-500'];

    return (
        <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {strength <= 1 ? <ShieldAlert size={14} className="text-rose-500" /> : 
                     strength <= 3 ? <Shield size={14} className="text-cobalt-electric" /> : 
                     <ShieldCheck size={14} className="text-emerald-500" />}
                    <span className="text-[10px] font-black tracking-[0.2em] font-mono text-slate-500 uppercase">
                        Entropy Status: <span className={strength > 0 ? colors[strength-1].replace('bg-', 'text-') : 'text-slate-600'}>
                            {labels[strength]}
                        </span>
                    </span>
                </div>
                <span className="text-[10px] font-mono text-slate-600">{strength * 25}% SECURE</span>
            </div>
            
            {/* Liquid Fill Bar Container */}
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(strength / 4) * 100}%` }}
                    className={`h-full ${colors[strength] || 'bg-slate-700'} transition-colors duration-500 shadow-[0_0_15px_rgba(46,91,255,0.4)] relative`}
                >
                    {/* Liquid Reflection Effect */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20 blur-[1px]" />
                </motion.div>
            </div>
            
            <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[0, 1, 2, 3].map((i) => (
                    <div 
                        key={i} 
                        className={`h-0.5 rounded-full transition-all duration-700 ${i < strength ? colors[strength] : 'bg-white/5'}`} 
                    />
                ))}
            </div>
        </div>
    );
};
