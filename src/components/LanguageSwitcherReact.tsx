import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useI18n } from '@/i18n/react';

export function LanguageSwitcherReact() {
  const { lang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  ] as const;

  const currentLanguage = languages.find(l => l.code === lang) || languages[0];

  const handleLanguageChange = (newLang: 'en' | 'it') => {
    if (newLang !== lang) {
      const currentPath = window.location.pathname;
      // Strip existing locale prefix (en or it) at the start
      const stripped = currentPath.replace(/^\/(en|it)(?=\/|$)/, '');
      const normalized = stripped.length === 0 ? '/' : stripped;
      const nextPath =
        newLang === 'en' ? normalized : `/${newLang}${normalized}`;
      if (nextPath !== currentPath) {
        window.location.assign(nextPath);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground bg-surface/60 border border-border rounded-md hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="flag">{currentLanguage.flag}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            type="button"
            className="fixed inset-0 z-10 cursor-pointer"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 top-full mt-1 w-full bg-popover border border-border-strong rounded-md shadow-2xl z-50">
            <div className="py-1">
              {languages.map(language => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left block px-4 py-2 text-sm transition-colors duration-150 cursor-pointer ${
                    language.code === lang
                      ? 'bg-accent text-accent-foreground font-medium'
                      : 'text-muted-foreground hover:bg-surface-hover hover:text-foreground'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2">
                    <span className="flag">{language.flag}</span>
                    {language.code === lang && (
                      <svg
                        aria-hidden="true"
                        className="w-4 h-4 ml-auto text-accent-foreground"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
