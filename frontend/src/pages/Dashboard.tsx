import React from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import { BookOpen, Calendar, Briefcase, TrendingUp } from 'lucide-react';

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
    <div className="card flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h2 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name.split(' ')[0]}!</h2>
                <p className="text-slate-500 mt-1">Here is what's happening with your career simulator today.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<BookOpen className="text-blue-600" />}
                    label="Study Progress"
                    value="68%"
                    color="bg-blue-50"
                />
                <StatCard
                    icon={<Calendar className="text-purple-600" />}
                    label="Next Interview"
                    value="Tomorrow"
                    color="bg-purple-50"
                />
                <StatCard
                    icon={<Briefcase className="text-emerald-600" />}
                    label="Active Job Posts"
                    value="3"
                    color="bg-emerald-50"
                />
                <StatCard
                    icon={<TrendingUp className="text-orange-600" />}
                    label="Profile Score"
                    value="82"
                    color="bg-orange-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card">
                    <h4 className="text-lg font-bold mb-4">Recent Study Plan</h4>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <span className="font-medium text-slate-700">OOP Revision - Chapter {i}</span>
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded text-uppercase">Day {i}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card">
                    <h4 className="text-lg font-bold mb-4">Upcoming Interviews</h4>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Calendar className="text-slate-200 mb-2" size={48} />
                        <p className="text-slate-500">No interviews scheduled for today.</p>
                        <button className="btn-primary mt-4">Schedule Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
