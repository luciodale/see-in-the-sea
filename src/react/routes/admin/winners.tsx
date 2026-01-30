import type { ContestsResponse } from '@/types/api';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AllWinnersViewer } from '../../components/AllWinnersViewer';
import AdminTabs from '../../components/AdminTabs';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/winners')({
  component: WinnersPage,
});

function WinnersPage() {
  const { isAdmin, isLoaded } = useUserRole();
  const [contestId, setContestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [contestError, setContestError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);
        setContestError(null);
        const res = await fetch('/api/contests');
        const data: ContestsResponse = await res.json();
        if (data.success && data.data?.contest?.id) {
          setContestId(data.data.contest.id);
        } else {
          setContestError('Nessun concorso attivo');
        }
      } catch {
        setContestError('Errore caricamento concorso');
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, []);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto" />
          <p className="mt-2">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="min-h-screen bg-slate-950 text-white">
            <AdminTabs />
            <div className="px-4 py-4 border-b border-slate-800">
              <div className="max-w-7xl mx-auto">
                <h1 className="text-2xl font-light tracking-wide">
                  Vincitori
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Anteprima piazzamenti dalla giuria (prima di Invia Risultati)
                </p>
              </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 py-6">
              {contestError ? (
                <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-center text-red-200">
                  {contestError}
                </div>
              ) : contestId ? (
                <AllWinnersViewer contestId={contestId} />
              ) : (
                <div className="text-center py-20 text-slate-400">
                  Nessun concorso attivo
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-xl font-bold">Accesso Negato</h2>
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
