import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import JobPostingService from '../services/jobPostingService';
import type { JobPost } from '../types/jobPosting';

const AdminApplicationsPage: React.FC = () => {
  const navigate = useNavigate();
  const posts: JobPost[] = JobPostingService.getAll();

  const postsWithApplications = useMemo(
    () => posts.filter(post => post.applications > 0),
    [posts]
  );

  const totalApplications = useMemo(
    () => postsWithApplications.reduce((sum, post) => sum + post.applications, 0),
    [postsWithApplications]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-screen-xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">Applied Posts</h1>
            <p className="text-slate-500 text-sm mt-1">
              View all job posts that have received applications.
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-300 transition"
          >
            Back
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-slate-600">
            Total applied posts: <strong>{postsWithApplications.length}</strong>
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Total applications: <strong>{totalApplications}</strong>
          </p>
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-black mb-4">Posts With Applications</h2>

          {postsWithApplications.length === 0 ? (
            <div className="text-slate-500 text-sm py-8 text-center">
              No applications found.
            </div>
          ) : (
            <div className="space-y-4">
              {postsWithApplications.map(post => (
                <article
                  key={post.id}
                  className="border border-slate-100 rounded-xl p-4 hover:border-slate-300 transition"
                >
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-black">{post.title}</h3>
                      <p className="text-xs text-slate-400 font-black uppercase tracking-wide">
                        {post.careerField} • {post.location || 'Remote/NA'}
                      </p>
                      <p className="text-sm text-slate-600 mt-2">{post.summary}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        By: {post.authorName} ({post.authorEmail})
                      </p>
                    </div>

                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-black tracking-widest uppercase">
                      {post.applications} applications
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => navigate(`/job-posting/public/${post.id}`)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-black hover:bg-slate-200 transition"
                    >
                      View Post
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminApplicationsPage;