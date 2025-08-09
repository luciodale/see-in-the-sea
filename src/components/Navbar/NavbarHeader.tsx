import { getLocalizedPath, type TranslationKey } from '@/i18n';
import { useI18n } from '@/i18n/react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { LanguageSwitcherReact } from '../LanguageSwitcherReact';

const useNavigation = (
  t: (key: TranslationKey) => string,
  currentLang: string
) => [
  {
    name: t('nav.about'),
    href: currentLang === 'it' ? '/it/about' : '/about',
  },
  {
    name: t('nav.contests'),
    href: currentLang === 'it' ? '/it/contest' : '/contest',
  },
  {
    name: t('nav.sponsors'),
    href: currentLang === 'it' ? '/it/sponsors' : '/sponsors',
  },
  {
    name: t('nav.contact'),
    href: currentLang === 'it' ? '/it/contact' : '/contact',
  },
  {
    name: t('nav.rules'),
    href: currentLang === 'it' ? '/it/rules' : '/rules',
  },
  {
    name: t('nav.submit'),
    href: currentLang === 'it' ? '/it/submit' : '/submit',
  },
];

const logoPath = '/ortona-sub-logo.svg';

export function NavbarHeader({ standalone = false }: { standalone?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, lang } = useI18n();
  const navigation = useNavigation(t, lang);

  const loginPath = getLocalizedPath('user/login', lang);

  return (
    <header className={`${!standalone ? 'absolute' : ''} inset-x-0 top-0 z-50`}>
      <nav
        aria-label="Global"
        className="flex items-center gap-4 justify-between p-4 lg:px-8"
      >
        <div className="flex">
          <a
            href={lang === 'it' ? '/it' : '/'}
            className="-m-1.5 p-1.5 lg:shrink-0"
          >
            <span className="sr-only">See in the sea</span>

            <img alt="" src={logoPath} className="h-12" />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-8 lg:flex-wrap">
          {navigation.map(item => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm/6 font-semibold text-white"
            >
              {item.name}
            </a>
          ))}
          <SignedIn>
            <a href={loginPath} className="text-sm/6 font-semibold text-white">
              {t('nav.submissions')} <span aria-hidden="true">&rarr;</span>
            </a>
          </SignedIn>
          <SignedOut>
            <a href={loginPath} className="text-sm/6 font-semibold text-white">
              {t('nav.login')} <span aria-hidden="true">&rarr;</span>
            </a>
          </SignedOut>
        </div>
        <div className="hidden lg:flex lg:gap-x-8 lg:flex-wrap">
          <LanguageSwitcherReact />
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
          <div className="flex items-center justify-between">
            <a href={lang === 'it' ? '/it' : '/'} className="-m-1.5 p-1.5">
              <span className="sr-only">See in the sea</span>
              <img alt="" src={logoPath} className="h-12 w-auto" />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-400"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/25">
              <div className="space-y-2 py-6">
                {navigation.map(item => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="py-6 space-y-4">
                <SignedIn>
                  <a
                    href={loginPath}
                    className="block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                  >
                    {t('nav.submissions')}{' '}
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                </SignedIn>
                <SignedOut>
                  <a
                    href={loginPath}
                    className="block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                  >
                    {t('nav.login')} <span aria-hidden="true">&rarr;</span>
                  </a>
                </SignedOut>
                <LanguageSwitcherReact />
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
