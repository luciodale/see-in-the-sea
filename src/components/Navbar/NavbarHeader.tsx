import { getNavigationItems } from '@/config/navigation';
import { getLocalizedPath } from '@/i18n';
import { useI18n } from '@/i18n/react';
import { getLanguageAwareSignOutUrl } from '@/i18n/utils';
import { useUserRole } from '@/react/hooks/useUserRole';
import { SignedIn, SignedOut, useClerk, useUser } from '@clerk/clerk-react';
import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import {
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { LanguageSwitcherReact } from '../LanguageSwitcherReact';

const logoPath = '/images/ortona-sub-logo.svg';

function UserDropdown() {
  const { t, lang } = useI18n();
  const { signOut } = useClerk();
  const { user } = useUser();
  const { isAdmin } = useUserRole();
  const [signingOut, setSigningOut] = useState(false);

  const submissionsPath = getLocalizedPath('user/submissions', lang);

  function handleSignOut() {
    setSigningOut(true);
    const redirectUrl = getLanguageAwareSignOutUrl(lang);
    signOut({ redirectUrl }).catch(() => setSigningOut(false));
  }

  return (
    <Menu as="div" className="relative">
      <MenuButton className="flex items-center gap-1 text-sm/6 font-bold uppercase text-white cursor-pointer">
        {t('nav.submissions')}
        <ChevronDownIcon className="w-4 h-4" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 mt-2 w-52 origin-top-right rounded-lg bg-slate-800 border border-slate-700 shadow-xl ring-1 ring-black/20 focus:outline-none transition data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 z-50"
      >
        <div className="p-1">
          {user && (
            <div className="px-3 py-2 border-b border-slate-700 mb-1">
              <p className="text-sm font-medium text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          )}

          <MenuItem>
            <a
              href={submissionsPath}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-200 data-[focus]:bg-slate-700 transition-colors"
            >
              {t('nav.submissions')}
            </a>
          </MenuItem>

          {isAdmin && (
            <MenuItem>
              <a
                href="/admin"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-200 data-[focus]:bg-slate-700 transition-colors"
              >
                {t('nav.admin')}
              </a>
            </MenuItem>
          )}

          <div className="border-t border-slate-700 mt-1 pt-1">
            <MenuItem>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 data-[focus]:bg-slate-700 transition-colors disabled:opacity-50"
              >
                {signingOut ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                )}
                {t('auth.logout')}
              </button>
            </MenuItem>
          </div>
        </div>
      </MenuItems>
    </Menu>
  );
}

export function NavbarHeader({ standalone = false }: { standalone?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, lang } = useI18n();
  const navigation = getNavigationItems(lang, t);
  const { isAdmin } = useUserRole();
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  const loginPath = getLocalizedPath('user/login', lang);
  const submissionsPath = getLocalizedPath('user/submissions', lang);

  function handleMobileSignOut() {
    setSigningOut(true);
    const redirectUrl = getLanguageAwareSignOutUrl(lang);
    signOut({ redirectUrl }).catch(() => setSigningOut(false));
  }

  return (
    <header
      className={`${!standalone ? 'absolute' : ''} inset-x-0 top-0 z-50`}
    >
      <nav
        aria-label="Global"
        className="mx-auto max-w-screen-2xl flex items-center justify-between p-4 lg:px-6 xl:px-8"
      >
        <div className="flex-shrink-0 w-24 lg:w-28 xl:w-32">
          <a href={lang === 'it' ? '/it' : '/'} className="block">
            <span className="sr-only">See in the sea</span>
            <img
              alt=""
              src={logoPath}
              className="h-14 lg:h-16 xl:h-20 2xl:h-24 w-auto"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400 cursor-pointer"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-14">
          {navigation.map(item => (
            <a
              key={item.name}
              href={item.href}
              className="text-sm xl:text-base 2xl:text-lg font-bold uppercase text-white whitespace-nowrap"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex items-center justify-end gap-3 flex-shrink-0 w-56 xl:w-64">
          <SignedIn>
            <UserDropdown />
          </SignedIn>
          <SignedOut>
            <a
              href={loginPath}
              className="text-sm/6 font-semibold text-white inline-block"
            >
              {t('nav.login')} <span aria-hidden="true">&rarr;</span>
            </a>
          </SignedOut>
          <LanguageSwitcherReact />
        </div>
      </nav>

      {/* Mobile menu */}
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
              className="-m-2.5 rounded-md p-2.5 text-gray-400 cursor-pointer"
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
              <div className="py-6 space-y-2">
                <SignedIn>
                  <a
                    href={submissionsPath}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                  >
                    {t('nav.submissions')}
                  </a>
                  {isAdmin && (
                    <a
                      href="/admin"
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                    >
                      {t('nav.admin')}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleMobileSignOut}
                    disabled={signingOut}
                    className="-mx-3 flex items-center gap-2 w-full rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5 disabled:opacity-50"
                  >
                    {signingOut ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                    )}
                    {t('auth.logout')}
                  </button>
                </SignedIn>
                <SignedOut>
                  <a
                    href={loginPath}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
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
