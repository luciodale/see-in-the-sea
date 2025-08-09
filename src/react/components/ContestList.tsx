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
    if (!dateString) return '—';
    const parsed = Date.parse(dateString);
    if (Number.isNaN(parsed)) return '—';
    return new Date(parsed).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          📋 Existing Contests
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <span className="ml-2 text-slate-300">Loading contests...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          📋 Existing Contests
        </h3>
        <div className="text-center py-8">
          <div className="text-red-400 text-4xl mb-2">❌</div>
          <p className="text-red-300">{error}</p>
          <button
            onClick={fetchContests}
            className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          📋 Existing Contests
        </h3>
        <div className="text-center py-8 text-slate-400">
          <div className="text-4xl mb-2">🏆</div>
          <p>No contests created yet</p>
          <p className="text-sm mt-1">
            Create your first contest using the create page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg">
      <div className="px-6 py-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">
          📋 Existing Contests
        </h3>
        <p className="text-sm text-slate-300 mt-1">
          {contests.length} contest{contests.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800/40">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Contest
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Max Submissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-700">
            {contests.map(contest => {
              const isSelected = selectedContestId === contest.id;
              return (
                <tr
                  key={contest.id}
                  className={'cursor-pointer'}
                  onClick={() => {
                    // If there's a contest selection handler, call it
                    onContestSelect?.(contest);
                    // Navigate to submissions page
                    window.location.href = `/admin/${contest.id}/submissions`;
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className={'text-sm font-medium text-slate-100'}>
                          {contest.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          ID: {contest.id}
                        </div>
                        {contest.description && (
                          <div className="text-xs text-slate-400 mt-1 max-w-xs truncate">
                            {contest.description}
                          </div>
                        )}
                        <div className="text-xs text-emerald-400 mt-1 font-medium">
                          Click to view submissions →
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contest.isActive
                          ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800'
                          : 'bg-slate-800/60 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {contest.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {formatDate(contest.startDate)} -{' '}
                    {formatDate(contest.endDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {contest.maxSubmissionsPerCategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {formatDate(contest.createdAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="px-6 py-3 bg-slate-900 border-t border-slate-700">
        <p className="text-xs text-slate-500">
          💡 More actions will be added here
        </p>
      </div>
    </div>
  );
}
