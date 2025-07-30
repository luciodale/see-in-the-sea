import { Layout } from '@/react/admin-components/Layout';
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/user/')({
  component: UserDashboard,
});

function UserDashboard() {
  return (
    <>
      <SignedIn>
        <Layout>
          <Outlet />
        </Layout>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
