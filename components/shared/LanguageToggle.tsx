'use client';

import { useLanguage, Language } from './LanguageContext';

const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
};

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white border border-deep-teal/10 rounded-full px-3 py-1.5 shadow-2xs">
      <span className="text-[10px] font-bold text-deep-teal/40 uppercase tracking-wider">
        Language:
      </span>
      <div className="flex gap-1">
        {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
              language === lang
                ? 'bg-deep-teal text-white'
                : 'text-deep-teal/60 hover:bg-deep-teal/5'
            }`}
          >
            {LANGUAGE_LABELS[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}
