import { ChevronLeft, TriangleAlert, X } from 'lucide-react';
import { useInspectChrome } from '../../hooks/useInspectChrome';
import type { JudgingSubmission } from '../../types/judging';
import { formatPortfolioPhotoType } from '../../utils/adminFormat';
import { cn } from '../ui/cn';
import {
  HoverRevealBar,
  InspectBar,
  InspectIconButton,
  InspectNavigation,
  ZoomIndicator,
} from './InspectControls';

type PortfolioPhotoZoomProps = {
  photo: JudgingSubmission;
  photoIndex: number;
  photoCount: number;
  imageUrl: string | null;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  zoomLevel: number;
  zoomOrigin: { x: number; y: number };
  onZoomClick: (e: React.MouseEvent) => void;
  onResetZoom: () => void;
  descriptionExpanded: boolean;
  onToggleDescription: () => void;
};

export function PortfolioPhotoZoom({
  photo,
  photoIndex,
  photoCount,
  imageUrl,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onClose,
  zoomLevel,
  zoomOrigin,
  onZoomClick,
  onResetZoom,
  descriptionExpanded,
  onToggleDescription,
}: PortfolioPhotoZoomProps) {
  const { isChromeVisible, surfaceHandlers, topBarProps, bottomBarProps } =
    useInspectChrome();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={photo.title || 'Foto'}
      className="absolute inset-0 z-60 bg-popover"
      {...surfaceHandlers}
    >
      {/* Full-screen image */}
      {/* biome-ignore lint/a11y/useSemanticElements: interactive zoom overlay with complex content */}
      <div
        role="button"
        tabIndex={0}
        className="absolute inset-0 flex items-center justify-center overflow-auto p-2 cursor-zoom-in"
        onClick={onZoomClick}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onZoomClick(e as unknown as React.MouseEvent);
          }
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={photo.title || 'Photo'}
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
              transition: 'transform 0.2s ease-out',
            }}
            className="max-h-full max-w-full border border-border-strong object-contain"
            draggable={false}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <TriangleAlert className="size-10 text-destructive" />
            <span className="text-sm text-destructive">
              Impossibile caricare l&apos;immagine
            </span>
          </div>
        )}
      </div>

      <HoverRevealBar
        position="top"
        isVisible={isChromeVisible}
        barProps={topBarProps}
      >
        <InspectBar position="top" className="justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors cursor-pointer hover:text-foreground"
            >
              <ChevronLeft className="size-3.5" />
              Portfolio
            </button>
            <span className="text-sm font-medium capitalize">
              {photo.portfolioPhotoType &&
                formatPortfolioPhotoType(photo.portfolioPhotoType)}
            </span>
          </div>
          <InspectIconButton onClick={onClose} aria-label="Chiudi zoom">
            <X className="size-4" />
          </InspectIconButton>
        </InspectBar>
      </HoverRevealBar>

      <HoverRevealBar
        position="bottom"
        isVisible={isChromeVisible}
        barProps={bottomBarProps}
        accessory={
          zoomLevel > 1 ? (
            <ZoomIndicator zoomLevel={zoomLevel} onReset={onResetZoom} />
          ) : undefined
        }
      >
        <InspectBar position="bottom">
          <div className="hidden flex-1 md:block" />
          <div className="flex min-w-0 flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center gap-3 text-xs">
              <span className="tabular-nums text-muted-foreground">
                {photoIndex + 1} / {photoCount}
              </span>
              {photo.title && (
                <span className="text-subtle-foreground">{photo.title}</span>
              )}
            </div>
            {photo.description?.trim() && (
              <button
                type="button"
                onClick={onToggleDescription}
                className={cn(
                  'max-w-md text-xs text-muted-foreground transition-colors cursor-pointer hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'block',
                    !descriptionExpanded && 'line-clamp-2'
                  )}
                >
                  {photo.description}
                </span>
              </button>
            )}
          </div>
          <InspectNavigation
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrev={onPrev}
            onNext={onNext}
            prevLabel="Foto precedente"
            nextLabel="Foto successiva"
          />
        </InspectBar>
      </HoverRevealBar>
    </div>
  );
}
