import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft } from 'lucide-react';
import type { JobPost } from '../services/jobPostService';

const JobPostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<JobPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await api.get(`/jobs/${id}`);
        setPost(res.data.data.post as JobPost);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load job post');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  if (isLoading) return <div className="p-8 text-center">Loading job details...</div>;
  if (error) return <div className="p-8 text-center text-rose-500">{error}</div>;
  if (!post) return <div className="p-8 text-center">Job post not found.</div>;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <button
        onClick={() => navigate('/job-postings')}
        className="inline-flex items-center gap-2 text-sm text-slate-600 font-semibold mb-4"
      >
        <ArrowLeft size={14} /> Back to Job Posting Dashboard
      </button>
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">{post.title}</h1>
      <p className="text-sm text-slate-500 mb-4">{post.targetRole} • {post.jobType}</p>
      <div className="grid gap-3 text-sm text-slate-700">
        <p><span className="font-semibold">Location:</span> {post.preferredLocation || 'Any location'}</p>
        <p><span className="font-semibold">Remote:</span> {post.isRemoteOk ? 'Yes' : 'No'}</p>
        <p><span className="font-semibold">Skills:</span> {(post.skills || []).join(', ')}</p>
        <p><span className="font-semibold">Summary:</span> {post.summary}</p>
      </div>
    </div>
  );
};

export default JobPostDetails;
