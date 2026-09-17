import { useI18n } from '@/i18n/react';
import { getLocalizedPath } from '@/i18n/utils';

export function NavbarContent() {
  const { t, lang } = useI18n();

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="text-center">
        <div className="flex sm:flex-row flex-col items-center justify-center gap-6">
          <img
            src="/images/logo.svg"
            alt="See in the Sea logo"
            className="h-40 sm:h-64"
          />
          <div className="sm:text-left flex flex-col gap-5">
            <h1 className="flex flex-col gap-2 text-balance text-foreground">
              <span className="font-serif sm:text-7xl text-5xl leading-display-tight tracking-display drop-shadow-sharp">
                See in the Sea
              </span>
              <span className="text-editorial sm:text-xs uppercase tracking-editorial-wider text-foreground drop-shadow-strong">
                International Underwater Photocontest
              </span>
            </h1>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <a
                href={getLocalizedPath('user/submissions', lang)}
                className="group inline-flex items-center gap-3 rounded-full bg-accent border border-accent text-accent-foreground px-5 py-3 text-editorial uppercase tracking-editorial drop-shadow-sharp hover:bg-accent-hover hover:border-accent-hover transition-all duration-300"
              >
                <span className="flex items-center gap-2 font-medium">
                  <span className="size-1.5 rounded-full bg-gold" />
                  {t('navbar.join.edition')}
                </span>
                <span className="h-3 border-l border-accent-foreground/20" />
                <span className="flex items-center gap-1.5">
                  {t('navbar.join.cta')}
                  <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
