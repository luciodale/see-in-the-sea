import { useEffect, useRef, useState } from 'react';
import { MAX_IMAGE_SIZE } from '../../constants.js';
import type { TranslationKey } from '../../i18n';
import { useI18n } from '../../i18n/react';
import type { SubmissionsResponse, UploadResponse } from '../../types/api.js';
import JudgesBar from './JudgesBar';
import UploadSuccessDialog from './UploadSuccessDialog';

const HARDCODED_CATEGORIES = [
  { id: 'wide-angle', name: 'Wide Angle' },
  { id: 'macro', name: 'Macro' },
  { id: 'black-and-white', name: 'Black & White' },
];

const MAX_SUBMISSIONS_PER_CATEGORY = 2 as const;

type CategoryState = {
  id: string;
  name: string;
  submissions: Array<{
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
  }>;
};

export default function UnifiedSubmissions() {
  const { t } = useI18n();
  const MAX_MB = Math.floor(MAX_IMAGE_SIZE / (1024 * 1024));
  const getCategoryLabel = (id: string) =>
    t(`category.${id}` as unknown as TranslationKey);
  const [contestId, setContestId] = useState<string | null>(null);
  const [judges, setJudges] = useState<string[]>([]);
  const [contestStatus, setContestStatus] = useState<
    'active' | 'inactive' | 'assessment'
  >('inactive');
  const [categories, setCategories] = useState<CategoryState[]>(
    HARDCODED_CATEGORIES.map(c => ({ ...c, submissions: [] }))
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyIds, setBusyIds] = useState<Record<string, boolean>>({});

  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});
  const [selectedFiles, setSelectedFiles] = useState<
    Record<string, File | null>
  >({});
  const [previews, setPreviews] = useState<Record<string, string | null>>({});
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [descriptions, setDescriptions] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogKind, setDialogKind] = useState<'upload' | 'delete'>('upload');
  const [_lastUpload, setLastUpload] = useState<{
    title: string;
  } | null>(null);
  const [noActiveContest, setNoActiveContest] = useState<boolean>(false);

  useEffect(() => {
    void initialize();
  }, []);

  async function initialize() {
    try {
      setLoading(true);
      setError(null);

      // Fetch user's submissions for active contest
      const submissionsRes = await fetch('/api/submissions');
      const submissionsData =
        (await submissionsRes.json()) as SubmissionsResponse;
      if (
        !submissionsRes.ok ||
        !submissionsData.success ||
        !submissionsData.data?.contest
      ) {
        setNoActiveContest(true);
        return;
      }

      const { id: activeContestId, status } = submissionsData.data.contest;
      setContestStatus(status ?? 'inactive');
      setContestId(activeContestId);

      // Map existing submissions into the hardcoded categories by matching names or ids
      const existing = submissionsData.data.categories ?? [];
      const nextCategories: CategoryState[] = HARDCODED_CATEGORIES.map(cat => {
        const found = existing.find(
          c =>
            c.id === cat.id || c.name.toLowerCase() === cat.name.toLowerCase()
        );
        return {
          id: cat.id,
          name: cat.name,
          submissions:
            found?.submissions.map(s => ({
              id: s.id,
              title: s.title,
              description: s.description ?? null,
              imageUrl: s.imageUrl,
            })) ?? [],
        };
      });
      setCategories(nextCategories);

      // Fetch judges for header
      const judgesRes = await fetch(
        `/api/judges?contestId=${encodeURIComponent(activeContestId)}`
      );
      if (judgesRes.ok) {
        const judgesData = (await judgesRes.json()) as {
          success: boolean;
          data?: Array<{ fullName: string }>;
        };
        if (judgesData.success && judgesData.data) {
          setJudges(judgesData.data.map(j => j.fullName));
        }
      }
    } catch (_e) {
      setNoActiveContest(true);
    } finally {
      setLoading(false);
    }
  }

  function setBusy(key: string, value: boolean) {
    setBusyIds(prev => ({ ...prev, [key]: value }));
  }

  function onFileChange(categoryId: string, file: File | null) {
    setSelectedFiles(prev => ({ ...prev, [categoryId]: file }));
    if (previews[categoryId]) URL.revokeObjectURL(previews[categoryId]!);
    setPreviews(prev => ({
      ...prev,
      [categoryId]: file ? URL.createObjectURL(file) : null,
    }));
  }

  async function uploadOrReplace(categoryId: string) {
    if (!contestId) return;
    const file = selectedFiles[categoryId];
    const title = (titles[categoryId] || '').trim();
    if (!file || !title) return;

    setBusy(`upload-${categoryId}`, true);
    try {
      const form = new FormData();
      form.append('image', file);
      form.append('contestId', contestId);
      form.append('categoryId', categoryId);
      form.append('title', title);
      form.append('description', (descriptions[categoryId] || '').trim());

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        body: form,
      });
      const result = (await res.json()) as UploadResponse;
      if (!result.success || !result.data) {
        throw new Error(result.message || 'Upload failed');
      }
      const data = result.data;

      // Update local state to reflect new/updated submission
      setCategories(prev =>
        prev.map(cat => {
          if (cat.id !== categoryId) return cat;
          const newSubmission = {
            id: data.submissionId,
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl,
          };
          return {
            ...cat,
            submissions: [...cat.submissions, newSubmission].slice(
              0,
              MAX_SUBMISSIONS_PER_CATEGORY
            ),
          };
        })
      );

      // Reset inputs for this category
      if (fileInputsRef.current[categoryId])
        fileInputsRef.current[categoryId]!.value = '';
      setSelectedFiles(prev => ({ ...prev, [categoryId]: null }));
      setPreviews(prev => ({ ...prev, [categoryId]: null }));
      setTitles(prev => ({ ...prev, [categoryId]: '' }));
      setDescriptions(prev => ({ ...prev, [categoryId]: '' }));

      // Show success dialog
      setLastUpload({ title: data.title });
      setDialogKind('upload');
      setDialogOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(`upload-${categoryId}`, false);
    }
  }

  async function deleteSubmission(categoryId: string, submissionId: string) {
    setBusy(`delete-${submissionId}`, true);
    try {
      const response = await fetch('/api/delete-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      const result = (await response.json()) as {
        success: boolean;
        message?: string;
      };
      if (!result.success)
        throw new Error(result.message || 'Failed to delete');
      setCategories(prev =>
        prev.map(cat =>
          cat.id === categoryId
            ? {
                ...cat,
                submissions: cat.submissions.filter(s => s.id !== submissionId),
              }
            : cat
        )
      );
      // Show deletion success dialog
      setDialogKind('delete');
      setDialogOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setBusy(`delete-${submissionId}`, false);
    }
  }

  // no replace flow – users delete and re-upload

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-slate-300">{t('submissions.loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header with judges */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">
          {t('nav.submissions')}
        </h1>
        {!noActiveContest && (
          <JudgesBar judges={judges} label={t('submissions.jury')} />
        )}
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-800 text-red-200 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* No active contest message */}
      {noActiveContest && (
        <div className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-6 text-center">
          {t('submissions.closed')}
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 gap-8">
        {!noActiveContest &&
          categories.map(cat => {
            const canAdd =
              cat.submissions.length < MAX_SUBMISSIONS_PER_CATEGORY;
            return (
              <section
                key={cat.id}
                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden w-full sm:w-[672px] mx-auto"
              >
                <div className="px-5 py-4 border-b border-slate-700">
                  <div className="w-full mx-auto flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">
                      {getCategoryLabel(cat.id)}
                    </h2>
                    <span className="text-xs text-slate-400">
                      {`${cat.submissions.length} / ${MAX_SUBMISSIONS_PER_CATEGORY}`}
                    </span>
                  </div>
                </div>

                <div className="p-2 space-y-5 w-full mx-auto">
                  {/* Existing submissions */}
                  {cat.submissions.length > 0 && (
                    <div className="space-y-4">
                      {cat.submissions.map(sub => (
                        <div key={sub.id} className="space-y-3">
                          <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                            <div className="mx-auto w-full max-w-2xl aspect-[4/3] bg-slate-800">
                              <img
                                src={`/api/images/${sub.imageUrl}`}
                                alt={sub.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="p-4 flex items-center justify-between">
                              <div>
                                <div className="text-white font-medium truncate">
                                  {sub.title}
                                </div>
                                {sub.description && (
                                  <div className="text-sm text-slate-400 line-clamp-2">
                                    {sub.description}
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-sm rounded-md disabled:opacity-50"
                                  disabled={!!busyIds[`delete-${sub.id}`]}
                                  onClick={() =>
                                    deleteSubmission(cat.id, sub.id)
                                  }
                                >
                                  {busyIds[`delete-${sub.id}`]
                                    ? t('state.deleting')
                                    : t('action.delete')}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Replace flow removed */}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Uploader for new submissions only (and only if contest is active) */}
                  {canAdd && contestStatus === 'active' && (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                      <div className="space-y-3">
                        <input
                          ref={el => {
                            fileInputsRef.current[cat.id] = el;
                          }}
                          id={`new-file-${cat.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e =>
                            onFileChange(cat.id, e.target.files?.[0] || null)
                          }
                        />
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className="px-4 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-white"
                            onClick={() =>
                              fileInputsRef.current[cat.id]?.click()
                            }
                          >
                            {t('form.choose-file')}
                          </button>
                          <span className="text-sm text-slate-400 truncate">
                            {selectedFiles[cat.id]?.name ||
                              t('form.no-file-chosen')}
                          </span>
                        </div>
                        <div className="mx-auto w-full bg-slate-800 flex items-center justify-center rounded overflow-hidden">
                          {previews[cat.id] ? (
                            <img
                              src={previews[cat.id]!}
                              alt="Preview"
                              className="h-full w-full object-contain"
                            />
                          ) : null}
                        </div>
                        <input
                          type="text"
                          placeholder={t('form.title')}
                          value={titles[cat.id] || ''}
                          onChange={e =>
                            setTitles(prev => ({
                              ...prev,
                              [cat.id]: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-slate-400"
                        />
                        <textarea
                          placeholder={t('form.description-optional')}
                          value={descriptions[cat.id] || ''}
                          onChange={e =>
                            setDescriptions(prev => ({
                              ...prev,
                              [cat.id]: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-slate-400"
                        />
                        <button
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md disabled:opacity-50"
                          disabled={
                            !selectedFiles[cat.id] ||
                            !(titles[cat.id] || '').trim() ||
                            !!busyIds[`upload-${cat.id}`]
                          }
                          onClick={() => uploadOrReplace(cat.id)}
                        >
                          {busyIds[`upload-${cat.id}`]
                            ? t('state.uploading')
                            : t('action.upload')}
                        </button>
                      </div>
                      <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
                        <span>{`${cat.submissions.length} / ${MAX_SUBMISSIONS_PER_CATEGORY} ${t('submissions.count-label')}`}</span>
                        <span>{`${t('submissions.max-size')}: ${MAX_MB}MB`}</span>
                      </div>
                    </div>
                  )}

                  {/* Inactive notice */}
                  {canAdd && contestStatus !== 'active' && (
                    <div className="bg-amber-900/30 border border-amber-700 text-amber-200 rounded-lg p-4">
                      {t('submissions.closed')}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
      </div>

      {/* Upload/Delete Success Dialog */}
      <UploadSuccessDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={
          dialogKind === 'upload'
            ? t('dialog.upload.title')
            : t('dialog.delete.title')
        }
        message={
          dialogKind === 'upload'
            ? t('toast.upload-success')
            : t('toast.delete-success')
        }
      />

      {/* Global Uploading/Deleting Overlay */}
      {(Object.entries(busyIds).some(
        ([key, val]) => key.startsWith('upload-') && val
      ) ||
        Object.entries(busyIds).some(
          ([key, val]) => key.startsWith('delete-') && val
        )) && (
        <div
          className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center"
          role="status"
          aria-busy="true"
          aria-live="polite"
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
            <div className="mt-4 text-slate-200 text-sm">
              {Object.entries(busyIds).some(
                ([key, val]) => key.startsWith('delete-') && val
              )
                ? t('state.deleting')
                : t('state.uploading')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
