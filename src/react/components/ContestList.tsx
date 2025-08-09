import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type { Contest } from '../../db/index.js';
import type { ContestListResponse } from '../../types/api';
import EditContestModal from './EditContestModal';

type ContestListProps = {
  refreshTrigger?: number; // To trigger refresh when new contest is created
  onContestSelect?: (contest: Contest) => void;
  selectedContestId?: string;
};

export default function ContestList({
  refreshTrigger,
  onContestSelect,
}: ContestListProps) {
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Contest | null>(null);

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
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Max Submissions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-slate-900 divide-y divide-slate-700">
            {contests.map(contest => {
              // const isSelected = selectedContestId === contest.id;
              return (
                <tr
                  key={contest.id}
                  className={'cursor-pointer'}
                  onClick={() => {
                    onContestSelect?.(contest);
                    const to =
                      contest.status === 'active'
                        ? '/admin/$contestId/submissions'
                        : '/admin/$contestId/results';
                    navigate({ to, params: { contestId: contest.id } });
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
                        <div className="text-xs text-emerald-400 mt-1 font-medium capitalize">
                          Click to view{' '}
                          {contest.status === 'active'
                            ? 'submissions'
                            : 'results'}{' '}
                          →
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-800/60 text-slate-300 border border-slate-700 capitalize">
                      {contest.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {contest.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {contest.maxSubmissionsPerCategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {formatDate(contest.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      className="inline-flex items-center px-3 py-1 border border-slate-700 text-sm font-medium rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      onClick={async e => {
                        e.stopPropagation();
                        setEditing(contest);
                        setEditOpen(true);
                      }}
                    >
                      Edit
                    </button>
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
      {editing && (
        <EditContestModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          contest={{
            id: editing.id,
            name: editing.name,
            description: editing.description ?? null,
            year: editing.year,
            status: editing.status,
            maxSubmissionsPerCategory: editing.maxSubmissionsPerCategory || 2,
          }}
          onSuccess={fetchContests}
        />
      )}
    </div>
  );
}

//
