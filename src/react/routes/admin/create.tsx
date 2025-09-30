import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import AdminTabs from '../../components/AdminTabs';
import CreateContestForm from '../../components/CreateContestForm';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/create')({
  component: AdminCreateContest,
});

function AdminCreateContest() {
  const { isAdmin, isLoaded } = useUserRole();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Caricamento...</p>
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
            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <CreateContestForm onSuccess={() => {}} />
            </main>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-lg p-6 text-center text-slate-100">
              <div className="text-red-400 text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Accesso Negato
              </h2>
              <p className="text-slate-400 mb-4">
                Hai bisogno di privilegi amministrativi per accedere a questa
                area.
              </p>
              <Link
                to="/user"
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-colors"
              >
                ← Torna alla Dashboard Utente
              </Link>
            </div>
          </div>
        )}
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-lg p-6 text-center text-slate-100">
            <h2 className="text-2xl font-bold text-white mb-4">
              Login Amministratore Richiesto
            </h2>
            <p className="text-slate-400 mb-6">
              Effettua l'accesso per accedere al pannello amministratore.
            </p>
            <RedirectToSignIn />
          </div>
        </div>
      </SignedOut>
    </>
  );
}
