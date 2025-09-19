import { useRef, useState } from 'react';
import { MAX_IMAGE_SIZE } from '../../constants.js';
import { useI18n } from '../../i18n/react';
import { ACCEPTED_IMAGE_TYPES } from '../../server/utils.js';
import type { MediterraneanMeta, UploadResponse } from '../../types/api.js';

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  contestId: string;
  onUploadSuccess: (data: UploadResponse['data']) => void;
  onUploadError: (error: string) => void;
};

export function UploadModal({
  isOpen,
  onClose,
  categoryId,
  contestId,
  onUploadSuccess,
  onUploadError,
}: UploadModalProps) {
  const { t } = useI18n();
  const MAX_MB = Math.floor(MAX_IMAGE_SIZE / (1024 * 1024));

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mediterranean category specific state
  const isMediterranean = categoryId === 'mediterranean';
  const [portfolio, setPortfolio] = useState<1 | 2 | null>(null);
  const [photoType, setPhotoType] = useState<
    'macro' | 'wide-angle' | 'free' | null
  >(null);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
    setError(null); // Clear any previous errors when selecting a new file
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

    // For Mediterranean category, validate meta fields
    if (isMediterranean && (!portfolio || !photoType)) {
      setError(
        'Please select both portfolio and photo type for Mediterranean category'
      );
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('image', selectedFile);
      form.append('contestId', contestId);
      form.append('categoryId', categoryId);
      form.append('title', title.trim());
      form.append('description', description.trim());

      // Add meta data for Mediterranean category
      if (isMediterranean && portfolio && photoType) {
        const meta: MediterraneanMeta = { portfolio, photoType };
        form.append('meta', JSON.stringify(meta));
      }

      const res = await fetch('/api/upload-image', {
        method: 'POST',
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
      setPortfolio(null);
      setPhotoType(null);
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
    setPortfolio(null);
    setPhotoType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div
        className={`${error ? 'bg-red-700 border-red-600' : 'bg-slate-800 border-slate-700'} border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {t('modal.upload.title')}
            </h2>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="text-slate-400 hover:text-white disabled:opacity-50"
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

          {/* Form */}
          <div className="space-y-4">
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
                className="w-full py-3 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600 disabled:opacity-50"
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

            {/* Mediterranean Portfolio Selection */}
            {isMediterranean && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Portfolio * (Choose 1 or 2)
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setPortfolio(1)}
                      disabled={isUploading}
                      className={`flex-1 py-2 px-4 rounded-lg border disabled:opacity-50 ${
                        portfolio === 1
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Portfolio 1
                    </button>
                    <button
                      type="button"
                      onClick={() => setPortfolio(2)}
                      disabled={isUploading}
                      className={`flex-1 py-2 px-4 rounded-lg border disabled:opacity-50 ${
                        portfolio === 2
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Portfolio 2
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Photo Type * (Choose one per upload)
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setPhotoType('macro')}
                      disabled={isUploading}
                      className={`py-2 px-4 rounded-lg border disabled:opacity-50 ${
                        photoType === 'macro'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Macro
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoType('wide-angle')}
                      disabled={isUploading}
                      className={`py-2 px-4 rounded-lg border disabled:opacity-50 ${
                        photoType === 'wide-angle'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Wide Angle
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoType('free')}
                      disabled={isUploading}
                      className={`py-2 px-4 rounded-lg border disabled:opacity-50 ${
                        photoType === 'free'
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Free Choice
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-slate-400">
                    Each portfolio must include: 1 Macro + 1 Wide Angle + 1 Free
                    Choice
                  </div>
                </div>
              </>
            )}

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
              className="flex-1 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg disabled:opacity-50"
            >
              {t('action.cancel')}
            </button>
            <button
              onClick={handleUpload}
              disabled={
                !selectedFile ||
                !title.trim() ||
                isUploading ||
                (isMediterranean && (!portfolio || !photoType))
              }
              className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50"
            >
              {isUploading ? t('state.uploading') : t('action.upload')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
