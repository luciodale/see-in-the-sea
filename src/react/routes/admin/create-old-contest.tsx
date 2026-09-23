import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { AdminTabs } from '../../components/AdminTabs';
import { AdminAccessDenied } from '../../components/admin/AdminAccessDenied';
import { AdminPageLoader } from '../../components/admin/AdminPageLoader';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { buttonVariants } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { cn } from '../../components/ui/cn';
import { useOldContestYears } from '../../hooks/useOldContestYears';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/create-old-contest')({
  component: AdminManageJudges,
});

function AdminManageJudges() {
  const { isAdmin, isLoaded, role } = useUserRole();
  const { years, isLoading, error } = useOldContestYears();

  if (!isLoaded) {
    return <AdminPageLoader />;
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="text-foreground">
            <AdminTabs />

            <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
              <div className="flex flex-col gap-0.5">
                <h2 className="text-base font-medium text-foreground">
                  Gestisci Giudici
                </h2>
                <p className="text-xs text-subtle-foreground">
                  Scegli un'edizione per aggiungere o modificare i suoi giudici.
                </p>
              </div>

              {error && (
                <Card variant="danger" className="p-4 text-sm text-destructive">
                  {error}
                </Card>
              )}

              <section className="flex flex-col gap-4 rounded-xl border border-border bg-background p-4 sm:p-6">
                <p className="text-editorial uppercase tracking-editorial text-subtle-foreground">
                  Edizioni
                </p>

                {isLoading ? (
                  <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
                    <div className="size-5 animate-spin rounded-full border-b-2 border-foreground/70" />
                    Caricamento edizioni...
                  </div>
                ) : years.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {years.map(year => (
                      <Link
                        key={year}
                        to="/admin/contest/$year"
                        params={{ year: String(year) }}
                        className={cn(
                          buttonVariants({ variant: 'secondary', size: 'sm' }),
                          'min-h-11 tabular-nums'
                        )}
                      >
                        {year}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="py-6 text-sm text-muted-foreground">
                    Nessuna edizione presente.
                  </p>
                )}
              </section>
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
