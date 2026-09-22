import { useCallback, useEffect, useRef, useState } from 'react';
import type { AdminSubmission } from '../../types/api';

export function useImageLightbox() {
  const [activeSubmission, setActiveSubmission] =
    useState<AdminSubmission | null>(null);

  const openLightbox = useCallback((submission: AdminSubmission) => {
    setActiveSubmission(submission);
  }, []);

  const closeLightbox = useCallback(() => {
    setActiveSubmission(null);
  }, []);

  return { activeSubmission, openLightbox, closeLightbox };
}

function trapTabFocus(event: KeyboardEvent, container: HTMLElement | null) {
  const focusable = container?.querySelectorAll<HTMLElement>('button');
  if (!focusable?.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  const isInside = container?.contains(active) ?? false;

  if (event.shiftKey && (active === first || !isInside)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !isInside)) {
    event.preventDefault();
    first.focus();
  }
}

// Escape closes, Tab stays inside the dialog, page scroll is locked, focus
// moves into the dialog and returns to the trigger on close.
export function useLightboxDialog(onClose: () => void) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') trapTabFocus(event, dialogRef.current);
    }

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return { dialogRef, closeButtonRef };
}
