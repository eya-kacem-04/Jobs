import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, Job, AppNotification } from '../types';
import { AuthService } from '../services/authService';
import { JobService } from '../services/jobService';
import { LocalStore } from '../lib/storage';

interface AuthContextType {
  user: UserProfile | null;
  role: 'admin' | 'moderator' | 'user';
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  favorites: Job[];
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  toggleFavorite: (jobId: string) => boolean;
  isFavorite: (jobId: string) => boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  refreshUserStats: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [favorites, setFavorites] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refreshUserStats = useCallback(() => {
    if (user) {
      const favJobs = JobService.getFavorites(user.id);
      setFavorites(favJobs);
      const notifs = LocalStore.getNotifications(user.id);
      setNotifications(notifs);
    } else {
      setFavorites([]);
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    const session = AuthService.getCurrentUser();
    setUser(session.user);
    setRole(session.role);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshUserStats();
  }, [user, refreshUserStats]);

  const login = async (email: string, pass: string) => {
    const session = await AuthService.login(email, pass);
    setUser(session.user);
    setRole(session.role);
  };

  const register = async (data: any) => {
    const session = await AuthService.register(data);
    setUser(session.user);
    setRole(session.role);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    setRole('user');
    setFavorites([]);
    setNotifications([]);
  };

  const updateProfile = async (updated: UserProfile) => {
    const res = await AuthService.updateProfile(updated);
    setUser(res);
  };

  const toggleFavorite = (jobId: string): boolean => {
    if (!user) return false;
    const isNowFav = JobService.toggleFavorite(user.id, jobId);
    refreshUserStats();
    return isNowFav;
  };

  const isFavorite = (jobId: string): boolean => {
    if (!user) return false;
    return JobService.isFavorite(user.id, jobId);
  };

  const markNotificationRead = (id: string) => {
    LocalStore.markNotificationAsRead(id);
    refreshUserStats();
  };

  const markAllNotificationsRead = () => {
    if (!user) return;
    LocalStore.markAllNotificationsAsRead(user.id);
    refreshUserStats();
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: Boolean(user),
        isAdmin: role === 'admin',
        isLoading,
        favorites,
        notifications,
        unreadNotificationsCount,
        login,
        register,
        logout,
        updateProfile,
        toggleFavorite,
        isFavorite,
        markNotificationRead,
        markAllNotificationsRead,
        refreshUserStats
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
