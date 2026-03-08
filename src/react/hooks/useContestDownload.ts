import { useAuth } from '@clerk/clerk-react';
import JSZip from 'jszip';
import { useCallback, useRef, useState } from 'react';

const CONCURRENCY = 10;

export type DownloadItem = {
  r2ImageId: string | null;
  categoryId: string;
  firstName?: string | null;
  lastName?: string | null;
  placement?: string | null;
  originalFilename?: string | null;
};

type DownloadStatus = 'idle' | 'downloading' | 'zipping' | 'complete' | 'error';

type DownloadState = {
  status: DownloadStatus;
  downloaded: number;
  failed: number;
  total: number;
  error: string | null;
};

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function getExtension(originalFilename: string | null): string {
  if (!originalFilename) return '.jpg';
  const ext = originalFilename.split('.').pop()?.toLowerCase();
  return ext && ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'tif'].includes(ext)
    ? `.${ext}`
    : '.jpg';
}

function buildFilename(params: {
  contestYear: number;
  categoryId: string;
  placement: string | null;
  firstName: string | null;
  lastName: string | null;
  originalFilename: string | null;
}): string {
  const parts = [
    String(params.contestYear),
    sanitizeFilename(params.categoryId),
  ];

  if (params.placement) {
    parts.push(params.placement);
  }

  const nameParts = [params.firstName, params.lastName].filter(
    (n): n is string => !!n
  );
  if (nameParts.length > 0) {
    parts.push(nameParts.map(n => sanitizeFilename(n)).join('_'));
  }

  const ext = getExtension(params.originalFilename);
  return `${parts.join('_')}${ext}`;
}

function deduplicateFilename(
  filename: string,
  seen: Map<string, number>
): string {
  const count = seen.get(filename) ?? 0;
  seen.set(filename, count + 1);
  if (count === 0) return filename;
  const dot = filename.lastIndexOf('.');
  return `${filename.slice(0, dot)}_${count + 1}${filename.slice(dot)}`;
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>
): Promise<void> {
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const idx = next++;
      await fn(items[idx], idx);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
}

export function useContestDownload() {
  const { getToken } = useAuth();
  const [state, setState] = useState<DownloadState>({
    status: 'idle',
    downloaded: 0,
    failed: 0,
    total: 0,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const downloadContest = useCallback(
    async (contestYear: number, items: DownloadItem[]) => {
      const downloadable = items.filter(
        (s): s is DownloadItem & { r2ImageId: string } => !!s.r2ImageId
      );

      if (downloadable.length === 0) {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: 'Nessuna immagine da scaricare',
        }));
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        status: 'downloading',
        downloaded: 0,
        failed: 0,
        total: downloadable.length,
        error: null,
      });

      const zip = new JSZip();
      const seenFilenames = new Map<string, number>();
      // Pre-compute filenames (must be synchronous to avoid race conditions on dedup)
      const filenames = downloadable.map(sub => {
        const base = buildFilename({
          contestYear,
          categoryId: sub.categoryId,
          placement: sub.placement ?? null,
          firstName: sub.firstName ?? null,
          lastName: sub.lastName ?? null,
          originalFilename: sub.originalFilename ?? null,
        });
        return deduplicateFilename(base, seenFilenames);
      });

      try {
        const token = await getToken();

        await runPool(downloadable, CONCURRENCY, async (sub, idx) => {
          if (controller.signal.aborted) return;

          try {
            const response = await fetch(
              `/api/admin/image-proxy?key=${encodeURIComponent(sub.r2ImageId)}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                signal: controller.signal,
              }
            );

            if (!response.ok) {
              console.warn(
                `Failed to fetch image ${sub.r2ImageId}: ${response.status}`
              );
              setState(prev => ({
                ...prev,
                downloaded: prev.downloaded + 1,
                failed: prev.failed + 1,
              }));
              return;
            }

            const blob = await response.blob();
            zip.file(filenames[idx], blob);
            setState(prev => ({ ...prev, downloaded: prev.downloaded + 1 }));
          } catch (err) {
            if (controller.signal.aborted) return;
            console.warn(`Error fetching ${sub.r2ImageId}:`, err);
            setState(prev => ({
              ...prev,
              downloaded: prev.downloaded + 1,
              failed: prev.failed + 1,
            }));
          }
        });

        if (controller.signal.aborted) return;

        setState(prev => ({ ...prev, status: 'zipping' }));

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contest_${contestYear}_images.zip`;
        a.click();
        URL.revokeObjectURL(url);

        setState(prev => ({ ...prev, status: 'complete' }));
      } catch (error) {
        if (controller.signal.aborted) return;
        setState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Download fallito',
        }));
      }
    },
    [getToken]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setState({
      status: 'idle',
      downloaded: 0,
      failed: 0,
      total: 0,
      error: null,
    });
  }, []);

  return { ...state, downloadContest, cancel };
}
