import React, { useState } from 'react';
import { Job, AcademicSectionKey, EducationLevelKey } from '../types';
import { useLanguage } from '../i18n/context';
import { useAuth } from '../context/AuthContext';
import { JobService } from '../services/jobService';
import { JobCard } from '../components/jobs/JobCard';
import { 
  Search, ShieldCheck, MapPin, Building, GraduationCap, 
  ChevronRight, ChevronLeft, Sparkles, BookOpen, Landmark, ArrowRight,
  TrendingUp, Laptop, Binary, Scale, HeartPulse, Cpu, PenTool
} from 'lucide-react';
import { ACADEMIC_SECTIONS, EDUCATION_LEVELS, TUNISIAN_GOVERNORATES, OFFICIAL_TUNISIAN_SOURCES } from '../constants/tunisiaData';

interface HomeViewProps {
  onNavigate: (view: string, param?: any) => void;
  onSelectJob: (job: Job) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectJob }) => {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();

  // Search Bar state
  const [keyword, setKeyword] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [selectedGov, setSelectedGov] = useState<string>('');

  // Fetch sections
  const concoursJobs = JobService.getPublicConcours(3);
  const teachingJobs = JobService.getTeachingJobs(3);
  const recentJobs = JobService.getRecentJobs(6);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('search', {
      keyword,
      academicSections: selectedSection ? [selectedSection as AcademicSectionKey] : [],
      educationLevels: selectedLevel ? [selectedLevel as EducationLevelKey] : [],
      governorates: selectedGov ? [selectedGov] : []
    });
  };

  const getSectionIcon = (iconName: string) => {
    switch (iconName) {
      case 'Laptop': return <Laptop className="w-5 h-5 text-blue-500" />;
      case 'Binary': return <Binary className="w-5 h-5 text-indigo-500" />;
      case 'Scale': return <Scale className="w-5 h-5 text-amber-500" />;
      case 'HeartPulse': return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-emerald-500" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-cyan-500" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-purple-500" />;
      default: return <GraduationCap className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-14 sm:pt-14 sm:pb-20 bg-gradient-to-b from-red-50/60 via-slate-50 to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 rounded-3xl border border-red-100/50 dark:border-slate-800">
        
        {/* Decorative subtle background accents */}
        <div className="absolute top-0 end-0 -mt-12 -me-12 w-96 h-96 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 start-0 -mb-12 -ms-12 w-80 h-80 bg-brand-500/10 dark:bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          
          {/* Top Verification Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs text-xs font-semibold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-tunisia-red" />
            <span>{t('hero_verified_badge')}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight">
            {t('hero_title')}
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {t('hero_subtitle')}
          </p>

          {/* Unified Search Box */}
          <form 
            onSubmit={handleHeroSearch}
            className="mt-8 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 text-start space-y-3"
          >
            {/* Keyword Input */}
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
                <Search className="w-5 h-5 text-tunisia-red" />
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder={t('hero_search_placeholder')}
                className="w-full ps-11 pe-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base outline-none focus:ring-2 focus:ring-tunisia-red focus:border-tunisia-red transition-all"
              />
            </div>

            {/* Quick Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Academic Section */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">{t('hero_academic_label')}</option>
                {ACADEMIC_SECTIONS.map(s => (
                  <option key={s.key} value={s.key}>
                    {language === 'ar' ? s.labelAr : s.labelFr}
                  </option>
                ))}
              </select>

              {/* Education Level */}
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">{t('hero_level_label')}</option>
                {EDUCATION_LEVELS.map(l => (
                  <option key={l.key} value={l.key}>
                    {language === 'ar' ? l.labelAr : l.labelFr}
                  </option>
                ))}
              </select>

              {/* Governorate */}
              <select
                value={selectedGov}
                onChange={(e) => setSelectedGov(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">{t('hero_governorate_label')} (24)</option>
                {TUNISIAN_GOVERNORATES.map(g => (
                  <option key={g.id} value={g.id}>
                    {language === 'ar' ? g.nameAr : g.nameFr}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'ar' ? 'أكثر المجالات طلباً :' : 'Populaire :'}
                </span>
                {['computer_science', 'mathematics', 'engineering', 'economics', 'languages'].map(secKey => {
                  const s = ACADEMIC_SECTIONS.find(item => item.key === secKey);
                  return s ? (
                    <button
                      key={secKey}
                      type="button"
                      onClick={() => onNavigate('search', { academicSections: [secKey] })}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {language === 'ar' ? s.labelAr.split(' ')[0] : s.labelFr.split(' ')[0]}
                    </button>
                  ) : null;
                })}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-tunisia-red hover:bg-tunisia-darkRed text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{t('hero_search_button')}</span>
              </button>
            </div>
          </form>

          {/* Call to Action for Profile Matching */}
          {!user && (
            <div className="pt-2">
              <button
                onClick={() => onNavigate('register')}
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-700 dark:text-brand-400 hover:underline"
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>{t('hero_cta_register')}</span>
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          )}

        </div>
      </section>

      {/* 2. KEY PILLARS & STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-tunisia-red flex items-center justify-center font-black text-xl">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">8+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('stat_sources')}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-black text-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">24</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('stat_govs')}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-black text-xl">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">18+</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('stat_sections')}</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-black text-xl">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">100%</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {language === 'ar' ? 'روابط تقديم رسمية' : 'Liens Officiels'}
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEDICATED SECTION: CONCOURS PUBLICS (FUNCTION PUBLIQUE) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 mb-2">
              <Landmark className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'مناظرات الوظيفة العمومية' : 'Secteur Public & Ministères'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('section_concours_title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {t('section_concours_subtitle')}
            </p>
          </div>

          <button
            onClick={() => onNavigate('concours')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-tunisia-red hover:underline shrink-0"
          >
            <span>{t('view_all')}</span>
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {concoursJobs.map(job => (
            <JobCard key={job.id} job={job} onSelect={onSelectJob} />
          ))}
        </div>
      </section>

      {/* 4. DEDICATED SECTION: TEACHING & EDUCATION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'قطاع التعليم والتربية والتكوين' : 'Éducation & Formation'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('section_teaching_title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {t('section_teaching_subtitle')}
            </p>
          </div>

          <button
            onClick={() => onNavigate('teaching')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
          >
            <span>{t('view_all')}</span>
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {teachingJobs.map(job => (
            <JobCard key={job.id} job={job} onSelect={onSelectJob} />
          ))}
        </div>
      </section>

      {/* 5. EXPLORE BY ACADEMIC DISCIPLINE GRID */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('section_categories_title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'ar'
              ? 'تغطي المنصة كافة الاختصاصات الأكاديمية وليس الإعلامية فقط : الرياضيات، العلوم، القانون، اللغات، الاقتصاد...'
              : 'Toutes les disciplines académiques couvertes : Mathématiques, Sciences, Droit, Lettres, Économie, Ingénierie...'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {ACADEMIC_SECTIONS.slice(0, 12).map(sec => (
            <div
              key={sec.key}
              onClick={() => onNavigate('search', { academicSections: [sec.key] })}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-brand-500 dark:hover:border-brand-400 cursor-pointer shadow-xs hover:shadow-md transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {getSectionIcon(sec.iconName)}
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
                {language === 'ar' ? sec.labelAr : sec.labelFr}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {language === 'ar' ? sec.descriptionAr : sec.descriptionFr}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. RECENT OPPORTUNITIES ACROSS ALL SECTORS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t('section_recent_title')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('section_recent_subtitle')}
            </p>
          </div>

          <button
            onClick={() => onNavigate('search')}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 dark:text-brand-400 hover:underline shrink-0"
          >
            <span>{t('view_all')}</span>
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentJobs.map(job => (
            <JobCard key={job.id} job={job} onSelect={onSelectJob} />
          ))}
        </div>
      </section>

      {/* 7. TRANSPARENT USER JOURNEY BANNER */}
      <section className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-tunisia-red text-white uppercase tracking-wider">
            {language === 'ar' ? 'المسار الواضح' : 'Parcours Simplifié'}
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            {language === 'ar'
              ? 'ابحث ← صفِّ النتائج ← اطلع على الشروط ← قدّم عبر الرابط الرسمي'
              : 'Chercher → Filtrer → Voir l\'Offre → Postuler Officiellement'}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {language === 'ar'
              ? 'منصة توظيف تونس لا تطلب أي مقابل مالي ولا تعيد نشر طلبات توظيف غير رسمية. نربطك مباشرة بالمصدر الرسمي لكل مناظرة وعرض شغل.'
              : 'Tawdheef TN ne demande aucun paiement et n\'invente aucun concours. Vous êtes directement orienté vers le portail officiel de chaque organisme.'}
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('search')}
              className="px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-sm shadow-md transition-all"
            >
              {language === 'ar' ? 'تصفح جميع الفرص' : 'Explorer les offres'}
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all"
            >
              {t('nav_register')}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
