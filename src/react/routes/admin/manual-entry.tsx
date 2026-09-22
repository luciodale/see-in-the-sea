import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AdminEmailInput } from '../../components/AdminEmailInput';
import { AdminImpersonationInterface } from '../../components/AdminImpersonationInterface';
import { AdminTabs } from '../../components/AdminTabs';
import { AdminAccessDenied } from '../../components/admin/AdminAccessDenied';
import { AdminPageLoader } from '../../components/admin/AdminPageLoader';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/manual-entry')({
  component: AdminManualEntry,
});

function AdminManualEntry() {
  const { isAdmin, isLoaded, role } = useUserRole();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function handleEmailSubmit(email: string) {
    setIsLoading(true);
    setTimeout(() => {
      setUserEmail(email);
      setIsLoading(false);
    }, 500);
  }

  function handleEmailChange() {
    setUserEmail(null);
  }

  if (!isLoaded) {
    return <AdminPageLoader />;
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="text-foreground">
            <AdminTabs />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-0.5">
                  <h2 className="text-base font-medium text-foreground">
                    Inserimento Manuale
                  </h2>
                  <p className="text-xs text-subtle-foreground">
                    Carica foto per conto degli utenti per il concorso 2025.
                  </p>
                </div>

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
          <AdminAccessDenied role={role} />
        )}
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
