import React, { useState } from 'react';
import { useLanguage } from '../../i18n/context';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, Bell, Moon, Sun, Globe, User, Bookmark, 
  Menu, X, ShieldAlert, LogOut, CheckCheck, ExternalLink, Sparkles 
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { user, isAdmin, isAuthenticated, logout, unreadNotificationsCount, notifications, markNotificationRead, markAllNotificationsRead } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  const navLinks = [
    { key: 'home', label: t('nav_home') },
    { key: 'search', label: t('nav_search') },
    { key: 'concours', label: t('nav_concours'), badge: language === 'ar' ? 'رسمي' : 'Officiel', badgeColor: 'bg-rose-500' },
    { key: 'teaching', label: t('nav_teaching'), badge: language === 'ar' ? 'تعليم' : 'Éducation', badgeColor: 'bg-amber-500' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Platform Name */}
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            {/* Tunisian Crescent & Star Emblem Badge */}
            <div className="relative w-10 h-10 rounded-2xl bg-tunisia-red flex items-center justify-center text-white shadow-md shadow-tunisia-red/20 group-hover:scale-105 transition-transform overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-7 h-7 fill-white">
                <circle cx="50" cy="50" r="38" fill="white" />
                <circle cx="53" cy="50" r="32" fill="#E70013" />
                <polygon points="46,47 50,51 48,56 43,53 38,56 40,51 35,47 41,47 43,41 46,47" fill="#E70013" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  {language === 'ar' ? 'توظيف تونس' : 'Tawdheef TN'}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-tunisia-red text-white uppercase tracking-wider">
                  TN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                {language === 'ar' ? 'البوابة الوطنية للمناظرات والتشغيل' : 'Portail National Recrutement & Concours'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentView === link.key;
              return (
                <button
                  key={link.key}
                  onClick={() => onNavigate(link.key)}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${link.badgeColor}`}>
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  currentView === 'admin'
                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>{t('nav_admin')}</span>
              </button>
            )}
          </nav>

          {/* Controls: Lang, Theme, Notifications, Auth */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title={language === 'fr' ? 'Changer en Arabe' : 'Passer en Français'}
            >
              <Globe className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span className="hidden sm:inline">{language === 'fr' ? 'العربية' : 'Français'}</span>
              <span className="sm:hidden uppercase">{language === 'fr' ? 'AR' : 'FR'}</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isDark ? t('theme_light') : t('theme_dark')}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-tunisia-red text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popup */}
                {notifDropdownOpen && (
                  <div 
                    className="absolute end-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 animate-in fade-in duration-150"
                  >
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Notifications ({notifications.length})
                      </span>
                      {unreadNotificationsCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[11px] font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>{t('notifications_mark_all_read')}</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                          {t('notifications_empty')}
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.jobId) onNavigate('detail', n.jobId);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-3 text-xs cursor-pointer transition-colors ${
                              !n.read 
                                ? 'bg-brand-50/50 dark:bg-brand-950/20 font-medium' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <div className="font-semibold text-slate-900 dark:text-white mb-1">
                              {n.title}
                            </div>
                            <p className="line-clamp-2 text-slate-500 dark:text-slate-400">
                              {n.message}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Authenticated User Menu or Login/Register */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-semibold text-xs sm:text-sm hover:bg-brand-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline truncate max-w-[120px]">{user.fullName.split(' ')[0]}</span>
                  <span className="lg:hidden">{t('nav_dashboard')}</span>
                </button>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title={t('nav_logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('nav_login')}
                </button>

                <button
                  onClick={() => onNavigate('register')}
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-tunisia-red hover:bg-tunisia-darkRed text-white shadow-sm transition-all"
                >
                  {t('nav_register')}
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <button
              key={link.key}
              onClick={() => {
                onNavigate(link.key);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-start px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                currentView === link.key
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{link.label}</span>
              {link.badge && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${link.badgeColor}`}>
                  {link.badge}
                </span>
              )}
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => {
                onNavigate('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full text-start px-4 py-2.5 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t('nav_admin')}</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => {
                onNavigate('dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-start px-4 py-2.5 rounded-xl text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>{t('nav_dashboard')}</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
