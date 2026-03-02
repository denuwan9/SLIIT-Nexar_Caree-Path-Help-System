import React from 'react';
import {
    User, BookOpen, Briefcase, Rocket, Mail,
    MapPin, Award, Github
} from 'lucide-react';
import type { StudentProfile } from '../../types/profile';

interface SectionWrapperProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    className?: string;
    iconColor?: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, icon: Icon, children, className = "", iconColor = "text-blue-600" }) => (
    <div className={`card space-y-6 ${className}`}>
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className={`h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center ${iconColor}`}>
                <Icon size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
        </div>
        {children}
    </div>
);

export const AboutMeView: React.FC<{ profile: StudentProfile }> = ({ profile }) => (
    <SectionWrapper title="About Me" icon={User}>
        <div className="space-y-6">
            <p className="text-slate-600 leading-relaxed font-medium">
                {profile.bio || 'Professional journey details not yet shared...'}
            </p>
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <MapPin size={16} className="text-blue-500" />
                    <span>{profile.location?.city ? `${profile.location.city}, ${profile.location.country}` : 'Location not set'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Mail size={16} className="text-blue-500" />
                    <span>{typeof profile.user !== 'string' ? profile.user?.email : 'No Email'}</span>
                </div>
            </div>
        </div>
    </SectionWrapper>
);

export const SkillsView: React.FC<{ profile: StudentProfile }> = ({ profile }) => (
    <SectionWrapper title="Skills & Expertise" icon={Award} iconColor="text-purple-600">
        <div className="space-y-8">
            <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Technical</p>
                <div className="flex flex-wrap gap-2">
                    {profile.technicalSkills.length > 0 ? profile.technicalSkills.map(skill => (
                        <span key={skill._id} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-wider rounded-lg border border-blue-100 italic">
                            {skill.name}
                        </span>
                    )) : <p className="text-xs font-bold text-slate-300 italic">No skills added</p>}
                </div>
            </div>
            <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Languages & Soft Skills</p>
                <div className="flex flex-wrap gap-2">
                    {profile.languages.map(lang => (
                        <span key={lang._id} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[11px] font-black uppercase tracking-wider rounded-lg border border-slate-100">
                            {lang.language}
                        </span>
                    ))}
                    {profile.softSkills.map(skill => (
                        <span key={skill._id} className="px-3 py-1.5 bg-white text-slate-500 text-[11px] font-black uppercase tracking-wider rounded-lg border border-slate-200">
                            {skill.name}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </SectionWrapper>
);

export const ExperienceEducationView: React.FC<{ profile: StudentProfile }> = ({ profile }) => (
    <div className="space-y-8">
        <SectionWrapper title="Education" icon={BookOpen} iconColor="text-orange-500">
            <div className="space-y-6">
                {profile.education.length > 0 ? profile.education.map(edu => (
                    <div key={edu._id} className="flex gap-4 group">
                        <div className="h-2 w-2 rounded-full bg-orange-200 mt-2 shrink-0 group-hover:bg-orange-500 transition-colors"></div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 leading-tight">{edu.institution}</h4>
                            <p className="text-sm font-bold text-orange-600">{edu.degree} in {edu.field}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                {new Date(edu.startDate).getFullYear()} - {edu.isCurrentlyEnrolled ? 'Present' : (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}
                            </p>
                        </div>
                    </div>
                )) : <p className="text-sm font-bold text-slate-300 italic text-center py-4">No education history.</p>}
            </div>
        </SectionWrapper>

        <SectionWrapper title="Experience" icon={Briefcase} iconColor="text-emerald-600">
            <div className="space-y-8">
                {profile.experience.length > 0 ? profile.experience.map(exp => (
                    <div key={exp._id} className="flex gap-4 group">
                        <div className="h-2 w-2 rounded-full bg-emerald-200 mt-2 shrink-0 group-hover:bg-emerald-500 transition-colors"></div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-slate-900 leading-tight">{exp.title}</h4>
                            <p className="text-sm font-bold text-emerald-600">{exp.company} • {exp.type.replace(/-/g, ' ')}</p>
                            <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
                                {new Date(exp.startDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : '')}
                            </p>
                            {exp.description && <p className="text-xs text-slate-500 leading-relaxed font-medium">{exp.description}</p>}
                        </div>
                    </div>
                )) : <p className="text-sm font-bold text-slate-300 italic text-center py-4">No experience listed.</p>}
            </div>
        </SectionWrapper>
    </div>
);

export const ProjectsView: React.FC<{ profile: StudentProfile }> = ({ profile }) => (
    <SectionWrapper title="Featured Projects" icon={Rocket} iconColor="text-pink-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(profile.projects || []).length > 0 ? (profile.projects || []).map(project => (
                <div key={project._id} className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-xl hover:border-blue-200 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{project.title}</h4>
                        {project.githubLink && (
                            <a href={project.githubLink} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900">
                                <Github size={18} />
                            </a>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium line-clamp-3">
                        {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {project.technologiesUsed.map(tech => (
                            <span key={tech} className="text-[9px] font-black uppercase tracking-tighter bg-white px-2 py-0.5 rounded-md border border-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:border-blue-100">
                                # {tech}
                            </span>
                        ))}
                    </div>
                </div>
            )) : (
                <div className="md:col-span-2 py-12 text-center border-2 border-dashed border-slate-100 rounded-[32px]">
                    <p className="text-slate-300 font-bold italic">No projects showcased yet.</p>
                </div>
            )}
        </div>
    </SectionWrapper>
);
