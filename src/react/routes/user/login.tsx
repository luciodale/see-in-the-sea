import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/user/login')({
  component: Login,
});

function Login() {
  return (
    <div>
      <SignedIn>
        <Navigate to="/user/manage" />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}
