import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import { fetchAllJobPosts, type JobPost } from '../services/jobPostService';
import { applyForJob } from '../services/applicationService';

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

const AdminJobPosts: React.FC = () => {
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchByRole, setIsSearchByRole] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredRoles, setFilteredRoles] = useState(targetRolesList);
  const [selectedJobPost, setSelectedJobPost] = useState<JobPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [clickOrigin, setClickOrigin] = useState<{ x: number; y: number } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const fetched = await fetchAllJobPosts();
        setPosts(fetched);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load job posts');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return posts;
    if (isSearchByRole) {
      return posts.filter(post => post.targetRole.toLowerCase().includes(searchQuery.toLowerCase()));
    } else {
      return posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.targetRole.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  }, [posts, searchQuery, isSearchByRole]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (isSearchByRole) {
      setFilteredRoles(targetRolesList.filter(role =>
        role.toLowerCase().includes(value.toLowerCase())
      ));
    }
  };

  const handleRoleSelect = (role: string) => {
    console.log('Selected role:', role);
    setSearchQuery(role);
    setIsDropdownOpen(false);
  };

  const handleJobPostClick = (jobPost: JobPost, event: React.MouseEvent) => {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    setClickOrigin({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    });
    setSelectedJobPost(jobPost);
    setIsModalOpen(true);
    setTimeout(() => setIsModalAnimating(true), 10);
  };

  const handleCloseModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedJobPost(null);
    }, 300); // Match the animation duration
  };

  const handleApply = async () => {
    if (!selectedJobPost) return;
    setIsApplying(true);
    try {
      await applyForJob(selectedJobPost._id);
      alert('Application submitted successfully!');
      handleCloseModal();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-600" />
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">Admin Job Posts</h1>
          </div>
          <p className="text-sm text-[#64748B] mt-1">Manage and review all student job postings.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-80" ref={searchRef}>
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isSearchByRole ? "Search by role..." : "Search posts..."}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => isSearchByRole && setIsDropdownOpen(true)}
              className="w-full pl-9 pr-20 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 shadow-sm"
            />
            <button
              onClick={() => {
                const newState = !isSearchByRole;
                setIsSearchByRole(newState);
                if (!newState) {
                  setIsDropdownOpen(false);
                  setSearchQuery('');
                }
              }}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                isSearchByRole ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Filter size={12} /> Role
            </button>
            {isSearchByRole && isDropdownOpen && filteredRoles.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto mt-1">
                {filteredRoles.map((role) => (
                  <li
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className="p-2 hover:bg-slate-100 cursor-pointer text-sm"
                  >
                    {role}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full p-8 bg-white border border-slate-100 rounded-3xl text-center text-slate-500">Loading job posts...</div>
      ) : error ? (
        <div className="w-full p-8 bg-white border border-rose-100 rounded-3xl text-center text-rose-600">{error}</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">All Job Listings</h2>
            <span className="text-xs text-slate-500 font-semibold">{filteredPosts.length} postings</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full p-6 text-center text-slate-500">No job posts found.</div>
            ) : filteredPosts.map((post) => (
              <div key={post._id} className="border border-slate-100 rounded-2xl p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={(e) => handleJobPostClick(post, e)}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-[#0F172A]">{post.title}</h3>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{post.jobType}</span>
                </div>
                <p className="text-sm text-[#64748B] mb-2">{post.targetRole}</p>
                <p className="text-sm text-[#64748B]">{post.preferredLocation || 'Any location'} • {post.isRemoteOk ? 'Remote okay' : 'Onsite only'}</p>
                <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
                  <span>{new Date(post.createdAt || '').toLocaleDateString()}</span>
                  <span>{(post.viewCount || 0)} views</span>
                </div>
                <div className="mt-4 flex gap-2 items-center">
                  <span className="px-2 py-1 text-[11px] rounded-full bg-emerald-50 text-emerald-600 font-semibold">{(post as any).applications || 0} applications</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job Post Details Popup Modal */}
      {isModalOpen && selectedJobPost && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{
            paddingLeft: '280px', // Account for sidebar (260px) + some margin
            paddingRight: '20px',
            opacity: isModalAnimating ? 1 : 0,
            transition: 'opacity 0.3s ease-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="modal-content bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              transform: isModalAnimating
                ? 'scale(1) translate(0, 0)'
                : 'scale(0.3) translate(0, 0)',
              opacity: isModalAnimating ? 1 : 0,
              transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transformOrigin: 'center center',
              paddingRight: '12px'
            }}
          >
            <style>
              {`
                .modal-content::-webkit-scrollbar {
                  width: 8px;
                  border-radius: 16px;
                }
                .modal-content::-webkit-scrollbar-track {
                  background: #f8fafc;
                  border-radius: 16px;
                }
                .modal-content::-webkit-scrollbar-thumb {
                  background: #cbd5e1;
                  border-radius: 16px;
                }
                .modal-content::-webkit-scrollbar-thumb:hover {
                  background: #94a3b8;
                }
              `}
            </style>
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedJobPost.title}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {typeof selectedJobPost.student === 'object'
                      ? (selectedJobPost.student as any).name || (selectedJobPost.student as any).email || 'Unknown'
                      : selectedJobPost.student || 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-sm text-slate-700 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-medium text-slate-900">Role:</span> {selectedJobPost.targetRole}
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-medium text-slate-900">Type:</span> {selectedJobPost.jobType}
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-medium text-slate-900">Location:</span> {selectedJobPost.preferredLocation || 'Any location'} • {selectedJobPost.isRemoteOk ? 'Remote' : 'Onsite'}
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="font-medium text-slate-900">Salary:</span> {selectedJobPost.salaryExpectation?.min ? `${selectedJobPost.salaryExpectation.currency || 'LKR'} ${selectedJobPost.salaryExpectation.min}` : 'N/A'}{selectedJobPost.salaryExpectation?.max ? ` - ${selectedJobPost.salaryExpectation.currency || 'LKR'} ${selectedJobPost.salaryExpectation.max}` : ''}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Job Summary</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700 leading-relaxed">
                  {selectedJobPost.summary}
                </div>
              </div>

              {selectedJobPost.skills?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJobPost.skills.map((skill, index) => (
                      <span key={index} className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={handleApply}
                  disabled={isApplying}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-indigo-300/30 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 transition-all transform hover:scale-105"
                >
                  {isApplying ? 'Applying...' : 'Apply for this Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminJobPosts;
