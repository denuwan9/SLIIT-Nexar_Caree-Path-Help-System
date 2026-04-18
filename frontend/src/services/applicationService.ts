import api from '../api/axios';

export type Application = {
  _id: string;
  jobPost: string;
  applicant: {
    _id: string;
    name: string;
    email: string;
  };
  appliedAt: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  coverLetter?: string;
  resume?: string;
};

export const applyForJob = async (jobPostId: string, coverLetter?: string, resume?: string): Promise<Application> => {
  // Try dedicated route first, fallback to legacy route
  try {
    const res = await api.post(`/jobs/${jobPostId}/apply`, { coverLetter, resume });
    return res.data.data.application as Application;
  } catch (error) {
    const res = await api.post('/applications', { jobPostId, coverLetter, resume });
    return res.data.data.application as Application;
  }
};

export const fetchMyApplications = async (): Promise<Application[]> => {
  const res = await api.get('/applications/me');
  return res.data.data.applications as Application[];
};

export const fetchApplicationsForJobPost = async (jobPostId: string): Promise<Application[]> => {
  const res = await api.get(`/applications/${jobPostId}`);
  return res.data.data.applications as Application[];
};

export const updateApplicationStatus = async (applicationId: string, status: string): Promise<Application> => {
  const res = await api.patch(`/applications/${applicationId}/status`, { status });
  return res.data.data.application as Application;
};