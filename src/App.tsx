import React, { useState, useEffect } from 'react';
import { Job, SearchFilters } from './types';
import { LanguageProvider, useLanguage } from './i18n/context';
import { ThemeProvider } from './theme/ThemeContext';
import { AuthProvider } from './context/AuthContext';
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

const AppContent: React.FC = () => {
  const { isRTL } = useLanguage();

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('home');
  const [searchParams, setSearchParams] = useState<Partial<SearchFilters>>({});
  
  // Job Details Modal state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync hash routing for shareable public URLs
  useEffect(() => {
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
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased font-sans">
      {/* Top Navigation */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentView === 'home' && (
          <HomeView onNavigate={handleNavigate} onSelectJob={handleSelectJob} />
        )}

        {currentView === 'search' && (
          <JobsSearchView initialFilters={searchParams} onSelectJob={handleSelectJob} />
        )}

        {currentView === 'concours' && (
          <ConcoursView onSelectJob={handleSelectJob} />
        )}

        {currentView === 'teaching' && (
          <TeachingView onSelectJob={handleSelectJob} />
        )}

        {currentView === 'dashboard' && (
          <DashboardView onSelectJob={handleSelectJob} onNavigate={handleNavigate} />
        )}

        {currentView === 'login' && (
          <LoginView onNavigate={handleNavigate} />
        )}

        {currentView === 'register' && (
          <RegisterView onNavigate={handleNavigate} />
        )}

        {currentView === 'admin' && (
          <AdminView onSelectJob={handleSelectJob} onNavigate={handleNavigate} />
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
