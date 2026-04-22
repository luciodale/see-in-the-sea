import { useI18n } from '@/i18n/react';

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
                href={
                  lang === 'it' ? '/it/contest/uw-2025' : '/contest/uw-2025'
                }
                className="inline-flex items-center justify-center rounded-full bg-accent border border-accent text-accent-foreground px-6 py-2.5 text-editorial uppercase tracking-editorial drop-shadow-sharp hover:bg-accent-hover hover:border-accent-hover transition-all duration-300"
              >
                {t('navbar.winners')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
