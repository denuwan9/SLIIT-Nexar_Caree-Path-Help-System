import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Edit3, Trash2, Share2, Eye, PlusCircle } from 'lucide-react';
import ProfileService from '../../services/profileService';
import JobPostingService from '../../services/jobPostingService';
import type { StudentProfile } from '../../types/profile';
import type { JobPost, Visibility } from '../../types/jobPosting';

const defaultJobTemplate: Omit<JobPost, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'applications'> = {
  authorId: '',
  authorName: '',
  authorEmail: '',
  title: '',
  careerField: '',
  location: '',
  employmentType: 'full-time',
  summary: '',
  description: '',
  skills: [],
  languages: [],
  socialLinks: '',
  visibility: 'public',
  status: 'active',
};

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

const availableEmployments = ['full-time', 'part-time', 'internship', 'contract', 'freelance'];

function safeName(profile: StudentProfile | null | undefined) {
  if (!profile) return '';
  return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.fullName || 'Unknown User';
}

function toSlug(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function removeDigits(value: string): string {
  return value.replace(/\d/g, '');
}

export const JobPostingDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [posts, setPosts] = useState<JobPost[]>(() => JobPostingService.getAll());
  const [isEditing, setIsEditing] = useState(false);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<JobPost, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'applications'>>({
    ...defaultJobTemplate,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const me = await ProfileService.getMe();
        setProfile(me);
      } catch (error) {
        console.error('Failed to load profile for JobPostingDashboard', error);
        toast.error('Unable to load profile for auto-filling.');
      } finally {
        setIsLoadingProfile(false);
      }
    };
    void fetchProfile();
  }, []);

  useEffect(() => {
    JobPostingService.saveAll(posts);
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts;
  }, [posts]);

  const autoPopulate = () => {
    if (!profile) {
      toast('Profile not ready yet.');
      return;
    }
    const fromProfile = {
      authorId: profile._id,
      authorName: safeName(profile),
      authorEmail: (profile.user && typeof profile.user !== 'string' ? profile.user.email : '') || '',
      careerField: profile.careerGoals?.targetRoles?.[0] || profile.major || '',
      summary: profile.careerGoals?.careerObjective || profile.headline || profile.bio || '',
      description: profile.bio || '',
      skills: profile.technicalSkills?.map(s => s.name).filter(Boolean) ?? [],
      languages: ['English'],
      socialLinks:
        profile.socialLinks?.linkedin || profile.socialLinks?.github || profile.socialLinks?.portfolio || '',
    };

    setFormData(prev => ({
      ...prev,
      ...fromProfile,
      location: profile.location?.city ? `${profile.location?.city}, ${profile.location?.country ?? ''}`.trim() : prev.location,
    }));
    toast.success('Auto-populated from profile successfully.');
  };

  const clearForm = () => {
    setFormData({ ...defaultJobTemplate, authorId: profile?._id ?? '', authorName: safeName(profile), authorEmail: (profile?.user && typeof profile.user !== 'string' ? profile.user.email : '') || '' });
    setActivePostId(null);
    setIsEditing(false);
  };

  const addOrUpdatePost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.careerField.trim() || !formData.summary.trim()) {
      toast.error('Title, Career Field and Summary are required.');
      return;
    }

    if (/\d/.test(formData.title)) {
      toast.error('Job title cannot contain numbers.');
      return;
    }

    const timestamp = new Date().toISOString();
    if (isEditing && activePostId) {
      setPosts(current =>
        current.map(post =>
          post.id === activePostId
            ? {
                ...post,
                ...formData,
                updatedAt: timestamp,
              }
            : post,
        ),
      );
      toast.success('Job post updated successfully.');
    } else {
      const newPost: JobPost = {
        id: `${toSlug(formData.title)}-${Date.now()}`,
        createdAt: timestamp,
        updatedAt: timestamp,
        views: 0,
        applications: 0,
        ...formData,
      };
      setPosts(current => [newPost, ...current]);
      toast.success('Job post created successfully.');
    }

    clearForm();
  };

  const startEdit = (post: JobPost) => {
    setIsEditing(true);
    setActivePostId(post.id);
    setFormData({
      authorId: post.authorId,
      authorName: post.authorName,
      authorEmail: post.authorEmail,
      title: post.title,
      careerField: post.careerField,
      location: post.location,
      employmentType: post.employmentType,
      summary: post.summary,
      description: post.description,
      skills: post.skills,
      languages: post.languages,
      socialLinks: post.socialLinks,
      visibility: post.visibility,
      status: post.status,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removePost = (post: JobPost) => {
    if (!window.confirm('Delete this job post permanently?')) {
      return;
    }
    setPosts(current => current.filter(item => item.id !== post.id));
    toast.success('Job post removed.');
  };

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

  const stats = useMemo(() => ({
    total: posts.length,
    active: posts.filter(p => p.status === 'active').length,
    public: posts.filter(p => p.visibility === 'public').length,
    totalViews: posts.reduce((acc, cur) => acc + cur.views, 0),
    totalApplications: posts.reduce((acc, cur) => acc + cur.applications, 0),
  }), [posts]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="max-w-screen-xl mx-auto space-y-6">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-black">Job Posting Manager</h1>
            <p className="text-slate-500 text-sm mt-1">Create, manage and share professional job posts powered by your profile data.</p>
          </div>
          <button
            onClick={autoPopulate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white text-xs uppercase font-black rounded-lg shadow hover:bg-cyan-700 transition"
          >
            <PlusCircle size={16} /> Auto-fill from profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={addOrUpdatePost} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start gap-2 mb-4">
                <h2 className="text-lg font-black">{isEditing ? 'Edit Job Post' : 'Create a New Job Post'}</h2>
                <span className="text-xs px-3 py-1 bg-slate-100 rounded-full text-slate-600">{isEditing ? 'Editing' : 'Draft'}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600">Job Title *</label>
                  <input
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: removeDigits(e.target.value) }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g., Junior Frontend Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600">Career Field *</label>
                  <select
                    value={formData.careerField}
                    onChange={e => setFormData(prev => ({ ...prev, careerField: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select field</option>
                    {availableCareerFields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600">Employment Type</label>
                  <select
                    value={formData.employmentType}
                    onChange={e => setFormData(prev => ({ ...prev, employmentType: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {availableEmployments.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600">Location</label>
                  <input
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600">Summary *</label>
                  <textarea
                    value={formData.summary}
                    onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600">Full Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm h-24 resize-none"
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <label className="text-xs font-black uppercase text-slate-600">Skills (comma separated)</label>
                <input
                  value={formData.skills.join(', ')}
                  onChange={e => setFormData(prev => ({ ...prev, skills: e.target.value.split(',').map(item => item.trim()).filter(Boolean) }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="React, Node.js, SQL"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2">
                <label className="text-xs font-black uppercase text-slate-600">Languages (comma separated)</label>
                <input
                  value={formData.languages.join(', ')}
                  onChange={e => setFormData(prev => ({ ...prev, languages: e.target.value.split(',').map(item => item.trim()).filter(Boolean) }))}
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="English, Sinhala"
                />
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-600">Social / Contact Link</label>
                  <input
                    value={formData.socialLinks}
                    onChange={e => setFormData(prev => ({ ...prev, socialLinks: e.target.value }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-600">Visibility</label>
                  <select
                    value={formData.visibility}
                    onChange={e => setFormData(prev => ({ ...prev, visibility: e.target.value as Visibility }))}
                    className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-black uppercase text-xs hover:bg-indigo-700 transition">
                  {isEditing ? 'Save Changes' : 'Publish Job Post'}
                </button>
                <button type="button" onClick={clearForm} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase hover:bg-slate-200 transition">
                  Clear
                </button>
                <span className="py-2 text-xs text-slate-500">Auto-filled on: {profile ? safeName(profile) : 'unknown'}</span>
              </div>
            </form>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="font-black mb-2">Profile Synced Data</h2>
              {isLoadingProfile ? (
                <p className="text-slate-500 text-sm">Loading profile data...</p>
              ) : profile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700">
                  <div>
                    <p className="font-black">Name</p>
                    <p>{safeName(profile)}</p>
                  </div>
                  <div>
                    <p className="font-black">Email</p>
                    <p>{profile.user && typeof profile.user !== 'string' ? profile.user.email : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-black">Career Goal</p>
                    <p>{profile.careerGoals.careerObjective || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="font-black">Top Skills</p>
                    <p>{profile.technicalSkills.map(s => s.name).join(', ') || 'No technical skills added'}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <p className="font-black">Summary</p>
                    <p>{profile.bio || 'No biography available.'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Profile is not available. Please check your account details.</p>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-3">Quick Stats</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>Total posts: <strong>{stats.total}</strong></li>
                <li>Active: <strong>{stats.active}</strong></li>
                <li>Public: <strong>{stats.public}</strong></li>
                <li>Views: <strong>{stats.totalViews}</strong></li>
                <li>Applications: <strong>{stats.totalApplications}</strong></li>
              </ul>
            </div>
          </aside>
        </div>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black">Job Posts ({filteredPosts.length})</h2>
            <p className="text-xs text-slate-500">Click on an action to edit, delete, view, or share</p>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="text-slate-500 text-sm py-8 text-center">No posts yet.</div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map(post => (
                <article key={post.id} className="border border-slate-100 rounded-xl p-4 hover:border-slate-300 transition">
                  <div className="flex justify-between items-start gap-3 mb-2">
                    <div>
                      <h3 className="text-base font-black">{post.title}</h3>
                      <p className="text-xs text-slate-400 font-black uppercase tracking-wide">{post.careerField} • {post.location || 'Remote/NA'}</p>
                      <p className="text-sm text-slate-600 mt-2">{post.summary}</p>
                    </div>
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full uppercase font-black tracking-widest">{post.visibility}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    {post.skills.slice(0, 5).map(skill => (<span key={skill} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg">{skill}</span>))}
                    {post.languages.map(lang => (<span key={lang} className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">{lang}</span>))}
                  </div>
                  <div className="mt-3 flex flex-wrap justify-between items-center gap-2 text-xs text-slate-500">                    
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>{post.views} views</span>
                    <span>{post.applications} applications</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => startEdit(post)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-black"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => removePost(post)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-black"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
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

export default JobPostingDashboard;
