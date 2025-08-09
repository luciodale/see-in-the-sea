import { useI18n } from '@/i18n/react';

export function NavbarContent() {
  const { t, lang } = useI18n();

  const cta = {
    show: false,
    text: t('navbar.cta'),
    link: '/',
  };
  return (
    <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
      {cta.show && (
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <a
            href={cta.link}
            className="relative rounded-full px-3 py-1 text-indigo-400 text-sm/6 ring-1 ring-white/10 hover:ring-white/20"
          >
            {`${cta.text} `}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      )}
      <div className="text-center">
        <div className="flex justify-center items-center">
          <img src="/logo.png" alt="Logo" className="h-40" />
          <h1 className="text-5xl text-left font-semibold tracking-tight text-balance text-white sm:text-7xl">
            See in <br /> the sea
          </h1>
        </div>

        <p className="mt-8 text-lg font-light text-pretty text-gray-300 sm:text-xl/8">
          {t('site.description')}
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href={lang === 'it' ? '/it/user/submissions' : '/user/submissions'}
            className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            {t('navbar.register')}
          </a>
          <a
            href={lang === 'it' ? '/it/rules' : '/rules'}
            className="text-sm/6 font-semibold text-white"
          >
            {t('navbar.discover')} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
