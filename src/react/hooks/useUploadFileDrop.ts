import { type DragEvent, useCallback, useEffect, useState } from 'react';

type UseUploadFileDropOptions = {
  onFileSelected: (file: File | null) => void;
  // Same list the file picker enforces, e.g. 'image/jpeg,image/png'
  accept: string;
  onRejected: () => void;
  disabled?: boolean;
  // While the modal is open, a drop anywhere on the page must not make the
  // browser open the file and discard the half filled form
  isActive?: boolean;
};

export function useUploadFileDrop({
  onFileSelected,
  accept,
  onRejected,
  disabled = false,
  isActive = false,
}: UseUploadFileDropOptions) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    function preventFileNavigation(event: Event) {
      event.preventDefault();
    }

    document.addEventListener('dragover', preventFileNavigation);
    document.addEventListener('drop', preventFileNavigation);
    return () => {
      document.removeEventListener('dragover', preventFileNavigation);
      document.removeEventListener('drop', preventFileNavigation);
    };
  }, [isActive]);

  const onDragOver = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      if (disabled) return;
      setIsDragging(true);
    },
    [disabled]
  );

  const onDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      const acceptedTypes = accept.split(',').map(type => type.trim());
      if (!acceptedTypes.includes(file.type)) {
        onRejected();
        return;
      }

      onFileSelected(file);
    },
    [disabled, onFileSelected, accept, onRejected]
  );

  return { isDragging, onDragOver, onDragLeave, onDrop };
}
