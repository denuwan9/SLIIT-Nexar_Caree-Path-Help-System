import React from 'react';
import { Linkedin, Github, Globe, Twitter, Share2, Layers, ExternalLink, Link2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { SocialLinks as SocialLinksType } from '../../types/profile';

interface SocialLinksProps {
    links: SocialLinksType;
    onUpdate: (data: SocialLinksType) => Promise<void>;
}

export const SocialLinks: React.FC<SocialLinksProps> = ({ links, onUpdate }) => {
    const { register, handleSubmit, formState: { isSubmitting, isDirty } } = useForm<SocialLinksType>({
        defaultValues: links
    });

    const onSubmit = async (data: SocialLinksType) => {
        await onUpdate(data);
    };

    const LinkField = ({ name, icon: Icon, placeholder, label, colorClass }: { name: keyof SocialLinksType, icon: any, placeholder: string, label: string, colorClass: string }) => (
        <div className="group space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-slate-600 transition-colors">
                <Icon size={12} className={colorClass} />
                {label}
            </label>
            <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-all">
                    <Link2 size={18} />
                </div>
                <input
                    {...register(name)}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-[24px] focus:bg-white focus:border-slate-200 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300 placeholder:font-medium italic-none"
                    placeholder={placeholder}
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex items-center gap-8 pb-8 border-b border-slate-50">
                <div className="h-20 w-20 rounded-[28px] bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 italic">
                    <Share2 size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Digital Footprint</h3>
                    <p className="text-xs font-bold text-slate-400 max-w-[280px] leading-relaxed mt-1 uppercase tracking-wider">
                        Your professional networking and social presence across the web.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                    <LinkField
                        name="linkedin"
                        icon={Linkedin}
                        label="LinkedIn Professional"
                        colorClass="text-[#0077B5]"
                        placeholder="linkedin.com/in/username"
                    />
                    <LinkField
                        name="github"
                        icon={Github}
                        label="GitHub Repository"
                        colorClass="text-[#181717]"
                        placeholder="github.com/username"
                    />
                    <LinkField
                        name="portfolioWebsite"
                        icon={Globe}
                        label="Creative Portfolio"
                        colorClass="text-blue-500"
                        placeholder="yourportfolio.io"
                    />
                    <LinkField
                        name="website"
                        icon={ExternalLink}
                        label="Personal Website"
                        colorClass="text-slate-600"
                        placeholder="yourdomain.com"
                    />
                    <LinkField
                        name="twitter"
                        icon={Twitter}
                        label="Twitter / X Platform"
                        colorClass="text-[#1DA1F2]"
                        placeholder="x.com/username"
                    />
                    <LinkField
                        name="stackoverflow"
                        icon={Layers}
                        label="Stack Overflow ID"
                        colorClass="text-[#F48024]"
                        placeholder="stackoverflow.com/users/id"
                    />
                </div>

                <div className="pt-8 border-t border-slate-50">
                    <button
                        type="submit"
                        disabled={isSubmitting || !isDirty}
                        className="w-full btn-primary py-5 rounded-[24px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all bg-gradient-to-r from-slate-900 to-slate-800 shadow-xl shadow-slate-900/20 disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
                    >
                        {isSubmitting ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                        ) : (
                            <Share2 size={18} />
                        )}
                        <span className="text-sm uppercase tracking-[0.2em] font-black text-white">Update Social Graph</span>
                    </button>
                    <p className="text-center text-[10px] font-bold text-slate-300 mt-6 uppercase tracking-[0.1em]">Verified links improve your searchability by recruiters</p>
                </div>
            </form>
        </div>
    );
};

export default SocialLinks;
