import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/context';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import {
  Bell, Moon, Sun, Globe, User,
  Menu, X, ShieldAlert, LogOut, CheckCheck, Settings,
  Home, Search, Landmark, GraduationCap
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const {
    user, isAdmin, isAuthenticated, logout,
    unreadNotificationsCount, notifications,
    markNotificationRead, markAllNotificationsRead
  } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  const navLinks = [
    { key: 'home', label: t('nav_home'), icon: Home },
    { key: 'search', label: t('nav_search'), icon: Search },
    { key: 'concours', label: t('nav_concours'), icon: Landmark },
    { key: 'teaching', label: t('nav_teaching'), icon: GraduationCap },
  ];

  const closeMenu = () => setMobileMenuOpen(false);

  const go = (view: string) => {
    onNavigate(view);
    closeMenu();
  };

  // Lock page scroll while the drawer is open + close on Escape
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileMenuOpen]);

  return (
      <>
        <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-2 h-16 sm:h-20">

              {/* Logo & Platform Name */}
              <div
                  onClick={() => onNavigate('home')}
                  className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
              >
                {/* Tunisian Crescent & Star Emblem Badge */}
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-2xl bg-tunisia-red flex items-center justify-center text-white shadow-md shadow-tunisia-red/20 group-hover:scale-105 transition-transform overflow-hidden">
                  <svg viewBox="0 0 100 100" className="w-6 h-6 sm:w-7 sm:h-7 fill-white">
                    <circle cx="50" cy="50" r="38" fill="white" />
                    <circle cx="53" cy="50" r="32" fill="#E70013" />
                    <polygon points="46,47 50,51 48,56 43,53 38,56 40,51 35,47 41,47 43,41 46,47" fill="#E70013" />
                  </svg>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-extrabold text-base sm:text-xl text-slate-900 dark:text-white tracking-tight truncate">
                  {language === 'ar' ? 'توظيف تونس' : 'Tawdheef TN'}
                </span>
                    <span className="hidden sm:inline px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-tunisia-red text-white uppercase tracking-wider">
                  TN
                </span>
                  </div>
                  <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
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

              {/* Controls: Settings (Lang+Theme), Notifications, Auth */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Settings Dropdown (Language + Theme): desktop only, mobile uses the drawer */}
                <div className="relative hidden md:block">
                  <button
                      onClick={() => {
                        setSettingsDropdownOpen(!settingsDropdownOpen);
                        setNotifDropdownOpen(false);
                      }}
                      className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title={language === 'ar' ? 'الإعدادات' : 'Paramètres'}
                  >
                    <Settings className="w-4 h-4" />
                  </button>

                  {settingsDropdownOpen && (
                      <div className="absolute end-0 mt-2 w-52 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 animate-in fade-in duration-150">
                        <button
                            onClick={() => {
                              toggleLanguage();
                              setSettingsDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <Globe className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                          <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
                        </button>

                        <button
                            onClick={() => {
                              toggleTheme();
                              setSettingsDropdownOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
                          <span>{isDark ? t('theme_light') : t('theme_dark')}</span>
                        </button>
                      </div>
                  )}
                </div>

                {/* Notifications Dropdown */}
                {isAuthenticated && (
                    <div className="sm:relative">
                      <button
                          onClick={() => {
                            setNotifDropdownOpen(!notifDropdownOpen);
                            setSettingsDropdownOpen(false);
                          }}
                          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Notifications"
                      >
                        <Bell className="w-4 h-4" />
                        {unreadNotificationsCount > 0 && (
                            <span className="absolute -top-1 -end-1 w-4 h-4 rounded-full bg-tunisia-red text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadNotificationsCount}
                    </span>
                        )}
                      </button>

                      {/* Notifications Popup: pinned to viewport on mobile, anchored on desktop */}
                      {notifDropdownOpen && (
                          <div className="fixed inset-x-3 top-[4.25rem] sm:absolute sm:inset-x-auto sm:top-auto sm:end-0 sm:mt-2 sm:w-96 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-2 z-50 animate-in fade-in duration-150">
                            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between gap-2">
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

                {/* Desktop auth: user menu or login/register (hidden on mobile, moved to drawer) */}
                {isAuthenticated && user ? (
                    <div className="hidden md:flex items-center gap-1.5">
                      <button
                          onClick={() => onNavigate('dashboard')}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-800 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-semibold text-sm hover:bg-brand-100 transition-colors"
                      >
                        <User className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[120px]">{user.fullName.split(' ')[0]}</span>
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
                    <div className="hidden md:flex items-center gap-1.5">
                      <button
                          onClick={() => onNavigate('login')}
                          className="px-3 py-1.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {t('nav_login')}
                      </button>

                      <button
                          onClick={() => onNavigate('register')}
                          className="px-3.5 py-1.5 rounded-xl text-sm font-bold bg-tunisia-red hover:bg-tunisia-darkRed text-white shadow-sm transition-all"
                      >
                        {t('nav_register')}
                      </button>
                    </div>
                )}

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                    aria-label="Menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

        </header>

        {/* Mobile side drawer (outside <header> so backdrop-blur doesn't break fixed positioning) */}
        <div
            className={`md:hidden fixed inset-0 z-50 ${mobileMenuOpen ? '' : 'pointer-events-none'}`}
            aria-hidden={!mobileMenuOpen}
        >
          {/* Dimmed backdrop: tap to close */}
          <div
              onClick={closeMenu}
              className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${
                  mobileMenuOpen ? 'opacity-100' : 'opacity-0'
              }`}
          />

          {/* Panel: slides from the start side (left in FR, right in AR) */}
          <aside
              role="dialog"
              aria-modal="true"
              className={`absolute inset-y-0 start-0 w-[80%] max-w-xs bg-white dark:bg-slate-900 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
                  mobileMenuOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'
              }`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between gap-2 h-16 px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 shrink-0 rounded-2xl bg-tunisia-red flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-6 h-6">
                    <circle cx="50" cy="50" r="38" fill="white" />
                    <circle cx="53" cy="50" r="32" fill="#E70013" />
                    <polygon points="46,47 50,51 48,56 43,53 38,56 40,51 35,47 41,47 43,41 46,47" fill="#E70013" />
                  </svg>
                </div>
                <span className="font-extrabold text-base text-slate-900 dark:text-white truncate">
              {language === 'ar' ? 'توظيف تونس' : 'Tawdheef TN'}
            </span>
              </div>
              <button
                  onClick={closeMenu}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentView === link.key;
                return (
                    <button
                        key={link.key}
                        onClick={() => go(link.key)}
                        className={`w-full text-start px-3 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors ${
                            isActive
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                        }`}
                    >
                      <Icon className="w-[18px] h-[18px] shrink-0" />
                      <span className="truncate">{link.label}</span>
                    </button>
                );
              })}

              {isAdmin && (
                  <button
                      onClick={() => go('admin')}
                      className="w-full text-start px-3 py-3 rounded-xl text-sm font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 flex items-center gap-3"
                  >
                    <ShieldAlert className="w-[18px] h-[18px] shrink-0" />
                    <span>{t('nav_admin')}</span>
                  </button>
              )}

              {isAuthenticated && (
                  <button
                      onClick={() => go('dashboard')}
                      className={`w-full text-start px-3 py-3 rounded-xl text-sm font-semibold flex items-center gap-3 ${
                          currentView === 'dashboard'
                              ? 'bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300'
                              : 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40'
                      }`}
                  >
                    <User className="w-[18px] h-[18px] shrink-0" />
                    <span>{t('nav_dashboard')}</span>
                  </button>
              )}

              {/* Quick settings */}
              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                <button
                    onClick={toggleLanguage}
                    className="w-full text-start px-3 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-3"
                >
                  <Globe className="w-[18px] h-[18px] shrink-0 text-brand-600 dark:text-brand-400" />
                  <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
                </button>
                <button
                    onClick={toggleTheme}
                    className="w-full text-start px-3 py-3 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 flex items-center gap-3"
                >
                  {isDark ? <Sun className="w-[18px] h-[18px] shrink-0 text-amber-400" /> : <Moon className="w-[18px] h-[18px] shrink-0" />}
                  <span>{isDark ? t('theme_light') : t('theme_dark')}</span>
                </button>
              </div>
            </nav>

            {/* Auth actions pinned at the bottom */}
            <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800">
              {isAuthenticated ? (
                  <button
                      onClick={() => {
                        logout();
                        closeMenu();
                      }}
                      className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav_logout')}</span>
                  </button>
              ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => go('login')}
                        className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
                    >
                      {t('nav_login')}
                    </button>
                    <button
                        onClick={() => go('register')}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold bg-tunisia-red hover:bg-tunisia-darkRed text-white"
                    >
                      {t('nav_register')}
                    </button>
                  </div>
              )}
            </div>
          </aside>
        </div>
      </>
  );
};