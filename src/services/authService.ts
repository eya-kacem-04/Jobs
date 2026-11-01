import type { User } from '@supabase/supabase-js';
import { UserProfile } from '../types';
import { LocalStore } from '../lib/storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type Role = 'admin' | 'moderator' | 'user';

export interface AuthState {
  user: UserProfile | null;
  role: Role;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AUTH_STORAGE_KEY = 'tawdheef_auth_session';

/**
 * Fetch the REAL role from the user_roles table.
 * Never trust user_metadata: users can edit it themselves.
 */
async function fetchRole(userId: string): Promise<Role> {
  if (!supabase) return 'user';
  const { data } = await supabase.from('user_roles').select('role').eq('user_id', userId);
  const roles = (data ?? []).map((r) => r.role);
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('moderator')) return 'moderator';
  return 'user';
}

/**
 * Build a UserProfile from a Supabase auth user (profile data kept in user_metadata).
 */
function buildProfile(u: User, fallbackEmail = ''): UserProfile {
  const m = u.user_metadata ?? {};
  return {
    id: u.id,
    email: u.email ?? fallbackEmail,
    fullName: m.full_name ?? '',
    academicSection: m.academic_section ?? 'other',
    educationLevel: m.education_level ?? 'licence',
    preferredJobCategories: m.preferred_job_categories ?? [],
    preferredGovernorates: m.preferred_governorates ?? ['Tunis'],
    professionalInterests: m.professional_interests ?? [],
    skills: m.skills ?? [],
    notificationPreferences: m.notification_preferences ?? {
      email: false,
      inApp: true,
      newMatchingJob: true,
      deadlineReminder: true
    },
    createdAt: u.created_at,
    updatedAt: u.updated_at ?? u.created_at
  };
}

export const AuthService = {
  /**
   * Cached session (fast, synchronous). For display only.
   * The real check is restoreSession(), which asks Supabase.
   */
  getCurrentUser(): { user: UserProfile | null; role: Role } {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        const latest = LocalStore.getProfile(session.user?.id);
        return {
          user: latest || session.user,
          role: session.role || 'user'
        };
      }
    } catch {}
    return { user: null, role: 'user' };
  },

  /**
   * Check the real Supabase session when the app starts.
   * - No valid session: clears the local cache and returns no user.
   * - Valid session: loads the role from the database.
   */
  async restoreSession(): Promise<{ user: UserProfile | null; role: Role }> {
    if (!isSupabaseConfigured() || !supabase) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return { user: null, role: 'user' };
    }

    const { data } = await supabase.auth.getSession();
    const authUser = data.session?.user;

    if (!authUser) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return { user: null, role: 'user' };
    }

    const role = await fetchRole(authUser.id);

    let profile = LocalStore.getProfile(authUser.id);
    if (!profile) {
      profile = buildProfile(authUser);
      LocalStore.saveProfile(profile);
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: profile, role }));
    return { user: profile, role };
  },

  /**
   * Call `callback` when Supabase signs the user out (expired session, other tab...).
   * Returns a function that stops listening.
   */
  onSignedOut(callback: () => void): () => void {
    if (!supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        callback();
      }
    });
    return () => data.subscription.unsubscribe();
  },

  /**
   * Login with email & password.
   * Requires Supabase to be configured.
   */
  async login(email: string, password: string): Promise<{ user: UserProfile; role: Role }> {
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error(
          'Connexion impossible : la base de données Supabase n\'est pas encore configurée. ' +
          'Veuillez configurer les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY avant de vous connecter. / ' +
          'تعذّر تسجيل الدخول: لم يتم تكوين قاعدة بيانات Supabase بعد. ' +
          'يرجى ضبط المتغيرين VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY قبل تسجيل الدخول.'
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error || !data.user) {
      throw new Error(
          error?.message ||
          'Identifiants incorrects. Veuillez réessayer. / بيانات الدخول غير صحيحة. يرجى المحاولة مجدداً.'
      );
    }

    const role = await fetchRole(data.user.id);
    const profile = buildProfile(data.user, email);

    LocalStore.saveProfile(profile);
    const session = { user: profile, role };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  /**
   * Register a new account.
   * Requires Supabase to be configured.
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
    if (!isSupabaseConfigured() || !supabase) {
      throw new Error(
          'Inscription impossible : la base de données Supabase n\'est pas encore configurée. ' +
          'Veuillez configurer les variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY. / ' +
          'تعذّر إنشاء الحساب: لم يتم تكوين قاعدة بيانات Supabase بعد.'
      );
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email.trim().toLowerCase(),
      password: data.password,
      options: {
        data: {
          full_name: data.fullName.trim(),
          academic_section: data.academicSection ?? 'other',
          education_level: data.educationLevel ?? 'licence',
          preferred_job_categories: data.preferredJobCategories ?? [],
          preferred_governorates: data.preferredGovernorates ?? ['Tunis'],
          professional_interests: data.professionalInterests ?? [],
          skills: data.skills ?? [],
          notification_preferences: {
            email: false,
            inApp: true,
            newMatchingJob: true,
            deadlineReminder: true
          }
        }
      }
    });

    if (error || !authData.user) {
      throw new Error(
          error?.message ||
          'Échec de l\'inscription. Veuillez réessayer. / فشل إنشاء الحساب. يرجى المحاولة مجدداً.'
      );
    }

    // If "Confirm email" is enabled in Supabase, no session is returned yet.
    if (!authData.session) {
      throw new Error(
          'Compte créé. Veuillez confirmer votre email avant de vous connecter. / ' +
          'تم إنشاء الحساب. يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول.'
      );
    }

    const profile: UserProfile = {
      id: authData.user.id,
      email: authData.user.email ?? data.email,
      fullName: data.fullName.trim(),
      academicSection: data.academicSection ?? 'other',
      educationLevel: data.educationLevel ?? 'licence',
      preferredJobCategories: data.preferredJobCategories ?? [],
      preferredGovernorates: data.preferredGovernorates ?? ['Tunis'],
      professionalInterests: data.professionalInterests ?? [],
      skills: data.skills ?? [],
      notificationPreferences: {
        email: false,
        inApp: true,
        newMatchingJob: true,
        deadlineReminder: true
      },
      createdAt: authData.user.created_at,
      updatedAt: authData.user.updated_at ?? authData.user.created_at
    };

    LocalStore.saveProfile(profile);
    LocalStore.addNotification({
      userId: profile.id,
      title: 'Bienvenue sur Tawdheef TN ! / مرحباً بك في توظيف تونس',
      message: 'Votre profil académique a été configuré avec succès. Découvrez les offres et concours correspondant à votre filière.',
      jobId: null
    });

    const session = { user: profile, role: 'user' as const };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return session;
  },

  /**
   * Update user profile metadata in Supabase and local cache.
   */
  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.updateUser({
        data: {
          full_name: profile.fullName,
          academic_section: profile.academicSection,
          education_level: profile.educationLevel,
          preferred_job_categories: profile.preferredJobCategories,
          preferred_governorates: profile.preferredGovernorates,
          professional_interests: profile.professionalInterests,
          skills: profile.skills,
          notification_preferences: profile.notificationPreferences
        }
      });
    }

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
   * Sign out: clears the Supabase session and the local cache.
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
};