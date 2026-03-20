import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import adminService from '../features/admin/adminService';
import { 
    Loader2, ArrowLeft, MapPin, Mail, Calendar, GraduationCap, 
    Briefcase, Code2, Heart, ExternalLink, Github, Linkedin, MonitorPlay
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminStudentPreview: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!id) return;
                const data = await adminService.getStudentProfileById(id);
                setProfile(data);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to fetch student profile');
                navigate('/admin/profiles');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <p className="text-slate-500 font-bold tracking-widest uppercase text-sm animate-pulse">Loading Profile Data...</p>
            </div>
        );
    }

    if (!profile) return null;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto relative min-h-[calc(100vh-80px)]">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header Navigation */}
            <button 
                onClick={() => navigate('/admin/profiles')}
                className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group relative z-10"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Career Profiles
            </button>

            {/* Profile Hero Section */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 relative z-10 mb-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                    {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-3xl object-cover shadow-lg border-4 border-white" />
                    ) : (
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-5xl font-black shadow-lg border-4 border-white/50">
                            {profile.firstName[0]}{profile.lastName[0]}
                        </div>
                    )}
                    
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                            <h1 className="text-4xl font-black text-slate-900">{profile.firstName} {profile.lastName}</h1>
                            <div className="flex gap-2">
                                {profile.isActivelyLooking ? (
                                    <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">Actively Looking</span>
                                ) : (
                                    <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">Not Looking</span>
                                )}
                            </div>
                        </div>
                        
                        <p className="text-xl font-medium text-slate-600 mb-4">{profile.headline || 'No headline provided'}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm font-bold text-slate-500">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                <Mail size={16} className="text-slate-400" />
                                {profile.user?.email}
                            </div>
                            {(profile.location?.city || profile.location?.country) && (
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                    <MapPin size={16} className="text-slate-400" />
                                    {profile.location.city ? `${profile.location.city}, ` : ''}{profile.location.country}
                                </div>
                            )}
                            {profile.socialLinks?.linkedin && (
                                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors border border-indigo-100/50 shadow-sm">
                                    <Linkedin size={16} /> LinkedIn
                                </a>
                            )}
                            {profile.socialLinks?.github && (
                                <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-colors border border-slate-200/50 shadow-sm">
                                    <Github size={16} /> GitHub
                                </a>
                            )}
                            {profile.resumeUrl && (
                                <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-100/50 shadow-sm">
                                    <ExternalLink size={16} /> View Resume
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {profile.bio && (
                    <div className="mt-8 pt-8 border-t border-slate-100 relative z-10">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">About</h3>
                        <p className="text-slate-600 leading-relaxed font-medium">{profile.bio}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Left Column: Academic & Experience */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Education */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                <GraduationCap size={20} />
                            </div>
                            Academic Background
                        </h2>
                        
                        <div className="mb-6 pb-6 border-b border-slate-100">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800">{profile.major || 'Undeclared Major'}</h3>
                                    <p className="text-slate-500 font-medium">{profile.university || 'No University'}</p>
                                </div>
                                {profile.gpa ? (
                                    <span className="bg-slate-100 text-slate-700 font-black px-3 py-1 rounded-lg">GPA: {profile.gpa.toFixed(2)}</span>
                                ) : null}
                            </div>
                            {profile.yearOfStudy && <p className="text-sm text-slate-400 font-bold mb-2">Year of Study: {profile.yearOfStudy}</p>}
                        </div>

                        {profile.education?.length > 0 ? (
                            <div className="space-y-6">
                                {profile.education.map((edu: any, index: number) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-2 h-2 mt-2 rounded-full bg-purple-400 shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-1">{edu.degree} in {edu.field}</h4>
                                            <p className="text-slate-600 font-medium text-sm mb-1">{edu.institution}</p>
                                            <div className="flex gap-4 text-xs font-bold text-slate-400">
                                                <span>{edu.startYear} - {edu.isCurrent ? 'Present' : edu.endYear}</span>
                                                {edu.gpa && <span>GPA: {edu.gpa.toFixed(2)}</span>}
                                            </div>
                                            {edu.description && <p className="mt-2 text-sm text-slate-500">{edu.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic font-medium">No extended education details provided.</p>
                        )}
                    </div>

                    {/* Experience */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                                <Briefcase size={20} />
                            </div>
                            Professional Experience
                        </h2>

                        {profile.experience?.length > 0 ? (
                            <div className="space-y-6">
                                {profile.experience.map((exp: any, index: number) => (
                                    <div key={index} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-lg">{exp.title}</h4>
                                                <p className="text-indigo-600 font-bold">{exp.company}</p>
                                            </div>
                                            <span className="bg-slate-50 text-slate-500 font-bold text-xs uppercase px-2 py-1 rounded">
                                                {exp.type}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 text-xs font-bold text-slate-400 mb-3">
                                            <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(exp.startDate).toLocaleDateString()} - {exp.isCurrent ? 'Present' : new Date(exp.endDate).toLocaleDateString()}</span>
                                            {exp.location && <span className="flex items-center gap-1"><MapPin size={14} /> {exp.location} {exp.isRemote && '(Remote)'}</span>}
                                        </div>
                                        {exp.description && <p className="text-sm text-slate-600 leading-relaxed mb-3">{exp.description}</p>}
                                        {exp.skills?.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {exp.skills.map((skill: string, i: number) => (
                                                    <span key={i} className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-2 py-1 rounded">{skill}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic font-medium">No experience recorded.</p>
                        )}
                    </div>

                    {/* Projects */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-8 shadow-xl shadow-slate-200/40">
                        <h2 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <MonitorPlay size={20} />
                            </div>
                            Featured Projects
                        </h2>

                        {profile.projects?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.projects.map((proj: any, index: number) => (
                                    <div key={index} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm group">
                                        <h4 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-blue-600 transition-colors">{proj.title}</h4>
                                        <p className="text-sm text-slate-500 mb-4 line-clamp-3">{proj.description}</p>
                                        
                                        <div className="flex items-center gap-3 mb-4">
                                            {proj.githubUrl && (
                                                <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                                                    <Github size={16} />
                                                </a>
                                            )}
                                            {proj.liveUrl && (
                                                <a href={proj.liveUrl} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-200 transition-colors">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </div>

                                        {proj.techStack?.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-auto">
                                                {proj.techStack.slice(0, 3).map((tech: string, i: number) => (
                                                    <span key={i} className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{tech}</span>
                                                ))}
                                                {proj.techStack.length > 3 && (
                                                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded">+{proj.techStack.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic font-medium">No projects recorded.</p>
                        )}
                    </div>
                </div>

                {/* Right Column: Skills & Goals */}
                <div className="space-y-8">
                    
                    {/* Technical Skills */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-xl shadow-slate-200/40">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                <Code2 size={16} />
                            </div>
                            Technical Skills
                        </h2>
                        
                        {profile.technicalSkills?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.technicalSkills.map((skill: any, index: number) => (
                                    <div key={index} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                                        <span>{skill.name}</span>
                                        <span className="w-1 h-1 rounded-full bg-indigo-300" />
                                        <span className="text-[9px] uppercase tracking-widest text-indigo-400">{skill.level}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic font-medium text-sm">No technical skills recorded.</p>
                        )}
                    </div>

                    {/* Soft Skills */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-xl shadow-slate-200/40">
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-3 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                <Heart size={16} />
                            </div>
                            Soft Skills
                        </h2>
                        
                        {profile.softSkills?.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.softSkills.map((skill: any, index: number) => (
                                    <div key={index} className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
                                        <span>{skill.name}</span>
                                        <span className="w-1 h-1 rounded-full bg-emerald-300" />
                                        <span className="text-[9px] uppercase tracking-widest text-emerald-500">{skill.level}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic font-medium text-sm">No soft skills recorded.</p>
                        )}
                    </div>

                    {/* Target Roles & Industries */}
                    {profile.careerGoals && (
                        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-6 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full" />
                            
                            <h2 className="text-lg font-black text-white mb-5 uppercase tracking-widest text-xs relative z-10">
                                Career Objectives
                            </h2>

                            {profile.careerGoals.careerObjective && (
                                <p className="text-sm text-slate-300 mb-6 italic leading-relaxed relative z-10">"{profile.careerGoals.careerObjective}"</p>
                            )}

                            {profile.careerGoals.targetRoles?.length > 0 && (
                                <div className="mb-4 relative z-10">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Target Roles</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.careerGoals.targetRoles.map((role: string, index: number) => (
                                            <span key={index} className="bg-white/10 text-white border border-white/10 px-2 py-1 rounded text-[10px] font-bold">{role}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {profile.careerGoals.preferredIndustries?.length > 0 && (
                                <div className="relative z-10">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Preferred Industries</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.careerGoals.preferredIndustries.map((ind: string, index: number) => (
                                            <span key={index} className="bg-white/10 text-white border border-white/10 px-2 py-1 rounded text-[10px] font-bold">{ind}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminStudentPreview;
