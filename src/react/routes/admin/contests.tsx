import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import type { Contest } from '../../../db/index.js';
import AdminSubmissionUpload from '../../components/AdminSubmissionUpload';
import ContestList from '../../components/ContestList';
import CreateContestForm from '../../components/CreateContestForm';
import { useUserRole } from '../../hooks/useUserRole';

export const Route = createFileRoute('/admin/contests')({
  component: AdminContests,
});

function AdminContests() {
  const { isAdmin, isLoaded, role } = useUserRole();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

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

  const handleContestCreated = (contestId: string) => {
    console.log('Contest created successfully:', contestId);
    // Trigger refresh of the contest list
    setRefreshTrigger(prev => prev + 1);
  };

  const handleContestSelect = (contest: Contest) => {
    setSelectedContest(contest);
  };

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
                      <Link
                        to="/admin"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/contests"
                        className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium"
                      >
                        Contests
                      </Link>
                      <a
                        href="/admin/submissions"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                      >
                        Submissions
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
                {/* Page Header */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    Contest Management
                  </h2>
                  <p className="mt-2 text-gray-600">
                    Create contests, manage submissions, and upload photos on
                    behalf of users.
                  </p>
                </div>

                {/* Create Contest Form */}
                <CreateContestForm onSuccess={handleContestCreated} />

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Contest List */}
                  <div>
                    <ContestList
                      refreshTrigger={refreshTrigger}
                      onContestSelect={handleContestSelect}
                      selectedContestId={selectedContest?.id}
                    />
                  </div>

                  {/* Admin Upload Panel */}
                  <div>
                    {selectedContest ? (
                      <AdminSubmissionUpload
                        selectedContest={selectedContest}
                      />
                    ) : (
                      <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="text-center py-8 text-gray-500">
                          <div className="text-4xl mb-4">👈</div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Select a Contest
                          </h3>
                          <p className="text-sm">
                            Click on a contest from the table to upload
                            submissions on behalf of users
                          </p>
                        </div>
                      </div>
                    )}
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
