import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminService from '../features/admin/adminService';
import type { StudentAnalyticsDTO } from '../features/admin/adminService';
import { Loader2, Search, MapPin, GraduationCap, ChevronRight, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 9;

const AdminCareerProfiles: React.FC = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<StudentAnalyticsDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                // Reusing getAllStudents as it has the high-level details we need for the cards
                const data = await adminService.getAllStudents();
                setStudents(data);
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Failed to fetch student profiles');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const filteredStudents = students.filter(student => {
        const query = searchQuery.toLowerCase();
        return (
            student.firstName.toLowerCase().includes(query) ||
            student.lastName.toLowerCase().includes(query) ||
            (student.major || '').toLowerCase().includes(query) ||
            (student.university || '').toLowerCase().includes(query)
        );
    });

    const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
    const paginatedStudents = filteredStudents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-indigo-600" size={40} /></div>;
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto relative min-h-[calc(100vh-80px)]">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 uppercase tracking-tighter mb-2 drop-shadow-sm flex items-center gap-4">
                        <Briefcase size={40} className="text-indigo-600" />
                        Career Profiles
                    </h1>
                    <p className="text-slate-500 font-medium tracking-wide">Student Directory & Portfolio Preview</p>
                </div>
                
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search profiles by name or major..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1); // Reset to page 1 on search
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl shadow-slate-200/40 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Grid Area */}
            {filteredStudents.length === 0 ? (
                <div className="text-center py-20 bg-white/40 backdrop-blur-md border border-white/50 rounded-[2rem] shadow-sm">
                    <p className="text-slate-500 font-medium text-lg">No students found matching your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 mb-10">
                    {paginatedStudents.map(student => (
                        <div 
                            key={student._id}
                            onClick={() => navigate(`/admin/profiles/${student._id}`)}
                            className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-500/30">
                                    {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <div className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    View Profile <ChevronRight size={14} />
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                                {student.firstName} {student.lastName}
                            </h3>
                            <p className="text-sm font-bold text-slate-400 mb-4 line-clamp-1">
                                {student.major || 'Undeclared Major'}
                            </p>

                            <div className="space-y-3 mt-auto">
                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                    <MapPin size={16} className="text-slate-400" />
                                    <span className="line-clamp-1">{student.university || 'No University Linked'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                    <GraduationCap size={16} className="text-slate-400" />
                                    <span>GPA: {student.gpa ? student.gpa.toFixed(2) : 'N/A'}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100/50 flex justify-between items-center">
                                <span className="text-xs uppercase tracking-widest font-black text-slate-400">Completeness</span>
                                <div className="flex items-center gap-3 w-1/2">
                                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                                        <div 
                                            className="bg-gradient-to-r from-purple-500 to-cyan-500 h-1.5 rounded-full" 
                                            style={{ width: `${student.profileCompleteness || 0}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-black text-slate-700">{student.profileCompleteness || 0}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="relative z-10 flex justify-center gap-2 pb-10">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl font-black text-sm transition-all duration-300 ${
                                currentPage === page 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                                : 'bg-white text-slate-500 hover:bg-slate-50 shadow-sm border border-slate-200'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminCareerProfiles;
