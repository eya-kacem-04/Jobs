import React from 'react';
import { useLanguage } from '../../i18n/context';
import { ExternalLink, ShieldCheck, MapPin, Building, GraduationCap } from 'lucide-react';
import { OFFICIAL_TUNISIAN_SOURCES } from '../../constants/tunisiaData';

interface FooterProps {
  onSelectGovernorate?: (govId: string) => void;
}

export const Footer: React.FC<FooterProps> = () => {
  const { t, language } = useLanguage();

  return (
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8 mt-16 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          {/* Top Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand & Mission */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-tunisia-red flex items-center justify-center text-white font-bold">
                  TN
                </div>
                <span className="font-extrabold text-white text-lg tracking-tight">
                {language === 'ar' ? 'توظيف تونس' : 'Tawdheef TN'}
              </span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {t('footer_text')}
              </p>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{t('hero_verified_badge')}</span>
              </div>
            </div>

            {/* Official Tunisian Portals */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Building className="w-4 h-4 text-tunisia-red" />
                <span>{language === 'ar' ? 'المصادر الرسمية المعتمدة' : 'Portails Officiels Partenaires'}</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                {OFFICIAL_TUNISIAN_SOURCES.slice(0, 5).map(src => (
                    <li key={src.id}>
                      <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white transition-colors flex items-center justify-between group"
                      >
                        <span className="truncate max-w-[210px]">{src.name}</span>
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                ))}
              </ul>
            </div>

            {/* Governorates Coverage (heading only) */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-tunisia-red" />
                <span>{language === 'ar' ? 'تغطية 24 ولاية تونسية' : 'Couverture des 24 Gouvernorats'}</span>
              </h4>
            </div>

            {/* Transparency & Integrity Charter */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-tunisia-red" />
                <span>{language === 'ar' ? 'ميثاق الموثوقية والنزاهة' : 'Charte d\'Intégrité'}</span>
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'ar'
                    ? 'لا تقوم منصة توظيف تونس بنشر أي بلاغ وهمي أو غير متحقق من مصدره. كل عرض يحتوي وجوباً على رابطه الأصلي ورابط تقديم الترشح الرسمي.'
                    : 'La plateforme Tawdheef TN ne publie aucune offre fictive. Chaque opportunité conserve son lien d\'origine et son URL officielle de candidature.'}
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="text-center sm:text-start space-y-1">
              <p>© {new Date().getFullYear()} Tawdheef TN (توظيف تونس). {t('footer_rights')}</p>
              <p>
                {language === 'ar' ? 'تطوير: ' : 'Développé par '}
                <span className="text-slate-300 font-semibold">Eya</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span>{language === 'ar' ? 'الجمهورية التونسية' : 'République Tunisienne'}</span>
              <span>•</span>
              <span>Portail National de Recrutement</span>
            </div>
          </div>

        </div>
      </footer>
  );
};