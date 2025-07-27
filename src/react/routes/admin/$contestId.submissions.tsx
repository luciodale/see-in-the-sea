import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import AdminSubmissionsBrowser from '../../components/AdminSubmissionsBrowser';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/$contestId/submissions')({
  component: AdminContestSubmissions,
});

function AdminContestSubmissions() {
  const { contestId } = Route.useParams();
  const { isAdmin, isLoaded, role } = useUserRole();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedIn>
        {isAdmin ? (
          <div className="min-h-screen bg-gray-50">
            {/* Admin Header with navigation */}
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-8">
                    <h1 className="text-xl font-semibold text-gray-900">
                      🛠️ Admin Panel
                    </h1>
                    <nav className="flex space-x-6">
                      <Link
                        to="/admin"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/contests"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                      >
                        Contests
                      </Link>
                      <span className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">
                        Submissions
                      </span>
                    </nav>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">Role: {role}</span>
                    <a
                      href="/user"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      ← Back to User Panel
                    </a>
                  </div>
                </div>
              </div>
            </header>

            {/* Admin Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="space-y-8">
                {/* Page Header */}
                <div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                    <Link to="/admin/contests" className="hover:text-gray-700">
                      Contest Management
                    </Link>
                    <span>→</span>
                    <span className="text-gray-900 font-medium">
                      Contest "{contestId}" Submissions
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Submissions for Contest: {contestId}
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Browse, search, and edit all submissions for this specific
                    contest.
                  </p>
                </div>

                {/* Submissions Browser */}
                <AdminSubmissionsBrowser contestId={contestId} />
              </div>
            </main>
          </div>
        ) : (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚫</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Access Denied
              </h2>
              <p className="text-gray-600 mb-4">
                You need admin privileges to access this page.
              </p>
              <p className="text-sm text-gray-500">
                Current role: {role || 'None'}
              </p>
            </div>
          </div>
        )}
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Login Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in with an admin account to access the admin panel.
            </p>
            <RedirectToSignIn />
          </div>
        </div>
      </SignedOut>
    </>
  );
}
