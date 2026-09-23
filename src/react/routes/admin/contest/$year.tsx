import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { AdminTabs } from '@/react/components/AdminTabs';
import { AdminAccessDenied } from '@/react/components/admin/AdminAccessDenied';
import { AdminPageLoader } from '@/react/components/admin/AdminPageLoader';
import { JudgeManager } from '@/react/components/JudgeManager';
import { RedirectToSignIn } from '@/react/components/RedirectToSignIn';
import { useContestManagement } from '@/react/hooks/useContestManagement';
import { useUserRole } from '@/react/hooks/useUserRole';

export const Route = createFileRoute('/admin/contest/$year')({
  component: ContestManagementPage,
});

function ContestManagementPage() {
  const { year } = Route.useParams();
  const yearNum = parseInt(year, 10);
  const { isAdmin, isLoaded, role } = useUserRole();
  const { data, isLoading, error, refreshData } = useContestManagement(yearNum);

  if (!isLoaded || isLoading) {
    return <AdminPageLoader />;
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="text-foreground">
            <AdminTabs />

            <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6">
              <div className="flex flex-col gap-1">
                <Link
                  to="/admin/create-old-contest"
                  className="inline-flex min-h-11 w-fit items-center gap-1 text-editorial uppercase tracking-editorial text-subtle-foreground transition-colors hover:text-foreground"
                >
                  <ChevronLeft className="size-4" />
                  Tutte le edizioni
                </Link>
                <h2 className="text-lg font-medium text-foreground">
                  Gestisci Giudici · {year}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {data?.contest.name || `UW Contest ${year}`}
                </p>
              </div>

              {error ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              ) : data ? (
                <JudgeManager
                  contestId={data.contest.id}
                  judges={data.judges}
                  onUpdate={refreshData}
                />
              ) : null}
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
