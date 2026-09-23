import { useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { JudgeLibraryItem, JudgesLibraryResponse } from '../../types/api';

const FETCH_ERROR = 'Errore caricamento libreria';

/**
 * Loads the judge photo library lazily: nothing is fetched until `isOpen`
 * turns true the first time, and the result stays cached for later opens.
 * `reload` forces a refetch after a photo has been added or removed.
 */
export function useJudgesLibrary(isOpen: boolean, invalidateKey = 0) {
  const { getToken } = useAuth();
  const [library, setLibrary] = useState<JudgeLibraryItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadLibrary = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch('/api/admin/judges-library', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result: JudgesLibraryResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || FETCH_ERROR);
      }

      if (requestIdRef.current === requestId) setLibrary(result.data ?? []);
    } catch (fetchError) {
      console.error('Error loading judges library:', fetchError);
      if (requestIdRef.current === requestId) {
        setError(
          fetchError instanceof Error ? fetchError.message : FETCH_ERROR
        );
      }
    } finally {
      if (requestIdRef.current === requestId) setIsLoading(false);
    }
  }, [getToken]);

  // A photo added or removed elsewhere makes the cache stale
  const lastInvalidateKeyRef = useRef(invalidateKey);
  if (lastInvalidateKeyRef.current !== invalidateKey) {
    lastInvalidateKeyRef.current = invalidateKey;
    if (library !== null) setLibrary(null);
  }

  useEffect(() => {
    // Cached data is reused; a failed load retries on the next open.
    if (!isOpen || library !== null) return;
    void loadLibrary();
  }, [isOpen, library, loadLibrary]);

  const reload = useCallback(() => {
    void loadLibrary();
  }, [loadLibrary]);

  return { library: library ?? [], isLoading, error, reload };
}
