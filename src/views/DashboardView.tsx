import React, { useState } from 'react';
import { Job, UserProfile, AcademicSectionKey, EducationLevelKey, ProfessionalCategoryKey } from '../types';
import { useLanguage } from '../i18n/context';
import { useAuth } from '../context/AuthContext';
import { JobService } from '../services/jobService';
import { JobCard } from '../components/jobs/JobCard';
import { 
  User, Bookmark, Bell, Sparkles, Settings, Check, 
  MapPin, GraduationCap, Award, Briefcase, CheckCheck, Trash2 
} from 'lucide-react';
import { ACADEMIC_SECTIONS, EDUCATION_LEVELS, TUNISIAN_GOVERNORATES } from '../constants/tunisiaData';

interface DashboardViewProps {
  onSelectJob: (job: Job) => void;
  onNavigate: (view: string, param?: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectJob, onNavigate }) => {
  const { t, language, isRTL } = useLanguage();
  const { 
    user, 
    favorites, 
    notifications, 
    updateProfile, 
    markNotificationRead, 
    markAllNotificationsRead 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'recommendations' | 'favorites' | 'notifications' | 'profile'>('recommendations');
  const [profileSaved, setProfileSaved] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [academicSection, setAcademicSection] = useState<AcademicSectionKey>(user?.academicSection || 'computer_science');
  const [educationLevel, setEducationLevel] = useState<EducationLevelKey>(user?.educationLevel || 'licence');
  const [preferredGovs, setPreferredGovs] = useState<string[]>(user?.preferredGovernorates || ['Tunis']);
  const [skillsStr, setSkillsStr] = useState(user?.skills?.join(', ') || '');
  const [interestsStr, setInterestsStr] = useState(user?.professionalInterests?.join(', ') || '');
  const [notifInApp, setNotifInApp] = useState(user?.notificationPreferences?.inApp ?? true);

  if (!user) {
    return (
      <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-md mx-auto space-y-4">
        <User className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          {language === 'ar' ? 'يرجى تسجيل الدخول' : 'Connexion requise'}
        </h2>
        <p className="text-sm text-slate-500">
          {language === 'ar' 
            ? 'سجل دخولك أو أنشئ حساباً لمتابعة الفرص المناسبة لمؤهلاتك ومفضلتك.' 
            : 'Connectez-vous pour accéder à vos recommandations ciblées et vos offres enregistrées.'}
        </p>
        <button
          onClick={() => onNavigate('login')}
          className="w-full py-2.5 rounded-xl bg-tunisia-red text-white font-bold text-sm shadow-sm hover:bg-tunisia-darkRed"
        >
          {t('nav_login')}
        </button>
      </div>
    );
  }

  // Get recommendations
  const recommendedJobs = JobService.getRecommendedJobs(user, 12);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      fullName: fullName.trim(),
      academicSection,
      educationLevel,
      preferredGovernorates: preferredGovs,
      skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean),
      professionalInterests: interestsStr.split(',').map(s => s.trim()).filter(Boolean),
      notificationPreferences: {
        ...user.notificationPreferences,
        inApp: notifInApp
      }
    };

    await updateProfile(updated);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const toggleGov = (govId: string) => {
    if (preferredGovs.includes(govId)) {
      if (preferredGovs.length > 1) {
        setPreferredGovs(preferredGovs.filter(g => g !== govId));
      }
    } else {
      setPreferredGovs([...preferredGovs, govId]);
    }
  };

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>{language === 'ar' ? 'فضاء المترشح' : 'Espace Candidat'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('dashboard_welcome', { name: user.fullName })}
          </h1>

          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-brand-400" />
              <span>{ACADEMIC_SECTIONS.find(s => s.key === user.academicSection)?.labelFr || user.academicSection}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{EDUCATION_LEVELS.find(l => l.key === user.educationLevel)?.labelFr || user.educationLevel}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>{user.preferredGovernorates.join(', ')}</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('profile')}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Settings className="w-4 h-4" />
          <span>{t('profile_edit_title')}</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'recommendations'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>{t('dashboard_tab_recommendations')}</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            {recommendedJobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4 text-rose-500" />
          <span>{t('dashboard_tab_favorites', { count: favorites.length })}</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-500" />
          <span>{t('dashboard_tab_notifications', { count: notifications.length })}</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t('dashboard_tab_profile')}</span>
        </button>
      </div>

      {/* Tab 1: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <p>
              {language === 'ar'
                ? 'يتم ترتيب هذه العروض بناءً على معاييرك الخمسة الحقيقية: شعبتك الأكاديمية، مستواك التعليمي، صنف العمل، ولاياتك المفضلة، وكفاءاتك، دون أي نسبة مئوية وهمية.'
                : 'Ces opportunités sont priorisées en fonction de vos 5 critères concrets : filière d\'études, diplôme, catégorie, gouvernorats et compétences. Aucun pourcentage arbitraire n\'est affiché.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedJobs.map(job => (
              <JobCard key={job.id} job={job} onSelect={onSelectJob} />
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Favorites */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {favorites.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p>{language === 'ar' ? 'لم تقم بحفظ أي عرض حتى الآن.' : 'Aucune offre enregistrée pour le moment.'}</p>
              <button
                onClick={() => onNavigate('search')}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
              >
                {language === 'ar' ? 'تصفح العروض والمناظرات' : 'Explorer les offres'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {favorites.map(job => (
                <JobCard key={job.id} job={job} onSelect={onSelectJob} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {language === 'ar' ? 'سجل الإشعارات والتنبيهات' : 'Historique des notifications'}
            </h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{t('notifications_mark_all_read')}</span>
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              {t('notifications_empty')}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationRead(notif.id);
                    if (notif.jobId) {
                      const found = JobService.getJobById(notif.jobId);
                      if (found) onSelectJob(found);
                    }
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                    !notif.read ? 'bg-brand-50/60 dark:bg-brand-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                      {notif.title}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(notif.createdAt).toLocaleString(language === 'ar' ? 'ar-TN' : 'fr-FR')}
                    </span>
                  </div>

                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-tunisia-red shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Academic Profile Edit */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 shadow-sm max-w-2xl">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('profile_edit_title')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'ar'
                ? 'تُستخدم هذه المعايير لتصفية وفرز المناظرات والعروض وتوجيه إشعارات فورية لملفك.'
                : 'Ces paramètres alimentent le moteur de recommandation et déterminent les alertes que vous recevrez.'}
            </p>
          </div>

          {profileSaved && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{t('profile_save_success')}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {t('profile_fullname')}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {t('profile_email')}
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {t('profile_academic_section')}
              </label>
              <select
                value={academicSection}
                onChange={(e) => setAcademicSection(e.target.value as AcademicSectionKey)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                {ACADEMIC_SECTIONS.map(s => (
                  <option key={s.key} value={s.key}>
                    {language === 'ar' ? s.labelAr : s.labelFr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {t('profile_education_level')}
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevelKey)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                {EDUCATION_LEVELS.map(l => (
                  <option key={l.key} value={l.key}>
                    {language === 'ar' ? l.labelAr : l.labelFr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred Governorates Multi-Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
              {t('profile_preferred_governorates')} ({preferredGovs.length} {language === 'ar' ? 'مختارة' : 'sélectionnés'})
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              {TUNISIAN_GOVERNORATES.map(gov => {
                const isSelected = preferredGovs.includes(gov.id);
                return (
                  <button
                    key={gov.id}
                    type="button"
                    onClick={() => toggleGov(gov.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-tunisia-red text-white font-bold'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {language === 'ar' ? gov.nameAr : gov.nameFr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Skills & Interests */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {t('profile_skills')}
              </label>
              <input
                type="text"
                value={skillsStr}
                onChange={(e) => setSkillsStr(e.target.value)}
                placeholder="Ex: Analyse mathématique, React, Didactique, Droit fiscal..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                {t('profile_interests')}
              </label>
              <input
                type="text"
                value={interestsStr}
                onChange={(e) => setInterestsStr(e.target.value)}
                placeholder="Ex: Enseignement secondaire, Concours fonction publique, Startups..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Notification toggles */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={notifInApp}
                onChange={(e) => setNotifInApp(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              <span>{language === 'ar' ? 'تفعيل الإشعارات الفورية عند نزول مناظرات وعروض مطابقة' : 'Activer les notifications automatiques pour les nouveaux concours correspondants'}</span>
            </label>
          </div>

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            {t('profile_save_btn')}
          </button>
        </form>
      )}
    </div>
  );
};
