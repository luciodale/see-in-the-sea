import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { NavbarHeader } from '../../components/Navbar/NavbarHeader';
import { SubNav } from '../components/SubNav';

export const Route = createRootRoute({
  component: () => (
    <>
      {/* Contest App Header */}
      <div className="bg-slate-900 border border-b-slate-700 sticky top-0 z-50">
        <NavbarHeader standalone />
      </div>
      <SubNav />
      {/* Main Content */}
      <div className="min-h-screen w-full bg-slate-900 relative">
        <main className="max-w-7xl mx-auto px-6">
          <Outlet />
        </main>
      </div>

      {/* Dev Tools */}
      <TanStackRouterDevtools />
    </>
  ),
});
