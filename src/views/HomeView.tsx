import React from 'react';
import { useLanguage } from '../i18n/context';
import { useAuth } from '../context/AuthContext';

import {
  ShieldCheck,
  MapPin,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BookOpen,
  Landmark,
  TrendingUp,
  Laptop,
  Binary,
  Scale,
  HeartPulse,
  Cpu,
} from 'lucide-react';

import { ACADEMIC_SECTIONS } from '../constants/tunisiaData';

interface HomeViewProps {
  onNavigate: (view: string, param?: any) => void;
  onSelectJob: (job: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
                                                    onNavigate,
                                                    onSelectJob,
                                                  }) => {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();

  // Icons for academic sections
  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop':
        return <Laptop className="w-5 h-5 text-blue-500" />;

      case 'Binary':
        return <Binary className="w-5 h-5 text-indigo-500" />;

      case 'Scale':
        return <Scale className="w-5 h-5 text-amber-500" />;

      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;

      case 'Cpu':
        return <Cpu className="w-5 h-5 text-emerald-500" />;

      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5 text-cyan-500" />;

      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-purple-500" />;

      default:
        return <GraduationCap className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
      <div
          className="w-full max-w-full min-w-0 space-y-12 sm:space-y-24"
          dir={isRTL ? 'rtl' : 'ltr'}
      >

        {/* ===================================================== */}
        {/* 1. HERO SECTION */}
        {/* ===================================================== */}

        <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-20 bg-gradient-to-b from-red-50/60 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 rounded-3xl border border-red-100/50 dark:border-slate-800">

          {/* Decorative background accents */}
          <div className="absolute top-0 end-0 -mt-12 -me-12 w-64 h-64 sm:w-96 sm:h-96 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute bottom-0 start-0 -mb-12 -ms-12 w-56 h-56 sm:w-80 sm:h-80 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5 sm:space-y-6">

            {/* Verification Badge */}
            <div className="inline-flex max-w-full items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-xs font-semibold text-slate-800 dark:text-slate-200">

              <ShieldCheck className="w-4 h-4 shrink-0 text-tunisia-red" />

              <span className="min-w-0 break-words">
              {t('hero_verified_badge')}
            </span>

              <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            {/* Main Title */}
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight break-words">
              {t('hero_title')}
            </h1>

            {/* Subtitle */}
            <p className="max-w-3xl mx-auto text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal break-words">
              {t('hero_subtitle')}
            </p>

            {/* Register CTA */}
            {!user && (
                <div className="pt-2">
                  <button
                      onClick={() => onNavigate('register')}
                      className="inline-flex max-w-full items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-brand-700 dark:text-brand-400 hover:underline"
                  >
                    <Sparkles className="w-4 h-4 shrink-0 text-brand-600" />

                    <span className="min-w-0 break-words">
                  {t('hero_cta_register')}
                </span>

                    {isRTL ? (
                        <ChevronLeft className="w-4 h-4 shrink-0" />
                    ) : (
                        <ChevronRight className="w-4 h-4 shrink-0" />
                    )}
                  </button>
                </div>
            )}

          </div>
        </section>

        {/* ===================================================== */}
        {/* 3. EXPLORE BY ACADEMIC DISCIPLINE */}
        {/* ===================================================== */}

        <section className="space-y-6 min-w-0">

          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight break-words">
              {t('section_categories_title')}
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 break-words">
              {language === 'ar'
                  ? 'تغطي المنصة كافة الاختصاصات الأكاديمية وليس الإعلامية فقط : الرياضيات، العلوم، القانون، اللغات، الاقتصاد...'
                  : 'Toutes les disciplines académiques couvertes : Mathématiques, Sciences, Droit, Lettres, Économie, Ingénierie...'}
            </p>
          </div>


          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3.5">

            {ACADEMIC_SECTIONS.slice(0, 12).map((sec) => (
                <div
                    key={sec.key}
                    onClick={() =>
                        onNavigate('search', {
                          academicSections: [sec.key],
                        })
                    }
                    className="min-w-0 p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-brand-500 dark:hover:border-brand-400 cursor-pointer shadow-xs hover:shadow-md transition-all group"
                >

                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {getSectionIcon(sec.iconName)}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                    {language === 'ar'
                        ? sec.labelAr
                        : sec.labelFr}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {language === 'ar'
                        ? sec.descriptionAr
                        : sec.descriptionFr}
                  </p>

                </div>
            ))}

          </div>
        </section>

      </div>
  );
};