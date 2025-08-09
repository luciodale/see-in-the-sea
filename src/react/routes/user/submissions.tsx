import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import UnifiedSubmissions from '../../components/UnifiedSubmissions';

export const Route = createFileRoute('/user/submissions')({
  component: UserSubmissions,
});

function UserSubmissions() {
  return (
    <>
      <SignedIn>
        <div className="py-8 text-white">
          <UnifiedSubmissions />
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
