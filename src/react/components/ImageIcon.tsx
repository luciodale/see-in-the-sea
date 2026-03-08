import { useI18n } from '../../i18n/react';

interface ImageIconProps {
  className?: string;
  variant?: 'uploaded' | 'empty';
}

export function ImageIcon({
  className = '',
  variant = 'uploaded',
}: ImageIconProps) {
  const { t } = useI18n();
  if (variant === 'empty') {
    return (
      <div
        className={`flex items-center justify-center bg-slate-700 border-2 border-dashed border-slate-500 ${className}`}
      >
        <div className="text-center">
          <svg
            aria-hidden="true"
            className="w-6 h-6 text-slate-400 mx-auto mb-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <span className="text-xs text-slate-400">
            {t('image-status.empty')}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-slate-600 border border-slate-500 ${className}`}
    >
      <div className="text-center">
        <svg
          aria-hidden="true"
          className="w-8 h-8 text-emerald-400 mx-auto mb-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-xs text-emerald-400">
          {t('image-status.uploaded')}
        </span>
      </div>
    </div>
  );
}
