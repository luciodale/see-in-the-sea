import {
  flip,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  offset,
  shift,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { useEffect } from 'react';

type UploadSuccessDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
};

export default function UploadSuccessDialog({
  open,
  onClose,
  title,
  message,
}: UploadSuccessDialogProps) {
  const { refs, context } = useFloating({
    open,
    onOpenChange: o => {
      if (!o) onClose();
    },
    placement: 'bottom',
    middleware: [offset(0), flip(), shift()],
  });

  const dismiss = useDismiss(context, { outsidePressEvent: 'mousedown' });
  const role = useRole(context, { role: 'dialog' });
  const { getFloatingProps } = useInteractions([dismiss, role]);

  const labelId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <FloatingPortal>
      <FloatingOverlay lockScroll className="fixed inset-0 z-50 bg-black/70">
        <FloatingFocusManager context={context} modal>
          <div
            ref={refs.setFloating}
            {...getFloatingProps({
              className:
                'fixed inset-0 z-50 flex items-center justify-center p-4',
              'aria-labelledby': labelId,
              'aria-describedby': descriptionId,
            })}
          >
            <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <h3 id={labelId} className="text-white text-lg font-semibold">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-slate-300 hover:text-white rounded-md px-3 py-2 text-2xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="px-6 py-5 space-y-3">
                <p id={descriptionId} className="text-slate-200 text-sm">
                  {message}
                </p>
                <div className="pt-4">
                  <button
                    className="w-full py-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-base font-medium"
                    onClick={onClose}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
}
