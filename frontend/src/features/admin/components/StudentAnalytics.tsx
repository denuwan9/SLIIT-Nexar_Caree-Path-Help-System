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
        <div className="space-y-8 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-white/80 uppercase tracking-widest text-xs font-black mb-2">Total Student Profiles</p>
                            <h3 className="text-5xl font-black drop-shadow-md">{students.length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                            <Users size={24} className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-cyan-500/20 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-white/80 uppercase tracking-widest text-xs font-black mb-2">Platform Completeness Status</p>
                            <h3 className="text-5xl font-black drop-shadow-md">
                                {students.length > 0 ? Math.round(students.reduce((acc, s) => acc + (s.profileCompleteness || 0), 0) / students.length) : 0}%
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                            <TrendingUp size={24} className="text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Table Area */}
            <div className="bg-white/50 backdrop-blur-md rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
                    <h3 className="font-black text-slate-800 text-lg">Student Directory</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, major, or university..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-[300px] transition-shadow shadow-sm bg-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-500">
                        <thead className="bg-slate-50/80 backdrop-blur-sm text-xs uppercase text-slate-700 font-bold tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Major</th>
                                <th className="px-6 py-4">GPA</th>
                                <th className="px-6 py-4">Completeness</th>
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
                                <tr key={student._id} className="border-t border-slate-100 hover:bg-white transition-colors cursor-default">
                                    <td className="px-6 py-5">
                                        <div className="font-bold text-slate-800 text-base">{student.firstName} {student.lastName}</div>
                                    <div className="text-[10px] text-slate-400">{student.university || 'No University'}</div>
                                </td>
                                <td className="px-4 py-4 text-slate-600 font-medium">
                                    {student.major || 'Undeclared'}
                                </td>
                                <td className="px-4 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 font-bold text-slate-700">
                                        <GraduationCap size={14} className="text-slate-400" />
                                        {student.gpa ? student.gpa.toFixed(2) : 'N/A'}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div 
                                                className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full" 
                                                style={{ width: `${student.profileCompleteness || 0}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-black text-slate-700 w-10 text-right">{student.profileCompleteness || 0}%</span>
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
                                    <td colSpan={4} className="text-center py-10 bg-white border border-slate-100">
                                        <p className="text-slate-500 font-medium">No students found matching "{searchQuery}"</p>
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
