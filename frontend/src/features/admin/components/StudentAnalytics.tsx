import React, { useEffect, useState } from 'react';
import adminService from '../adminService';
import type { StudentAnalyticsDTO } from '../adminService';
import { Loader2, GraduationCap, TrendingUp, Users, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const StudentAnalytics: React.FC = () => {
    const [students, setStudents] = useState<StudentAnalyticsDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await adminService.getAllStudents();
                setStudents(data);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to fetch student analytics');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    if (loading) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-cyan-600" size={32} /></div>;
    }

    return (
        <div className="space-y-10 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Tactical Intelligence Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="relative overflow-hidden group rounded-[3rem] p-10 bg-slate-900 shadow-2xl shadow-indigo-500/10 border border-white/5 transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 opacity-80">Registry Population</p>
                            <div className="space-y-1">
                                <h3 className="text-6xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform origin-left duration-500">{students.length}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Individual Profiles</p>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                            <Users size={28} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden group rounded-[3rem] p-10 bg-slate-900 shadow-2xl shadow-cyan-500/10 border border-white/5 transition-all duration-700 hover:-translate-y-2">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] -mr-20 -mb-20 group-hover:scale-150 transition-transform duration-1000" />
                    
                    <div className="relative z-10 flex justify-between items-start">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 opacity-80">Platform Proficiency</p>
                            <div className="space-y-1">
                                <h3 className="text-6xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform origin-left duration-500">
                                    {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.profileCompleteness || 0), 0) / students.length) : 0}%
                                </h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Aggregate Completeness Meta</p>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-[2rem] bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-inner group-hover:-rotate-12 transition-transform duration-500">
                            <TrendingUp size={28} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Dossier Search & List */}
            <div className="space-y-8">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Student Directory</h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Academic Metadata Index</p>
                    </div>
                    
                    <div className="relative group/search w-full xl:w-[400px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/search:text-cyan-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, major, or institution..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-cyan-100/50 focus:border-cyan-400 outline-none transition-all placeholder:text-slate-300 shadow-inner"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto pb-4 custom-scrollbar">
                    <table className="w-full text-left text-sm border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 whitespace-nowrap">
                                <th className="px-10 py-2">Student Identity</th>
                                <th className="px-8 py-2">Strategic Major</th>
                                <th className="px-8 py-2 text-center">Performance GPA</th>
                                <th className="px-10 py-2">Operational Readiness</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students
                                .filter(student => {
                                    const query = searchQuery.toLowerCase();
                                    return (
                                        student.firstName.toLowerCase().includes(query) ||
                                        student.lastName.toLowerCase().includes(query) ||
                                        (student.major || '').toLowerCase().includes(query) ||
                                        (student.university || '').toLowerCase().includes(query)
                                    );
                                })
                                .map((student) => (
                                    <tr key={student._id} className="group/row transition-all duration-500">
                                        <td className="bg-white px-10 py-6 rounded-l-[2rem] border-y border-l border-slate-100 group-hover/row:border-cyan-200 group-hover/row:bg-cyan-50/20 shadow-sm transition-all">
                                            <div>
                                                <div className="font-black text-slate-900 text-base tracking-tight">{student.firstName} {student.lastName}</div>
                                                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{student.university || 'Unverified Institution'}</div>
                                            </div>
                                        </td>
                                        <td className="bg-white px-8 py-6 border-y border-slate-100 group-hover/row:border-cyan-200 group-hover/row:bg-cyan-50/20 transition-all font-bold text-slate-500">
                                            {student.major || 'Decentralized Study'}
                                        </td>
                                        <td className="bg-white px-8 py-6 border-y border-slate-100 group-hover/row:border-cyan-200 group-hover/row:bg-cyan-50/20 transition-all text-center">
                                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 font-extrabold text-slate-800 text-xs shadow-sm group-hover/row:bg-white transition-all">
                                                <GraduationCap size={16} className="text-cyan-500" />
                                                {student.gpa ? student.gpa.toFixed(2) : '0.00'}
                                            </span>
                                        </td>
                                        <td className="bg-white px-10 py-6 rounded-r-[2rem] border-y border-r border-slate-100 group-hover/row:border-cyan-200 group-hover/row:bg-cyan-50/20 transition-all shadow-sm">
                                            <div className="flex items-center gap-5">
                                                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner p-0.5">
                                                    <div 
                                                        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 h-full rounded-full transition-all duration-1000 ease-out shadow-lg shadow-indigo-500/40" 
                                                        style={{ width: `${student.profileCompleteness || 0}%` }}
                                                    />
                                                </div>
                                                <div className="flex flex-col items-end min-w-[3rem]">
                                                    <span className="text-xs font-black text-slate-900 tracking-tighter">{student.profileCompleteness || 0}%</span>
                                                    <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Sync</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            {students.filter(s => 
                                s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                s.lastName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                (s.major || '').toLowerCase().includes(searchQuery.toLowerCase())
                            ).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                        <div className="inline-flex flex-col items-center gap-4 p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-xl">
                                            <p className="text-lg font-black text-slate-800 tracking-tight">No Matches Found</p>
                                            <button 
                                                onClick={() => setSearchQuery('')}
                                                className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500 hover:text-cyan-600 transition-colors"
                                            >
                                                Clear Search Registry
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
