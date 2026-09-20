import React, { useState } from 'react';
import { Job } from '../types';
import { useLanguage } from '../i18n/context';
import { JobService } from '../services/jobService';
import { JobCard } from '../components/jobs/JobCard';
import { Landmark, ExternalLink, ShieldCheck, Building2, Search, Filter } from 'lucide-react';
import { TUNISIAN_GOVERNORATES, ACADEMIC_SECTIONS } from '../constants/tunisiaData';

interface ConcoursViewProps {
  onSelectJob: (job: Job) => void;
}

export const ConcoursView: React.FC<ConcoursViewProps> = ({ onSelectJob }) => {
  const { t, language, isRTL } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [selectedGov, setSelectedGov] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  // Fetch only public sector concours
  const { jobs: allPublicJobs } = JobService.searchJobs({
    sectors: ['public'],
    onlyActive: true,
    pageSize: 100
  });

  // Client filtering for this dedicated view
  const filteredConcours = allPublicJobs.filter(job => {
    if (keyword) {
      const kw = keyword.toLowerCase();
      const match = job.title.toLowerCase().includes(kw) ||
        (job.organization || '').toLowerCase().includes(kw) ||
        job.description.toLowerCase().includes(kw);
      if (!match) return false;
    }
    if (selectedGov && !job.governorates.includes('all_tunisia') && !job.governorates.includes(selectedGov)) {
      return false;
    }
    if (selectedSection && job.academicSection !== selectedSection) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Dedicated Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
            <Landmark className="w-4 h-4 text-amber-300" />
            <span>{language === 'ar' ? 'القطاع العام والوظيفة العمومية' : 'Fonction Publique Tunisienne'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t('concours_portal_title')}
          </h1>

          <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
            {t('concours_portal_desc')}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
            <a
              href="https://www.concours.gov.tn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-rose-900 font-bold hover:bg-rose-50 transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t('concours_official_portal_link')}</span>
            </a>
            <span className="flex items-center gap-1 text-emerald-300 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>100% {language === 'ar' ? 'بلاغات رسمية موثقة' : 'Avis officiels garantis'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute inset-y-0 start-3 my-auto text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={language === 'ar' ? 'ابحث باسم الوزارة أو الخطة...' : 'Rechercher par ministère, corps ou fonction...'}
            className="w-full ps-9 pe-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          className="w-full sm:w-64 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="">{t('filter_all_sections')}</option>
          {ACADEMIC_SECTIONS.map(s => (
            <option key={s.key} value={s.key}>
              {language === 'ar' ? s.labelAr : s.labelFr}
            </option>
          ))}
        </select>

        <select
          value={selectedGov}
          onChange={(e) => setSelectedGov(e.target.value)}
          className="w-full sm:w-48 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="">{t('filter_all_tunisia')}</option>
          {TUNISIAN_GOVERNORATES.map(g => (
            <option key={g.id} value={g.id}>
              {language === 'ar' ? g.nameAr : g.nameFr}
            </option>
          ))}
        </select>
      </div>

      {/* Concours Grid */}
      <div className="space-y-4">
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {language === 'ar' 
            ? `المناظرات المفتوحة (${filteredConcours.length})` 
            : `Concours officiels en cours (${filteredConcours.length})`}
        </div>

        {filteredConcours.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
            {t('filter_no_results')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredConcours.map(job => (
              <JobCard key={job.id} job={job} onSelect={onSelectJob} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
