import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import {
  CHROME_IGNORE_ATTRIBUTE,
  type ChromeBarProps,
} from '../../hooks/useInspectChrome';
import { cn } from '../ui/cn';

// Shared chrome for the full screen inspect views: dark grey backdrop
// (bg-popover) and neutral controls, matching the Concorso lightbox.

type InspectBarProps = ComponentProps<'div'> & {
  position: 'top' | 'bottom';
};

export function InspectBar({
  position,
  className,
  children,
  ...props
}: InspectBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-border bg-popover/95 px-3 py-1.5 text-foreground backdrop-blur-sm',
        position === 'top' ? 'border-b' : 'border-t',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function InspectIconButton({
  className,
  children,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type="button"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors cursor-pointer hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

type InspectNavButtonProps = ComponentProps<'button'> & {
  direction: 'prev' | 'next';
};

export function InspectNavButton({
  direction,
  className,
  ...props
}: InspectNavButtonProps) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;

  return (
    <InspectIconButton
      aria-label={direction === 'prev' ? 'Precedente' : 'Successivo'}
      className={cn(
        'disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent',
        className
      )}
      {...props}
    >
      <Icon className="size-4" />
    </InspectIconButton>
  );
}

type InspectNavigationProps = {
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  prevLabel: string;
  nextLabel: string;
};

// Prev/next pair, placed at the right end of an inspect bottom bar
export function InspectNavigation({
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
}: InspectNavigationProps) {
  return (
    <div className="flex flex-1 items-center justify-end gap-1">
      <InspectNavButton
        direction="prev"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label={prevLabel}
        title={prevLabel}
      />
      <InspectNavButton
        direction="next"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label={nextLabel}
        title={nextLabel}
      />
    </div>
  );
}

type HoverRevealBarProps = {
  position: 'top' | 'bottom';
  isVisible: boolean;
  barProps: ChromeBarProps;
  // Floating control kept just off the bar edge (bottom bar only): above the
  // bar while it shows, near the screen edge while it is hidden
  accessory?: ReactNode;
  children: ReactNode;
};

// Edge bar that stays hidden until the pointer nears that edge (see
// useInspectChrome), so it never covers the photo while judging. The outer
// wrapper keeps the bar's final box (the slide is a transform on the inner
// bar), which the hook hit tests.
export function HoverRevealBar({
  position,
  isVisible,
  barProps,
  accessory,
  children,
}: HoverRevealBarProps) {
  const isTop = position === 'top';
  const { barRef, onFocus, onBlur } = barProps;

  return (
    <div
      ref={barRef}
      className={cn(
        'pointer-events-none absolute inset-x-0 z-30',
        isTop ? 'top-0' : 'bottom-0'
      )}
    >
      {accessory && !isTop && (
        <div
          {...{ [CHROME_IGNORE_ATTRIBUTE]: '' }}
          className={cn(
            'pointer-events-auto absolute left-3 transition-all duration-200',
            isVisible ? 'bottom-full pb-2' : 'bottom-12'
          )}
        >
          {accessory}
        </div>
      )}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: focus listeners only track keyboard focus of the controls inside, to keep the bar shown */}
      <div
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(
          'transition-all duration-200',
          isVisible && 'pointer-events-auto translate-y-0 opacity-100',
          !isVisible && 'opacity-0',
          !isVisible && (isTop ? '-translate-y-full' : 'translate-y-full')
        )}
      >
        {children}
      </div>
    </div>
  );
}

type ZoomIndicatorProps = {
  zoomLevel: number;
  onReset: () => void;
  className?: string;
};

// Shown only while zoomed in: a faint chip with the level and a reset
// button, full opacity on hover so it never competes with the photo.
// Rendered as the bottom HoverRevealBar accessory.
export function ZoomIndicator({
  zoomLevel,
  onReset,
  className,
}: ZoomIndicatorProps) {
  if (zoomLevel <= 1) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1 rounded-full bg-background/40 py-0.5 pr-0.5 pl-2 text-tiny tabular-nums text-muted-foreground opacity-50 backdrop-blur-sm transition-opacity hover:opacity-100 focus-within:opacity-100',
        className
      )}
    >
      <span>{Math.round(zoomLevel * 100)}%</span>
      <button
        type="button"
        onClick={onReset}
        aria-label="Reimposta zoom"
        title="Reimposta zoom"
        className="flex size-4 items-center justify-center rounded-full transition-colors cursor-pointer hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <RotateCcw className="size-2.5" />
      </button>
    </div>
  );
}
