import { RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { IMAGES_BASE_URL } from '../../constants';
import type { JudgeLibraryItem } from '../../types/api';
import { useJudgesLibrary } from '../hooks/useJudgesLibrary';
import { BaseModal } from './BaseModal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

type JudgeLibraryPickerProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: JudgeLibraryItem) => void;
  busyR2ImageId: string | null;
  // Bumped when a judge photo changes, so the cached library refetches
  refreshKey?: number;
  excludeR2ImageId?: string | null;
  emptyMessage?: string;
  helperText?: string;
};

export function JudgeLibraryPicker({
  refreshKey,
  isOpen,
  onClose,
  onSelect,
  busyR2ImageId,
  excludeR2ImageId,
  emptyMessage = 'Nessuna foto giudice in libreria',
  helperText,
}: JudgeLibraryPickerProps) {
  const { library, isLoading, error, reload } = useJudgesLibrary(
    isOpen,
    refreshKey
  );
  const [search, setSearch] = useState('');
  const searchFieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setSearch('');
    // The shared Input does not forward refs on React 18, so the field is
    // focused through its wrapper once the modal content is mounted.
    searchFieldRef.current?.querySelector('input')?.focus();
  }, [isOpen]);

  const available = excludeR2ImageId
    ? library.filter(item => item.r2ImageId !== excludeR2ImageId)
    : library;

  const query = search.trim().toLowerCase();
  const visible = query
    ? available.filter(item => item.fullName.toLowerCase().includes(query))
    : available;

  const isBusy = busyR2ImageId !== null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Libreria giudici"
      subtitle={helperText}
      maxWidth="2xl"
    >
      <div className="flex flex-col gap-4">
        <div ref={searchFieldRef}>
          <Input
            id="judge-library-search"
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca per nome..."
            aria-label="Cerca giudice in libreria"
            disabled={isBusy}
            className="rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-editorial uppercase tracking-editorial text-subtle-foreground">
            {visible.length} foto
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={reload}
            disabled={isLoading || isBusy}
            className="min-h-11"
          >
            <RefreshCw className="size-3.5" />
            Aggiorna
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center gap-3 py-12 text-sm text-muted-foreground">
            <div className="size-8 animate-spin rounded-full border-b-2 border-foreground/70" />
            Caricamento...
          </div>
        ) : visible.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {available.length === 0
              ? emptyMessage
              : 'Nessun giudice corrisponde alla ricerca'}
          </p>
        ) : (
          <div className="grid max-h-96 gap-2 overflow-y-auto sm:grid-cols-2">
            {visible.map(item => (
              <button
                key={item.r2ImageId}
                type="button"
                onClick={() => onSelect(item)}
                disabled={isBusy}
                className="flex min-h-11 items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 text-left transition-colors cursor-pointer hover:border-border-strong hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="relative shrink-0">
                  <img
                    src={`${IMAGES_BASE_URL}/${item.r2ImageId}`}
                    alt={item.fullName}
                    loading="lazy"
                    className="size-10 rounded-full border border-border object-cover"
                  />
                  {busyR2ImageId === item.r2ImageId && (
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
                      <span className="size-4 animate-spin rounded-full border-b-2 border-foreground/70" />
                    </span>
                  )}
                </span>
                <span className="flex-1 text-sm leading-tight text-foreground">
                  {item.fullName}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
