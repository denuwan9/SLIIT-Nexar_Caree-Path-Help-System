import React from 'react';
import { Linkedin, Github, Globe, Twitter, Share2, Layers } from 'lucide-react';
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

    const LinkField = ({ name, icon: Icon, placeholder, label }: { name: keyof SocialLinksType, icon: any, placeholder: string, label: string }) => (
        <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Icon size={16} className="text-slate-400" />
                {label}
            </label>
            <input
                {...register(name)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder={placeholder}
            />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Share2 className="text-blue-600" />
                    Social & Professional Links
                </h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LinkField
                        name="linkedin"
                        icon={Linkedin}
                        label="LinkedIn Profile"
                        placeholder="https://linkedin.com/in/username"
                    />
                    <LinkField
                        name="github"
                        icon={Github}
                        label="GitHub Profile"
                        placeholder="https://github.com/username"
                    />
                    <LinkField
                        name="portfolioWebsite"
                        icon={Globe}
                        label="Portfolio Website"
                        placeholder="https://yourportfolio.com"
                    />
                    <LinkField
                        name="website"
                        icon={Globe}
                        label="Personal Website"
                        placeholder="https://yourwebsite.com"
                    />
                    <LinkField
                        name="twitter"
                        icon={Twitter}
                        label="Twitter / X"
                        placeholder="https://x.com/username"
                    />
                    <LinkField
                        name="stackoverflow"
                        icon={Layers}
                        label="Stack Overflow"
                        placeholder="https://stackoverflow.com/users/id"
                    />
                </div>

                <div className="flex gap-3 pt-6 border-t border-slate-100">
                    <button
                        type="submit"
                        disabled={isSubmitting || !isDirty}
                        className="btn-primary py-2 px-10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : 'Save Social Links'}
                    </button>
                </div>
            </form>
        </div>
    );
};
