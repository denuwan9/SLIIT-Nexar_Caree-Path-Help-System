export type Visibility = 'public' | 'private';
export type PostingStatus = 'draft' | 'active' | 'closed';

export interface JobPost {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  title: string;
  careerField: string;
  location?: string;
  employmentType?: string;
  summary: string;
  description: string;
  skills: string[];
  languages: string[];
  socialLinks: string;
  visibility: Visibility;
  status: PostingStatus;
  createdAt: string;
  updatedAt: string;
  views: number;
  applications: number;
}
