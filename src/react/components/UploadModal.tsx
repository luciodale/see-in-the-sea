import { useAuth } from '@clerk/clerk-react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { type ChangeEvent, useRef, useState } from 'react';
import { MAX_IMAGE_SIZE } from '../../constants';
import { useI18n } from '../../i18n/react';
import type { TranslationKey } from '../../i18n/translations';
import { ACCEPTED_IMAGE_TYPES } from '../../server/utils';
import type { UploadResponse } from '../../types/api';
import { useUploadFileDrop } from '../hooks/useUploadFileDrop';
import { BaseModal } from './BaseModal';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { cn } from './ui/cn';
import { Input, Textarea } from './ui/Input';

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  contestId: string;
  photoNumber: number;
  maxPhotos: number;
  portfolio?: string;
  portfolioPhotoType?: string;
  onUploadSuccess: (data: UploadResponse['data']) => void;
  onUploadError: (error: string) => void;
  isAdminUpload?: boolean;
  adminUserEmail?: string;
};

type DestinationParts = {
  categoryId: string;
  photoNumber: number;
  maxPhotos: number;
  portfolio?: string;
  portfolioPhotoType?: string;
};

function buildDestination(
  t: (key: TranslationKey) => string,
  {
    categoryId,
    photoNumber,
    maxPhotos,
    portfolio,
    portfolioPhotoType,
  }: DestinationParts
) {
  const categoryName = t(`category.${categoryId}` as TranslationKey);
  const prefix = t('modal.upload.destination');

  if (portfolio && portfolioPhotoType) {
    const photoTypeLabel = t(
      `photo-type.${portfolioPhotoType}` as TranslationKey
    );
    return `${prefix} ${categoryName} · ${t('portfolio.title')} ${portfolio} · ${photoTypeLabel}`;
  }

  return `${prefix} ${categoryName} · ${t('submissions.photo')} ${photoNumber} ${t('common.of')} ${maxPhotos}`;
}

export function UploadModal({
  isOpen,
  onClose,
  categoryId,
  contestId,
  photoNumber,
  maxPhotos,
  portfolio,
  portfolioPhotoType,
  onUploadSuccess,
  onUploadError: _onUploadError,
  isAdminUpload = false,
  adminUserEmail,
}: UploadModalProps) {
  const { t } = useI18n();
  const { getToken } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(file: File | null) {
    setError(null);

    if (!file) {
      setSelectedFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError(t('form.file-too-large'));
    } else {
      setError(null);
    }

    setSelectedFile(file);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  }

  const { isDragging, onDragOver, onDragLeave, onDrop } = useUploadFileDrop({
    onFileSelected: handleFileChange,
    accept: ACCEPTED_IMAGE_TYPES,
    onRejected: () => setError(t('form.file-type-invalid')),
    disabled: isUploading,
    isActive: isOpen,
  });

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFileChange(event.target.files?.[0] || null);
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleUpload() {
    if (!selectedFile || !title.trim()) return;

    if (selectedFile.size > MAX_IMAGE_SIZE) {
      setError(t('form.file-too-large'));
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error(t('error.auth-required'));
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
        throw new Error(result.message || t('error.upload-failed'));
      }

      setSelectedFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      setTitle('');
      setDescription('');
      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      onUploadSuccess(result.data);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : t('error.upload-failed')
      );
    } finally {
      setIsUploading(false);
    }
  }

  function handleClose() {
    if (isUploading) return;

    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setTitle('');
    setDescription('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    onClose();
  }

  const needsTitle = !!selectedFile && !title.trim();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isAdminUpload ? 'Admin Upload' : t('modal.upload.title')}
      subtitle={buildDestination(t, {
        categoryId,
        photoNumber,
        maxPhotos,
        portfolio,
        portfolioPhotoType,
      })}
      isLoading={isUploading}
      loadingMessage={t('state.uploading')}
      loadingSubMessage={t('upload.processing-large-file')}
      maxWidth="2xl"
      error={!!error}
    >
      <div className="flex flex-col gap-5">
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

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES}
          className="hidden"
          onChange={handleFileInputChange}
        />

        {selectedFile ? (
          <div className="flex flex-col gap-3">
            {preview && (
              <img
                src={preview}
                alt={selectedFile.name}
                className="max-h-64 w-full rounded-xl border border-border object-contain sm:max-h-80"
              />
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="min-w-0 truncate font-light text-sm text-muted-foreground leading-paragraph">
                {selectedFile.name}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={openFilePicker}
                disabled={isUploading}
              >
                {t('modal.upload.change-file')}
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openFilePicker}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            disabled={isUploading}
            className={cn(
              'flex w-full flex-col items-center gap-3 rounded-xl border border-dashed border-border-strong p-8 text-center transition-colors cursor-pointer',
              isDragging && 'border-accent bg-surface-hover'
            )}
          >
            <PhotoIcon
              aria-hidden="true"
              className="w-8 h-8 text-subtle-foreground"
            />
            <span className="font-serif text-lg text-foreground leading-heading">
              {t('modal.upload.dropzone')}
            </span>
            <span className="text-editorial uppercase tracking-editorial text-muted-foreground">
              {t('modal.upload.dropzone-action')}
            </span>
          </button>
        )}

        {error && (
          <Card variant="danger" className="p-3">
            <p className="font-light text-sm text-foreground leading-paragraph">
              {error}
            </p>
          </Card>
        )}

        <div className="flex flex-col gap-2">
          <Input
            id="upload-title"
            type="text"
            label={`${t('form.title')} *`}
            value={title}
            onChange={e => setTitle(e.target.value)}
            disabled={isUploading}
            placeholder={t('form.title-placeholder')}
          />
          <p className="font-light text-xs text-muted-foreground leading-paragraph">
            {t('upload.title-hint')}
          </p>
        </div>

        <Textarea
          id="upload-description"
          label={t('form.description-optional')}
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={isUploading}
          rows={3}
          placeholder={t('form.description-placeholder')}
        />
      </div>

      <div className="sticky bottom-0 -mx-6 mt-8 flex flex-col gap-3 border-t border-border bg-popover px-6 py-4 sm:-mx-8 sm:px-8">
        {needsTitle && (
          <p className="text-center text-xs text-muted-foreground sm:text-right">
            {t('form.title-required')}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            className="min-h-11 w-full sm:w-auto"
            onClick={handleClose}
            disabled={isUploading}
          >
            {t('action.cancel')}
          </Button>
          <Button
            variant="primary"
            className="min-h-11 w-full sm:w-auto"
            onClick={handleUpload}
            loading={isUploading}
            disabled={
              !selectedFile ||
              !title.trim() ||
              isUploading ||
              selectedFile.size > MAX_IMAGE_SIZE
            }
          >
            {isUploading ? t('state.uploading') : t('action.upload')}
          </Button>
        </div>
      </div>
    </BaseModal>
  );
}
