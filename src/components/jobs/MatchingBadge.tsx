import React from 'react';
import { MatchCriteriaResult } from '../../types';
import { useLanguage } from '../../i18n/context';
import { CheckCircle2, Sparkles, MapPin, GraduationCap, Briefcase } from 'lucide-react';

interface MatchingBadgeProps {
  evaluation: MatchCriteriaResult;
  compact?: boolean;
}

/**
 * Transparent Matching Criteria Badge
 * Displays purely factual, verified criteria matches with ZERO arbitrary percentages.
 */
export const MatchingBadge: React.FC<MatchingBadgeProps> = ({ evaluation, compact = false }) => {
  const { t, language } = useLanguage();

  if (!evaluation.isRecommended && evaluation.totalMatchesCount === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{t('matching_profile_recommended')}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-200 mb-1.5">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{t('matching_criteria_title')}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {evaluation.matchesSection && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
            <GraduationCap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>
              {language === 'ar' ? 'مطابق لشعبتك' : 'Filière correspondante'}
              {evaluation.matchedSectionLabel ? ` (${evaluation.matchedSectionLabel})` : ''}
            </span>
          </span>
        )}

        {evaluation.matchesLevel && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>
              {language === 'ar' ? 'المستوى المطلوب محقق' : 'Niveau d\'études requis vérifié'}
              {evaluation.matchedLevelLabel ? ` (${evaluation.matchedLevelLabel})` : ''}
            </span>
          </span>
        )}

        {evaluation.matchesGovernorate && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
            <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>
              {language === 'ar' ? 'ضمن ولايتك المفضلة' : 'Votre gouvernorat'}
              {evaluation.matchedGovernorateLabels.length > 0 ? ` (${evaluation.matchedGovernorateLabels.join(', ')})` : ''}
            </span>
          </span>
        )}

        {evaluation.matchesCategory && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
            <Briefcase className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'ar' ? 'صنف العمل المطلوب' : 'Catégorie souhaitée'}</span>
          </span>
        )}

        {evaluation.matchedSkills.length > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>
              {language === 'ar' ? 'مهارات متطابقة' : 'Compétences'} : {evaluation.matchedSkills.slice(0, 2).join(', ')}
            </span>
          </span>
        )}
      </div>
    </div>
  );
};
