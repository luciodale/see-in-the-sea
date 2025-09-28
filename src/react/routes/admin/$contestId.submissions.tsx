import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AdminSubmissionsViewer } from '../../components/AdminSubmissionsViewer';
import AdminTabs from '../../components/AdminTabs';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/$contestId/submissions')({
  component: AdminContestSubmissions,
});

function AdminContestSubmissions() {
  const { contestId } = Route.useParams();
  const { isAdmin, isLoaded, role } = useUserRole();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-2">Caricamento...</p>
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                    <Link to="/admin/contests" className="hover:text-slate-200">
                      Concorsi
                    </Link>
                    <span>→</span>
                    <span className="text-slate-200 font-medium">
                      Invia del Concorso "{contestId}"
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Invia per il Concorso: {contestId}
                  </h2>
                  <p className="mt-1 text-slate-300">
                    Sfoglia e gestisci tutte le invia per questo concorso.
                  </p>
                </div>

                <div className="max-w-[1400px] mx-auto">
                  <AdminSubmissionsViewer contestId={contestId} />
                </div>
              </div>
            </main>
          </div>
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Accesso Negato
              </h2>
              <p className="text-gray-600 mb-4">
                Hai bisogno di privilegi amministrativi per accedere a questa
                pagina.
              </p>
              <p className="text-sm text-gray-500">
                Ruolo attuale: {role || 'Nessuno'}
              </p>
            </div>
          </div>
        )}
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Login Amministratore Richiesto
            </h2>
            <p className="text-gray-600 mb-6">
              Effettua l'accesso con un account amministratore per accedere al
              pannello amministratore.
            </p>
            <RedirectToSignIn />
          </div>
        </div>
      </SignedOut>
    </>
  );
}
