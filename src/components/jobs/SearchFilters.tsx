import React, { useState } from 'react';
import { SearchFilters, AcademicSectionKey, EducationLevelKey, SectorType, JobType } from '../../types';
import { useLanguage } from '../../i18n/context';
import { useAuth } from '../../context/AuthContext';
import { 
  Search, RotateCcw, Filter, MapPin, GraduationCap, Award, 
  Briefcase, ChevronDown, ChevronUp, Check, X 
} from 'lucide-react';
import { ACADEMIC_SECTIONS, EDUCATION_LEVELS, TUNISIAN_GOVERNORATES } from '../../constants/tunisiaData';

interface SearchFiltersProps {
  filters: SearchFilters;
  onChange: (updated: SearchFilters) => void;
  onReset: () => void;
  totalResults: number;
}

export const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalResults
}) => {
  const { t, language, isRTL } = useLanguage();
  const { user } = useAuth();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [govSearch, setGovSearch] = useState('');

  // Handle Sector Tab change
  const handleSectorChange = (sector: SectorType | 'all') => {
    if (sector === 'all') {
      onChange({ ...filters, sectors: [], page: 1 });
    } else {
      onChange({ ...filters, sectors: [sector], page: 1 });
    }
  };

  // Toggle governorate
  const toggleGov = (govId: string) => {
    let updated = [...filters.governorates];
    if (govId === 'all_tunisia') {
      updated = [];
    } else if (updated.includes(govId)) {
      updated = updated.filter(g => g !== govId);
    } else {
      updated.push(govId);
    }
    onChange({ ...filters, governorates: updated, page: 1 });
  };

  // Filtered governorates list for selection modal/drawer
  const filteredGovs = TUNISIAN_GOVERNORATES.filter(g => 
    g.nameFr.toLowerCase().includes(govSearch.toLowerCase()) ||
    g.nameAr.includes(govSearch) ||
    g.regionFr.toLowerCase().includes(govSearch.toLowerCase())
  );

  const activeSectors = filters.sectors;
  const currentSector = activeSectors.length === 1 ? activeSectors[0] : 'all';

  return (
    <div className="bg-white dark:bg-slate-800/95 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm space-y-5">
      {/* 1. Main Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={filters.keyword}
          onChange={(e) => onChange({ ...filters, keyword: e.target.value, page: 1 })}
          placeholder={t('hero_search_placeholder')}
          className="w-full ps-11 pe-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
        />
        {filters.keyword && (
          <button
            onClick={() => onChange({ ...filters, keyword: '', page: 1 })}
            className="absolute inset-y-0 end-0 flex items-center pe-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Sector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 dark:border-slate-700/80 pb-4">
        <button
          onClick={() => handleSectorChange('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            currentSector === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {language === 'ar' ? 'جميع القطاعات' : 'Tous les secteurs'}
        </button>

        <button
          onClick={() => handleSectorChange('public')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
            currentSector === 'public'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50'
          }`}
        >
          <span>{t('filter_sector_public')}</span>
        </button>

        <button
          onClick={() => handleSectorChange('teaching')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
            currentSector === 'teaching'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
          }`}
        >
          <span>{t('filter_sector_teaching')}</span>
        </button>

        <button
          onClick={() => handleSectorChange('private')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
            currentSector === 'private'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
          }`}
        >
          <span>{t('filter_sector_private')}</span>
        </button>
      </div>

      {/* 3. Primary Selectors Row (Academic Section & Education Level) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Academic Section */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-brand-600" />
            <span>{t('filter_academic_section')}</span>
          </label>
          <select
            value={filters.academicSections[0] || ''}
            onChange={(e) => {
              const val = e.target.value as AcademicSectionKey;
              onChange({
                ...filters,
                academicSections: val ? [val] : [],
                page: 1
              });
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">{t('filter_all_sections')}</option>
            {ACADEMIC_SECTIONS.map(s => (
              <option key={s.key} value={s.key}>
                {language === 'ar' ? s.labelAr : s.labelFr}
              </option>
            ))}
          </select>
        </div>

        {/* Education Level */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>{t('filter_education_level')}</span>
          </label>
          <select
            value={filters.educationLevels[0] || ''}
            onChange={(e) => {
              const val = e.target.value as EducationLevelKey;
              onChange({
                ...filters,
                educationLevels: val ? [val] : [],
                page: 1
              });
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">{t('filter_all_levels')}</option>
            {EDUCATION_LEVELS.map(l => (
              <option key={l.key} value={l.key}>
                {language === 'ar' ? l.labelAr : l.labelFr}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            {t('filter_sort_by')}
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any, page: 1 })}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="date">{t('filter_sort_date')}</option>
            <option value="deadline">{t('filter_sort_deadline')}</option>
            {user && <option value="relevance">{t('filter_sort_relevance')}</option>}
          </select>
        </div>
      </div>

      {/* 4. Governorates Quick Chips */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-tunisia-red" />
            <span>{t('filter_governorates')}</span>
          </label>
          {filters.governorates.length > 0 && (
            <button
              onClick={() => onChange({ ...filters, governorates: [], page: 1 })}
              className="text-xs text-tunisia-red hover:underline font-medium"
            >
              {language === 'ar' ? 'إلغاء التحديد' : 'Désélectionner'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
          <button
            type="button"
            onClick={() => onChange({ ...filters, governorates: [], page: 1 })}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              filters.governorates.length === 0
                ? 'bg-tunisia-red text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {t('filter_all_tunisia')}
          </button>

          {TUNISIAN_GOVERNORATES.map(gov => {
            const isSelected = filters.governorates.includes(gov.id);
            return (
              <button
                key={gov.id}
                type="button"
                onClick={() => toggleGov(gov.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-tunisia-red text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
                <span>{language === 'ar' ? gov.nameAr : gov.nameFr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Advanced Filters Toggle */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>{showAdvanced ? (language === 'ar' ? 'إخفاء الخيارات المتقدمة' : 'Moins de filtres') : (language === 'ar' ? 'خيارات تصفية متقدمة' : 'Plus de filtres')}</span>
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onlyActive}
              onChange={(e) => onChange({ ...filters, onlyActive: e.target.checked, page: 1 })}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <span>{t('filter_active_only')}</span>
          </label>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            title={t('filter_reset')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('filter_reset')}</span>
          </button>
        </div>
      </div>

      {/* Advanced Drawer Content */}
      {showAdvanced && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-4 text-xs sm:text-sm animate-in fade-in duration-150">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              {t('filter_job_type')}
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'full_time', labelFr: 'CDI / Temps plein', labelAr: 'دوام كامل' },
                { key: 'civil_service', labelFr: 'Titularisation Fonction Publique', labelAr: 'انتداب بالوظيفة العمومية' },
                { key: 'contract', labelFr: 'Contractuel / CDD', labelAr: 'عقد محدد المدة' },
                { key: 'internship', labelFr: 'Stage / PFE', labelAr: 'تربص / مشروع تخرج' }
              ].map(tType => {
                const isChecked = filters.jobTypes.includes(tType.key as JobType);
                return (
                  <button
                    key={tType.key}
                    type="button"
                    onClick={() => {
                      const updated = isChecked
                        ? filters.jobTypes.filter(k => k !== tType.key)
                        : [...filters.jobTypes, tType.key as JobType];
                      onChange({ ...filters, jobTypes: updated, page: 1 });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      isChecked
                        ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 border-transparent'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {language === 'ar' ? tType.labelAr : tType.labelFr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
