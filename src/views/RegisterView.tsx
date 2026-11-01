import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

import { AcademicSectionKey, EducationLevelKey } from '../types';
import { useLanguage } from '../i18n/context';
import { useAuth } from '../context/AuthContext';
import {
  ACADEMIC_SECTIONS,
  EDUCATION_LEVELS,
} from '../constants/tunisiaData';

interface RegisterViewProps {
  onNavigate: (view: string) => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
                                                            onNavigate,
                                                          }) => {
  const { t, language, isRTL } = useLanguage();
  const { register } = useAuth();

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  const [academicSection, setAcademicSection] =
      useState<AcademicSectionKey>('computer_science');

  const [educationLevel, setEducationLevel] =
      useState<EducationLevelKey>('licence');

  const [selectedGovs] = useState<string[]>(['Tunis']);

  const [skills, setSkills] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Submit registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Password validation
    if (password.length < 6) {
      setError(
          language === 'ar'
              ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف'
              : 'Le mot de passe doit contenir au moins 6 caractères'
      );
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
        skills: skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
      });

      // Go to dashboard after successful registration
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || "Échec de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div
          className="max-w-xl mx-auto py-8 sm:py-12"
          dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-xl space-y-6">

          {/* ================= HEADER ================= */}
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

          {/* ================= ERROR ================= */}
          {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
          )}

          {/* ================= FORM ================= */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* FULL NAME */}
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
                    placeholder="Nom et prénom"
                    className="w-full ps-9 pe-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            {/* EMAIL + PASSWORD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* EMAIL */}
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

              {/* PASSWORD */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('auth_password_label')}
                </label>

                <div className="relative">

                  {/* Lock icon */}
                  <Lock className="w-4 h-4 absolute inset-y-0 start-3 my-auto text-slate-400" />

                  {/* Password input */}
                  <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full ps-9 pe-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                  />

                  {/* Show / Hide password button */}
                  <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 end-3 my-auto flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      aria-label={
                        showPassword
                            ? 'Masquer le mot de passe'
                            : 'Afficher le mot de passe'
                      }
                      title={
                        showPassword
                            ? 'Masquer le mot de passe'
                            : 'Afficher le mot de passe'
                      }
                  >
                    {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                    ) : (
                        <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ACADEMIC SECTION + EDUCATION LEVEL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* ACADEMIC SECTION */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('profile_academic_section')}
                </label>

                <select
                    value={academicSection}
                    onChange={(e) =>
                        setAcademicSection(
                            e.target.value as AcademicSectionKey
                        )
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {ACADEMIC_SECTIONS.map((section) => (
                      <option
                          key={section.key}
                          value={section.key}
                      >
                        {language === 'ar'
                            ? section.labelAr
                            : section.labelFr}
                      </option>
                  ))}
                </select>
              </div>

              {/* EDUCATION LEVEL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('profile_education_level')}
                </label>

                <select
                    value={educationLevel}
                    onChange={(e) =>
                        setEducationLevel(
                            e.target.value as EducationLevelKey
                        )
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {EDUCATION_LEVELS.map((level) => (
                      <option
                          key={level.key}
                          value={level.key}
                      >
                        {language === 'ar'
                            ? level.labelAr
                            : level.labelFr}
                      </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SKILLS */}
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

            {/* REGISTER BUTTON */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '...' : t('auth_register_btn')}
            </button>
          </form>

          {/* ================= LOGIN LINK ================= */}
          <div className="text-center text-xs text-slate-500">
            <span>{t('auth_has_account')} </span>

            <button
                type="button"
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