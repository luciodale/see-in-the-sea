import { ImageOff, TriangleAlert } from 'lucide-react';
import { cn } from '../ui/cn';

type ImageFallbackProps = {
  variant: 'missing' | 'failed';
  compact?: boolean;
  detail?: string;
  className?: string;
};

export function ImageFallback({
  variant,
  compact = false,
  detail,
  className,
}: ImageFallbackProps) {
  const isFailed = variant === 'failed';
  const Icon = isFailed ? TriangleAlert : ImageOff;

  return (
    <div
      className={cn(
        'flex size-full flex-col items-center justify-center gap-1.5 bg-surface-raised',
        isFailed ? 'text-destructive' : 'text-subtle-foreground',
        className
      )}
    >
      <Icon className={compact ? 'size-4' : 'size-6'} />
      {!compact && (
        <span className="text-xs">
          {isFailed ? 'Errore caricamento' : 'Nessuna immagine'}
        </span>
      )}
      {!compact && detail && (
        <span className="text-tiny opacity-70">{detail}</span>
      )}
    </div>
  );
}
