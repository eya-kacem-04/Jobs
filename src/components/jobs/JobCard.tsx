import React from 'react';
import { Job } from '../../types';
import { useLanguage } from '../../i18n/context';
import { useAuth } from '../../context/AuthContext';
import { evaluateJobMatch } from '../../services/matchingService';
import { MatchingBadge } from './MatchingBadge';
import { 
  Building2, MapPin, Calendar, Clock, Bookmark, ExternalLink, 
  GraduationCap, Users, ShieldCheck, ChevronRight, ChevronLeft 
} from 'lucide-react';
import { ACADEMIC_SECTIONS, EDUCATION_LEVELS, TUNISIAN_GOVERNORATES } from '../../constants/tunisiaData';

interface JobCardProps {
  job: Job;
  onSelect: (job: Job) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSelect }) => {
  const { t, language, isRTL } = useLanguage();
  const { user, isFavorite, toggleFavorite } = useAuth();

  const fav = isFavorite(job.id);
  const evaluation = evaluateJobMatch(job, user);

  // Academic section label
  const sectionObj = ACADEMIC_SECTIONS.find(s => s.key === job.academicSection);
  const sectionLabel = sectionObj ? (language === 'ar' ? sectionObj.labelAr : sectionObj.labelFr) : job.academicSection;

  // Level label
  const levelObj = EDUCATION_LEVELS.find(l => l.key === job.educationLevel);
  const levelLabel = levelObj ? (language === 'ar' ? levelObj.labelAr : levelObj.labelFr) : job.educationLevel;

  // Governorates names
  const govNames = job.governorates.includes('all_tunisia')
    ? (language === 'ar' ? 'كامل تراب الجمهورية' : 'Toute la Tunisie')
    : job.governorates.slice(0, 3).map(g => {
        const found = TUNISIAN_GOVERNORATES.find(tg => tg.id === g);
        return found ? (language === 'ar' ? found.nameAr : found.nameFr) : g;
      }).join(', ') + (job.governorates.length > 3 ? ` +${job.governorates.length - 3}` : '');

  // Calculate days remaining
  let daysRemaining: number | null = null;
  let isExpired = job.status === 'expired';
  if (job.applicationDeadline) {
    const diff = new Date(job.applicationDeadline).getTime() - new Date().setHours(0,0,0,0);
    daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (daysRemaining < 0) {
      isExpired = true;
    }
  }

  const sectorBadgeColor = 
    job.sector === 'public' 
      ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-900'
      : job.sector === 'teaching'
      ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-900'
      : 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900';

  const sectorLabel = 
    job.sector === 'public'
      ? (language === 'ar' ? 'مناظرة عمومية' : 'Concours Public')
      : job.sector === 'teaching'
      ? (language === 'ar' ? 'تعليم وتربية' : 'Enseignement')
      : (language === 'ar' ? 'قطاع خاص' : 'Secteur Privé');

  return (
    <div 
      className="group relative flex flex-col justify-between bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sectorBadgeColor}`}>
              {sectorLabel}
            </span>

            {job.sourceName && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span className="truncate">{job.sourceName}</span>
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(job.id);
            }}
            className={`p-2 rounded-xl transition-colors shrink-0 ${
              fav 
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900' 
                : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={fav ? t('job_remove_favorite') : t('job_save_favorite')}
          >
            <Bookmark className={`w-4 h-4 ${fav ? 'fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Title */}
        <h3 
          onClick={() => onSelect(job)}
          className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-tunisia-red dark:group-hover:text-red-400 transition-colors cursor-pointer line-clamp-2 leading-snug mb-2"
        >
          {job.title}
        </h3>

        {/* Organization / Company */}
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">{job.organization || job.company}</span>
        </div>

        {/* Tags: Section, Level & Governorates */}
        <div className="flex flex-wrap gap-1.5 mb-3 text-xs">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 font-medium">
            <GraduationCap className="w-3 h-3 text-brand-600 dark:text-brand-400" />
            <span className="truncate max-w-[170px]">{sectionLabel}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200">
            <span>{levelLabel}</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{govNames}</span>
          </span>

          {job.vacanciesCount > 1 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 font-medium">
              <Users className="w-3 h-3" />
              <span>{t('job_vacancies', { count: job.vacanciesCount })}</span>
            </span>
          )}
        </div>

        {/* Transparent Matching Criteria Badge (Factual, No Misleading Percentages) */}
        {user && (
          <MatchingBadge evaluation={evaluation} />
        )}
      </div>

      {/* Footer Area */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          {isExpired ? (
            <span className="text-red-600 dark:text-red-400 font-semibold">{t('job_expired')}</span>
          ) : daysRemaining !== null && daysRemaining >= 0 ? (
            <span className="text-amber-700 dark:text-amber-400 font-medium">
              {t('job_deadline_days_left', { days: daysRemaining })}
            </span>
          ) : (
            <span>{t('job_published', { date: job.publicationDate })}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelect(job)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span>{t('job_details')}</span>
            {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold transition-all shadow-sm"
          >
            <span>{language === 'ar' ? 'ترشح' : 'Postuler'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
