import { useI18n } from '@/i18n/react';
import { ChevronDownIcon, LanguageIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export function LanguageSwitcherReact() {
  const { lang } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  console.log('lang', lang);

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  ] as const;

  const currentLanguage = languages.find(l => l.code === lang) || languages[0];

  const handleLanguageChange = (newLang: 'en' | 'it') => {
    if (newLang !== lang) {
      const currentPath = window.location.pathname;
      let newPath = currentPath;

      // Remove current language prefix if exists
      if (lang !== 'en' && currentPath.startsWith(`/${lang}/`)) {
        newPath = currentPath.replace(`/${lang}`, '') || '/';
      }

      // Add new language prefix if not default
      if (newLang !== 'en') {
        newPath = `/${newLang}${newPath}`;
      }

      // Navigate to new URL
      if (newPath !== currentPath) {
        window.location.href = newPath;
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <LanguageIcon className="w-4 h-4" />
        <span className="flag">{currentLanguage.flag}</span>
        <span className="hidden sm:block">{currentLanguage.label}</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <button
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-20">
            <div className="py-1">
              {languages.map(language => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`w-full text-left block px-4 py-2 text-sm transition-colors duration-150 ${
                    language.code === lang
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                  }`}
                  role="menuitem"
                >
                  <div className="flex items-center gap-2">
                    <span className="flag">{language.flag}</span>
                    <span>{language.label}</span>
                    {language.code === lang && (
                      <svg
                        className="w-4 h-4 ml-auto text-indigo-200"
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
