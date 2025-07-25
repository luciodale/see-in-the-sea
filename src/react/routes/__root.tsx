import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      {/* Contest App Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Contest Title */}
            <div>
              <Link to="/user" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                📸 Underwater Photography Contest 2025
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <SignedIn>
                <Link 
                  to="/user" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors [&.active]:text-blue-600 [&.active]:font-semibold"
                >
                  Contest
                </Link>
                <Link 
                  to="/user/gallery" 
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors [&.active]:text-blue-600 [&.active]:font-semibold"
                >
                  My Gallery
                </Link>
                <Link 
                  to="/user/upload" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors [&.active]:bg-blue-800"
                >
                  Upload Photo
                </Link>
                <UserButton />
              </SignedIn>
              
              <SignedOut>
                <Link 
                  to="/user/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </Link>
              </SignedOut>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>

      {/* Dev Tools */}
      <TanStackRouterDevtools />
    </>
  ),
})