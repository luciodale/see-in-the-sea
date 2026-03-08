import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback } from 'react';
import { validateAdminSearch } from '../../adminSearchSchema';
import { AdminAccessDenied } from '../../components/admin/AdminAccessDenied';
import { AdminPageLoader } from '../../components/admin/AdminPageLoader';
import AdminTabs from '../../components/AdminTabs';
import { AllWinnersViewer } from '../../components/AllWinnersViewer';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { useAdminContestId } from '../../hooks/useAdminContestId';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/winners')({
  component: WinnersPage,
  validateSearch: validateAdminSearch,
});

function WinnersPage() {
  const { isAdmin, isLoaded } = useUserRole();
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const navigateToContest = useCallback(
    (id: string) => {
      navigate({ search: { contestId: id }, replace: true });
    },
    [navigate]
  );

  const { contestId, contests, loading, setContestId } = useAdminContestId(
    searchParams,
    navigateToContest
  );

  if (!isLoaded || loading) {
    return <AdminPageLoader />;
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="text-white">
            <AdminTabs
              contests={contests}
              selectedContestId={contestId}
              onContestChange={setContestId}
            />
            <div className="max-w-7xl mx-auto px-4 py-4">
              {contestId ? (
                <AllWinnersViewer contestId={contestId} />
              ) : (
                <div className="text-center py-20 text-slate-400">
                  Nessun concorso trovato
                </div>
              )}
            </div>
          </div>
        ) : (
          <AdminAccessDenied />
        )}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
