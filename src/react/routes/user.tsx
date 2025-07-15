import { useAuth0 } from '@auth0/auth0-react';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { LoginButton } from '../auth/LoginButton';

export const Route = createFileRoute('/user')({
  component: User,
})

function User() {
    const props = useAuth0();
    const { user, isAuthenticated, isLoading } = props;

    if(!isAuthenticated) {
      return <LoginButton />
    }
    if (isLoading) {
      return <div>Loading ...</div>;
    }

    return (
      isAuthenticated && (
        <div>
          <img src={user?.picture} alt={user?.name} />
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          <Outlet />
        </div>
      )
    );
}