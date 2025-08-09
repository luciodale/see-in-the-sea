import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type {
  AdminSubmission,
  AdminSubmissionsResponse,
} from '../../types/api';
import CategorySelect from './CategorySelect';
import EditSubmissionModal from './EditSubmissionModal';

type AdminSubmissionsBrowserProps = {
  contestId: string;
};

type Filters = {
  categoryId: string;
  userEmail: string;
  search: string;
};

export default function AdminSubmissionsBrowser({
  contestId,
}: AdminSubmissionsBrowserProps) {
  const { getToken } = useAuth();
  const [submissions, setSubmissions] = useState<AdminSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    categoryId: '',
    userEmail: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSubmission, setEditingSubmission] = useState<{
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    contestId: string;
    categoryId: string;
    userEmail: string;
  } | null>(null);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      // Build query parameters - contestId is always included
      const params = new URLSearchParams({
        contestId: contestId, // Always filter by the current contest
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
      });

      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.userEmail) params.append('userEmail', filters.userEmail);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/admin/manage-submissions?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: AdminSubmissionsResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('Failed to fetch submissions');
      }

      setSubmissions(result.data || []);
      setTotalCount(result.totalCount || 0);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to fetch submissions'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filters, currentPage]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleEditSubmission = (submission: AdminSubmission) => {
    setEditingSubmission({
      id: submission.id,
      title: submission.title,
      description: submission.description || '',
      imageUrl: submission.imageUrl,
      contestId: submission.contestId,
      categoryId: submission.categoryId,
      userEmail: submission.userEmail,
    });
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchSubmissions(); // Refresh the list
  };

  const clearFilters = () => {
    setFilters({
      categoryId: '',
      userEmail: '',
      search: '',
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    const parsed = Date.parse(dateString);
    if (Number.isNaN(parsed)) return '—';
    return new Date(parsed).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Keep the view mounted; show loading inside the table area

  return (
    <>
      <div className="bg-slate-900 border border-slate-700 rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">All Submissions</h2>
              <p className="text-slate-300 text-sm">
                {totalCount} total submissions{' '}
                {totalCount !== submissions.length &&
                  `(showing ${submissions.length})`}
              </p>
            </div>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-700 rounded-md hover:bg-slate-800"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label
                htmlFor="search-filter"
                className="block text-xs font-medium text-slate-200 mb-1"
              >
                Search Title
              </label>
              <input
                id="search-filter"
                type="text"
                value={filters.search}
                onChange={e => handleFilterChange('search', e.target.value)}
                placeholder="Search by title..."
                className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Category Filter */}
            <CategorySelect
              id="category-filter"
              label="Category"
              value={filters.categoryId}
              onChange={val => handleFilterChange('categoryId', val)}
              includeAllOption
              allLabel="All"
            />

            {/* User Email Filter */}
            <div>
              <label
                htmlFor="email-filter"
                className="block text-xs font-medium text-slate-200 mb-1"
              >
                User Email
              </label>
              <input
                id="email-filter"
                type="text"
                value={filters.userEmail}
                onChange={e => handleFilterChange('userEmail', e.target.value)}
                placeholder="Filter by email..."
                className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
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
                <p>Loading submissions...</p>
              </div>
            </div>
          ) : submissions.length === 0 ? (
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
                  No Submissions Found
                </h3>
                <p className="text-slate-300">
                  {Object.values(filters).some(v => v)
                    ? 'Try adjusting your filters to see more results.'
                    : 'No submissions have been uploaded yet.'}
                </p>
              </div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800/40">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Submission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Contest & Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 divide-y divide-slate-700">
                {submissions.map(submission => (
                  <tr key={submission.id} className="hover:bg-slate-800/50">
                    {/* Submission Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img
                          src={`/api/images/${submission.imageUrl}`}
                          alt={submission.title}
                          className="w-16 h-16 object-cover rounded-lg border border-slate-700"
                        />
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
                      </div>
                    </td>

                    {/* Contest & Category */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {submission.contestName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {submission.categoryName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {submission.contestId} / {submission.categoryId}
                        </p>
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-white">
                        {submission.userEmail}
                      </p>
                    </td>

                    {/* Upload Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {formatDate(submission.uploadedAt)}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditSubmission(submission)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          window.open(
                            `/api/images/${submission.imageUrl}`,
                            '_blank'
                          )
                        }
                        className="inline-flex items-center px-3 py-1 border border-slate-700 text-sm font-medium rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between text-slate-300">
            <div className="text-sm">
              Showing page {currentPage} of {totalPages} ({totalCount} total)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
