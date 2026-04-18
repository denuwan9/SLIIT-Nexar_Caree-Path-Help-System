import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Briefcase, UserCheck, Calendar, Percent, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../components/auth/AuthProvider';
import { fetchMyJobPosts, deleteJobPost } from '../services/jobPostService';
import { fetchApplicationsForJobPost, updateApplicationStatus, type Application } from '../services/applicationService';
import type { JobPost } from '../services/jobPostService';

const JobPostingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.firstName || 'User';

  const [posts, setPosts] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applications, setApplications] = useState<Record<string, Application[]>>({});
  const [selectedPost, setSelectedPost] = useState<JobPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeletePost = async (postId: string) => {
    const confirmed = window.confirm('Delete this job post? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteJobPost(postId);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      setApplications((prev) => {
        const next = { ...prev };
        delete next[postId];
        return next;
      });
      if (selectedPost?._id === postId) {
        setSelectedPost(null);
        setIsModalOpen(false);
      }
      toast.success('Job post deleted successfully.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete job post.');
    }
  };

  const handleAcceptApplication = async (appId: string, postId: string) => {
    try {
      await updateApplicationStatus(appId, 'accepted');
      toast.success('Application accepted!');
      setApplications(prev => ({
        ...prev,
        [postId]: prev[postId].map(app => 
          app._id === appId ? { ...app, status: 'accepted' as const } : app
        )
      }));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to accept application.');
    }
  };

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

  useEffect(() => {
    if (posts.length > 0) {
      const loadApplications = async () => {
        const results = await Promise.all(posts.map(async (post) => {
          try {
            const apps = await fetchApplicationsForJobPost(post._id);
            return [post._id, apps] as const;
          } catch (err) {
            console.error('Failed to load applications for post', post._id, err);
            return [post._id, []] as const;
          }
        }));

        setApplications(Object.fromEntries(results));
      };

      loadApplications();
    }
  }, [posts]);

  const totalApplications = useMemo(() => {
    return Object.values(applications).reduce((total, apps) => total + apps.length, 0);
  }, [applications]);

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
              ) : posts.map((post) => {
                const postApplications = applications[post._id] || [];
                return (
                  <div
                    key={post._id}
                    onClick={() => navigate(`/job-postings/${post._id}/edit`)}
                    className="border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-bold text-[#0F172A]">{post.title}</h3>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{post.jobType}</span>
                    </div>
                    <p className="text-sm text-[#64748B]">{post.preferredLocation || 'Any location'} • {post.isRemoteOk ? 'Remote okay' : 'Onsite only'}</p>
                    <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
                      <span>{new Date(post.createdAt || '').toLocaleDateString()}</span>
                      <span>{(post.viewCount || 0)} views</span>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between gap-3 text-[13px] text-slate-600">
                        <span className="font-medium">Applications received</span>
                        <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">{postApplications.length}</span>
                      </div>

                      {postApplications.length > 0 ? (
                        <div className="space-y-1 text-sm text-slate-500">
                          {postApplications.slice(0, 2).map((app) => (
                            <div key={app._id} className="flex items-center justify-between gap-2">
                              <span className="truncate">{app.applicant.name}</span>
                              <span className="text-[11px] uppercase tracking-wider text-slate-400">{app.status}</span>
                            </div>
                          ))}
                          {postApplications.length > 2 && (
                            <p className="text-xs text-slate-400">+{postApplications.length - 2} more application{postApplications.length - 2 > 1 ? 's' : ''}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400">No applications yet. Click to edit or view details.</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPost(post);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                        >
                          View applicants
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePost(post._id);
                          }}
                          className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 size={14} className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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

      {/* Applicants Modal */}
      {isModalOpen && selectedPost && (
        <div
          onClick={() => setIsModalOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ paddingLeft: '280px', paddingRight: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ transform: 'scale(1)', opacity: 1, transition: 'all 0.3s ease-out', paddingRight: '12px' }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-[#0F172A]">Applicants for "{selectedPost.title}"</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {applications[selectedPost._id]?.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No applications yet.</p>
                ) : (
                  applications[selectedPost._id]?.map((app) => (
                    <div key={app._id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-[#0F172A]">{app.applicant.name}</h3>
                          <p className="text-sm text-[#64748B]">{app.applicant.email}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          app.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          app.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-sm text-[#64748B] mb-2">
                        Applied on {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                      {app.coverLetter && (
                        <div>
                          <h4 className="font-medium text-[#0F172A] text-sm">Application Details</h4>
                          <p className="text-sm text-[#64748B]">{app.coverLetter}</p>
                        </div>
                      )}
                      {app.status !== 'accepted' && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleAcceptApplication(app._id, selectedPost._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
                          >
                            Accept
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPostingDashboard;
