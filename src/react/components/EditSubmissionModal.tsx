import { useAuth } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import type { ManageSubmissionResponse } from '../../types/api';

type EditSubmissionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  submission: {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    contestId: string;
    categoryId: string;
    userEmail: string;
  };
  onSuccess: () => void;
};

export default function EditSubmissionModal({
  isOpen,
  onClose,
  submission,
  onSuccess,
}: EditSubmissionModalProps) {
  const { getToken } = useAuth();

  const [formData, setFormData] = useState({
    title: submission.title,
    description: submission.description || '',
    replaceImage: false,
    imageFile: null as File | null,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when submission changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: submission.title,
        description: submission.description || '',
        replaceImage: false,
        imageFile: null,
      });
      setPreview(null);
      setError(null);
    }
  }, [isOpen, submission]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
      }));

      // If unchecking replace image, clear the file and preview
      if (name === 'replaceImage' && !checked) {
        setFormData(prev => ({ ...prev, imageFile: null }));
        setPreview(null);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image must be less than 10MB');
        return;
      }

      setFormData(prev => ({ ...prev, imageFile: file, replaceImage: true }));

      // Create preview
      const reader = new FileReader();
      reader.onload = e => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setError(null);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, imageFile: null, replaceImage: false }));
    setPreview(null);
    // Reset file input
    const fileInput = document.getElementById(
      'edit-image-upload'
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }

      if (formData.replaceImage && !formData.imageFile) {
        throw new Error('Please select an image to replace with');
      }

      // Get JWT token
      const token = await getToken();
      if (!token) {
        throw new Error('Authentication token not available');
      }

      let requestBody;
      const headers: HeadersInit = {
        Authorization: `Bearer ${token}`,
      };

      if (formData.replaceImage && formData.imageFile) {
        // Use FormData for image replacement
        const uploadFormData = new FormData();
        uploadFormData.append('id', submission.id);
        uploadFormData.append('contestId', submission.contestId);
        uploadFormData.append('categoryId', submission.categoryId);
        uploadFormData.append('userEmail', submission.userEmail);
        uploadFormData.append('title', formData.title);
        uploadFormData.append('description', formData.description);
        uploadFormData.append('replaceImage', 'true');
        uploadFormData.append('image', formData.imageFile);

        requestBody = uploadFormData;
      } else {
        // Use JSON for text-only updates
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify({
          id: submission.id,
          contestId: submission.contestId,
          categoryId: submission.categoryId,
          userEmail: submission.userEmail,
          title: formData.title,
          description: formData.description,
          replaceImage: false,
        });
      }

      // Submit to manage-submissions API
      const response = await fetch('/api/admin/manage-submissions', {
        method: 'POST',
        headers,
        body: requestBody,
      });

      const result = (await response.json()) as ManageSubmissionResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to update submission');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating submission:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to update submission'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Submission</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">❌ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Image */}
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-2">
                Current Photo
              </div>
              <img
                src={`/api/images/${submission.imageUrl}`}
                alt={submission.title}
                className="w-full h-48 object-cover rounded-lg border border-gray-300"
              />
            </div>

            {/* Replace Image Option */}
            <div>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="replaceImage"
                  checked={formData.replaceImage}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Replace image with new one
                </span>
              </label>
            </div>

            {/* New Image Upload */}
            {formData.replaceImage && (
              <div>
                <label
                  htmlFor="edit-image-upload"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Image
                </label>

                {!preview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      id="edit-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="edit-image-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <svg
                        className="w-12 h-12 text-gray-400"
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
                      <span className="text-sm text-gray-600">
                        Click to select new image
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG up to 10MB
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview of replacement"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
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
                )}
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
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </span>
                ) : (
                  'Update Submission'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
