import { Job, SearchFilters, UserProfile } from '../types';
import { LocalStore } from '../lib/storage';
import { prioritizeJobsForUser } from './matchingService';

export const JobService = {
  /**
   * Search and filter jobs with pagination and sorting
   */
  searchJobs(filters: Partial<SearchFilters>, profile?: UserProfile | null): { jobs: Job[]; total: number } {
    const allJobs = LocalStore.getJobs();

    let filtered = allJobs.filter(job => {
      // 1. Status Filter: by default only active verified offers unless explicitly requested
      if (filters.onlyActive !== false && job.status !== 'active') {
        return false;
      }
      if (filters.verificationStatus && job.verificationStatus !== filters.verificationStatus) {
        return false;
      }

      // 2. Keyword search in title, description, company, organization, location, skills
      if (filters.keyword && filters.keyword.trim().length > 0) {
        const kw = filters.keyword.toLowerCase().trim();
        const inTitle = job.title.toLowerCase().includes(kw);
        const inDesc = job.description.toLowerCase().includes(kw);
        const inOrg = (job.organization || '').toLowerCase().includes(kw);
        const inComp = (job.company || '').toLowerCase().includes(kw);
        const inLoc = (job.location || '').toLowerCase().includes(kw);
        const inSkills = job.requiredSkills?.some(s => s.toLowerCase().includes(kw));

        if (!inTitle && !inDesc && !inOrg && !inComp && !inLoc && !inSkills) {
          return false;
        }
      }

      // 3. Academic sections filter
      if (filters.academicSections && filters.academicSections.length > 0) {
        if (!filters.academicSections.includes(job.academicSection)) {
          return false;
        }
      }

      // 4. Education level filter
      if (filters.educationLevels && filters.educationLevels.length > 0) {
        if (!filters.educationLevels.includes(job.educationLevel)) {
          return false;
        }
      }

      // 5. Professional category filter
      if (filters.professionalCategories && filters.professionalCategories.length > 0) {
        if (!filters.professionalCategories.includes(job.professionalCategory)) {
          return false;
        }
      }

      // 6. Sector filter (public / private / teaching / other)
      if (filters.sectors && filters.sectors.length > 0) {
        if (!filters.sectors.includes(job.sector)) {
          return false;
        }
      }

      // 7. Governorate filter (matches if job has governorate OR 'all_tunisia' OR user has no filter)
      if (filters.governorates && filters.governorates.length > 0) {
        const hasMatch = job.governorates.includes('all_tunisia') || 
          job.governorates.some(g => filters.governorates!.includes(g));
        if (!hasMatch) return false;
      }

      // 8. Job types filter
      if (filters.jobTypes && filters.jobTypes.length > 0) {
        if (!filters.jobTypes.includes(job.jobType)) {
          return false;
        }
      }

      return true;
    });

    // Apply Sorting
    const sortBy = filters.sortBy || (profile ? 'relevance' : 'date');

    if (sortBy === 'relevance' && profile) {
      filtered = prioritizeJobsForUser(filtered, profile);
    } else if (sortBy === 'deadline') {
      filtered.sort((a, b) => {
        if (!a.applicationDeadline) return 1;
        if (!b.applicationDeadline) return -1;
        return new Date(a.applicationDeadline).getTime() - new Date(b.applicationDeadline).getTime();
      });
    } else {
      // Default: date published descending
      filtered.sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime());
    }

    const total = filtered.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 12;
    const startIndex = (page - 1) * pageSize;
    const pagedJobs = filtered.slice(startIndex, startIndex + pageSize);

    return { jobs: pagedJobs, total };
  },

  /**
   * Get single job by ID
   */
  getJobById(id: string): Job | undefined {
    return LocalStore.getJobById(id);
  },

  /**
   * Get public recruitment competitions (Concours Publics)
   */
  getPublicConcours(limit = 6): Job[] {
    const all = LocalStore.getJobs();
    return all
      .filter(j => (j.sector === 'public' || j.professionalCategory === 'public_concours') && j.status === 'active')
      .sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime())
      .slice(0, limit);
  },

  /**
   * Get teaching and education recruitment opportunities
   */
  getTeachingJobs(limit = 6): Job[] {
    const all = LocalStore.getJobs();
    return all
      .filter(j => (j.sector === 'teaching' || j.professionalCategory === 'teaching') && j.status === 'active')
      .sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime())
      .slice(0, limit);
  },

  /**
   * Get recent opportunities across all sectors
   */
  getRecentJobs(limit = 6): Job[] {
    const all = LocalStore.getJobs();
    return all
      .filter(j => j.status === 'active')
      .sort((a, b) => new Date(b.publicationDate).getTime() - new Date(a.publicationDate).getTime())
      .slice(0, limit);
  },

  /**
   * Get personalized recommendations for a user
   */
  getRecommendedJobs(profile: UserProfile, limit = 8): Job[] {
    const all = LocalStore.getJobs().filter(j => j.status === 'active');
    const prioritized = prioritizeJobsForUser(all, profile);
    return prioritized.slice(0, limit);
  },

  /**
   * Save / Update a job (Admin)
   */
  saveJob(job: Job): Job {
    return LocalStore.saveJob(job);
  },

  /**
   * Delete a job (Admin)
   */
  deleteJob(id: string): boolean {
    return LocalStore.deleteJob(id);
  },

  /**
   * Toggle favorite
   */
  toggleFavorite(userId: string, jobId: string): boolean {
    if (LocalStore.isFavorite(userId, jobId)) {
      LocalStore.removeFavorite(userId, jobId);
      return false; // now not favorite
    } else {
      LocalStore.addFavorite(userId, jobId);
      return true; // now favorite
    }
  },

  isFavorite(userId: string, jobId: string): boolean {
    return LocalStore.isFavorite(userId, jobId);
  },

  getFavorites(userId: string): Job[] {
    const favs = LocalStore.getFavorites(userId);
    return favs.map(f => f.job).filter((j): j is Job => Boolean(j));
  }
};
