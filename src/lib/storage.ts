import { Job, RecruitmentSource, UserProfile, Favorite, AppNotification, ImportLog } from '../types';
import { INITIAL_SEED_JOBS } from '../data/seedJobs';
import { OFFICIAL_TUNISIAN_SOURCES } from '../constants/tunisiaData';

const STORAGE_KEYS = {
  JOBS: 'tawdheef_jobs_v1',
  SOURCES: 'tawdheef_sources_v1',
  CURRENT_USER: 'tawdheef_current_user_v1',
  PROFILES: 'tawdheef_profiles_v1',
  FAVORITES: 'tawdheef_favorites_v1',
  NOTIFICATIONS: 'tawdheef_notifications_v1',
  IMPORT_LOGS: 'tawdheef_import_logs_v1',
  INITIALIZED: 'tawdheef_initialized_v1'
};

// Check and sweep expired jobs automatically based on current date
const sweepExpirations = (jobs: Job[]): Job[] => {
  const todayStr = new Date().toISOString().split('T')[0];
  let changed = false;

  const updatedJobs = jobs.map(job => {
    if (job.status === 'active' && job.applicationDeadline && job.applicationDeadline < todayStr) {
      changed = true;
      return { ...job, status: 'expired' as const, updatedAt: new Date().toISOString() };
    }
    return job;
  });

  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updatedJobs));
    } catch (e) {
      console.warn('Failed to update expired jobs in storage', e);
    }
  }

  return updatedJobs;
};

// Initialize default storage data if not present
export const initLocalStorage = () => {
  try {
    const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInitialized) {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_SEED_JOBS));
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(OFFICIAL_TUNISIAN_SOURCES));
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.IMPORT_LOGS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  } catch (err) {
    console.warn('Local storage not accessible, falling back to memory', err);
  }
};

// In-memory fallback if localStorage is disabled or throws
let memoryJobs: Job[] = [...INITIAL_SEED_JOBS];
let memorySources: RecruitmentSource[] = [...OFFICIAL_TUNISIAN_SOURCES];
let memoryFavorites: Favorite[] = [];
let memoryNotifications: AppNotification[] = [];
let memoryImportLogs: ImportLog[] = [];
let memoryProfiles: Record<string, UserProfile> = {};

