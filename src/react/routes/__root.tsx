import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { NavbarHeader } from '../../components/Navbar/NavbarHeader';

export const Route = createRootRoute({
  component: () => {
    const location = useLocation();
    const isAuthRoute =
      location.pathname.includes('/user/login') ||
      location.pathname.includes('/user/register') ||
      location.pathname.includes('/user/verify') ||
      location.pathname.includes('/user/reset');

    if (isAuthRoute) {
      return (
        <>
          <Outlet />
          <TanStackRouterDevtools />
        </>
      );
    }

    return (
      <div className="flex flex-col flex-1">
        <NavbarHeader />
        <div className="flex-1 w-full bg-background relative">
          <main className="max-w-7xl mx-auto px-6 min-h-[80dvh]">
            <Outlet />
          </main>
        </div>

        <TanStackRouterDevtools />
      </div>
    );
  },
});
