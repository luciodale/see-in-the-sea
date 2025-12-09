import { useAuth } from '@clerk/clerk-react';
import { useRef, useState } from 'react';
import { MAX_IMAGE_SIZE } from '../../constants';
import { useI18n } from '../../i18n/react';
import { ACCEPTED_IMAGE_TYPES } from '../../server/utils';
import type { UploadResponse } from '../../types/api';
import { BaseModal } from './BaseModal';

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  contestId: string;
  portfolio?: string;
  portfolioPhotoType?: string;
  onUploadSuccess: (data: UploadResponse['data']) => void;
  onUploadError: (error: string) => void;
  isAdminUpload?: boolean;
  adminUserEmail?: string;
};

export function UploadModal({
  isOpen,
  onClose,
  categoryId,
  contestId,
  portfolio,
  portfolioPhotoType,
  onUploadSuccess,
  onUploadError,
  isAdminUpload = false,
  adminUserEmail,
}: UploadModalProps) {
  const { t } = useI18n();
  const { getToken } = useAuth();
  const MAX_MB = Math.floor(MAX_IMAGE_SIZE / (1024 * 1024));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    setError(null); // Clear any previous errors when selecting a new file

    if (!file) {
      setSelectedFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    // Check file size and set error if too large, but still show preview
    if (file.size > MAX_IMAGE_SIZE) {
      const actualSize = (file.size / (1024 * 1024)).toFixed(1);
      setError(`${t('form.file-too-large')} (${actualSize}MB/${MAX_MB}MB)`);
    } else {
      setError(null); // Clear error if file size is OK
    }

    setSelectedFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    // Double-check file size before upload (safety measure)
    if (selectedFile.size > MAX_IMAGE_SIZE) {
      const actualSize = (selectedFile.size / (1024 * 1024)).toFixed(1);
      setError(`${t('form.file-too-large')} (${actualSize}MB/${MAX_MB}MB)`);
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error(
          'Authentication required. Please log in and try again.'
        );
      }

      const form = new FormData();
      form.append('image', selectedFile);
      form.append('contestId', contestId);
      form.append('categoryId', categoryId);
      form.append('title', title.trim());
      form.append('description', description.trim());

      // Add portfolio fields if provided
      if (portfolio) {
        form.append('portfolio', portfolio);
      }
      if (portfolioPhotoType) {
        form.append('portfolioPhotoType', portfolioPhotoType);
      }

      // Add admin upload fields if this is an admin upload
      if (isAdminUpload) {
        form.append('adminUpload', 'true');
        if (adminUserEmail) {
          form.append('userEmail', adminUserEmail);
        }
      }

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const result = (await res.json()) as UploadResponse;

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Upload failed');
      }

      // Clear form
      setSelectedFile(null);
      setPreview(null);
      setTitle('');
      setDescription('');
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      onUploadSuccess(result.data);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;

    // Clear form state
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setTitle('');
    setDescription('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isAdminUpload ? 'Admin Upload' : t('modal.upload.title')}
      isLoading={isUploading}
      loadingMessage={t('state.uploading')}
      loadingSubMessage={t('upload.processing-large-file')}
      maxWidth="2xl"
      error={!!error}
    >
      {/* Form */}
      <div className="space-y-4">
        {/* Admin Upload Notice */}
        {isAdminUpload && adminUserEmail && (
          <div className="bg-blue-900/30 border border-blue-700 text-blue-200 rounded-lg p-3">
            <p className="text-sm">
              <strong>Admin Upload:</strong> This image will be uploaded on
              behalf of <span className="font-mono">{adminUserEmail}</span>
            </p>
          </div>
        )}
        {/* File input */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="hidden"
            onChange={e => handleFileChange(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 disabled:opacity-50 cursor-pointer"
          >
            {selectedFile ? selectedFile.name : t('form.choose-file')}
          </button>
        </div>

        {/* Preview */}
        {preview && (
          <div className="relative w-full h-80 bg-slate-900 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            {/* Error overlay on image */}
            {error && (
              <div
                className="absolute bottom-0 left-0 right-0 text-red-100 p-3 text-sm font-medium"
                style={{
                  background: `
                        repeating-linear-gradient(
                          45deg,
                          rgba(127, 29, 29, 0.9),
                          rgba(127, 29, 29, 0.9) 10px,
                          rgba(153, 27, 27, 0.9) 10px,
                          rgba(153, 27, 27, 0.9) 20px
                        )
                      `,
                }}
              >
                {error}
              </div>
            )}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('form.title')} *
          </label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isUploading}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg disabled:opacity-50"
            placeholder={t('form.title-placeholder')}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('form.description-optional')}
          </label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            disabled={isUploading}
            rows={3}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg disabled:opacity-50"
            placeholder={t('form.description-placeholder')}
          />
        </div>

        {/* File size info */}
        <div className="text-xs text-slate-400">
          {t('submissions.max-size')}: {MAX_MB}MB
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleClose}
          disabled={isUploading}
          className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50 cursor-pointer"
        >
          {t('action.cancel')}
        </button>
        <button
          onClick={handleUpload}
          disabled={
            !selectedFile ||
            !title.trim() ||
            isUploading ||
            (selectedFile && selectedFile.size > MAX_IMAGE_SIZE)
          }
          className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isUploading && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          )}
          {isUploading ? t('state.uploading') : t('action.upload')}
        </button>
      </div>
    </BaseModal>
  );
}
