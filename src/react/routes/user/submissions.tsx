import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { RedirectToSignIn } from '../../components/RedirectToSignIn';
import { UnifiedSubmissions } from '../../components/UnifiedSubmissions';

export const Route = createFileRoute('/user/submissions')({
  component: UserSubmissions,
});

function UserSubmissions() {
  return (
    <>
      <SignedIn>
        <UnifiedSubmissions />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
