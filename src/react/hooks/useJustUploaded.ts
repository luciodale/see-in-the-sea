import { useCallback, useEffect, useRef, useState } from 'react';

// How long a freshly uploaded photo stays highlighted in its slot
const HIGHLIGHT_MS = 2500;

// The upload is confirmed in place (the photo appears, highlighted) instead
// of behind a second dialog.
export function useJustUploaded() {
  const [justUploadedId, setJustUploadedId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHighlight = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setJustUploadedId(null);
  }, []);

  const markUploaded = useCallback((submissionId: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setJustUploadedId(submissionId);
    timeoutRef.current = setTimeout(() => {
      setJustUploadedId(null);
      timeoutRef.current = null;
    }, HIGHLIGHT_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { justUploadedId, markUploaded, clearHighlight };
}
