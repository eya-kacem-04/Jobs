import React, { useState } from 'react';
import { Job } from '../../types';
import { useLanguage } from '../../i18n/context';
import { useAuth } from '../../context/AuthContext';
import { evaluateJobMatch } from '../../services/matchingService';
import { MatchingBadge } from './MatchingBadge';
import { 
  X, ExternalLink, Calendar, MapPin, Building2, GraduationCap, 
  Bookmark, Check, Share2, AlertCircle, Award, Users, BookOpen
} from 'lucide-react';
import { ACADEMIC_SECTIONS, EDUCATION_LEVELS, TUNISIAN_GOVERNORATES } from '../../constants/tunisiaData';

interface JobDetailsModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, isOpen, onClose }) => {
  const { t, language, isRTL } = useLanguage();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !job) return null;

  const fav = isFavorite(job.id);
  const evaluation = evaluateJobMatch(job, user);

  // Labels
  const sectionObj = ACADEMIC_SECTIONS.find(s => s.key === job.academicSection);
  const sectionLabel = sectionObj ? (language === 'ar' ? sectionObj.labelAr : sectionObj.labelFr) : job.academicSection;

  const levelObj = EDUCATION_LEVELS.find(l => l.key === job.educationLevel);
  const levelLabel = levelObj ? (language === 'ar' ? levelObj.labelAr : levelObj.labelFr) : job.educationLevel;

  // Governorates names
  const govNames = job.governorates.includes('all_tunisia')
    ? (language === 'ar' ? 'كامل تراب الجمهورية' : 'Toute la Tunisie')
    : job.governorates.map(g => {
        const found = TUNISIAN_GOVERNORATES.find(tg => tg.id === g);
        return found ? (language === 'ar' ? found.nameAr : found.nameFr) : g;
      }).join(', ');

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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: job.title,
          text: `Recrutement en Tunisie : ${job.title} (${job.organization || job.company})`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {}
  };

  const sectorBadgeColor = 
    job.sector === 'public' 
      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-900'
      : job.sector === 'teaching'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-900';

  const sectorLabel = 
    job.sector === 'public'
      ? (language === 'ar' ? 'مناظرة وظيفة عمومية' : 'Concours Fonction Publique')
      : job.sector === 'teaching'
      ? (language === 'ar' ? 'قطاع التعليم والتربية' : 'Enseignement & Éducation')
      : (language === 'ar' ? 'انتداب قطاع خاص' : 'Secteur Privé');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col"
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sectorBadgeColor}`}>
              {sectorLabel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {job.verificationStatus === 'verified' ? (language === 'ar' ? '✓ مصدر محقق' : '✓ Source Vérifiée') : 'En attente'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => toggleFavorite(job.id)}
              className={`p-2 rounded-xl border transition-colors ${
                fav 
                  ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500'
              }`}
              title={fav ? t('job_remove_favorite') : t('job_save_favorite')}
            >
              <Bookmark className={`w-4 h-4 ${fav ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={t('job_share')}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Title & Organization */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
              {job.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                <Building2 className="w-4 h-4 text-slate-500" />
                {job.organization || job.company}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                {govNames}
              </span>
              {job.vacanciesCount > 1 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                    <Users className="w-4 h-4" />
                    {t('job_vacancies', { count: job.vacanciesCount })}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Transparent Profile Matching Badge */}
          {user && (
            <MatchingBadge evaluation={evaluation} />
          )}

          {/* Key Facts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm">
            <div className="flex items-start gap-2.5">
              <GraduationCap className="w-4 h-4 text-brand-600 dark:text-brand-400 mt-0.5" />
              <div>
                <span className="block text-slate-500 dark:text-slate-400 text-xs">
                  {language === 'ar' ? 'الشعبة الأكاديمية المطلوبة' : 'Filière académique'}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{sectionLabel}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <span className="block text-slate-500 dark:text-slate-400 text-xs">
                  {language === 'ar' ? 'المستوى التعليمي / الشهادة' : 'Niveau de diplôme requis'}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{levelLabel}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-500 mt-0.5" />
              <div>
                <span className="block text-slate-500 dark:text-slate-400 text-xs">
                  {language === 'ar' ? 'تاريخ نشر البلاغ' : 'Date de publication'}
                </span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{job.publicationDate}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <AlertCircle className={`w-4 h-4 mt-0.5 ${isExpired ? 'text-red-500' : 'text-amber-500'}`} />
              <div>
                <span className="block text-slate-500 dark:text-slate-400 text-xs">
                  {language === 'ar' ? 'آخر أجل لقبول الترشحات' : 'Date limite de candidature'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {job.applicationDeadline || (language === 'ar' ? 'مفتوح حتى إشعار آخر' : 'Ouvert')}
                  </span>
                  {isExpired ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300 font-bold">
                      {t('job_expired')}
                    </span>
                  ) : daysRemaining !== null && daysRemaining >= 0 ? (
                    <span className="px-2 py-0.5 rounded text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-medium">
                      {t('job_deadline_days_left', { days: daysRemaining })}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Full Description */}
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              {t('job_description')}
            </h3>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 text-sm leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Required Skills & Keywords */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {t('job_required_skills')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Attribution & Integrity notice */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>{t('job_source')}</span>
              <span className="text-brand-600 dark:text-brand-400 font-bold">{job.sourceName || 'Portail Officiel'}</span>
            </div>
            <p>
              {language === 'ar'
                ? 'يتم استقاء بيانات هذا البلاغ مباشرة من الموقع الرسمي المعتمد، وتقديم الترشح يتم حصرياً عبر الرابط الرسمي المباشر.'
                : 'Les données de cette offre proviennent de la source officielle déclarée. La candidature s\'effectue directement via le portail officiel de l\'organisme.'}
            </p>
            {job.sourceUrl && (
              <a
                href={job.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-brand-600 underline text-xs font-medium mt-1"
              >
                <span>{t('job_original_url')}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm"
          >
            {language === 'ar' ? 'إغلاق' : 'Fermer'}
          </button>

          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-tunisia-red hover:bg-tunisia-darkRed text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
          >
            <span>{t('job_apply')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
