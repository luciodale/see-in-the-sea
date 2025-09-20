import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AdminEmailInput } from '../../components/AdminEmailInput';
import { AdminImpersonationInterface } from '../../components/AdminImpersonationInterface';
import AdminTabs from '../../components/AdminTabs';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/manual-entry')({
  component: AdminManualEntry,
});

function AdminManualEntry() {
  const { isAdmin, isLoaded, role } = useUserRole();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = (email: string) => {
    setIsLoading(true);
    // Simulate a brief loading state, then set the email
    setTimeout(() => {
      setUserEmail(email);
      setIsLoading(false);
    }, 500);
  };

  const handleEmailChange = () => {
    setUserEmail(null);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="min-h-screen bg-slate-900 text-slate-100">
            <AdminTabs />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="space-y-8">
                {/* Page Header */}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Inserimento Manuale
                  </h2>
                  <p className="mt-1 text-slate-300">
                    Carica foto per conto degli utenti per il concorso 2025.
                  </p>
                </div>

                {/* Content based on state */}
                {!userEmail ? (
                  <AdminEmailInput
                    onEmailSubmit={handleEmailSubmit}
                    isLoading={isLoading}
                  />
                ) : (
                  <AdminImpersonationInterface
                    userEmail={userEmail}
                    onEmailChange={handleEmailChange}
                  />
                )}
              </div>
            </main>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="max-w-md w-full bg-slate-800 rounded-lg shadow-md p-6 text-center">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Accesso Negato
              </h2>
              <p className="text-slate-300 mb-4">
                Hai bisogno di privilegi amministrativi per accedere a questa
                area.
              </p>
              <p className="text-sm text-slate-400 mb-6">
                Il tuo ruolo attuale:{' '}
                <span className="font-semibold">{role || 'user'}</span>
              </p>
            </div>
          </div>
        )}
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
