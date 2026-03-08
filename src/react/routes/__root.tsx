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
        {/* Contest App Header */}
        <div className="bg-slate-900 border border-b-slate-700 sticky top-0 z-50">
          <NavbarHeader standalone />
        </div>
        {/* Main Content */}
        <div className="flex-1 w-full bg-slate-900 relative">
          <main className="max-w-7xl mx-auto px-6 min-h-[80dvh]">
            <Outlet />
          </main>
        </div>

        {/* Dev Tools */}
        <TanStackRouterDevtools />
      </div>
    );
  },
});
