import { X } from 'lucide-react';
import { useInspectChrome } from '../../hooks/useInspectChrome';
import type {
  FlagStatus,
  JudgingSubmission,
  Placement,
} from '../../types/judging';
import { getImageUrl } from '../../utils/imageUtils';
import { cn } from '../ui/cn';
import {
  HoverRevealBar,
  InspectBar,
  InspectIconButton,
  InspectNavigation,
  ZoomIndicator,
} from './InspectControls';
import { VotingToolbar } from './VotingToolbar';

type SubmissionInspectModalProps = {
  submission: JudgingSubmission;
  index: number;
  total: number;
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
  onFlag: (submissionId: string, status: FlagStatus) => void;
  onPlace: (submissionId: string, placement: Placement) => void;
};

export function SubmissionInspectModal({
  submission,
  index,
  total,
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
  onFlag,
  onPlace,
}: SubmissionInspectModalProps) {
  const { isChromeVisible, surfaceHandlers, topBarProps, bottomBarProps } =
    useInspectChrome();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={submission.title}
      className="fixed inset-0 z-50 bg-popover"
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
        <img
          src={submission.r2ImageId ? getImageUrl(submission.r2ImageId) : ''}
          alt={submission.title}
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            transition: 'transform 0.2s ease-out',
          }}
          className="max-h-full max-w-full border border-border-strong object-contain"
          draggable={false}
        />
      </div>

      <HoverRevealBar
        position="top"
        isVisible={isChromeVisible}
        barProps={topBarProps}
      >
        <InspectBar position="top" className="justify-between">
          <div className="flex min-w-0 flex-col">
            <div className="flex min-w-0 items-baseline gap-2">
              <span className="truncate text-sm font-medium">
                {submission.title}
              </span>
              <span className="shrink-0 text-xs tabular-nums text-subtle-foreground">
                {index + 1}/{total}
              </span>
            </div>
            {submission.description?.trim() && (
              <button
                type="button"
                onClick={onToggleDescription}
                className={cn(
                  'text-left text-xs text-muted-foreground transition-colors cursor-pointer hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'block',
                    !descriptionExpanded && 'line-clamp-1'
                  )}
                >
                  {submission.description}
                </span>
              </button>
            )}
          </div>
          <InspectIconButton onClick={onClose} aria-label="Chiudi">
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
        <InspectBar position="bottom" className="flex-wrap">
          <div className="hidden flex-1 md:block" />
          <VotingToolbar
            size="large"
            flagStatus={submission.flagStatus}
            placement={submission.placement}
            onFlag={status => onFlag(submission.id, status)}
            onPlace={placement => onPlace(submission.id, placement)}
          />
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
