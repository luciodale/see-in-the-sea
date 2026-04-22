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
import { getNavigationItems } from '@/config/navigation';
import { useI18n } from '@/i18n/react';
import { getLanguageAwareSignOutUrl, getLocalizedPath } from '@/i18n/utils';
import { useUserRole } from '@/react/hooks/useUserRole';
import { LanguageSwitcherReact } from '../LanguageSwitcherReact';

const logoPath = '/images/ortona-sub-logo.svg';

const navLinkClass =
  'text-editorial uppercase tracking-editorial text-foreground/85 hover:text-foreground transition-colors whitespace-nowrap';

const mobileLinkClass =
  '-mx-3 block rounded-lg px-3 py-3 text-editorial uppercase tracking-editorial text-foreground/85 hover:text-foreground hover:bg-surface transition-colors';

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
      <MenuButton
        className={`flex items-center gap-1 cursor-pointer ${navLinkClass}`}
      >
        {t('nav.profile')}
        <ChevronDownIcon className="w-3 h-3" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 mt-3 w-56 origin-top-right rounded-xl bg-popover border border-border-strong shadow-2xl focus:outline-none transition data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 z-50"
      >
        <div className="p-1">
          {user && (
            <div className="px-3 py-3 border-b border-border mb-1">
              <p className="font-serif text-base text-foreground leading-heading">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {user.emailAddresses[0]?.emailAddress}
              </p>
            </div>
          )}

          <MenuItem>
            <a
              href={submissionsPath}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-editorial uppercase tracking-editorial text-foreground/85 data-[focus]:bg-surface-hover data-[focus]:text-foreground transition-colors"
            >
              {t('nav.submissions')}
            </a>
          </MenuItem>

          {isAdmin && (
            <MenuItem>
              <a
                href="/admin"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-editorial uppercase tracking-editorial text-foreground/85 data-[focus]:bg-surface-hover data-[focus]:text-foreground transition-colors"
              >
                {t('nav.admin')}
              </a>
            </MenuItem>
          )}

          <div className="border-t border-border mt-1 pt-1">
            <MenuItem>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-editorial uppercase tracking-editorial text-muted-foreground data-[focus]:bg-surface-hover data-[focus]:text-foreground transition-colors disabled:opacity-50"
              >
                {signingOut ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
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

type NavbarHeaderProps = {
  darkOverlay?: boolean;
};

export function NavbarHeader({ darkOverlay = false }: NavbarHeaderProps) {
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

  const overlayClass = darkOverlay
    ? 'bg-gradient-to-b from-black/80 via-black/80 to-transparent'
    : '';

  return (
    <header className={`relative z-40 pointer-events-none ${overlayClass}`}>
      <nav
        aria-label="Global"
        className="mx-auto max-w-screen-2xl flex items-center justify-between p-5 lg:px-7 xl:px-10 pointer-events-auto"
      >
        <div className="flex-shrink-0 w-24 lg:w-28 xl:w-32">
          <a href={lang === 'it' ? '/it' : '/'} className="block">
            <span className="sr-only">See in the sea</span>
            <img
              alt=""
              src={logoPath}
              className="h-10 lg:h-12 xl:h-14 2xl:h-16 w-auto"
            />
          </a>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-10 xl:gap-14">
          {navigation.map(item => (
            <a key={item.name} href={item.href} className={navLinkClass}>
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex items-center justify-end gap-4 flex-shrink-0 w-56 xl:w-64">
          <SignedIn>
            <UserDropdown />
          </SignedIn>
          <SignedOut>
            <a href={loginPath} className={navLinkClass}>
              {t('nav.login')}
            </a>
          </SignedOut>
          <LanguageSwitcherReact />
        </div>
      </nav>

      {/* Mobile menu */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden pointer-events-auto"
      >
        <div className="fixed inset-0 z-50 bg-black/60" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-background p-6 sm:max-w-sm border-l border-border">
          <div className="flex items-center justify-between">
            <a href={lang === 'it' ? '/it' : '/'} className="-m-1.5 p-1.5">
              <span className="sr-only">See in the sea</span>
              <img alt="" src={logoPath} className="h-12 w-auto" />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-8 flow-root">
            <div className="-my-6 divide-y divide-border">
              <div className="space-y-1 py-6">
                {navigation.map(item => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={mobileLinkClass}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="py-6 space-y-1">
                <SignedIn>
                  <a href={submissionsPath} className={mobileLinkClass}>
                    {t('nav.submissions')}
                  </a>
                  {isAdmin && (
                    <a href="/admin" className={mobileLinkClass}>
                      {t('nav.admin')}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleMobileSignOut}
                    disabled={signingOut}
                    className="-mx-3 flex items-center gap-2 w-full rounded-lg px-3 py-3 text-editorial uppercase tracking-editorial text-muted-foreground hover:text-foreground hover:bg-surface transition-colors disabled:opacity-50"
                  >
                    {signingOut ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current" />
                    ) : (
                      <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
                    )}
                    {t('auth.logout')}
                  </button>
                </SignedIn>
                <SignedOut>
                  <a href={loginPath} className={mobileLinkClass}>
                    {t('nav.login')}
                  </a>
                </SignedOut>
                <div className="pt-4">
                  <LanguageSwitcherReact />
                </div>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
