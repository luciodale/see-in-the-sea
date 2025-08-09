import { useEffect, useState } from 'react';
import type { ContestsResponse, ContestWithCategories } from '../../types/api';

type ContestOverviewProps = {
  onUploadClick?: (categoryId: string) => void;
};

export default function ContestOverview({
  onUploadClick,
}: ContestOverviewProps) {
  const [data, setData] = useState<ContestWithCategories | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContest() {
      try {
        const response = await fetch('/api/contests');
        const contestData: ContestsResponse = await response.json();

        if (contestData.success && contestData.data) {
          setData(contestData.data);
        } else {
          setError(contestData.message || 'Failed to load contest');
        }
      } catch (err) {
        setError('Failed to fetch contest data');
        console.error('Contest fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContest();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading contest...</span>
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
              Error Loading Contest
            </h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const { contest, categories } = data;

  // Removed dates; using year only in schema now

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Contest Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">{contest.name}</h1>
        {contest.description && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {contest.description}
          </p>
        )}

        <div className="flex justify-center text-sm text-gray-500">
          <div>
            <span className="font-medium">Year:</span>{' '}
            {String((contest as any).year ?? '')}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          Categories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(category => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              {/* Category Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Category Content */}
              <div className="p-6 space-y-4">
                {/* Submission Limit Info */}
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Max submissions:</span>{' '}
                  {contest.maxSubmissionsPerCategory || 2}
                </div>

                {/* Upload Button */}
                <button
                  onClick={() => onUploadClick?.(category.id)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contest Rules */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Contest Rules
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>
              Upload up to {contest.maxSubmissionsPerCategory || 2} photos per
              category
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>You can replace uploaded images before the deadline</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Images will be optimized for web display automatically</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-blue-600 mt-1">•</span>
            <span>Make sure your photos follow the theme of each category</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
