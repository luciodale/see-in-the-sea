import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { CURRENT_CONTEST_CATEGORIES } from '../../constants/categories';
import { getImageApiUrl } from '../../server/imageService';
import type {
  AdminSubmission,
  AdminSubmissionsResponse,
} from '../../types/api';
import EditSubmissionModal from './EditSubmissionModal';

type AdminSubmissionsViewerProps = {
  contestId: string;
};

type Filters = {
  categoryId: string;
  search: string;
};

type JudgeFlags = {
  isRejected: boolean;
  isKeep: boolean;
  isUnsure: boolean;
};

type SubmissionWithFlags = AdminSubmission & {
  judgeFlags: JudgeFlags;
};

export function AdminSubmissionsViewer({
  contestId,
}: AdminSubmissionsViewerProps) {
  const { getToken } = useAuth();
  const [allSubmissions, setAllSubmissions] = useState<SubmissionWithFlags[]>(
    []
  );
  const [filteredSubmissions, setFilteredSubmissions] = useState<
    SubmissionWithFlags[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    categoryId: '',
    search: '',
  });
  const [showUserColumn, setShowUserColumn] = useState(false);
  const [showDateColumn, setShowDateColumn] = useState(false);
  const [groupByUser, setGroupByUser] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<{
    id: string;
    title: string;
    description: string;
    r2ImageId: string | null;
    contestId: string;
    categoryId: string;
    userEmail: string;
  } | null>(null);

  // Fetch all submissions for the contest (no server-side filtering)
  const fetchAllSubmissions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Token di autenticazione non disponibile');
      }

      // Fetch all submissions for the contest without pagination or filters
      const response = await fetch(
        `/api/admin/manage-submissions?contestId=${contestId}&limit=10000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result: AdminSubmissionsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('Impossibile recuperare le invia');
      }

      // Add judge flags to each submission
      const submissionsWithFlags: SubmissionWithFlags[] = (
        result.data || []
      ).map((submission: AdminSubmission) => ({
        ...submission,
        judgeFlags: {
          isRejected: false,
          isKeep: false,
          isUnsure: false,
        },
      }));

      setAllSubmissions(submissionsWithFlags);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Impossibile recuperare le invia'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side filtering
  useEffect(() => {
    let filtered = allSubmissions;

    // Filter by category
    if (filters.categoryId) {
      filtered = filtered.filter(
        submission => submission.categoryId === filters.categoryId
      );
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        submission =>
          submission.title.toLowerCase().includes(searchLower) ||
          (submission.description &&
            submission.description.toLowerCase().includes(searchLower))
      );
    }

    setFilteredSubmissions(filtered);
  }, [allSubmissions, filters]);

  useEffect(() => {
    fetchAllSubmissions();
  }, [contestId]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleEditSubmission = (submission: SubmissionWithFlags) => {
    setEditingSubmission({
      id: submission.id,
      title: submission.title,
      description: submission.description || '',
      r2ImageId: submission.r2ImageId,
      contestId: submission.contestId,
      categoryId: submission.categoryId,
      userEmail: submission.userEmail,
    });
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchAllSubmissions(); // Refresh the list
  };

  const clearFilters = () => {
    setFilters({
      categoryId: '',
      search: '',
    });
  };

  const updateJudgeFlags = (
    submissionId: string,
    flags: Partial<JudgeFlags>
  ) => {
    setAllSubmissions(prev =>
      prev.map(submission =>
        submission.id === submissionId
          ? {
              ...submission,
              judgeFlags: { ...submission.judgeFlags, ...flags },
            }
          : submission
      )
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const parsed = Date.parse(dateString);
    if (Number.isNaN(parsed)) return '—';
    return new Date(parsed).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group submissions by user if requested
  const groupedSubmissions = groupByUser
    ? filteredSubmissions.reduce(
        (groups, submission) => {
          const userEmail = submission.userEmail;
          if (!groups[userEmail]) {
            groups[userEmail] = [];
          }
          groups[userEmail].push(submission);
          return groups;
        },
        {} as Record<string, SubmissionWithFlags[]>
      )
    : { All: filteredSubmissions };

  return (
    <>
      <div className="bg-slate-900 border border-slate-700 rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Concorso Corrente
              </h2>
              <p className="text-slate-300 text-sm">
                {filteredSubmissions.length} invia mostrate di{' '}
                {allSubmissions.length} totali
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-700 rounded-md hover:bg-slate-800 cursor-pointer"
              >
                Cancella Filtri
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label
                htmlFor="search-filter"
                className="block text-xs font-medium text-slate-200 mb-1"
              >
                Cerca Titolo
              </label>
              <input
                id="search-filter"
                type="text"
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                placeholder="Cerca per titolo..."
                className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <label
                htmlFor="category-filter"
                className="block text-xs font-medium text-slate-200 mb-1"
              >
                Categoria
              </label>
              <select
                id="category-filter"
                value={filters.categoryId}
                onChange={e => handleFilterChange('categoryId', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Tutte le categorie</option>
                {CURRENT_CONTEST_CATEGORIES.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Column Visibility Toggles */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-medium text-slate-200 mb-1">
                Colonne Visibili
              </label>
              <div className="flex gap-2">
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUserColumn}
                    onChange={e => setShowUserColumn(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-600 rounded bg-slate-700"
                  />
                  <span className="text-xs text-slate-300">Utente</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showDateColumn}
                    onChange={e => setShowDateColumn(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-600 rounded bg-slate-700"
                  />
                  <span className="text-xs text-slate-300">Data</span>
                </label>
              </div>
            </div>

            {/* Grouping Toggle */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-medium text-slate-200 mb-1">
                Raggruppamento
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupByUser}
                  onChange={e => setGroupByUser(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-600 rounded bg-slate-700"
                />
                <span className="text-xs text-slate-300">
                  Raggruppa per utente
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="px-6 py-4 bg-red-900/30 border-b border-red-800">
            <p className="text-red-200 text-sm">❌ {error}</p>
          </div>
        )}

        {/* Submissions Table */}
        <div className="overflow-x-auto rounded-b-lg">
          {isLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="text-slate-300">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                <p>Caricamento invia...</p>
              </div>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-slate-400">
                <svg
                  className="mx-auto h-12 w-12 text-slate-500 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-white mb-2">
                  Nessuna Invia Trovata
                </h3>
                <p className="text-slate-300">
                  {Object.values(filters).some(v => v)
                    ? 'Prova ad aggiustare i filtri per vedere più risultati.'
                    : 'Nessuna invia è stata ancora caricata.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSubmissions).map(
                ([groupKey, submissions]) => (
                  <div key={groupKey}>
                    {groupByUser && groupKey !== 'All' && showUserColumn && (
                      <div className="px-6 py-2 bg-slate-800/50 border-b border-slate-700">
                        <h3 className="text-sm font-medium text-white">
                          Utente: {groupKey}
                        </h3>
                      </div>
                    )}

                    <table className="min-w-full divide-y divide-slate-700">
                      <thead className="bg-slate-800/40">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Titolo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Info Portfolio
                          </th>
                          {showUserColumn && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                              Utente
                            </th>
                          )}
                          {showDateColumn && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                              Data Caricamento
                            </th>
                          )}
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Valutazione Giudici
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                            Azioni
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-slate-900 divide-y divide-slate-700">
                        {submissions.map(submission => (
                          <tr
                            key={submission.id}
                            className="hover:bg-slate-800/50"
                          >
                            {/* Title */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-white truncate">
                                  {submission.title}
                                </p>
                                {submission.description && (
                                  <p className="text-xs text-slate-400 truncate max-w-xs">
                                    {submission.description}
                                  </p>
                                )}
                                <p className="text-xs text-slate-400 break-all truncate">
                                  ID: {submission.id}
                                </p>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-white">
                                {submission.categoryName}
                              </p>
                            </td>

                            {/* Portfolio Info */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {submission.categoryId === 'mediterranean' &&
                              submission.portfolio &&
                              submission.portfolioPhotoType ? (
                                <div>
                                  <p className="text-sm font-medium text-white">
                                    Portfolio {submission.portfolio}
                                  </p>
                                  <p className="text-xs text-slate-400 capitalize">
                                    {submission.portfolioPhotoType.replace(
                                      '-',
                                      ' '
                                    )}
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-500">
                                  —
                                </span>
                              )}
                            </td>

                            {/* User (conditional) */}
                            {showUserColumn && (
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-sm text-white">
                                  {submission.userEmail}
                                </p>
                              </td>
                            )}

                            {/* Upload Date (conditional) */}
                            {showDateColumn && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                {formatDate(submission.uploadedAt)}
                              </td>
                            )}

                            {/* Judge Flags */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    updateJudgeFlags(submission.id, {
                                      isRejected:
                                        !submission.judgeFlags.isRejected,
                                      isKeep: false,
                                      isUnsure: false,
                                    })
                                  }
                                  className={`px-2 py-1 text-xs rounded ${
                                    submission.judgeFlags.isRejected
                                      ? 'bg-red-600 text-white'
                                      : 'bg-slate-700 text-slate-300 hover:bg-red-600'
                                  }`}
                                >
                                  ❌ Rifiuta
                                </button>
                                <button
                                  onClick={() =>
                                    updateJudgeFlags(submission.id, {
                                      isRejected: false,
                                      isKeep: !submission.judgeFlags.isKeep,
                                      isUnsure: false,
                                    })
                                  }
                                  className={`px-2 py-1 text-xs rounded ${
                                    submission.judgeFlags.isKeep
                                      ? 'bg-green-600 text-white'
                                      : 'bg-slate-700 text-slate-300 hover:bg-green-600'
                                  }`}
                                >
                                  ✅ Mantieni
                                </button>
                                <button
                                  onClick={() =>
                                    updateJudgeFlags(submission.id, {
                                      isRejected: false,
                                      isKeep: false,
                                      isUnsure: !submission.judgeFlags.isUnsure,
                                    })
                                  }
                                  className={`px-2 py-1 text-xs rounded ${
                                    submission.judgeFlags.isUnsure
                                      ? 'bg-yellow-600 text-white'
                                      : 'bg-slate-700 text-slate-300 hover:bg-yellow-600'
                                  }`}
                                >
                                  ❓ Incerto
                                </button>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                              <button
                                onClick={() => handleEditSubmission(submission)}
                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                  />
                                </svg>
                                Modifica
                              </button>

                              <button
                                onClick={() =>
                                  window.open(
                                    getImageApiUrl(submission.r2ImageId) || '',
                                    '_blank'
                                  )
                                }
                                className="inline-flex items-center px-3 py-1 border border-slate-700 text-sm font-medium rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                              >
                                <svg
                                  className="w-4 h-4 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Visualizza
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingSubmission && (
        <EditSubmissionModal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingSubmission(null);
          }}
          submission={editingSubmission}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
