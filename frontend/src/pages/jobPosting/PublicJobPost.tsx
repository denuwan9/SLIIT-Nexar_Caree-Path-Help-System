import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, ArrowLeft } from 'lucide-react';
import JobPostingService from '../../services/jobPostingService';
import type { JobPost } from '../../types/jobPosting';

export const PublicJobPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<JobPost | null>(null);

  useEffect(() => {
    if (!id) return;
    const all = JobPostingService.getAll();
    const found = all.find(item => item.id === id) ?? null;
    setPost(found);
  }, [id]);

  const applyNow = () => {
    if (!post) return;
    const updated: JobPost = { ...post, applications: post.applications + 1 };
    JobPostingService.update(updated);
    setPost(updated);
    alert('Application tracked. Thank you!');
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white border border-slate-200 rounded-xl shadow-sm">
          <h2 className="text-xl font-black">Job post not found</h2>
          <p className="text-slate-500 mt-2">This sharing link may be invalid or deleted.</p>
          <button onClick={() => navigate('/job-posting')} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Back to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-slate-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
        <button onClick={() => navigate('/job-posting')} className="inline-flex items-center gap-2 text-indigo-600 font-black mb-4">
          <ArrowLeft size={18} /> Back to Manager
        </button>

        <div className="border-b border-slate-200 pb-4 mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black">{post.title}</h1>
            <p className="text-sm text-slate-500">{post.careerField} • {post.location || 'Remote'}</p>
          </div>
          <div className="text-right text-slate-400 text-xs">
            <p>{new Date(post.createdAt).toLocaleDateString()}</p>
            <p className="mt-1">Views: {post.views} • Applications: {post.applications}</p>
          </div>
        </div>

        <p className="text-slate-700 mb-4">{post.summary}</p>
        <p className="text-slate-600 whitespace-pre-wrap mb-4">{post.description || 'No extended description provided.'}</p>

        <div className="grid grid-cols-2 gap-3 text-sm text-slate-700 mb-4">
          <div>
            <p className="font-black uppercase text-xs text-slate-400">Employment</p>
            <p className="mt-1">{post.employmentType ?? 'unspecified'}</p>
          </div>
          <div>
            <p className="font-black uppercase text-xs text-slate-400">Status</p>
            <p className="mt-1 capitalize">{post.status}</p>
          </div>
          <div>
            <p className="font-black uppercase text-xs text-slate-400">Visibility</p>
            <p className="mt-1 capitalize">{post.visibility}</p>
          </div>
          <div>
            <p className="font-black uppercase text-xs text-slate-400">Contact</p>
            <a href={post.socialLinks || '#'} className="mt-1 text-cyan-600 underline" target="_blank" rel="noreferrer">{post.socialLinks || 'Not provided'}</a>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {post.skills.map(skill => <span key={skill} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">{skill}</span>)}
          {post.languages.map(lang => <span key={lang} className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold">{lang}</span>)}
        </div>

        <button onClick={applyNow} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg font-black uppercase hover:bg-emerald-600 transition">
          <Eye size={16} /> Apply to this Post
        </button>
      </div>
    </div>
  );
};

export default PublicJobPost;
