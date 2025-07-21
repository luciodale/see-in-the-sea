import { SignOutButton } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/')({
  component: UserContainer,
})

function UserContainer() {
    return (
      <div>
        <SignOutButton />
      {/* <Outlet /> */}
      </div>
    );
}