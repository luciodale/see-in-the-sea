import { Layout } from '@/react/admin-components/Layout';
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router';

export const Route = createFileRoute('/user/')({
  component: UserDashboard,
});

function UserDashboard() {
  const router = useRouter();

  const handleUploadClick = (categoryId: string) => {
    // Navigate to upload page with category pre-selected
    router.navigate({
      to: '/user/upload',
      search: { categoryId },
    });
  };

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
