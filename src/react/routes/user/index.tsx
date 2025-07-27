import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import AdminPanel from '../../components/AdminPanel';
import ContestOverview from '../../components/ContestOverview';

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
        <div className="py-8 space-y-6">
          {/* Admin-only panel */}
          <AdminPanel />

          <ContestOverview onUploadClick={handleUploadClick} />
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
