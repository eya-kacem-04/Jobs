import React, { useState } from 'react';
import { Job } from '../types';
import { useLanguage } from '../i18n/context';
import { JobService } from '../services/jobService';
import { JobCard } from '../components/jobs/JobCard';
import { BookOpen, Search, GraduationCap, School, Sparkles } from 'lucide-react';
import { ACADEMIC_SECTIONS, TUNISIAN_GOVERNORATES } from '../constants/tunisiaData';

interface TeachingViewProps {
  onSelectJob: (job: Job) => void;
}

export const TeachingView: React.FC<TeachingViewProps> = ({ onSelectJob }) => {
  const { t, language, isRTL } = useLanguage();
  const [keyword, setKeyword] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGov, setSelectedGov] = useState('');
  const [publicPrivateFilter, setPublicPrivateFilter] = useState<'all' | 'public' | 'private'>('all');

  // Fetch all teaching jobs
  const { jobs: allTeachingJobs } = JobService.searchJobs({
    sectors: ['teaching'],
    onlyActive: true,
    pageSize: 100
  });

  const filteredTeaching = allTeachingJobs.filter(job => {
    if (keyword) {
      const kw = keyword.toLowerCase();
      const match = job.title.toLowerCase().includes(kw) ||
        (job.organization || '').toLowerCase().includes(kw) ||
        (job.company || '').toLowerCase().includes(kw) ||
        job.description.toLowerCase().includes(kw);
      if (!match) return false;
    }
    if (selectedSubject && job.academicSection !== selectedSubject) {
      return false;
    }
    if (selectedGov && !job.governorates.includes('all_tunisia') && !job.governorates.includes(selectedGov)) {
      return false;
    }
    if (publicPrivateFilter === 'public' && !job.organization) return false;
    if (publicPrivateFilter === 'private' && !job.company) return false;

    return true;
  });

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white">
            <School className="w-4 h-4 text-amber-200" />
            <span>{language === 'ar' ? 'فضاء المدرسين والمربين' : 'Espace Recrutement Enseignement'}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            {t('teaching_portal_title')}
          </h1>

          <p className="text-amber-100 text-sm sm:text-base leading-relaxed">
            {t('teaching_portal_desc')}
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-xs font-medium">
              {language === 'ar' ? 'التعليم الابتدائي (معلمون)' : 'Primaire (Instituteurs)'}
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-xs font-medium">
              {language === 'ar' ? 'التعليم الثانوي (أساتذة)' : 'Secondaire (Professeurs)'}
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-xs font-medium">
              {language === 'ar' ? 'التعليم العالي (مساعدون وباحثون)' : 'Supérieur (Assistants & Maîtres)'}
            </span>
            <span className="px-3 py-1 rounded-lg bg-white/15 backdrop-blur-xs font-medium">
              {language === 'ar' ? 'التعليم الخاص والتكوين' : 'Enseignement Privé'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute inset-y-0 start-3 my-auto text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={language === 'ar' ? 'ابحث حسب المادة أو المؤسسة...' : 'Matière, spécialité, lycée ou école...'}
              className="w-full ps-9 pe-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">{t('teaching_filter_by_subject')}</option>
            {ACADEMIC_SECTIONS.map(s => (
              <option key={s.key} value={s.key}>
                {language === 'ar' ? s.labelAr : s.labelFr}
              </option>
            ))}
          </select>

          <select
            value={selectedGov}
            onChange={(e) => setSelectedGov(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">{t('filter_all_tunisia')}</option>
            {TUNISIAN_GOVERNORATES.map(g => (
              <option key={g.id} value={g.id}>
                {language === 'ar' ? g.nameAr : g.nameFr}
              </option>
            ))}
          </select>
        </div>

        {/* Public vs Private filter pills */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">{language === 'ar' ? 'نوع المؤسسة :' : 'Type :'}</span>
          <button
            onClick={() => setPublicPrivateFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              publicPrivateFilter === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'Tous'}
          </button>
          <button
            onClick={() => setPublicPrivateFilter('public')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              publicPrivateFilter === 'public'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {language === 'ar' ? 'التعليم العمومي (وزارة التربية / التعليم العالي)' : 'Enseignement Public'}
          </button>
          <button
            onClick={() => setPublicPrivateFilter('private')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              publicPrivateFilter === 'private'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {language === 'ar' ? 'التعليم الخاص والتكوين' : 'Enseignement Privé'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="space-y-4">
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {language === 'ar' 
            ? `العروض المتوفرة (${filteredTeaching.length})` 
            : `Opportunités d'enseignement (${filteredTeaching.length})`}
        </div>

        {filteredTeaching.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
            {t('filter_no_results')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTeaching.map(job => (
              <JobCard key={job.id} job={job} onSelect={onSelectJob} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
