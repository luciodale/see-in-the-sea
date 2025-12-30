import { useClerk, useUser } from '@clerk/clerk-react';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useI18n } from '../../i18n/react';
import { getLanguageAwareSignOutUrl } from '../../i18n/utils';

export function LogoutButton() {
  const { t, lang } = useI18n();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      // Get the language-aware sign out URL
      const redirectUrl = getLanguageAwareSignOutUrl(lang);
      await signOut({ redirectUrl });
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex items-center space-x-3">
      {/* User Info */}
      <div className="text-right hidden sm:block">
        <p className="text-white text-sm font-medium">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-slate-400 text-xs">
          {user.emailAddresses[0]?.emailAddress}
        </p>
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={loading}
        className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:cursor-not-allowed cursor-pointer text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium"
        title={t('auth.logout')}
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{t('auth.logout')}</span>
      </button>
    </div>
  );
}
