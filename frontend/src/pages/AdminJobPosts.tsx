import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { fetchAllJobPosts, type JobPost } from '../services/jobPostService';

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
      return posts.filter(post => post.targetRole.toLowerCase() === searchQuery.toLowerCase());
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
    setSearchQuery(role);
    setIsDropdownOpen(false);
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">Admin Job Posts</h1>
          <p className="text-sm text-[#64748B] mt-1">Manage and review all student job postings.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative w-80">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isSearchByRole ? "Search by role..." : "Search posts..."}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => isSearchByRole && setIsDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 shadow-sm"
            />
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
          <button
            onClick={() => setIsSearchByRole(!isSearchByRole)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl font-semibold transition-all text-sm ${
              isSearchByRole ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Filter size={14} /> Role
          </button>
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
              <div key={post._id} className="border border-slate-100 rounded-2xl p-4">
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
    </div>
  );
};

export default AdminJobPosts;
