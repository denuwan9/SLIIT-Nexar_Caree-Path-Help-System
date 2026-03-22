import React, { useEffect } from 'react';
import { useSystemBoot } from '../hooks/useSystemBoot';
import { useAuth } from '../components/auth/AuthProvider';
import { DashboardSkeleton } from '../components/ui/DashboardSkeleton';
import { 
    Calendar,
    Target,
    Activity,
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Plus,
    Briefcase,
    ArrowUpRight,
    BookOpen,
    CheckCircle2,
    Circle,
    Flag,
    Zap,
    Map
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { StudentProfile } from '../types/profile';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { boot, bootData, isLoading, error } = useSystemBoot();
    const navigate = useNavigate();

    useEffect(() => {
        boot();
    }, [boot]);

    if (isLoading || !bootData) return <DashboardSkeleton />;
    
    if (error) {
        return (
            <div className="min-h-[500px] flex items-center justify-center font-sans">
                <div className="bg-white rounded-3xl p-8 text-center max-w-md shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-rose-500 mb-4">Boot Error</h2>
                    <p className="text-slate-500 text-sm mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-[#0F172A] text-white rounded-xl font-bold text-sm"
                    >
                        Re-initialize System
                    </button>
                </div>
            </div>
        );
    }

    const profile: StudentProfile = bootData.ProfileData;
    const firstName = profile?.firstName || user?.firstName || 'Student';
    const targetRole = profile?.careerGoals?.targetRoles?.[0] || 'Software Engineer';
    const completeness = profile?.profileCompleteness || 0;

    // Dynamic Recommendations based on role
    const getRecommendations = (role: string) => {
        const baseRecs = [
            { 
                tag: 'SKILLS', 
                title: `Mastering Core ${role} Fundamentals`, 
                img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600' 
            },
            { 
                tag: 'PROJECTS', 
                title: `Building a Production-Ready ${role} Portfolio`, 
                img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=600' 
            },
            { 
                tag: 'CAREER', 
                title: `Interview Strategies for top tier ${role} roles`, 
                img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600' 
            }
        ];
        return baseRecs;
    };

    const recommendations = getRecommendations(targetRole);

    // Roadmap Milestones
    const milestones = [
        { label: 'Profile Setup', status: completeness >= 20 ? 'complete' : 'pending' },
        { label: 'Skill Mapping', status: (profile?.technicalSkills?.length || 0) > 0 ? 'complete' : 'pending' },
        { label: 'Interview Prep', status: bootData.DashboardState.interviewBookings > 0 ? 'complete' : 'current' },
        { label: 'Job Ready', status: completeness >= 90 ? 'complete' : 'pending' }
    ];

    return (
        <div className="w-full pb-10 text-[#0F172A] font-sans">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* ─── LEFT MAIN COLUMN ─── */}
                <div className="xl:col-span-8 flex flex-col gap-8">
                    
                    {/* Welcome Header */}
                    <div className="flex justify-between items-center bg-white rounded-3xl p-8 shadow-sm border border-slate-100/50">
                        <div>
                            <h1 className="text-[28px] font-bold text-[#0F172A] tracking-tight mb-1">Hello, {firstName}</h1>
                            <p className="text-[#64748B] text-[14px]">Track career progress here. You almost reach a goal!</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[13px] font-semibold text-[#0F172A]">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                                <Calendar size={18} className="text-[#64748B]" />
                            </div>
                        </div>
                    </div>

                    {/* Career Roadmap Card (Replacement for Stats Row) */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100/50 relative overflow-hidden group">
                        <div className="flex justify-between items-center mb-10 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Map size={20} />
                                </div>
                                <div>
                                    <h2 className="text-[17px] font-bold text-[#0F172A]">Career Roadmap</h2>
                                    <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">{targetRole} Pathway</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-full border border-emerald-100">Synchronized</span>
                        </div>

                        <div className="relative z-10 grid grid-cols-4 gap-4 px-2">
                            {/* Connector Line */}
                            <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-100 -z-10">
                                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000" style={{ width: `${(milestones.filter(m => m.status === 'complete').length / milestones.length) * 100}%` }}></div>
                            </div>

                            {milestones.map((ms, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-3 text-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-all duration-300 ${
                                        ms.status === 'complete' ? 'bg-emerald-500 text-white' : 
                                        ms.status === 'current' ? 'bg-purple-600 text-white animate-pulse shadow-purple-200' : 
                                        'bg-slate-100 text-slate-300'
                                    }`}>
                                        {ms.status === 'complete' ? <CheckCircle2 size={16} /> : <Circle size={10} fill={ms.status === 'current' ? 'currentColor' : 'none'} />}
                                    </div>
                                    <span className={`text-[12px] font-bold ${ms.status !== 'pending' ? 'text-[#0F172A]' : 'text-slate-400'}`}>{ms.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Background subtle pattern */}
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-50 group-hover:bg-purple-100 transition-colors rounded-tl-[100px] -z-0 opacity-50 blur-2xl"></div>
                    </div>

                    {/* Quick Actions (Additional Feature) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Analyze Resume', icon: <BookOpen size={16} />, color: 'bg-blue-50 text-blue-600', path: '/resume' },
                            { label: 'Mock Interview', icon: <Activity size={16} />, color: 'bg-rose-50 text-rose-600', path: '/interview' },
                            { label: 'Skill Gap', icon: <Target size={16} />, color: 'bg-emerald-50 text-emerald-600', path: '/skills' },
                            { label: 'AI Strategy', icon: <Zap size={16} />, color: 'bg-amber-50 text-amber-600', path: '/ai-advisor' }
                        ].map((action, aIdx) => (
                            <button key={aIdx} onClick={() => navigate(action.path)} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all flex flex-col items-center gap-3 text-center group">
                                <div className={`w-10 h-10 rounded-2xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    {action.icon}
                                </div>
                                <span className="text-[11px] font-bold text-slate-700">{action.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Featured Recommendations */}
                    <div>
                        <div className="flex justify-between items-center mb-5 mt-2 px-1">
                            <h2 className="text-[18px] font-bold text-[#0F172A]">Featured Recommendations</h2>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-[#94A3B8] hover:bg-slate-50 transition-colors">
                                    <ChevronLeft size={16} />
                                </button>
                                <button className="w-8 h-8 rounded-full bg-[#0F172A] flex items-center justify-center text-white hover:bg-black transition-colors shadow-md">
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {recommendations.map((rec, i) => (
                                <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/50 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="w-full h-32 bg-[#F8FAFC] rounded-2xl mb-4 overflow-hidden relative border border-slate-100">
                                       <img 
                                          src={rec.img} 
                                          alt={rec.tag} 
                                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                                          onError={(e) => { 
                                              (e.target as HTMLImageElement).src = `https://placehold.co/600x400/F1F5F9/64748B?text=${rec.tag}`;
                                          }}
                                       />
                                       <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors"></div>
                                    </div>
                                    <div className="mb-3">
                                        <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-purple-100">{rec.tag}</span>
                                    </div>
                                    <h3 className="text-[13px] font-bold text-[#0F172A] leading-snug mb-5 group-hover:text-purple-600 transition-colors h-10 line-clamp-2">{rec.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center">
                                            <Zap size={10} className="text-white" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-[#0F172A] leading-tight">Nexar Advisor</span>
                                            <span className="text-[9px] font-medium text-[#94A3B8] leading-tight">AI Strategy</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Your Assets (Sync with real technical skills) */}
                    <div className="mt-2">
                        <div className="flex justify-between items-center mb-5 px-1">
                            <h2 className="text-[18px] font-bold text-[#0F172A]">Current Skill Assets</h2>
                            <button className="text-[13px] font-bold text-[#0F172A] hover:underline">Manage All</button>
                        </div>
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100/50">
                            <div className="w-full">
                                <div className="grid grid-cols-4 gap-4 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-4 px-2">
                                    <div className="col-span-2 sm:col-span-1">SKILL</div>
                                    <div className="hidden sm:block">CATEGORY</div>
                                    <div className="hidden sm:block">PROFICIENCY</div>
                                    <div className="col-span-2 sm:col-span-1 text-right">ACTION</div>
                                </div>
                                <div className="w-full h-px bg-[#F1F5F9] mb-4" />
                                
                                {profile.technicalSkills?.length > 0 ? (
                                    profile.technicalSkills.slice(0, 3).map((skill, sIdx) => (
                                        <div key={sIdx} className="flex items-center justify-between p-2 hover:bg-[#F8FAFC] rounded-2xl transition-colors cursor-pointer group">
                                            <div className="flex items-center gap-4 w-1/2 sm:w-1/4">
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                                    <Flag size={16} className="text-purple-600" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-bold text-[#0F172A]">{skill.name}</span>
                                                    <span className="text-[11px] font-medium text-[#94A3B8]">Verified Skill</span>
                                                </div>
                                            </div>
                                            <div className="hidden sm:block w-1/4">
                                                <span className="px-2 py-0.5 bg-white text-[#64748B] text-[9px] font-black uppercase tracking-widest rounded-md border border-slate-200">{skill.category}</span>
                                            </div>
                                            <div className="hidden sm:block w-1/4">
                                                <div className="flex items-center gap-1">
                                                    {[1, 2, 3].map(v => (
                                                        <div key={v} className={`h-1 w-4 rounded-full ${v <= (skill.level === 'expert' ? 3 : skill.level === 'advanced' ? 2 : 1) ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>
                                                    ))}
                                                    <span className="text-[10px] font-bold text-[#64748B] ml-2 capitalize">{skill.level}</span>
                                                </div>
                                            </div>
                                            <div className="w-1/2 sm:w-1/4 flex justify-end">
                                                <button className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-[#0F172A] group-hover:bg-white group-hover:shadow-sm transition-all">
                                                    <ArrowUpRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center">
                                        <p className="text-slate-400 text-sm italic">No skills mapped yet. Start analyzing your resume!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* ─── RIGHT SIDEBAR COLUMN ─── */}
                <div className="xl:col-span-4 flex flex-col h-full gap-8">
                    
                    {/* Statistic Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 flex flex-col items-center relative overflow-hidden">
                        <div className="w-full flex justify-between items-center mb-8 relative z-10">
                            <h2 className="text-[16px] font-bold text-[#0F172A]">Statistic</h2>
                            <button className="text-[#94A3B8] hover:text-[#0F172A]"><MoreHorizontal size={20} /></button>
                        </div>
                        
                        <div className="relative w-36 h-36 rounded-full border-[5px] border-[#0F172A] p-1.5 mb-6 z-10 flex items-center justify-center bg-white shadow-xl shadow-slate-100">
                            <img src={profile?.avatarUrl || user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=1e293b&color=fff`} className="w-full h-full rounded-full object-cover border border-slate-100" alt="Profile" />
                            <div className="absolute top-2 -right-4 bg-[#0F172A] text-white text-[11px] font-bold px-2 py-1 rounded-[0.5rem] border-2 border-white shadow-sm">
                                {completeness}%
                            </div>
                        </div>

                        <h3 className="text-[18px] font-bold text-[#0F172A] mb-1.5 z-10">Good Morning {firstName} 🤲</h3>
                        <p className="text-[#94A3B8] text-[12px] font-medium text-center mb-10 z-10">Ready to achieve your career targets!</p>

                        <div className="w-full bg-[#F8FAFC] rounded-3xl p-6 mb-8 relative z-10 border border-slate-100/50">
                            <div className="w-full h-32 flex items-end justify-between gap-3 border-b border-dashed border-slate-200 pb-2 relative px-2">
                                <div className="absolute top-[20%] w-full h-px border-t border-dashed border-slate-200"></div>
                                <div className="absolute top-[60%] w-full h-px border-t border-dashed border-slate-200"></div>
                                
                                <div className="w-full bg-[#0F172A] rounded-t-sm z-10" style={{height: `${completeness * 0.4}%`}}></div>
                                <div className="w-full bg-[#D4D4D8] rounded-t-sm z-10" style={{height: '60%'}}></div>
                                <div className="w-full bg-[#D4D4D8] rounded-t-sm z-10" style={{height: '40%'}}></div>
                                <div className="w-full bg-[#D4D4D8] rounded-t-sm z-10" style={{height: '50%'}}></div>
                                <div className="w-full bg-[#0F172A] rounded-t-sm z-10" style={{height: '90%'}}></div>
                            </div>
                            <div className="flex justify-between mt-3 text-[9px] font-black text-[#94A3B8] uppercase tracking-widest px-2">
                                <span>SKLS</span>
                                <span>EXP</span>
                                <span>SFT</span>
                                <span>PROJ</span>
                                <span>HLTH</span>
                            </div>
                        </div>
                    </div>

                    {/* Target Roles Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 flex flex-col flex-1">
                        <div className="w-full relative z-10 flex-1 flex flex-col pb-2">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-[15px] font-bold text-[#0F172A]">Your Target Roles</h3>
                                <button className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-[#94A3B8] hover:bg-slate-50 transition-colors"><Plus size={14} /></button>
                            </div>
                            
                            <div className="flex flex-col gap-3 mb-auto">
                                {(profile.careerGoals?.targetRoles || [targetRole]).map((role, rIdx) => (
                                    <div key={rIdx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#F8FAFC] transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-full bg-[#F1F5F9] flex items-center justify-center relative border border-slate-200/50 group-hover:bg-white transition-colors">
                                                <Briefcase size={16} className="text-[#0F172A]" />
                                                <div className="absolute -bottom-1 -left-1 w-5 h-5 bg-[#0F172A] rounded-full border-2 border-white text-white flex items-center justify-center text-[9px] font-bold">{rIdx + 1}</div>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-bold text-[#0F172A]">{role}</span>
                                                <span className="text-[11px] font-medium text-[#94A3B8]">Primary Goal</span>
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#E2E8F0] text-[11px] font-bold text-[#0F172A] hover:bg-[#F1F5F9] transition-colors shadow-sm">
                                            <Target size={12} className="text-purple-600" /> Goal
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={() => navigate('/profile')} className="w-full h-[52px] bg-[#0F172A] hover:bg-black text-white rounded-2xl font-bold text-[14px] flex items-center justify-center transition-all mt-8 shadow-lg shadow-slate-200 hover:shadow-xl active:scale-95">
                                See Full Profile
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Dashboard;
