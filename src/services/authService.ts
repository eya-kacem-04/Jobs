import { UserProfile, UserRole } from '../types';
import { LocalStore } from '../lib/storage';

export interface AuthState {
  user: UserProfile | null;
  role: 'admin' | 'moderator' | 'user';
  isAuthenticated: boolean;
  isLoading: boolean;
}

const DEMO_USERS: (UserProfile & { role: 'admin' | 'moderator' | 'user'; passwordHash: string })[] = [
  {
    id: 'usr_admin_001',
    email: 'admin@tawdheef.tn',
    fullName: 'Administrateur Tawdheef TN',
    academicSection: 'computer_science',
    educationLevel: 'engineer',
    preferredJobCategories: ['public_concours', 'it', 'engineering'],
    preferredGovernorates: ['Tunis', 'Ariana'],
    professionalInterests: ['Administration publique', 'Gouvernance des données'],
    skills: ['Management', 'Validation de sources', 'Cybersécurité'],
    notificationPreferences: { email: true, inApp: true, newMatchingJob: true, deadlineReminder: true },
    role: 'admin',
    passwordHash: 'admin123',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr_math_002',
    email: 'anis.math@tawdheef.tn',
    fullName: 'Anis Ben Salem',
    academicSection: 'mathematics',
    educationLevel: 'master',
    preferredJobCategories: ['teaching', 'public_concours'],
    preferredGovernorates: ['Sousse', 'Monastir', 'Mahdia'],
    professionalInterests: ['Enseignement secondaire', 'Pédagogie mathématique', 'Concours nationaux'],
    skills: ['Mathématiques fondamentales', 'Analyse & Algèbre', 'Didactique'],
    notificationPreferences: { email: false, inApp: true, newMatchingJob: true, deadlineReminder: true },
    role: 'user',
    passwordHash: 'anis123',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z'
  },
  {
    id: 'usr_dev_003',
    email: 'yasmine.dev@tawdheef.tn',
    fullName: 'Yasmine Triki',
    academicSection: 'computer_science',
    educationLevel: 'engineer',
    preferredJobCategories: ['it', 'engineering'],
    preferredGovernorates: ['Tunis', 'Ariana', 'Sousse'],
    professionalInterests: ['Développement Full Stack', 'Cloud & DevOps'],
    skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker'],
    notificationPreferences: { email: false, inApp: true, newMatchingJob: true, deadlineReminder: true },
    role: 'user',
    passwordHash: 'yasmine123',
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-02-15T00:00:00Z'
  }
];

const AUTH_STORAGE_KEY = 'tawdheef_auth_session';

export const AuthService = {
  /**
   * Get current session from storage
   */
  getCurrentUser(): { user: UserProfile | null; role: 'admin' | 'moderator' | 'user' } {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        // Refresh profile from store if exists
        const latest = LocalStore.getProfile(session.user.id);
        return {
          user: latest || session.user,
          role: session.role || 'user'
        };
      }
    } catch (e) {}
    return { user: null, role: 'user' };
  },

  /**
   * Login user with email & password
   */
  async login(email: string, password: string): Promise<{ user: UserProfile; role: 'admin' | 'moderator' | 'user' }> {
    const cleanEmail = email.trim().toLowerCase();
    
    // Check known demo users
    const foundDemo = DEMO_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (foundDemo) {
      if (foundDemo.passwordHash !== password) {
        throw new Error('Mot de passe incorrect / كلمة المرور غير صحيحة');
      }
      const session = {
        user: foundDemo,
        role: foundDemo.role
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      LocalStore.saveProfile(foundDemo);
      return session;
    }

    // Check stored profiles
    const stored = LocalStore.getProfile(cleanEmail);
    if (stored) {
      const session = { user: stored, role: 'user' as const };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      return session;
    }

    throw new Error('Aucun compte trouvé avec cet email / لم يتم العثور على حساب بهذا البريد');
  },

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    fullName: string;
    academicSection?: any;
    educationLevel?: any;
    preferredJobCategories?: any[];
    preferredGovernorates?: string[];
    professionalInterests?: string[];
    skills?: string[];
  }): Promise<{ user: UserProfile; role: 'user' }> {
    const cleanEmail = data.email.trim().toLowerCase();

    // Check if email already used
    if (DEMO_USERS.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Cet email est déjà utilisé / هذا البريد الإلكتروني مسجل بالفعل');
    }

    const newId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newProfile: UserProfile = {
      id: newId,
      email: cleanEmail,
      fullName: data.fullName.trim(),
      academicSection: data.academicSection || 'other',
      educationLevel: data.educationLevel || 'licence',
      preferredJobCategories: data.preferredJobCategories || [],
      preferredGovernorates: data.preferredGovernorates || ['Tunis'],
      professionalInterests: data.professionalInterests || [],
      skills: data.skills || [],
      notificationPreferences: {
        email: false,
        inApp: true,
        newMatchingJob: true,
        deadlineReminder: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    LocalStore.saveProfile(newProfile);

    // Add welcome notification
    LocalStore.addNotification({
      userId: newId,
      title: 'Bienvenue sur Tawdheef TN ! / مرحباً بك في توظيف تونس',
      message: 'Votre profil académique a été configuré avec succès. Découvrez dès maintenant les offres et concours correspondant à votre filière.',
      jobId: null
    });

    const session = { user: newProfile, role: 'user' as const };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));

    return session;
  },

  /**
   * Update Profile
   */
  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    const updated = LocalStore.saveProfile(profile);
    const currentSession = this.getCurrentUser();
    if (currentSession.user && currentSession.user.id === profile.id) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({
        user: updated,
        role: currentSession.role
      }));
    }
    return updated;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};
