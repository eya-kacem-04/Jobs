import React, { useState, useEffect } from 'react';
import { Job, SearchFilters } from '../types';
import { useLanguage } from '../i18n/context';
import { useAuth } from '../context/AuthContext';
import { JobService } from '../services/jobService';
import { JobCard } from '../components/jobs/JobCard';
import { SearchFiltersComponent } from '../components/jobs/SearchFilters';
import { Briefcase, ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

interface JobsSearchViewProps {
  initialFilters?: Partial<SearchFilters>;
  onSelectJob: (job: Job) => void;
}

const DEFAULT_FILTERS: SearchFilters = {
  keyword: '',
  academicSections: [],
  educationLevels: [],
  professionalCategories: [],
  sectors: [],
  governorates: [],
  jobTypes: [],
  onlyActive: true,
  sortBy: 'date',
  page: 1,
  pageSize: 9
};

export const JobsSearchView: React.FC<JobsSearchViewProps> = ({ initialFilters, onSelectJob }) => {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();

  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
    sortBy: user ? 'relevance' : 'date'
  });

  // Sync when initialFilters changes (e.g., navigated from Home hero search)
  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters,
        page: 1
      }));
    }
  }, [initialFilters]);

  // Execute query
  const { jobs, total } = JobService.searchJobs(filters, user);
  const totalPages = Math.ceil(total / filters.pageSize) || 1;

  const handleReset = () => {
    setFilters({ ...DEFAULT_FILTERS, sortBy: user ? 'relevance' : 'date' });
  };

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('nav_search')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('filter_results_count', { count: total })}
        </p>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filters Sidebar / Top component */}
        <div className="lg:col-span-1">
          <SearchFiltersComponent
            filters={filters}
            onChange={(updated) => setFilters(updated)}
            onReset={handleReset}
            totalResults={total}
          />
        </div>

        {/* Results Column */}
        <div className="lg:col-span-3 space-y-6">
          {jobs.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {t('filter_no_results')}
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {language === 'ar'
                  ? 'جرب توسيع معايير البحث، اختيار ولايات أخرى أو إلغاء تصفية الشعبة الأكاديمية.'
                  : 'Essayez d\'élargir vos critères, de sélectionner d\'autres gouvernorats ou de réinitialiser vos filtres.'}
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-sm hover:opacity-90"
              >
                {t('filter_reset')}
              </button>
            </div>
          ) : (
            <>
              {/* Jobs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onSelect={onSelectJob} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pt-6 flex items-center justify-center gap-2">
                  <button
                    disabled={filters.page <= 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                  </button>

                  <div className="flex items-center gap-1 text-sm font-semibold">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setFilters(prev => ({ ...prev, page: p }))}
                        className={`w-9 h-9 rounded-xl transition-all ${
                          filters.page === p
                            ? 'bg-tunisia-red text-white shadow-sm'
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={filters.page >= totalPages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};
