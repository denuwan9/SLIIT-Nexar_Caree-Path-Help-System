import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, Share2 } from 'lucide-react';
import JobPostingService from '../services/jobPostingService';
import type { JobPost, Visibility, PostingStatus } from '../types/jobPosting';

const availableCareerFields = [
  'Software Engineering',
  'Data Science',
  'Product Management',
  'UX/UI Design',
  'Digital Marketing',
  'Finance',
  'HR & Talent',
  'Operations',
  'Research',
  'Other',
];

const defaultFilters = {
  query: '',
  careerField: 'All',
  visibility: 'All',
  status: 'All',
};

export const AdminJobPosts: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<JobPost[]>(() => JobPostingService.getAll());
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    JobPostingService.saveAll(posts);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return posts.filter(post => {
      const matchedText = [
        post.title,
        post.careerField,
        post.summary,
        post.description,
        post.skills.join(' '),
      ].some(value => value.toLowerCase().includes(q));

      const matchField = filters.careerField === 'All' || post.careerField === filters.careerField;
      const matchVisibility =
        filters.visibility === 'All' || post.visibility === (filters.visibility.toLowerCase() as Visibility);
      const matchStatus =
        filters.status === 'All' || post.status === (filters.status.toLowerCase() as PostingStatus);

      return matchedText && matchField && matchVisibility && matchStatus;
    });
  }, [posts, filters]);

  const viewPublic = (post: JobPost) => {
    setPosts(current =>
      current.map(item => (item.id === post.id ? { ...item, views: item.views + 1 } : item)),
    );
    navigate(`/job-posting/public/${post.id}`);
  };

  const sharePost = (post: JobPost) => {
    const url = `${window.location.origin}/job-posting/public/${post.id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success('Shareable link copied to clipboard'))
      .catch(() => toast.error('Cannot copy shareable link.'));
  };

  const stats = useMemo(
    () => ({
      total: posts.length,
      active: posts.filter(p => p.status === 'active').length,
      public: posts.filter(p => p.visibility === 'public').length,
      totalApplications: posts.reduce((acc, cur) => acc + cur.applications, 0),
    }),
    [posts],
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-screen-xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">Student&apos;s Job Posts</h1>
            <p className="text-slate-500 text-sm mt-1">Monitor and manage job posts created by students.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Filters</h3>

              <input
                value={filters.query}
                onChange={e => setFilters(prev => ({ ...prev, query: e.target.value }))}
                placeholder="Search posts..."
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              />

              <select
                value={filters.careerField}
                onChange={e => setFilters(prev => ({ ...prev, careerField: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              >
                <option value="All">All fields</option>
                {availableCareerFields.map(field => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>

              <select
                value={filters.visibility}
                onChange={e => setFilters(prev => ({ ...prev, visibility: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
              >
                <option value="All">All visibility</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>

              <select
                value={filters.status}
                onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="All">All status</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Quick Stats</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>Total posts: <strong>{stats.total}</strong></li>
                <li>Active: <strong>{stats.active}</strong></li>
                <li>Public: <strong>{stats.public}</strong></li>
                <li>
                  <button
                    onClick={() => navigate('/admin/applications')}
                    className="text-left hover:text-purple-600 hover:underline transition"
                  >
                    Applications: <strong>{stats.totalApplications}</strong>
                  </button>
                </li>
              </ul>
            </div>
          </aside>
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black">Job Posts ({filteredPosts.length})</h2>
            <p className="text-xs text-slate-500">Admin view: monitor student-created posts</p>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-slate-500 text-sm py-8 text-center">No posts match current filters.</div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <article key={post.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-300 transition">
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
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full uppercase font-black tracking-widest">
                      {post.visibility}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    {post.skills.slice(0, 5).map(skill => (
                      <span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">
                        {skill}
                      </span>
                    ))}
                    {post.languages.map(lang => (
                      <span key={lang} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                        {lang}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap justify-between items-center gap-2 text-xs text-slate-500">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>{post.applications} applications</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => viewPublic(post)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-black"
                    >
                      <Eye size={14} /> View Public
                    </button>
                    <button
                      onClick={() => sharePost(post)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-lg text-xs font-black"
                    >
                      <Share2 size={14} /> Copy Share Link
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

export default AdminJobPosts;