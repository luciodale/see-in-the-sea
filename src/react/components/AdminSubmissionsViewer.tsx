import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type { AdminUsersResponse } from '../../pages/api/admin/users';
import {
  getFullQualityImageUrl,
  getThumbnailImageApiUrl,
} from '../../server/imageService';
import type {
  AdminSubmission,
  AdminSubmissionsResponse,
} from '../../types/api';
import { LazyImage } from './LazyImage';

type AdminSubmissionsViewerProps = {
  contestId: string;
};

type Filters = {
  search: string;
};

type UserWithoutUploads = {
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  lastActiveAt?: string;
  hasUploaded: boolean;
  paymentAmount: number;
};

export function AdminSubmissionsViewer({
  contestId,
}: AdminSubmissionsViewerProps) {
  const { getToken } = useAuth();
  const [allSubmissions, setAllSubmissions] = useState<AdminSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<
    AdminSubmission[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // User data from Clerk
  const [totalClerkUsers, setTotalClerkUsers] = useState<number>(0);
  const [usersWithoutUploads, setUsersWithoutUploads] = useState<
    UserWithoutUploads[]
  >([]);
  const [userPayments, setUserPayments] = useState<Record<string, number>>({});
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const toggleRow = (submissionId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

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
        throw new Error('Impossibile recuperare le submission');
      }

      setAllSubmissions(result.data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Impossibile recuperare le submission'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Client-side filtering
  useEffect(() => {
    let filtered = allSubmissions;

    // Filter by search term (name and email)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(submission => {
        const firstName = submission.firstName?.toLowerCase() || '';
        const lastName = submission.lastName?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const email = submission.userEmail.toLowerCase();

        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    setFilteredSubmissions(filtered);
  }, [allSubmissions, filters]);

  // Fetch users data from Clerk
  const fetchUsersData = async () => {
    try {
      setIsLoadingUsers(true);

      const token = await getToken();
      if (!token) {
        throw new Error('Token di autenticazione non disponibile');
      }

      const response = await fetch(`/api/admin/users?contestId=${contestId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result: AdminUsersResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error('Impossibile recuperare i dati degli utenti');
      }

      setTotalClerkUsers(result.data.totalUsers);
      setUsersWithoutUploads(result.data.usersWithoutUploads);
      setUserPayments(result.data.userPayments);
    } catch (error) {
      console.error('Error fetching users data:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchAllSubmissions();
    fetchUsersData();
  }, [contestId]);

  const handleSearchChange = (value: string) => {
    setFilters({ search: value });
  };

  // Always group submissions by user for the new UI
  const groupedByUser = filteredSubmissions.reduce(
    (groups, submission) => {
      const userEmail = submission.userEmail;
      if (!groups[userEmail]) {
        groups[userEmail] = [];
      }
      groups[userEmail].push(submission);
      return groups;
    },
    {} as Record<string, AdminSubmission[]>
  );

  // Create user-level rows
  const userRows = Object.entries(groupedByUser).map(([email, submissions]) => {
    const firstSubmission = submissions[0];
    return {
      userEmail: email,
      firstName: firstSubmission.firstName,
      lastName: firstSubmission.lastName,
      userCreatedAt: firstSubmission.userCreatedAt,
      userLastActiveAt: firstSubmission.userLastActiveAt,
      hasPaid: firstSubmission.hasPaid,
      submissions: submissions,
      submissionCount: submissions.length,
    };
  });

  // Calculate aggregate statistics
  const usersWhoSubmitted = Object.keys(groupedByUser).length;
  const usersWhoPaid = Object.values(groupedByUser).filter(
    submissions => submissions[0].hasPaid
  ).length;

  const formatDate = (dateString: string | null | undefined) => {
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

  const formatAmount = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

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
                {userRows.length} utenti con {filteredSubmissions.length} foto (
                {allSubmissions.length} totali)
              </p>
            </div>
          </div>
        </div>

        {/* Aggregate Statistics */}
        <div className="px-6 py-4 bg-slate-800/30 border-b border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Registered Users */}
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Utenti Registrati
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {isLoadingUsers ? '...' : totalClerkUsers}
                  </p>
                  {!isLoadingUsers && usersWithoutUploads.length > 0 && (
                    <button
                      onClick={() => setShowUsersModal(true)}
                      className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
                    >
                      {usersWithoutUploads.length} senza foto
                    </button>
                  )}
                </div>
                <div className="bg-blue-900/40 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-blue-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Users Who Submitted */}
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Utenti con Foto
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {usersWhoSubmitted}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {totalClerkUsers > 0
                      ? `${Math.round((usersWhoSubmitted / totalClerkUsers) * 100)}%`
                      : '0%'}
                  </p>
                </div>
                <div className="bg-emerald-900/40 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-emerald-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Users Who Paid */}
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Utenti Pagati
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {usersWhoPaid}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {usersWhoSubmitted > 0
                      ? `${Math.round((usersWhoPaid / usersWhoSubmitted) * 100)}%`
                      : '0%'}{' '}
                    con foto
                  </p>
                </div>
                <div className="bg-green-900/40 rounded-full p-3">
                  <svg
                    className="w-6 h-6 text-green-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-700">
          <div className="max-w-md">
            <label
              htmlFor="search-filter"
              className="block text-xs font-medium text-slate-200 mb-1"
            >
              Cerca User
            </label>
            <input
              id="search-filter"
              type="text"
              value={filters.search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Cerca per nome o email..."
              className="w-full px-3 py-2 text-sm border border-slate-700 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
                <p>Caricamento...</p>
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
                  Nessun Utente Trovato
                </h3>
                <p className="text-slate-300">
                  {filters.search
                    ? 'Nessun utente corrisponde alla tua ricerca.'
                    : 'Nessun utente ha ancora inviato foto.'}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800/40">
                  <tr>
                    <th className="px-6 py-3 w-10"></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Registrato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Ultima Attività
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      # Foto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Importo Pagato
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900">
                  {userRows.map(userRow => {
                    const isExpanded = expandedRows.has(userRow.userEmail);
                    return (
                      <>
                        {/* User Row */}
                        <tr
                          key={userRow.userEmail}
                          onClick={() => toggleRow(userRow.userEmail)}
                          className="hover:bg-slate-800/50 cursor-pointer border-b border-slate-700"
                        >
                          {/* Expand/Collapse Icon */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <svg
                              className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </td>

                          {/* Name */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {userRow.firstName || userRow.lastName ? (
                              <p className="text-sm font-medium text-white">
                                {userRow.firstName || ''}{' '}
                                {userRow.lastName || ''}
                              </p>
                            ) : (
                              <span className="text-xs text-slate-500">—</span>
                            )}
                          </td>

                          {/* Email */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm text-slate-300">
                              {userRow.userEmail}
                            </p>
                          </td>

                          {/* Payment Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {userRow.hasPaid ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/40 text-green-300 border border-green-700">
                                ✓ Pagato
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/40 text-red-300 border border-red-700">
                                ✗ Non Pagato
                              </span>
                            )}
                          </td>

                          {/* Registered Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {userRow.userCreatedAt
                              ? formatDate(userRow.userCreatedAt)
                              : '—'}
                          </td>

                          {/* Last Active */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {userRow.userLastActiveAt
                              ? formatDate(userRow.userLastActiveAt)
                              : '—'}
                          </td>

                          {/* Photo Count */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-900/40 text-emerald-300 border border-emerald-700">
                              {userRow.submissionCount}
                            </span>
                          </td>

                          {/* Payment Amount */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {userPayments[userRow.userEmail] ? (
                              <span className="font-medium text-green-300">
                                {formatAmount(userPayments[userRow.userEmail])}
                              </span>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>
                        </tr>

                        {/* Expanded Submissions */}
                        {isExpanded && (
                          <tr className="bg-slate-800/30">
                            <td colSpan={100} className="px-0 py-0">
                              <div className="px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6">
                                {userRow.submissions.map(submission => (
                                  <div
                                    key={submission.id}
                                    className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden"
                                  >
                                    <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6">
                                      {/* Image Preview */}
                                      <div className="md:col-span-1">
                                        {submission.r2ImageId ? (
                                          <LazyImage
                                            src={
                                              getThumbnailImageApiUrl(
                                                submission.r2ImageId
                                              ) || ''
                                            }
                                            alt={submission.title}
                                            className="relative w-full max-h-64 md:max-h-none aspect-square md:aspect-auto"
                                          />
                                        ) : (
                                          <div className="w-full aspect-video bg-slate-800 rounded-lg flex items-center justify-center">
                                            <span className="text-slate-500 text-sm">
                                              Nessuna immagine
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Submission Details */}
                                      <div className="md:col-span-2 space-y-3 md:space-y-4">
                                        {/* Title and Description */}
                                        <div>
                                          <h3 className="text-base md:text-lg font-semibold text-white mb-1 md:mb-2">
                                            {submission.title}
                                          </h3>
                                          {submission.description && (
                                            <p className="text-xs md:text-sm text-slate-300">
                                              {submission.description}
                                            </p>
                                          )}
                                        </div>

                                        {/* Metadata Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                                          <div>
                                            <span className="text-slate-400">
                                              Categoria:
                                            </span>
                                            <span className="ml-2 text-white">
                                              {submission.categoryName}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-400">
                                              Caricato:
                                            </span>
                                            <span className="ml-2 text-white">
                                              {formatDate(
                                                submission.uploadedAt
                                              )}
                                            </span>
                                          </div>
                                          {submission.categoryId ===
                                            'mediterranean' &&
                                            submission.portfolio && (
                                              <>
                                                <div>
                                                  <span className="text-slate-400">
                                                    Portfolio:
                                                  </span>
                                                  <span className="ml-2 text-white">
                                                    {submission.portfolio}
                                                  </span>
                                                </div>
                                                {submission.portfolioPhotoType && (
                                                  <div>
                                                    <span className="text-slate-400">
                                                      Tipo:
                                                    </span>
                                                    <span className="ml-2 text-white capitalize">
                                                      {submission.portfolioPhotoType.replace(
                                                        '-',
                                                        ' '
                                                      )}
                                                    </span>
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          <div className="md:col-span-2">
                                            <span className="text-slate-400">
                                              ID:
                                            </span>
                                            <span className="ml-2 text-slate-300 text-xs font-mono break-all">
                                              {submission.id}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-2">
                                          <button
                                            onClick={e => {
                                              e.stopPropagation();
                                              if (!submission.r2ImageId) {
                                                alert('No image ID found');
                                                return;
                                              }
                                              window.open(
                                                getFullQualityImageUrl(
                                                  submission.r2ImageId
                                                ) || '',
                                                '_blank'
                                              );
                                            }}
                                            className="inline-flex items-center px-3 md:px-4 py-2 border border-slate-700 text-xs md:text-sm font-medium rounded-md text-slate-200 bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
                                          >
                                            <svg
                                              className="w-4 h-4 mr-2"
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
                                            Visualizza Originale
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Users Without Uploads Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                Utenti Senza Foto ({usersWithoutUploads.length})
              </h3>
              <button
                type="button"
                onClick={() => setShowUsersModal(false)}
                aria-label="Chiudi"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-auto flex-1">
              <table className="min-w-full divide-y divide-slate-700">
                <thead className="bg-slate-800/40 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Registrato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Ultima Attività
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Pagato
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-700">
                  {usersWithoutUploads.map(user => (
                    <tr key={user.email} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.firstName || user.lastName ? (
                          <p className="text-sm font-medium text-white">
                            {user.firstName || ''} {user.lastName || ''}
                          </p>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-slate-300">{user.email}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {formatDate(user.lastActiveAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.paymentAmount > 0 ? (
                          <span className="text-sm font-medium text-green-300">
                            {formatAmount(user.paymentAmount)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-900/40 text-red-300 border border-red-700">
                            Non Pagato
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-700 flex justify-end">
              <button
                type="button"
                onClick={() => setShowUsersModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
