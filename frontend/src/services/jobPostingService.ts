import type { JobPost } from '../types/jobPosting';

const STORAGE_KEY = 'nexar_job_posts_v1';

const readFromStorage = (): JobPost[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as JobPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeToStorage = (posts: JobPost[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
};

class JobPostingService {
  getAll(): JobPost[] {
    return readFromStorage();
  }

  saveAll(posts: JobPost[]): JobPost[] {
    writeToStorage(posts);
    return posts;
  }

  create(post: JobPost): JobPost[] {
    const all = readFromStorage();
    const updated = [post, ...all];
    writeToStorage(updated);
    return updated;
  }

  update(post: JobPost): JobPost[] {
    const all = readFromStorage();
    const updated = all.map(p => (p.id === post.id ? post : p));
    writeToStorage(updated);
    return updated;
  }

  remove(id: string): JobPost[] {
    const all = readFromStorage();
    const updated = all.filter(p => p.id !== id);
    writeToStorage(updated);
    return updated;
  }
}

export default new JobPostingService();
