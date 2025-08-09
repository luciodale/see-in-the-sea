import { useAuth } from '@clerk/clerk-react';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import type {
  AdminResultRow,
  AdminResultsResponse,
} from '../../../types/api.js';
import CategorySelect from '../../components/CategorySelect';
import EditResultModal from '../../components/EditResultModal';

export const Route = createFileRoute('/admin/$contestId/results')({
  component: AdminResultsPage,
});

function AdminResultsPage() {
  const { contestId } = Route.useParams();
  const { getToken } = useAuth();
  const [rows, setRows] = useState<AdminResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    categoryId: '',
    userEmail: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [editing, setEditing] = useState<AdminResultRow | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const token = await getToken();
        if (!token) throw new Error('Auth token not available');

        const params = new URLSearchParams({
          contestId,
          limit: String(itemsPerPage),
          offset: String((currentPage - 1) * itemsPerPage),
        });
        if (filters.categoryId) params.append('categoryId', filters.categoryId);
        if (filters.userEmail) params.append('userEmail', filters.userEmail);
        if (filters.search) params.append('search', filters.search);

        const res = await fetch(`/api/admin/results?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data: AdminResultsResponse = await res.json();
        if (!res.ok || !data.success || !data.data)
          throw new Error(data.message || 'Failed');
        setRows(data.data);
        setTotalCount(data.totalCount || data.data.length);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to fetch results');
      } finally {
        setLoading(false);
      }
    })();
  }, [contestId, getToken, filters, currentPage, itemsPerPage]);

  return (
    <main className="max-w-7xl mx-auto p-6 text-slate-200">
      <div className="px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Results</h2>
            <p className="text-slate-300 text-sm">
              {totalCount} total results{' '}
              {totalCount !== rows.length && `(showing ${rows.length})`}
            </p>
          </div>
          <button
            onClick={() => {
              setFilters({ categoryId: '', userEmail: '', search: '' });
              setCurrentPage(1);
            }}
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
              onChange={e => {
                setFilters(prev => ({ ...prev, search: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Search by title..."
              className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter (dropdown) */}
          <CategorySelect
            id="category-filter"
            label="Category"
            value={filters.categoryId}
            onChange={val => {
              setFilters(prev => ({ ...prev, categoryId: val }));
              setCurrentPage(1);
            }}
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
              onChange={e => {
                setFilters(prev => ({ ...prev, userEmail: e.target.value }));
                setCurrentPage(1);
              }}
              placeholder="Filter by email..."
              className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center">Loading...</div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded">
          {error}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-slate-400">No results found for this contest.</div>
      ) : (
        <div className="overflow-x-auto rounded-b-lg">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800/40">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Title & User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-700">
              {rows.map(r => (
                <tr key={r.submissionId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200 capitalize">
                    {r.result}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    {r.categoryName || r.categoryId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                    <div className="text-white font-medium truncate">
                      {r.title}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {r.userEmail}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      ID: {r.submissionId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={`/api/publicImages/${r.r2Key}`}
                      alt=""
                      className="w-16 h-16 object-cover rounded border border-slate-700"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setEditing(r)}
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
                        window.open(`/api/publicImages/${r.r2Key}`, '_blank')
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
        </div>
      )}
      {Math.ceil(totalCount / itemsPerPage) > 1 && (
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between text-slate-300">
          <div className="text-sm">
            Showing page {currentPage} of {Math.ceil(totalCount / itemsPerPage)}{' '}
            ({totalCount} total)
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
              {currentPage} / {Math.ceil(totalCount / itemsPerPage)}
            </span>
            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(
                    Math.ceil(totalCount / itemsPerPage),
                    currentPage + 1
                  )
                )
              }
              disabled={currentPage === Math.ceil(totalCount / itemsPerPage)}
              className="px-3 py-2 text-sm border border-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {editing && (
        <EditResultModal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          result={{
            resultId: editing.resultId,
            submissionId: editing.submissionId,
            contestId: editing.contestId,
            categoryId: editing.categoryId,
            result: editing.result,
            firstName: editing.firstName,
            lastName: editing.lastName,
          }}
          onSuccess={() => {
            // refetch on success
            setCurrentPage(1);
          }}
        />
      )}
    </main>
  );
}
