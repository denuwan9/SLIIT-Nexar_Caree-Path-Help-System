import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Search, Filter, ArrowLeft } from 'lucide-react';
import { fetchAllJobPosts, type JobPost } from '../services/jobPostService';

type JobPostWithAI = JobPost & {
  aiScore?: number;
  aiReason?: string;
};
import { applyForJob, fetchMyApplications, type Application } from '../services/applicationService';
import api from '../api/axios';

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
  const [posts, setPosts] = useState<JobPostWithAI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchByRole, setIsSearchByRole] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredRoles, setFilteredRoles] = useState(targetRolesList);
  const [selectedJobPost, setSelectedJobPost] = useState<JobPostWithAI | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const [isAppliedModalOpen, setIsAppliedModalOpen] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<Application[]>([]);
  const [isAppliedJobsLoading, setIsAppliedJobsLoading] = useState(false);
  const [appliedJobsError, setAppliedJobsError] = useState<string | null>(null);

  const [isApplicationMessageModalOpen, setIsApplicationMessageModalOpen] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');

  const [isAIFilterModalOpen, setIsAIFilterModalOpen] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState<JobPostWithAI[]>([]);
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isAIFilterActive, setIsAIFilterActive] = useState(false);
  const [aiQueryUsed, setAiQueryUsed] = useState('');
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
        const [fetched, myApps] = await Promise.all([
          fetchAllJobPosts(),
          fetchMyApplications().catch(() => [])
        ]);
        setPosts(fetched);
        setAppliedJobs(myApps || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Unable to load job posts');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filteredPosts = useMemo(() => {
    if (isAIFilterActive) {
      const source = aiResults.length > 0 ? aiResults : posts;
      return [...source].sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
    }

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
  }, [posts, searchQuery, isSearchByRole, isAIFilterActive, aiResults]);

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

  const handleJobPostClick = (jobPost: JobPost, _event: React.MouseEvent) => {
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

  const handleApplyClick = () => {
    setApplicationMessage('');
    setIsApplicationMessageModalOpen(true);
  };

  const handleConfirmApply = async () => {
    if (!selectedJobPost) return;
    setIsApplying(true);
    try {
      await applyForJob(selectedJobPost._id, applicationMessage);
      alert('Application submitted successfully!');
      setIsApplicationMessageModalOpen(false);
      handleCloseModal();
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  const handleOpenAppliedJobs = async () => {
    setIsAppliedModalOpen(true);
    setIsAppliedJobsLoading(true);
    setAppliedJobsError(null);
    try {
      const applications = await fetchMyApplications();
      setAppliedJobs(applications || []);
    } catch (err: any) {
      setAppliedJobsError(err?.response?.data?.message || 'Failed to load applied jobs');
    } finally {
      setIsAppliedJobsLoading(false);
    }
  };

  const handleAIAnalyze = async () => {
    if (!aiQuery.trim()) {
      setAiError('Please enter a query to analyze.');
      return;
    }

    setIsAIAnalyzing(true);
    setAiError(null);

    try {
      const response = await api.post('/admin/ai-rank-posts', { query: aiQuery });
      const ranked = Array.isArray(response.data?.data?.rankedPosts)
        ? response.data.data.rankedPosts
        : Array.isArray(response.data?.rankedPosts)
        ? response.data.rankedPosts
        : [];

      if (!ranked.length) {
        setAiError('AI analysis succeeded but returned no ranked posts. Showing standard job posts.');
        setIsAIFilterActive(false);
        setAiResults([]);
        setIsAIAnalyzing(false);
        return;
      }

      const normalized = ranked.map((post: JobPostWithAI) => ({
        ...post,
        aiScore: post.aiScore != null ? Number(post.aiScore) : 0,
        aiReason: post.aiReason || 'No reasoning provided',
      }));

      const sortedRanked = normalized.sort((a: JobPostWithAI, b: JobPostWithAI) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
      setAiResults(sortedRanked);
      setPosts(sortedRanked);
      setAiQueryUsed(aiQuery);
      setIsAIFilterActive(true);
      setIsAIFilterModalOpen(false); // Close the modal
      setAiQuery(''); // Clear the query for next use
    } catch (error: any) {
      setAiError(error.response?.data?.message || error.message || 'An error occurred while analyzing job posts.');
    } finally {
      setIsAIAnalyzing(false);
    }
  };

  const handleCancelAIFilter = () => {
    setIsAIFilterActive(false);
    setAiResults([]);
    setAiQueryUsed('');
    setAiError(null);
  };

  const getAIScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
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
          <p className="text-sm text-[#64748B] mt-1">
            {isAIFilterActive ? `AI Filtered Results: "${aiQueryUsed}"` : 'Manage and review all student job postings.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => {
              setIsAIFilterModalOpen(true);
              setAiQuery(''); // Reset query when opening modal
              setAiError(null);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-300/30 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105"
          >
            🤖 AI Filter
          </button>
          {isAIFilterActive && (
            <button
              onClick={handleCancelAIFilter}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-red-300/30 hover:bg-red-700 transition-all transform hover:scale-105"
            >
              Clear
            </button>
          )}
        </div>

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

      {isLoading ? (
        <div className="w-full p-8 bg-white border border-slate-100 rounded-3xl text-center text-slate-500">Loading job posts...</div>
      ) : error ? (
        <div className="w-full p-8 bg-white border border-rose-100 rounded-3xl text-center text-rose-600">{error}</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-[#0F172A]">All Job Listings</h2>
            <div className="flex items-center gap-4">
              <button 
                className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-semibold text-sm transition-colors border border-indigo-100"
                onClick={handleOpenAppliedJobs}
              >
                View Applied Jobs
              </button>
              <span className="text-xs text-slate-500 font-semibold">{filteredPosts.length} postings</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full p-6 text-center text-slate-500">No job posts found.</div>
            ) : filteredPosts.map((post) => {
              const myApp = appliedJobs.find(app => app.jobPost && typeof app.jobPost === 'object' ? (app.jobPost as any)._id === post._id : app.jobPost === post._id);
              
              return (
              <div key={post._id} className="border border-slate-100 rounded-2xl p-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={(e) => handleJobPostClick(post, e)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0F172A]">{post.title}</h3>
                    {myApp && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        myApp.status === 'accepted' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {myApp.status === 'accepted' ? 'ACCEPTED' : 'APPLIED'}
                      </span>
                    )}
                  </div>
                  {isAIFilterActive && post.aiScore !== undefined && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${getAIScoreColor(post.aiScore)}`}>
                      {post.aiScore}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#64748B] mb-2">{post.targetRole}</p>
                <p className="text-sm text-[#64748B]">{post.preferredLocation || 'Any location'} • {post.isRemoteOk ? 'Remote okay' : 'Onsite only'}</p>
                <div className="mt-3 flex items-center justify-between text-[12px] text-slate-500">
                  <span>{new Date(post.createdAt || '').toLocaleDateString()}</span>
                  <span>{(post.viewCount || 0)} views</span>
                </div>
              </div>
            )})}
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
                  {isAIFilterActive && selectedJobPost.aiScore !== undefined && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 md:col-span-2">
                      <span className="font-medium text-slate-900">AI Match Score:</span>
                      <span className={`ml-2 text-sm font-bold px-2 py-1 rounded-full border ${getAIScoreColor(selectedJobPost.aiScore)}`}>
                        {selectedJobPost.aiScore}%
                      </span>
                    </div>
                  )}
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

              {isAIFilterActive && selectedJobPost.aiReason && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">AI Analysis</h3>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-700 leading-relaxed">
                    {selectedJobPost.aiReason}
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-slate-200">
                {(() => {
                  const hasApplied = appliedJobs.some(app => app.jobPost && typeof app.jobPost === 'object' ? (app.jobPost as any)._id === selectedJobPost._id : app.jobPost === selectedJobPost._id);
                  return (
                    <button
                      onClick={() => {
                        if (hasApplied) {
                          alert('Already applied to this job post');
                          return;
                        }
                        handleApplyClick();
                      }}
                      disabled={isApplying}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg transition-all transform ${
                        hasApplied 
                          ? 'bg-slate-400 cursor-not-allowed shadow-none' 
                          : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-300/30 hover:from-indigo-700 hover:to-purple-700 hover:scale-105 disabled:opacity-60'
                      }`}
                    >
                      {isApplying ? 'Applying...' : hasApplied ? 'Already Applied' : 'Interested'}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Filter Modal */}
      {isAIFilterModalOpen && (
        <div
          onClick={() => setIsAIFilterModalOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{
            paddingLeft: '280px',
            paddingRight: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              transform: 'scale(1)',
              opacity: 1,
              transition: 'all 0.3s ease-out',
              paddingRight: '12px'
            }}
          >
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">🤖 AI Job Post Ranking</h2>
                <button
                  onClick={() => setIsAIFilterModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {!aiResults.length ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Describe the job posts you want</h3>
                    <textarea
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      placeholder="Example: Show me the best frontend developer job posts with strong React skills and a clear professional summary"
                      className="w-full h-32 p-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none"
                      disabled={isAIAnalyzing}
                    />
                    {aiError && (
                      <p className="text-red-600 text-sm mt-2">{aiError}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setIsAIFilterModalOpen(false)}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAIAnalyze}
                      disabled={!aiQuery.trim() || isAIAnalyzing}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-300/30 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isAIAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                  </div>
                </>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">AI Ranked Results</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {aiResults.map((result, index) => (
                      <div key={result._id || index} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900">{result.title}</h4>
                          <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                            Score: {result.aiScore || 'N/A'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{result.targetRole}</p>
                        {result.aiReason && (
                          <p className="text-sm text-slate-700 italic">"{result.aiReason}"</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => {
                        setAiResults([]);
                        setAiQuery('');
                        setAiError(null);
                      }}
                      className="px-4 py-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      New Search
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Applied Jobs Modal */}
      {isAppliedModalOpen && (
        <div
          onClick={() => setIsAppliedModalOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ paddingLeft: '280px', paddingRight: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">My Applied Jobs</h2>
              <button
                onClick={() => setIsAppliedModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {isAppliedJobsLoading ? (
                <div className="text-center text-slate-500 py-8">Loading your applications...</div>
              ) : appliedJobsError ? (
                <div className="text-center text-red-500 py-8">{appliedJobsError}</div>
              ) : appliedJobs.length === 0 ? (
                <div className="text-center text-slate-500 py-8">You haven't applied to any jobs yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appliedJobs.map((app) => (
                    <div key={app._id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer" onClick={(e) => {
                       if (app.jobPost && typeof app.jobPost === 'object') {
                         handleJobPostClick(app.jobPost as any, e as any);
                         setIsAppliedModalOpen(false);
                       }
                    }}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-900">
                           {app.jobPost && typeof app.jobPost === 'object' ? (app.jobPost as any).title : 'Deleted Job Post'}
                        </h4>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                          app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {app.status ? app.status.toUpperCase() : 'PENDING'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">
                        Applied on: {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Unknown date'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Application Message Modal */}
      {isApplicationMessageModalOpen && (
        <div
          onClick={() => setIsApplicationMessageModalOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ paddingLeft: '280px', paddingRight: '20px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-4">Application Details</h2>
            <p className="text-sm text-slate-600 mb-4">
              Please enter any important messages (e.g., what to bring, date, time, venue, etc.):
            </p>
            <textarea
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              placeholder="Enter important details here..."
              className="w-full h-32 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 resize-none text-sm mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsApplicationMessageModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={isApplying}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium text-sm shadow-lg shadow-indigo-200"
              >
                {isApplying ? 'Sending...' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminJobPosts;
