import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchJobPostById, updateJobPost } from '../services/jobPostService';
import profileService from '../services/profileService';
import { ArrowLeft, ClipboardCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const targetRolesList = [
  'Frontend Engineer',
  'Backend Engineer',
  'Full Stack Engineer',
  'Software Engineer',
  'Mobile App Developer',
  'Game Developer',
  'AI/ML Engineer',
  'Data Scientist',
  'Data Analyst',
  'DevOps Engineer',
  'Cloud Engineer',
  'Cybersecurity Analyst',
  'QA Engineer',
  'UX Designer',
  'UI Designer',
  'Product Manager',
  'Project Manager',
  'Business Analyst',
  'Marketing Manager',
  'Sales Manager',
  'HR Manager',
  'Finance Manager',
  'Operations Manager',
  'Consultant',
  'Graphic Designer',
  'Content Creator',
  'Technical Writer',
  'System Administrator',
  'Network Engineer',
  'Database Administrator',
  'IT Support Specialist',
  'Teacher',
  'Professor',
  'Trainer'
];

const EditJobPost: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredRoles, setFilteredRoles] = useState(targetRolesList);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [data, setData] = useState({
    title: '',
    summary: '',
    targetRole: '',
    jobType: 'full-time',
    skills: '',
    preferredLocation: '',
    isRemoteOk: false,
    salaryMin: '',
    salaryMax: '',
  });

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const post = await fetchJobPostById(id);
        setData({
          title: post.title || '',
          summary: post.summary || '',
          targetRole: post.targetRole || '',
          jobType: post.jobType || 'full-time',
          skills: (post.skills || []).join(', '),
          preferredLocation: post.preferredLocation || '',
          isRemoteOk: post.isRemoteOk || false,
          salaryMin: post.salaryExpectation?.min?.toString() || '',
          salaryMax: post.salaryExpectation?.max?.toString() || '',
        });
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load job post.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < filteredRoles.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filteredRoles.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredRoles.length) {
          onChange('targetRole', filteredRoles[highlightedIndex]);
          setIsDropdownOpen(false);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const onChange = (key: keyof typeof data, value: string | boolean) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleAutoPopulate = async () => {
    try {
      const profile = await profileService.getMe();
      const stRoles = profile.careerGoals?.targetRoles || [];
      const techSkills = profile.technicalSkills?.map((skill) => skill.name) || [];
      const expSkills = profile.experience?.flatMap((exp) => exp.skills || []) || [];
      const cleanSkills = Array.from(new Set([...techSkills, ...expSkills])).join(', ');
      const location = profile.location?.city
        ? profile.location.country
          ? `${profile.location.city}, ${profile.location.country}`
          : profile.location.city
        : '';

      const summaryParts: string[] = [];
      if (profile.bio) summaryParts.push(profile.bio.trim());
      if (profile.major) summaryParts.push(`Supervised from ${profile.major} at ${profile.university || 'your university'}`);
      if (profile.experience?.length) {
        const firstExp = profile.experience[0];
        summaryParts.push(`Experience as ${firstExp.title} at ${firstExp.company}`);
      }

      setData((prev) => ({
        ...prev,
        targetRole: prev.targetRole || stRoles[0] || prev.targetRole,
        skills: prev.skills || cleanSkills || prev.skills,
        preferredLocation: prev.preferredLocation || location || prev.preferredLocation,
        summary: prev.summary || summaryParts.join(' | '),
      }));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load profile for auto-populate.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await updateJobPost(id, {
        title: data.title,
        summary: data.summary,
        targetRole: data.targetRole,
        jobType: data.jobType as any,
        skills: data.skills.split(',').map((s) => s.trim()).filter(Boolean),
        preferredLocation: data.preferredLocation,
        isRemoteOk: data.isRemoteOk,
        salaryExpectation: {
          min: Number(data.salaryMin) || undefined,
          max: Number(data.salaryMax) || undefined,
          currency: 'LKR',
        },
      });
      toast.success('Job post updated successfully.');
      navigate('/job-postings');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to update job post.');
      toast.error(err?.response?.data?.message || 'Unable to update job post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading job post...</div>;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
      <button
        onClick={() => navigate('/job-postings')}
        className="inline-flex items-center gap-2 text-sm text-slate-600 font-semibold mb-4"
      >
        <ArrowLeft size={14} /> Back to Job Posting Dashboard
      </button>

      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Edit Job Post</h1>
      <p className="text-sm text-slate-500 mb-6">Update the details for your existing listing.</p>

      <div className="flex items-center justify-end gap-3 mb-4">
        <button
          onClick={handleAutoPopulate}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-white font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition"
        >
          Auto-Fill
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            required
            type="text"
            placeholder="Job title"
            value={data.title}
            onChange={(e) => onChange('title', e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <div className="relative">
            <input
              required
              type="text"
              placeholder="Target role (e.g. Frontend Engineer)"
              value={data.targetRole}
              onChange={(e) => {
                onChange('targetRole', e.target.value);
                setFilteredRoles(targetRolesList.filter((role) =>
                  role.toLowerCase().includes(e.target.value.toLowerCase())
                ));
                setHighlightedIndex(-1);
              }}
              onFocus={() => {
                setIsDropdownOpen(true);
                setHighlightedIndex(-1);
              }}
              onBlur={() => setTimeout(() => {
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
              }, 200)}
              onKeyDown={handleKeyDown}
              className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            {isDropdownOpen && filteredRoles.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto mt-1">
                {filteredRoles.map((role, index) => (
                  <li
                    key={role}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChange('targetRole', role);
                      setIsDropdownOpen(false);
                      setHighlightedIndex(-1);
                    }}
                    className={`p-2 cursor-pointer text-sm ${index === highlightedIndex ? 'bg-purple-100 text-purple-900' : 'hover:bg-slate-100'}`}
                  >
                    {role}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <textarea
          required
          rows={5}
          placeholder="Professional summary, requirements and responsibilities"
          value={data.summary}
          onChange={(e) => onChange('summary', e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={data.jobType}
            onChange={(e) => onChange('jobType', e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="full-time">Full-Time</option>
            <option value="part-time">Part-Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="freelance">Freelance</option>
          </select>
          <input
            type="text"
            placeholder="Skills (comma-separated)"
            value={data.skills}
            onChange={(e) => onChange('skills', e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Preferred Location"
            value={data.preferredLocation}
            onChange={(e) => onChange('preferredLocation', e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <div className="flex items-center gap-3">
            <input
              id="remote-ok"
              type="checkbox"
              checked={data.isRemoteOk}
              onChange={(e) => onChange('isRemoteOk', e.target.checked)}
              className="rounded border-slate-300 text-purple-600"
            />
            <label htmlFor="remote-ok" className="text-sm text-slate-600">Remote friendly</label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Min salary"
            value={data.salaryMin}
            onChange={(e) => onChange('salaryMin', e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          <input
            type="number"
            placeholder="Max salary"
            value={data.salaryMax}
            onChange={(e) => onChange('salaryMax', e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        {error && <p className="text-sm text-rose-500">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-all disabled:opacity-60"
        >
          <ClipboardCheck size={16} />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditJobPost;
