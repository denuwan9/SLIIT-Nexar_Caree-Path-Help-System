import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, UserCheck, Calendar, Percent } from 'lucide-react';
import { useAuth } from '../components/auth/AuthProvider';
import { fetchMyJobPosts } from '../services/jobPostService';
import type { JobPost } from '../services/jobPostService';

const JobPostingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.firstName || 'User';

  const [posts, setPosts] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const fetched = await fetchMyJobPosts();
        setPosts(fetched);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load job posts');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const totalApplications = useMemo(() => {
    return posts.reduce((total, post) => total + ((post as any).applications || 0), 0);
  }, [posts]);

  const totalVisitors = useMemo(() => {
    return posts.reduce((total, post) => total + (post.viewCount || 0), 0);
  }, [posts]);

  const engagementRate = posts.length > 0 ? Math.min(100, Math.round((totalApplications / Math.max(1, totalVisitors)) * 100)) : 0;

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">Job Posting Dashboard</h1>
          <p className="text-sm text-[#64748B] mt-1">Welcome back, {firstName}. Manage your postings and track applications.</p>
        </div>
        <button
          onClick={() => navigate('/job-postings/new')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold shadow-lg hover:opacity-95 transition-opacity"
        >
          <Plus size={16} /> Create Job Post
        </button>
      </div>

      {isLoading ? (
        <div className="w-full p-8 bg-white border border-slate-100 rounded-3xl text-center text-slate-500">Loading job posts...</div>
      ) : error ? (
        <div className="w-full p-8 bg-white border border-rose-100 rounded-3xl text-center text-rose-600">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Posts</span>
                <Briefcase size={18} className="text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-[#0F172A]">{posts.length}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Applications</span>
                <UserCheck size={18} className="text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-[#0F172A]">{totalApplications}</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Profile Sync</span>
                <Calendar size={18} className="text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-[#0F172A]">Enabled</p>
              <p className="text-xs text-[#64748B] mt-1">Education, skills, experience sync</p>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Engagement</span>
                <Percent size={18} className="text-slate-400" />
              </div>
              <p className="text-3xl font-bold text-[#0F172A]">{engagementRate}%</p>
              <p className="text-xs text-[#64748B] mt-1">Profile and post visibility metrics</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#0F172A]">Active Job Listings</h2>
              <span className="text-xs text-slate-500 font-semibold">{posts.length} postings</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {posts.length === 0 ? (
                <div className="col-span-full p-6 text-center text-slate-500">No job posts yet. Create your first posting to get started.</div>
              ) : posts.map((post) => (
                <div key={post._id} className="border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-[#0F172A]">{post.title}</h3>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{post.jobType}</span>
                  </div>
                  <p className="text-sm text-[#64748B]">{post.preferredLocation || 'Any location'} • {post.isRemoteOk ? 'Remote okay' : 'Onsite only'}</p>
                  <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
                    <span>{new Date(post.createdAt || '').toLocaleDateString()}</span>
                    <span>{(post.viewCount || 0)} views</span>
                  </div>

                  <div className="mt-4 flex gap-2 items-center">
                    <span className="px-2 py-1 text-[11px] rounded-full bg-emerald-50 text-emerald-600 font-semibold">{(post as any).applications || 0} applications</span>
                    <button
                      onClick={() => navigate(`/job-postings/${post._id}`)}
                      className="rounded-full px-3 py-1.5 text-xs bg-purple-600 text-white hover:bg-purple-700 transition-all"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-sm text-slate-500 leading-relaxed">
            <p className="font-semibold text-slate-600">Tips:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Keep posting requirements concise and role-specific to attract high-quality candidates.</li>
              <li>Use the auto-population sync to reduce redundant data entry from your profile.</li>
              <li>Monitor the engagement percentages to optimize job visibility and scope.</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default JobPostingDashboard;
