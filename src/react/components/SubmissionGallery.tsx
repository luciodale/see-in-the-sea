import { useEffect, useState } from 'react';
import type { Submission } from '../../db/index.js';
import type {
  CategoryWithSubmissions,
  SubmissionsResponse,
  UserContestData,
} from '../../types/api.js';
import EditSubmissionModal from './EditSubmissionModal';

type SubmissionGalleryProps = {
  onReplaceImage?: (submissionId: string, categoryId: string) => void;
  onImageClick?: (imageUrl: string, title: string) => void;
  refreshTrigger?: number;
};

export default function SubmissionGallery({
  onReplaceImage,
  onImageClick,
  refreshTrigger,
}: SubmissionGalleryProps) {
  const [data, setData] = useState<UserContestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit modal state
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
      setLoading(true);
      const response = await fetch('/api/submissions');
      const submissionsData = (await response.json()) as SubmissionsResponse;

      if (submissionsData.success && submissionsData.data) {
        setData(submissionsData.data);
        setError(null);
      } else {
        setError(submissionsData.message || 'Failed to load submissions');
      }
    } catch (err) {
      setError('Failed to fetch submissions');
      console.error('Submissions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [refreshTrigger]);

  const handleDeleteSubmission = async (submissionId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this submission? This action cannot be undone.'
      )
    ) {
      return;
    }

    setDeletingId(submissionId);
    try {
      const response = await fetch('/api/upload-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });

      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (result.success) {
        // Refresh submissions after successful delete
        await fetchSubmissions();
      } else {
        setError(result.message || 'Failed to delete submission');
      }
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete submission');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditSubmission = (submission: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    contestId: string;
    categoryId: string;
    userEmail: string;
  }) => {
    setEditingSubmission(submission);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Refresh submissions after successful edit
    fetchSubmissions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading your submissions...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error Loading Submissions
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { contest, categories } = data;

  // Check if user has any submissions at all
  const hasAnySubmissions = categories.some(
    (category: CategoryWithSubmissions) => category.submissions.length > 0
  );

  return (
    <>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">My Submissions</h1>
          <p className="text-gray-600 mt-2">{contest?.name}</p>
        </div>

        {/* Overall Status */}
        {!hasAnySubmissions && (
          <div className="text-center p-12 bg-gray-50 rounded-xl">
            <div className="text-gray-500">
              <svg
                className="mx-auto h-16 w-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Submissions Yet
              </h3>
              <p className="text-gray-600">
                Upload your first photo to get started!
              </p>
            </div>
          </div>
        )}

        {/* Categories with Submissions */}
        {categories.map((category: CategoryWithSubmissions) => (
          <div key={category.id} className="space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {category.name}
              </h2>
              <p className="text-sm text-gray-600">
                {category.submissions.length} /{' '}
                {contest?.maxSubmissionsPerCategory} submissions
              </p>
            </div>

            {category.submissions.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <div className="text-gray-500">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-900">
                    No submissions in this category yet
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Upload a photo to get started
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.submissions.map(submission => (
                  <div
                    key={submission.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
                  >
                    {/* Image */}
                    <button
                      type="button"
                      className="aspect-w-16 aspect-h-12 bg-gray-100 w-full"
                      onClick={() =>
                        onImageClick?.(submission.imageUrl, submission.title)
                      }
                    >
                      <img
                        src={`/api/images/${submission.imageUrl}`}
                        alt={submission.title}
                        className="w-full h-48 object-cover hover:opacity-95 transition-opacity"
                      />
                    </button>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">
                          {submission.title}
                        </h3>
                        {submission.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {submission.description}
                          </p>
                        )}
                      </div>

                      <div className="text-xs text-gray-500">
                        Uploaded{' '}
                        {new Date(
                          submission.uploadedAt || ''
                        ).toLocaleDateString()}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2 pt-2">
                        {/* Edit Button */}
                        <button
                          onClick={() =>
                            handleEditSubmission({
                              id: submission.id,
                              title: submission.title,
                              description: submission.description || '',
                              imageUrl: submission.imageUrl,
                              contestId: (submission as Submission).contestId,
                              categoryId: (submission as Submission).categoryId,
                              userEmail: (submission as Submission).userEmail,
                            })
                          }
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                        >
                          <svg
                            className="h-4 w-4"
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
                          <span>Edit</span>
                        </button>

                        {/* Replace Button */}
                        <button
                          onClick={() =>
                            onReplaceImage?.(submission.id, category.id)
                          }
                          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <span>Replace</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteSubmission(submission.id)}
                          disabled={deletingId === submission.id}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1 disabled:opacity-50"
                        >
                          {deletingId === submission.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700"></div>
                              <span>Deleting...</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
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
