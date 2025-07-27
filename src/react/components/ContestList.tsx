import { useEffect, useState } from 'react';
import type { Contest } from '../../db/index.js';
import type { ContestListResponse } from '../../types/api';

type ContestListProps = {
  refreshTrigger?: number; // To trigger refresh when new contest is created
  onContestSelect?: (contest: Contest) => void;
  selectedContestId?: string;
};

export default function ContestList({
  refreshTrigger,
  onContestSelect,
  selectedContestId,
}: ContestListProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContests = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/admin/manage-contest');
      const result: ContestListResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('Failed to fetch contests');
      }

      setContests(result.data || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch contests'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, [refreshTrigger]);

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Existing Contests
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading contests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Existing Contests
        </h3>
        <div className="text-center py-8">
          <div className="text-red-500 text-4xl mb-2">❌</div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchContests}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📋 Existing Contests
        </h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">🏆</div>
          <p>No contests created yet</p>
          <p className="text-sm mt-1">
            Create your first contest using the form above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          📋 Existing Contests
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {contests.length} contest{contests.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Submissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contests.map(contest => {
              const isSelected = selectedContestId === contest.id;
              return (
                <tr
                  key={contest.id}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => {
                    // If there's a contest selection handler, call it
                    onContestSelect?.(contest);
                    // Navigate to submissions page
                    window.location.href = `/admin/${contest.id}/submissions`;
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {isSelected && (
                        <div className="mr-3 text-blue-600">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                      <div>
                        <div
                          className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}
                        >
                          {contest.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {contest.id}
                        </div>
                        {contest.description && (
                          <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                            {contest.description}
                          </div>
                        )}
                        <div className="text-xs text-blue-600 mt-1 font-medium">
                          Click to view submissions →
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contest.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {contest.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(contest.startDate)} -{' '}
                    {formatDate(contest.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contest.maxSubmissionsPerCategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(contest.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Future actions */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          💡 Future: Edit/delete actions will be added here
        </p>
      </div>
    </div>
  );
}
