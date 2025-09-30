import type { ContestsResponse } from '@/types/api';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AdminSubmissionsViewer } from '../../components/AdminSubmissionsViewer';
import AdminTabs from '../../components/AdminTabs';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/current-contest')({
  component: AdminCurrentContest,
});

function AdminCurrentContest() {
  const { isAdmin, isLoaded, role } = useUserRole();
  const [activeContestId, setActiveContestId] = useState<string | null>(null);
  const [isLoadingContest, setIsLoadingContest] = useState(true);
  const [contestError, setContestError] = useState<string | null>(null);

  // Fetch the active contest ID
  useEffect(() => {
    const fetchActiveContest = async () => {
      try {
        setIsLoadingContest(true);
        setContestError(null);

        const response = await fetch('/api/contests');
        const result: ContestsResponse = await response.json();

        if (!response.ok || !result.success || !result.data?.contest) {
          setContestError('Nessun concorso attivo trovato');
          return;
        }

        setActiveContestId(result.data.contest.id);
      } catch (error) {
        console.error('Error fetching active contest:', error);
        setContestError('Impossibile recuperare il concorso attivo');
      } finally {
        setIsLoadingContest(false);
      }
    };

    fetchActiveContest();
  }, []);

  if (!isLoaded || isLoadingContest) {
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
                {contestError ? (
                  <div className="bg-red-900/40 border border-red-800 text-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-400 text-4xl mb-2">❌</div>
                    <h2 className="text-xl font-bold mb-2">Errore Concorso</h2>
                    <p>{contestError}</p>
                  </div>
                ) : activeContestId ? (
                  <div className="max-w-[1400px] mx-auto">
                    <AdminSubmissionsViewer contestId={activeContestId} />
                  </div>
                ) : (
                  <div className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-6 text-center">
                    <div className="text-slate-400 text-4xl mb-2">🏆</div>
                    <h2 className="text-xl font-bold mb-2">
                      Nessun Concorso Attivo
                    </h2>
                    <p>Non c'è attualmente un concorso attivo.</p>
                  </div>
                )}
              </div>
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
              <p className="text-sm text-slate-400 mb-6">
                Il tuo ruolo attuale:{' '}
                <span className="font-semibold text-white">
                  {role || 'user'}
                </span>
              </p>
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
