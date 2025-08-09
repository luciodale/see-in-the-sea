import { SignedIn, UserButton } from '@clerk/clerk-react';
import { Link } from '@tanstack/react-router';
import { useI18n } from '../../i18n/react';
import { useUserRole } from '../hooks/useUserRole';

const linkClasses =
  'text-gray-300 font-medium [&.active]:text-white [&.active]:font-semibold';

export function SubNav() {
  const { t } = useI18n();
  const { isAdmin } = useUserRole();
  return (
    <header className="bg-slate-800 flex items-center uppercase">
      <div className="w-full  px-6 py-4">
        {/* Navigation */}
        <nav className="flex justify-between items-center space-x-6">
          <SignedIn>
            <div className="flex items-center space-x-6">
              <Link to="/user/submissions" className={linkClasses}>
                {t('nav.submissions')}
              </Link>
              {isAdmin && (
                <Link to="/admin" className={linkClasses}>
                  {t('nav.admin')}
                </Link>
              )}
            </div>
            <UserButton userProfileUrl="/user/account" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
