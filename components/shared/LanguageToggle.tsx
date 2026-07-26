'use client';

import { useLanguage, Language } from './LanguageContext';

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
};

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const handleSelectLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof document !== 'undefined') {
      document.cookie = `shikshasetu-lang=${lang}; path=/; max-age=31536000`;
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-deep-teal/15 rounded-full px-3 py-1.5 shadow-xs">
      <span className="text-[10px] font-extrabold text-deep-teal/50 uppercase tracking-wider select-none">
        🌐 Language:
      </span>
      <div className="flex gap-1">
        {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => {
          const isActive = language === lang;
          return (
            <button
              key={lang}
              type="button"
              onClick={() => handleSelectLanguage(lang)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all duration-200 ${
                isActive
                  ? 'bg-primary text-white shadow-xs scale-105'
                  : 'text-deep-teal/70 hover:bg-deep-teal/10 hover:text-deep-teal'
              }`}
              aria-label={`Switch language to ${LANGUAGE_LABELS[lang]}`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