export const LocalStore = {
  // --- JOBS ---
  getJobs(): Job[] {
    try {
      initLocalStorage();
      const raw = localStorage.getItem(STORAGE_KEYS.JOBS);
      if (raw) {
        const parsed: Job[] = JSON.parse(raw);
        return sweepExpirations(parsed);
      }
    } catch (e) {
      // fallback to memory
    }
    return sweepExpirations(memoryJobs);
  },

  getJobById(id: string): Job | undefined {
    return this.getJobs().find(j => j.id === id);
  },

  saveJob(job: Job): Job {
    const jobs = this.getJobs();
    const existingIndex = jobs.findIndex(j => j.id === job.id);
    let updated: Job[];

    const preparedJob = {
      ...job,
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      updated = [...jobs];
      updated[existingIndex] = preparedJob;
    } else {
      updated = [preparedJob, ...jobs];
    }

    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(updated));
    } catch (e) {
      memoryJobs = updated;
    }
    return preparedJob;
  },

  saveJobsBatch(newJobs: Job[]): void {
    const existing = this.getJobs();
    const map = new Map<string, Job>();
    existing.forEach(j => map.set(j.id, j));
    newJobs.forEach(j => map.set(j.id, j));
    const merged = Array.from(map.values());

    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(merged));
    } catch (e) {
      memoryJobs = merged;
    }
  },

  deleteJob(id: string): boolean {
    const jobs = this.getJobs().filter(j => j.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
    } catch (e) {
      memoryJobs = jobs;
    }
    return true;
  },

  // --- SOURCES ---
  getSources(): RecruitmentSource[] {
    try {
      initLocalStorage();
      const raw = localStorage.getItem(STORAGE_KEYS.SOURCES);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return memorySources;
  },

  saveSource(source: RecruitmentSource): RecruitmentSource {
    const sources = this.getSources();
    const idx = sources.findIndex(s => s.id === source.id);
    let updated: RecruitmentSource[];

    if (idx >= 0) {
      updated = [...sources];
      updated[idx] = source;
    } else {
      updated = [source, ...sources];
    }

    try {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(updated));
    } catch (e) {
      memorySources = updated;
    }
    return source;
  },

  deleteSource(id: string): boolean {
    const sources = this.getSources().filter(s => s.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.SOURCES, JSON.stringify(sources));
    } catch (e) {
      memorySources = sources;
    }
    return true;
  },

  // --- FAVORITES ---
  getFavorites(userId: string): Favorite[] {
    try {
      initLocalStorage();
      const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      const all: Favorite[] = raw ? JSON.parse(raw) : memoryFavorites;
      const userFavs = all.filter(f => f.userId === userId);
      // populate job details
      const jobs = this.getJobs();
      return userFavs.map(f => ({
        ...f,
        job: jobs.find(j => j.id === f.jobId)
      }));
    } catch (e) {
      return memoryFavorites.filter(f => f.userId === userId);
    }
  },

  addFavorite(userId: string, jobId: string): Favorite {
    const current = this.getFavorites(userId);
    const existing = current.find(f => f.jobId === jobId);
    if (existing) return existing;

    const newFav: Favorite = {
      id: 'fav_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId,
      jobId,
      createdAt: new Date().toISOString()
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      const all: Favorite[] = raw ? JSON.parse(raw) : [];
      all.push(newFav);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(all));
    } catch (e) {
      memoryFavorites.push(newFav);
    }
    return newFav;
  },

  removeFavorite(userId: string, jobId: string): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      const all: Favorite[] = raw ? JSON.parse(raw) : memoryFavorites;
      const filtered = all.filter(f => !(f.userId === userId && f.jobId === jobId));
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
      memoryFavorites = filtered;
      return true;
    } catch (e) {
      memoryFavorites = memoryFavorites.filter(f => !(f.userId === userId && f.jobId === jobId));
      return true;
    }
  },

  isFavorite(userId: string, jobId: string): boolean {
    const favs = this.getFavorites(userId);
    return favs.some(f => f.jobId === jobId);
  },

  // --- NOTIFICATIONS ---
  getNotifications(userId: string): AppNotification[] {
    try {
      initLocalStorage();
      const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const all: AppNotification[] = raw ? JSON.parse(raw) : memoryNotifications;
      return all
        .filter(n => n.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (e) {
      return memoryNotifications.filter(n => n.userId === userId);
    }
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'createdAt' | 'read'>): AppNotification {
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      read: false,
      createdAt: new Date().toISOString()
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const all: AppNotification[] = raw ? JSON.parse(raw) : [];
      all.unshift(newNotif);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    } catch (e) {
      memoryNotifications.unshift(newNotif);
    }
    return newNotif;
  },

  markNotificationAsRead(id: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (raw) {
        const all: AppNotification[] = JSON.parse(raw);
        const updated = all.map(n => n.id === id ? { ...n, read: true } : n);
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      }
    } catch (e) {
      memoryNotifications = memoryNotifications.map(n => n.id === id ? { ...n, read: true } : n);
    }
  },

  markAllNotificationsAsRead(userId: string): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (raw) {
        const all: AppNotification[] = JSON.parse(raw);
        const updated = all.map(n => n.userId === userId ? { ...n, read: true } : n);
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
      }
    } catch (e) {
      memoryNotifications = memoryNotifications.map(n => n.userId === userId ? { ...n, read: true } : n);
    }
  },

  // --- IMPORT LOGS ---
  getImportLogs(): ImportLog[] {
    try {
      initLocalStorage();
      const raw = localStorage.getItem(STORAGE_KEYS.IMPORT_LOGS);
      if (raw) {
        const parsed: ImportLog[] = JSON.parse(raw);
        return parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (e) {}
    return memoryImportLogs;
  },

  addImportLog(log: Omit<ImportLog, 'id' | 'createdAt'>): ImportLog {
    const newLog: ImportLog = {
      ...log,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString()
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.IMPORT_LOGS);
      const all: ImportLog[] = raw ? JSON.parse(raw) : [];
      all.unshift(newLog);
      localStorage.setItem(STORAGE_KEYS.IMPORT_LOGS, JSON.stringify(all));
    } catch (e) {
      memoryImportLogs.unshift(newLog);
    }
    return newLog;
  },

  // --- PROFILES ---
  getProfile(userId: string): UserProfile | null {
    try {
      initLocalStorage();
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (raw) {
        const all: UserProfile[] = JSON.parse(raw);
        return all.find(p => p.id === userId) || null;
      }
    } catch (e) {}
    return memoryProfiles[userId] || null;
  },

  saveProfile(profile: UserProfile): UserProfile {
    const updatedProfile = {
      ...profile,
      updatedAt: new Date().toISOString()
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILES);
      const all: UserProfile[] = raw ? JSON.parse(raw) : [];
      const idx = all.findIndex(p => p.id === profile.id);
      if (idx >= 0) {
        all[idx] = updatedProfile;
      } else {
        all.push(updatedProfile);
      }
      localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(all));
    } catch (e) {
      memoryProfiles[profile.id] = updatedProfile;
    }
    return updatedProfile;
  }
};
