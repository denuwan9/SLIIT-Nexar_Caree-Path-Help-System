import api from '../api/axios';

export type JobPost = {
  _id: string;
  student: string;
  title: string;
  summary: string;
  targetRole: string;
  jobType: 'full-time' | 'part-time' | 'internship' | 'contract' | 'freelance';
  skills: string[];
  preferredLocation?: string;
  isRemoteOk?: boolean;
  salaryExpectation?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  profileSnapshot?: Record<string, unknown>;
  aiRating?: {
    score?: number;
    feedback?: string;
  };
  viewCount?: number;
  isPublished?: boolean;
  createdAt?: string;
  updatedAt?: string;
  aiScore?: number;
  aiReason?: string;
};

export const fetchMyJobPosts = async (): Promise<JobPost[]> => {
  const res = await api.get('/jobs/me');
  return res.data.data.posts as JobPost[];
};

export const fetchAllJobPosts = async (): Promise<JobPost[]> => {
  const res = await api.get('/jobs');
  return res.data.data.posts as JobPost[];
};

export const createJobPost = async (payload: Partial<JobPost>): Promise<JobPost> => {
  const res = await api.post('/jobs', payload);
  return res.data.data.post as JobPost;
};

export const deleteJobPost = async (id: string): Promise<void> => {
  await api.delete(`/jobs/${id}`);
};
