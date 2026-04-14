import { useAuth } from '@clerk/clerk-react';
import { useRef, useState } from 'react';
import { MAX_IMAGE_SIZE } from '../../constants';
import { useI18n } from '../../i18n/react';
import { ACCEPTED_IMAGE_TYPES } from '../../server/utils';
import type { UploadResponse } from '../../types/api';
import { BaseModal } from './BaseModal';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';

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
  onUploadError: _onUploadError,
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
    setError(null);

    if (!file) {
      setSelectedFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      const actualSize = (file.size / (1024 * 1024)).toFixed(1);
      setError(`${t('form.file-too-large')} (${actualSize}MB/${MAX_MB}MB)`);
    } else {
      setError(null);
    }

    setSelectedFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) return;

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

      if (portfolio) {
        form.append('portfolio', portfolio);
      }
      if (portfolioPhotoType) {
        form.append('portfolioPhotoType', portfolioPhotoType);
      }

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
      <div className="space-y-5">
        {isAdminUpload && adminUserEmail && (
          <div className="bg-accent-muted border border-accent/40 text-foreground rounded-xl p-4">
            <p className="font-light text-sm leading-paragraph">
              <strong className="text-editorial uppercase tracking-editorial mr-2">
                Admin Upload
              </strong>
              This image will be uploaded on behalf of{' '}
              <span className="font-mono">{adminUserEmail}</span>
            </p>
          </div>
        )}

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="hidden"
            onChange={e => handleFileChange(e.target.files?.[0] || null)}
          />
          <Button
            variant="outline"
            fullWidth
            size="lg"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {selectedFile ? selectedFile.name : t('form.choose-file')}
          </Button>
        </div>

        {preview && (
          <div className="relative w-full h-80 bg-background border border-border rounded-xl overflow-hidden">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain"
            />
            {error && (
              <div className="absolute bottom-0 left-0 right-0 bg-destructive/90 text-destructive-foreground p-3 text-sm font-light">
                {error}
              </div>
            )}
          </div>
        )}

        <Input
          id="upload-title"
          type="text"
          label={`${t('form.title')} *`}
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={isUploading}
          placeholder={t('form.title-placeholder')}
        />

        <Textarea
          id="upload-description"
          label={t('form.description-optional')}
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={isUploading}
          rows={3}
          placeholder={t('form.description-placeholder')}
        />

        <p className="text-editorial uppercase tracking-editorial text-subtle-foreground">
          {t('submissions.max-size')}: {MAX_MB}MB
        </p>
      </div>

      <div className="flex gap-3 mt-8">
        <Button
          variant="outline"
          fullWidth
          onClick={handleClose}
          disabled={isUploading}
        >
          {t('action.cancel')}
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={handleUpload}
          loading={isUploading}
          disabled={
            !selectedFile ||
            !title.trim() ||
            isUploading ||
            (selectedFile !== null && selectedFile.size > MAX_IMAGE_SIZE)
          }
        >
          {isUploading ? t('state.uploading') : t('action.upload')}
        </Button>
      </div>
    </BaseModal>
  );
}
