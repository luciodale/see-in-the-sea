import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import type { Contest } from '../../../db/index';
import AdminTabs from '../../components/AdminTabs';
import ContestList from '../../components/ContestList';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/contests')({
  component: AdminContests,
});

function AdminContests() {
  const { isAdmin, isLoaded, role } = useUserRole();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

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

  const _handleContestCreated = (_contestId: string) => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleContestSelect = (contest: Contest) => {
    setSelectedContest(contest);
  };

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="min-h-screen bg-slate-900 text-slate-100">
            <AdminTabs />

            {/* Admin Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="space-y-8">
                {/* Page Header (minimal) */}
                <div className="sr-only">
                  <h2>Concorsi</h2>
                </div>

                {/* Main Content Area - Full width contests list */}
                <ContestList
                  refreshTrigger={refreshTrigger}
                  onContestSelect={handleContestSelect}
                  selectedContestId={selectedContest?.id}
                />
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
