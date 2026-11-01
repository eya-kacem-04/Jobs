import React, { useState, useEffect } from 'react';
import { Job, SearchFilters } from './types';
import { LanguageProvider, useLanguage } from './i18n/context';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { JobDetailsModal } from './components/jobs/JobDetailsModal';
import { HomeView } from './views/HomeView';
import { JobsSearchView } from './views/JobsSearchView';
import { ConcoursView } from './views/ConcoursView';
import { TeachingView } from './views/TeachingView';
import { DashboardView } from './views/DashboardView';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { AdminView } from './views/AdminView';
import { JobService } from './services/jobService';
import { JobRepository } from './lib/jobRepository';

const AppContent: React.FC = () => {
  const { isRTL, language } = useLanguage();
  const { isAdmin, isLoading: authLoading, user, role } = useAuth();

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('home');
  const [searchParams, setSearchParams] = useState<Partial<SearchFilters>>({});

  // Job Details Modal state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Jobs loading state (jobs come from Supabase)
  const [jobsReady, setJobsReady] = useState(false);
  const [jobsVersion, setJobsVersion] = useState(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load jobs once the login state is known, and reload when the user or role changes
  // (admins can see more jobs than visitors).
  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;

    JobRepository.loadJobs().finally(() => {
      if (cancelled) return;
      setJobsReady(true);
      setJobsVersion(v => v + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.id, role]);

  // Show database errors (save/delete refused, loading failed...) in a red banner
  useEffect(() => {
    const onSyncError = (e: Event) => setSyncError((e as CustomEvent<string>).detail);
    window.addEventListener('tawdheef:sync-error', onSyncError);
    return () => window.removeEventListener('tawdheef:sync-error', onSyncError);
  }, []);

  // Sync hash routing for shareable public URLs (only after jobs are loaded)
  useEffect(() => {
    if (!jobsReady) return;

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      if (hash.startsWith('job/')) {
        const jobId = hash.replace('job/', '');
        const found = JobService.getJobById(jobId);
        if (found) {
          setSelectedJob(found);
          setIsModalOpen(true);
        }
      } else {
        setCurrentView(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [jobsReady]);

  const handleNavigate = (view: string, param?: any) => {
    if (view === 'detail' && typeof param === 'string') {
      const found = JobService.getJobById(param);
      if (found) {
        setSelectedJob(found);
        setIsModalOpen(true);
        window.location.hash = `job/${found.id}`;
      }
      return;
    }

    if (view === 'search' && param) {
      setSearchParams(param);
    }

    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    window.location.hash = `job/${job.id}`;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
    window.location.hash = currentView;
  };

  const isLoadingApp = authLoading || !jobsReady;

  return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased font-sans">
        {/* Top Navigation */}
        <Navbar currentView={currentView} onNavigate={handleNavigate} />

        {/* Database error banner */}
        {syncError && (
            <div
                role="alert"
                className="bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs px-4 py-2 flex items-center justify-between gap-3"
            >
              <span>{syncError}</span>
              <button
                  type="button"
                  onClick={() => setSyncError(null)}
                  aria-label="Fermer"
                  className="font-bold px-2"
              >
                ✕
              </button>
            </div>
        )}

        {/* Main Container (key = remounts the pages after jobs are reloaded) */}
        <main
            key={jobsVersion}
            className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
        >
          {isLoadingApp && (
              <div className="py-24 text-center text-sm text-slate-500 dark:text-slate-400">
                {language === 'ar' ? 'جارٍ التحميل...' : 'Chargement...'}
              </div>
          )}

          {!isLoadingApp && currentView === 'home' && (
              <HomeView onNavigate={handleNavigate} onSelectJob={handleSelectJob} />
          )}

          {!isLoadingApp && currentView === 'search' && (
              <JobsSearchView initialFilters={searchParams} onSelectJob={handleSelectJob} />
          )}

          {!isLoadingApp && currentView === 'concours' && (
              <ConcoursView onSelectJob={handleSelectJob} />
          )}

          {!isLoadingApp && currentView === 'teaching' && (
              <TeachingView onSelectJob={handleSelectJob} />
          )}

          {!isLoadingApp && currentView === 'dashboard' && (
              <DashboardView onSelectJob={handleSelectJob} onNavigate={handleNavigate} />
          )}

          {!isLoadingApp && currentView === 'login' && (
              <LoginView onNavigate={handleNavigate} />
          )}

          {!isLoadingApp && currentView === 'register' && (
              <RegisterView onNavigate={handleNavigate} />
          )}

          {/* Admin page: only for users whose role in the database is "admin" */}
          {!isLoadingApp && currentView === 'admin' && (
              isAdmin ? (
                  <AdminView onSelectJob={handleSelectJob} onNavigate={handleNavigate} />
              ) : (
                  <div className="max-w-md mx-auto text-center py-20 space-y-4">
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {language === 'ar'
                          ? 'هذه الصفحة مخصصة للمشرفين فقط'
                          : 'Accès réservé aux administrateurs'}
                    </h2>
                    <button
                        type="button"
                        onClick={() => handleNavigate(user ? 'home' : 'login')}
                        className="px-6 py-2.5 rounded-xl bg-tunisia-red hover:bg-tunisia-darkRed text-white font-bold text-sm shadow-md transition-all"
                    >
                      {user
                          ? (language === 'ar' ? 'العودة إلى الرئيسية' : 'Retour à l\'accueil')
                          : (language === 'ar' ? 'تسجيل الدخول' : 'Se connecter')}
                    </button>
                  </div>
              )
          )}
        </main>

        {/* Job Details Modal */}
        <JobDetailsModal
            job={selectedJob}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
        />

        {/* Footer */}
        <Footer onSelectGovernorate={(govId) => handleNavigate('search', { governorates: [govId] })} />
      </div>
  );
};

export const App: React.FC = () => {
  return (
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
  );
};

export default App;