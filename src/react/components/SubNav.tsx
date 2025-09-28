import { SignedIn } from '@clerk/clerk-react';
import { Link } from '@tanstack/react-router';
import { useI18n } from '../../i18n/react';
import { getLocalizedPath } from '../../i18n/utils';
import { useUserRole } from '../hooks/useUserRole';
import { LogoutButton } from './LogoutButton.tsx';

const linkClasses =
  'text-gray-300 font-medium [&.active]:text-white [&.active]:font-semibold';

export function SubNav() {
  const { t, lang } = useI18n();
  const { isAdmin } = useUserRole();
  return (
    <header className="bg-slate-800 flex items-center uppercase">
      <div className="w-full  px-6 py-4">
        {/* Navigation */}
        <nav className="flex justify-between items-center space-x-6">
          <SignedIn>
            <div className="flex items-center space-x-6">
              <Link
                to={getLocalizedPath('user/submissions', lang)}
                className={linkClasses}
              >
                {t('nav.submissions')}
              </Link>
              {isAdmin && (
                <Link to="/admin" className={linkClasses}>
                  {t('nav.admin')}
                </Link>
              )}
            </div>
            <LogoutButton />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
