import React, { useState } from 'react';
import { AcademicSectionKey, EducationLevelKey } from '../types';
import { useLanguage } from '../i18n/context';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, GraduationCap, Award, MapPin, AlertCircle } from 'lucide-react';
import { ACADEMIC_SECTIONS, EDUCATION_LEVELS, TUNISIAN_GOVERNORATES } from '../constants/tunisiaData';

interface RegisterViewProps {
  onNavigate: (view: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onNavigate }) => {
  const { t, language, isRTL } = useLanguage();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [academicSection, setAcademicSection] = useState<AcademicSectionKey>('computer_science');
  const [educationLevel, setEducationLevel] = useState<EducationLevelKey>('licence');
  const [selectedGovs, setSelectedGovs] = useState<string[]>(['Tunis']);
  const [skills, setSkills] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError(language === 'ar' ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف' : 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (selectedGovs.length === 0) {
      setError(language === 'ar' ? 'يرجى اختيار ولاية واحدة على الأقل' : 'Veuillez sélectionner au moins un gouvernorat');
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName,
        email,
        password,
        academicSection,
        educationLevel,
        preferredGovernorates: selectedGovs,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const toggleGov = (govId: string) => {
    if (selectedGovs.includes(govId)) {
      if (selectedGovs.length > 1) {
        setSelectedGovs(selectedGovs.filter(g => g !== govId));
      }
    } else {
      setSelectedGovs([...selectedGovs, govId]);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 sm:py-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('auth_register_title')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('auth_register_desc')}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('profile_fullname')}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute inset-y-0 start-3 my-auto text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Mohamed Ben Ali"
                className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('auth_email_label')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute inset-y-0 start-3 my-auto text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.tn"
                  className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('auth_password_label')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute inset-y-0 start-3 my-auto text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('profile_academic_section')}
              </label>
              <select
                value={academicSection}
                onChange={(e) => setAcademicSection(e.target.value as AcademicSectionKey)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                {ACADEMIC_SECTIONS.map(s => (
                  <option key={s.key} value={s.key}>
                    {language === 'ar' ? s.labelAr : s.labelFr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('profile_education_level')}
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevelKey)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
              >
                {EDUCATION_LEVELS.map(l => (
                  <option key={l.key} value={l.key}>
                    {language === 'ar' ? l.labelAr : l.labelFr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('profile_preferred_governorates')}
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              {TUNISIAN_GOVERNORATES.map(gov => {
                const isSelected = selectedGovs.includes(gov.id);
                return (
                  <button
                    key={gov.id}
                    type="button"
                    onClick={() => toggleGov(gov.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-tunisia-red text-white'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {language === 'ar' ? gov.nameAr : gov.nameFr}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('profile_skills')} (optionnel)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="Ex: Mathématiques, React, Gestion, Droit..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? '...' : t('auth_register_btn')}
          </button>
        </form>

        {/* Link to Login */}
        <div className="text-center text-xs text-slate-500">
          <span>{t('auth_has_account')} </span>
          <button
            onClick={() => onNavigate('login')}
            className="text-brand-600 hover:underline font-bold"
          >
            {t('nav_login')}
          </button>
        </div>

      </div>
    </div>
  );
};
