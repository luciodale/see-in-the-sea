import { useEffect, useRef, useState } from 'react';
import type {
  ContestsResponse,
  ContestWithCategories,
  UploadResponse,
} from '../../types/api.js';

type ImageUploadFormProps = {
  selectedCategoryId?: string;
  replacedSubmissionId?: string;
  onUploadSuccess?: (result: UploadResponse) => void;
  onCancel?: () => void;
};

export default function ImageUploadForm({
  selectedCategoryId,
  replacedSubmissionId,
  onUploadSuccess,
  onCancel,
}: ImageUploadFormProps) {
  const [contestData, setContestData] = useState<ContestWithCategories | null>(
    null
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState(selectedCategoryId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch contest data on mount
  useEffect(() => {
    async function fetchContestData() {
      try {
        const response = await fetch('/api/contests');
        const data = (await response.json()) as ContestsResponse;
        if (data.success && data.data) {
          setContestData(data.data);
        } else {
          setError('Failed to load contest information');
        }
      } catch (err) {
        console.error('Failed to fetch contest data:', err);
        setError('Failed to load contest information');
      }
    }

    fetchContestData();
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedFile || !categoryId || !title.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!contestData) {
      setError('Contest data not available');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('contestId', contestData.contest.id);
      formData.append('categoryId', categoryId);
      formData.append('title', title.trim());
      formData.append('description', description.trim());

      if (replacedSubmissionId) {
        formData.append('replacedSubmissionId', replacedSubmissionId);
      }

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const result = (await response.json()) as UploadResponse;

      if (result.success) {
        onUploadSuccess?.(result);
        // Reset form
        setSelectedFile(null);
        setPreviewUrl(null);
        setTitle('');
        setDescription('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setDescription('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!contestData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading contest...</span>
      </div>
    );
  }

  const { contest, categories } = contestData;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-xl">
          <h2 className="text-xl font-semibold text-gray-900">
            {replacedSubmissionId ? 'Replace Photo' : 'Upload Photo'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {contest.name} - Submit your entry
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category *
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!!selectedCategoryId || uploading}
              required
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Input */}
          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Photo *
            </label>
            <div className="mt-1">
              <input
                ref={fileInputRef}
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500
                         file:mr-4 file:py-3 file:px-6
                         file:rounded-lg file:border-0
                         file:text-sm file:font-medium
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100
                         file:cursor-pointer cursor-pointer"
                disabled={uploading}
                required={!replacedSubmissionId}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Accepted formats: JPG, PNG, WebP. Max size: 10MB
            </p>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={resetForm}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  disabled={uploading}
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Give your photo a title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={uploading}
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Tell us about your photo (optional)..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={uploading}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500">
              {description.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={
                uploading || !selectedFile || !categoryId || !title.trim()
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>
                    {replacedSubmissionId ? 'Replacing...' : 'Uploading...'}
                  </span>
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
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <span>
                    {replacedSubmissionId ? 'Replace Photo' : 'Upload Photo'}
                  </span>
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={uploading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
