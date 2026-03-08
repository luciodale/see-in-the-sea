import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { AdminAccessDenied } from '../../components/admin/AdminAccessDenied';
import { AdminPageLoader } from '../../components/admin/AdminPageLoader';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { isAdmin, isLoaded, role } = useUserRole();
  const router = useRouter();

  if (!isLoaded) {
    return <AdminPageLoader />;
  }

  // Redirect admins immediately to current contest (main entry)
  if (isAdmin) {
    router.navigate({ to: '/admin/current-contest' });
    return null;
  }

  return (
    <>
      <SignedIn>
        <AdminAccessDenied role={role} />
      </SignedIn>

      <SignedOut>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-lg p-6 text-center text-slate-100">
            <h2 className="text-lg font-semibold text-white mb-2">
              Login Amministratore Richiesto
            </h2>
            <p className="text-sm text-slate-400 mb-4">
              Effettua l'accesso per accedere al pannello amministratore.
            </p>
            <RedirectToSignIn />
          </div>
        </div>
      </SignedOut>
    </>
  );
}
