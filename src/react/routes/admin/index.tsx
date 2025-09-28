import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { isAdmin, isLoaded, role } = useUserRole();
  const router = useRouter();

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

  // Redirect admins immediately to current contest (main entry)
  if (isAdmin) {
    router.navigate({ to: '/admin/current-contest' });
    return null;
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="min-h-screen bg-slate-900 text-slate-100">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center">Reindirizzamento…</div>
            </main>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Accesso Negato
              </h2>
              <p className="text-gray-600 mb-4">
                Hai bisogno di privilegi amministrativi per accedere a questa
                area.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Il tuo ruolo attuale:{' '}
                <span className="font-semibold">{role || 'user'}</span>
              </p>
              <Link
                to="/user"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                ← Torna alla Dashboard Utente
              </Link>
            </div>
          </div>
        )}
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Login Amministratore Richiesto
            </h2>
            <p className="text-gray-600 mb-6">
              Effettua l'accesso per accedere al pannello amministratore.
            </p>
            <RedirectToSignIn />
          </div>
        </div>
      </SignedOut>
    </>
  );
}
