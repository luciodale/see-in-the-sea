import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/user" className="[&.active]:font-bold">
          /user
        </Link>{' '}
        <Link to="/user/manage" className="[&.active]:font-bold">
          user manage
        </Link>

      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})