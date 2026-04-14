import { useI18n } from '@/i18n/react';

export function NavbarContent() {
  const { t, lang } = useI18n();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <div className="flex sm:flex-row flex-col items-center justify-center">
          <img src="/images/logo.svg" alt="Logo" className="h-40 sm:h-64" />
          <div className="sm:text-left flex flex-col gap-1">
            <h1 className="flex flex-col gap-1 tracking-tight text-balance text-white">
              <span className="sm:text-5xl text-4xl font-semibold">
                See In The Sea
              </span>
              <span className="sm:text-4xl text-2xl">
                International Underwater Photocontest
              </span>
            </h1>
            <div className="mt-4 flex flex-col sm:flex-row items-center sm:items-start gap-3">
              <a
                href={
                  lang === 'it' ? '/it/contest/uw-2025' : '/contest/uw-2025'
                }
                className="rounded-md bg-[#077f9d] px-3.5 py-2.5 text-sm font-semibold text-white text-center shadow-xs hover:bg-[#077f9d]/80 w-48"
              >
                {t('navbar.winners')}
              </a>
              <a
                href={
                  lang === 'it' ? '/it/user/submissions' : '/user/submissions'
                }
                className="rounded-md border border-[#077f9d] px-3.5 py-2.5 text-sm font-semibold text-white text-center hover:bg-[#077f9d]/10 w-48"
              >
                {t('navbar.discover')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
