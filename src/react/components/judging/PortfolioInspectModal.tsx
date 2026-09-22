import { X } from 'lucide-react';
import { useInspectChrome } from '../../hooks/useInspectChrome';
import { usePortfolioLayout } from '../../hooks/usePortfolioLayout';
import type {
  FlagStatus,
  JudgingSubmission,
  Placement,
  PortfolioGroup,
} from '../../types/judging';
import { cn } from '../ui/cn';
import {
  HoverRevealBar,
  InspectBar,
  InspectIconButton,
  InspectNavigation,
} from './InspectControls';
import { PortfolioPhotoCell } from './PortfolioPhotoCell';
import { PortfolioPhotoZoom } from './PortfolioPhotoZoom';
import { VotingToolbar } from './VotingToolbar';

type PortfolioInspectModalProps = {
  portfolio: PortfolioGroup;
  portfolioIndex: number;
  portfoliosTotal: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  // Zoomed photo state
  zoomedPhoto: JudgingSubmission | null;
  zoomedPhotoIndex: number;
  zoomedImageUrl: string | null;
  canGoPrevPhoto: boolean;
  canGoNextPhoto: boolean;
  onOpenZoomedPhoto: (id: string) => void;
  onCloseZoomedPhoto: () => void;
  onPrevPhoto: () => void;
  onNextPhoto: () => void;
  // Zoom controls
  zoomLevel: number;
  zoomOrigin: { x: number; y: number };
  onZoomClick: (e: React.MouseEvent) => void;
  onResetZoom: () => void;
  // Description
  descriptionExpanded: boolean;
  onToggleDescription: () => void;
  // Voting
  onFlag: (submissionIds: string[], status: FlagStatus) => void;
  onPlace: (
    submissionIds: string[],
    placement: Placement,
    categoryId: string
  ) => void;
};

export function PortfolioInspectModal({
  portfolio,
  portfolioIndex,
  portfoliosTotal,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onClose,
  zoomedPhoto,
  zoomedPhotoIndex,
  zoomedImageUrl,
  canGoPrevPhoto,
  canGoNextPhoto,
  onOpenZoomedPhoto,
  onCloseZoomedPhoto,
  onPrevPhoto,
  onNextPhoto,
  zoomLevel,
  zoomOrigin,
  onZoomClick,
  onResetZoom,
  descriptionExpanded,
  onToggleDescription,
  onFlag,
  onPlace,
}: PortfolioInspectModalProps) {
  const { isChromeVisible, surfaceHandlers, topBarProps, bottomBarProps } =
    useInspectChrome();
  const firstPhoto = portfolio.submissions[0];
  const submissionIds = portfolio.submissions.map(s => s.id);
  const {
    containerRef,
    layout,
    isReady,
    failedIds,
    handleImageLoad,
    handleImageError,
  } = usePortfolioLayout(portfolio.submissions);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio"
      className="fixed inset-0 z-50 bg-popover"
      {...surfaceHandlers}
    >
      {/* Hidden (and out of the tab order) while a photo is zoomed on top */}
      <div className={cn(zoomedPhoto && 'invisible')}>
        {/* Portfolio photos, laid out to maximise photo area */}
        <div
          ref={containerRef}
          className={cn(
            'absolute inset-0 grid gap-1 p-2',
            layout === 'pyramid'
              ? 'grid-cols-2 grid-rows-2'
              : 'auto-cols-fr grid-flow-col grid-rows-1',
            !isReady && 'invisible'
          )}
        >
          {portfolio.submissions.map((sub, index) => (
            <PortfolioPhotoCell
              key={sub.id}
              photo={sub}
              hasFailed={failedIds.has(sub.id)}
              onOpen={onOpenZoomedPhoto}
              onImageLoad={handleImageLoad}
              onImageError={handleImageError}
              className={cn(
                layout === 'pyramid' &&
                  index === 2 &&
                  'col-span-2 w-1/2 justify-self-center'
              )}
            />
          ))}
        </div>

        <HoverRevealBar
          position="top"
          isVisible={isChromeVisible}
          barProps={topBarProps}
        >
          <InspectBar position="top" className="justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium">
                  Portfolio Mediterranean
                </span>
                <span className="text-xs tabular-nums text-subtle-foreground">
                  {portfolioIndex + 1}/{portfoliosTotal}
                </span>
              </div>
              <span className="text-xs text-subtle-foreground">
                Usa le frecce per navigare · Clicca una foto per ingrandire
              </span>
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
        >
          <InspectBar position="bottom" className="flex-wrap">
            <div className="hidden flex-1 md:block" />
            <VotingToolbar
              size="large"
              flagStatus={firstPhoto?.flagStatus ?? 'pending'}
              placement={firstPhoto?.placement ?? null}
              onFlag={s => onFlag(submissionIds, s)}
              onPlace={p =>
                onPlace(submissionIds, p, firstPhoto?.categoryId || '')
              }
            />
            <InspectNavigation
              canGoPrev={canGoPrev}
              canGoNext={canGoNext}
              onPrev={onPrev}
              onNext={onNext}
              prevLabel="Portfolio precedente"
              nextLabel="Portfolio successivo"
            />
          </InspectBar>
        </HoverRevealBar>
      </div>

      {zoomedPhoto && (
        <PortfolioPhotoZoom
          photo={zoomedPhoto}
          photoIndex={zoomedPhotoIndex}
          photoCount={portfolio.submissions.length}
          imageUrl={zoomedImageUrl}
          canGoPrev={canGoPrevPhoto}
          canGoNext={canGoNextPhoto}
          onPrev={onPrevPhoto}
          onNext={onNextPhoto}
          onClose={onCloseZoomedPhoto}
          zoomLevel={zoomLevel}
          zoomOrigin={zoomOrigin}
          onZoomClick={onZoomClick}
          onResetZoom={onResetZoom}
          descriptionExpanded={descriptionExpanded}
          onToggleDescription={onToggleDescription}
        />
      )}
    </div>
  );
}
