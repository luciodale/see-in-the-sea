import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { isAdmin, isLoaded, role } = useUserRole();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-8">
                    <h1 className="text-xl font-semibold text-gray-900">
                      🛠️ Admin Panel
                    </h1>

                    <nav className="flex space-x-6">
                      <span className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">
                        Dashboard
                      </span>
                      <a
                        href="/admin/contests"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                      >
                        Contests
                      </a>
                    </nav>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Role:{' '}
                      <span className="font-semibold text-red-600">Admin</span>
                    </span>
                    <Link
                      to="/user"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      ← Back to User Panel
                    </Link>
                  </div>
                </div>
              </div>
            </header>

            {/* Admin Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-8">
                {/* Welcome Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    👋 Welcome to Admin Dashboard
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Manage contests, categories, and oversee the underwater
                    photography competition.
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link
                    to="/admin/contests"
                    className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center mb-4">
                      <div className="bg-blue-100 rounded-lg p-3">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Manage Contests
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Create and edit contests
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Set up new photography contests with dates, rules, and
                      categories.
                    </p>
                  </Link>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-100 rounded-lg p-3">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          View Statistics
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Contest analytics
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Monitor submissions, participation rates, and engagement
                      metrics.
                    </p>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-100 rounded-lg p-3">
                        <span className="text-2xl">👥</span>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          User Management
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Manage roles & permissions
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Control user access levels and moderation capabilities.
                    </p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-red-500 text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 mb-4">
                You need admin privileges to access this area.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Your current role:{' '}
                <span className="font-semibold">{role || 'user'}</span>
              </p>
              <Link
                to="/user"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                ← Return to User Dashboard
              </Link>
            </div>
          </div>
        )}
      </SignedIn>

      <SignedOut>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Admin Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access the admin panel.
            </p>
            <RedirectToSignIn />
          </div>
        </div>
      </SignedOut>
    </>
  );
}
