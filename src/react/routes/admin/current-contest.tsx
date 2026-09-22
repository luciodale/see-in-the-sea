import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback } from 'react';
import { validateAdminSearch } from '../../adminSearchSchema';
import { AdminSubmissionsViewer } from '../../components/AdminSubmissionsViewer';
import { AdminTabs } from '../../components/AdminTabs';
import { AdminAccessDenied } from '../../components/admin/AdminAccessDenied';
import { AdminPageLoader } from '../../components/admin/AdminPageLoader';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { useAdminContestId } from '../../hooks/useAdminContestId';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/current-contest')({
  component: AdminCurrentContest,
  validateSearch: validateAdminSearch,
});

function AdminCurrentContest() {
  const { isAdmin, isLoaded, role } = useUserRole();
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
          <div className="text-foreground">
            <AdminTabs
              contests={contests}
              selectedContestId={contestId}
              onContestChange={setContestId}
            />
            <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
              {contestId ? (
                <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-4 sm:px-6 lg:px-8">
                  <AdminSubmissionsViewer contestId={contestId} />
                </div>
              ) : (
                <div className="flex flex-col gap-1 rounded-xl border border-border bg-surface p-6 text-center">
                  <h2 className="text-lg font-medium text-foreground">
                    Nessun Concorso Trovato
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Non ci sono concorsi disponibili.
                  </p>
                </div>
              )}
            </div>
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
