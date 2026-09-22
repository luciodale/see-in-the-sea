import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ImageOff, Trophy } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type {
  FilterStatus,
  FlagStatus,
  JudgingSubmission,
  Placement,
  PortfolioGroup,
} from '../../types/judging';
import { getPlacementInfo } from '../../types/judging';
import { cn } from '../ui/cn';
import { PortfolioCard } from './PortfolioCard';
import { SortableItem } from './SortableItem';
import { SubmissionCard } from './SubmissionCard';
import { VirtualizedGrid } from './VirtualizedGrid';

type JudgingContentGridProps = {
  columns: number;
  loading: boolean;
  error: string | null;
  filterStatus: FilterStatus;
  isMediterranean: boolean;
  sortedSubmissions: JudgingSubmission[];
  portfoliosList: PortfolioGroup[];
  groupedByUser: Record<string, Record<string, JudgingSubmission[]>> | null;
  // Drag-and-drop for submissions
  orderedShortlistedSubmissions: JudgingSubmission[];
  handleSubmissionReorder: (activeId: string, overId: string) => void;
  resetSubmissionOrder: () => void;
  // Drag-and-drop for portfolios
  orderedShortlistedPortfolios: (PortfolioGroup & { id: string })[];
  handlePortfolioReorder: (activeId: string, overId: string) => void;
  resetPortfolioOrder: () => void;
  // Callbacks
  onInspectSubmission: (id: string) => void;
  onInspectPortfolio: (id: string) => void;
  onOpenPortfolioPhoto: (portfolioId: string, photoId: string) => void;
  onFlag: (submissionId: string, status: FlagStatus) => void;
  onPlace: (submissionId: string, placement: Placement) => void;
  onPortfolioFlag: (submissionIds: string[], status: FlagStatus) => void;
  onPortfolioPlace: (
    submissionIds: string[],
    placement: Placement,
    categoryId: string
  ) => void;
};

const WINNER_PLACEMENTS = ['first', 'second', 'third'] as const;

const gridStyle = (cols: number) => ({
  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
});

export function JudgingContentGrid({
  columns,
  loading,
  error,
  filterStatus,
  isMediterranean,
  sortedSubmissions,
  portfoliosList,
  groupedByUser,
  orderedShortlistedSubmissions,
  handleSubmissionReorder,
  resetSubmissionOrder,
  orderedShortlistedPortfolios,
  handlePortfolioReorder,
  resetPortfolioOrder,
  onInspectSubmission,
  onInspectPortfolio,
  onOpenPortfolioPhoto,
  onFlag,
  onPlace,
  onPortfolioFlag,
  onPortfolioPlace,
}: JudgingContentGridProps) {
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(
    null
  );
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeSubmission = activeSubmissionId
    ? orderedShortlistedSubmissions.find(s => s.id === activeSubmissionId)
    : null;

  const activePortfolio = activePortfolioId
    ? orderedShortlistedPortfolios.find(p => p.id === activePortfolioId)
    : null;

  const handleSubmissionDragStart = useCallback((event: DragStartEvent) => {
    setActiveSubmissionId(event.active.id as string);
  }, []);

  const handleSubmissionDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveSubmissionId(null);
      const { active, over } = event;
      if (over && active.id !== over.id) {
        handleSubmissionReorder(active.id as string, over.id as string);
      }
    },
    [handleSubmissionReorder]
  );

  const handlePortfolioDragStart = useCallback((event: DragStartEvent) => {
    setActivePortfolioId(event.active.id as string);
  }, []);

  const handlePortfolioDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActivePortfolioId(null);
      const { active, over } = event;
      if (over && active.id !== over.id) {
        handlePortfolioReorder(active.id as string, over.id as string);
      }
    },
    [handlePortfolioReorder]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="size-8 animate-spin rounded-full border-b-2 border-foreground/70" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (sortedSubmissions.length === 0) {
    return filterStatus === 'winners' ? (
      <div className="flex flex-col items-center gap-2 py-20 text-center">
        <Trophy className="size-10 text-subtle-foreground" />
        <p className="text-foreground">Nessun vincitore selezionato</p>
        <p className="text-sm text-muted-foreground">
          Assegna 1&deg;, 2&deg;, 3&deg; o M per vedere i vincitori qui
        </p>
      </div>
    ) : (
      <div className="flex flex-col items-center gap-2 py-20 text-center">
        <ImageOff className="size-10 text-subtle-foreground" />
        <p className="text-sm text-muted-foreground">
          Nessuna foto corrisponde a questo filtro
        </p>
      </div>
    );
  }

  // Winners view
  if (filterStatus === 'winners') {
    if (isMediterranean) {
      const placedPortfolios = WINNER_PLACEMENTS.flatMap(placement =>
        portfoliosList.filter(p =>
          p.submissions.some(s => s.placement === placement)
        )
      );
      const runnerUpPortfolios = portfoliosList.filter(p =>
        p.submissions.some(s => s.placement === 'runner-up')
      );

      return (
        <div className="flex flex-col gap-8">
          {placedPortfolios.length > 0 && (
            <div className="flex flex-col gap-4">
              {placedPortfolios.map(portfolio => (
                <PortfolioCard
                  key={portfolio.portfolioId}
                  portfolioId={portfolio.portfolioId}
                  submissions={portfolio.submissions}
                  showImages
                  onOpenPhoto={onOpenPortfolioPhoto}
                  onInspect={onInspectPortfolio}
                  onFlag={onPortfolioFlag}
                  onPlace={onPortfolioPlace}
                />
              ))}
            </div>
          )}

          {runnerUpPortfolios.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-border pt-8">
              <PlacementHeading
                placement="runner-up"
                title={`Menzioni (${runnerUpPortfolios.length})`}
              />
              {runnerUpPortfolios.map(portfolio => (
                <PortfolioCard
                  key={portfolio.portfolioId}
                  portfolioId={portfolio.portfolioId}
                  submissions={portfolio.submissions}
                  showImages
                  onOpenPhoto={onOpenPortfolioPhoto}
                  onInspect={onInspectPortfolio}
                  onFlag={onPortfolioFlag}
                  onPlace={onPortfolioPlace}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Non-Mediterranean Winners
    const runnerUps = sortedSubmissions.filter(
      s => s.placement === 'runner-up'
    );

    return (
      <div className="flex flex-col gap-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {WINNER_PLACEMENTS.map(placement => {
            const winner = sortedSubmissions.find(
              s => s.placement === placement
            );
            const placementInfo = getPlacementInfo(placement);

            return winner ? (
              <SubmissionCard
                key={placement}
                submission={winner}
                size="large"
                onInspect={onInspectSubmission}
                onFlag={onFlag}
                onPlace={onPlace}
              />
            ) : (
              <div
                key={placement}
                className="flex aspect-4/3 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface text-subtle-foreground"
              >
                <span
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                    placementInfo?.color
                  )}
                >
                  {placementInfo?.label}
                </span>
                <span className="text-sm">Non assegnato</span>
              </div>
            );
          })}
        </div>

        {runnerUps.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-border pt-8">
            <PlacementHeading
              placement="runner-up"
              title={`Menzioni (${runnerUps.length})`}
            />
            <div className="grid gap-4" style={gridStyle(columns)}>
              {runnerUps.map(submission => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  onInspect={onInspectSubmission}
                  onFlag={onFlag}
                  onPlace={onPlace}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mediterranean grid
  if (isMediterranean && groupedByUser) {
    if (filterStatus === 'shortlisted') {
      return (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-subtle-foreground">
              Trascina per riordinare
            </p>
            <button
              type="button"
              onClick={resetPortfolioOrder}
              className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Ripristina ordine
            </button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handlePortfolioDragStart}
            onDragEnd={handlePortfolioDragEnd}
          >
            <SortableContext
              items={orderedShortlistedPortfolios.map(p => p.id)}
              strategy={
                columns === 1
                  ? verticalListSortingStrategy
                  : rectSortingStrategy
              }
            >
              <div className="grid gap-4" style={gridStyle(columns)}>
                {orderedShortlistedPortfolios.map(portfolio => (
                  <SortableItem
                    key={portfolio.id}
                    id={portfolio.id}
                    layout="vertical"
                  >
                    <PortfolioCard
                      portfolioId={portfolio.portfolioId}
                      submissions={portfolio.submissions}
                      showImages
                      onInspect={onInspectPortfolio}
                      onFlag={onPortfolioFlag}
                      onPlace={onPortfolioPlace}
                    />
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activePortfolio && (
                <div className="rotate-1 rounded-lg opacity-90 shadow-2xl ring-1 ring-border-strong">
                  <PortfolioCard
                    portfolioId={activePortfolio.portfolioId}
                    submissions={activePortfolio.submissions}
                    showImages
                    onInspect={() => {}}
                    onFlag={() => {}}
                    onPlace={() => {}}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      );
    }

    // Default Mediterranean grid (virtualized)
    return (
      <MediterraneanDefaultGrid
        groupedByUser={groupedByUser}
        columns={columns}
        onInspectPortfolio={onInspectPortfolio}
        onPortfolioFlag={onPortfolioFlag}
        onPortfolioPlace={onPortfolioPlace}
      />
    );
  }

  // Non-Mediterranean shortlisted - draggable
  if (filterStatus === 'shortlisted') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-subtle-foreground">
            Trascina per riordinare
          </p>
          <button
            type="button"
            onClick={resetSubmissionOrder}
            className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Ripristina ordine
          </button>
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleSubmissionDragStart}
          onDragEnd={handleSubmissionDragEnd}
        >
          <SortableContext
            items={orderedShortlistedSubmissions.map(s => s.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4" style={gridStyle(columns)}>
              {orderedShortlistedSubmissions.map(submission => (
                <SortableItem key={submission.id} id={submission.id}>
                  <SubmissionCard
                    submission={submission}
                    size="large"
                    onInspect={onInspectSubmission}
                    onFlag={onFlag}
                    onPlace={onPlace}
                  />
                </SortableItem>
              ))}
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeSubmission && (
              <div className="w-64 rotate-1 rounded-lg opacity-90 shadow-2xl ring-1 ring-border-strong">
                <SubmissionCard
                  submission={activeSubmission}
                  size="large"
                  onInspect={() => {}}
                  onFlag={() => {}}
                  onPlace={() => {}}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    );
  }

  // Default grid (virtualized)
  return (
    <VirtualizedGrid
      key={`submissions-${columns}`}
      items={sortedSubmissions}
      columns={columns}
      gap={16}
      estimateRowHeight={300}
      getKey={getSubmissionKey}
      renderItem={submission => (
        <SubmissionCard
          submission={submission}
          size="large"
          onInspect={onInspectSubmission}
          onFlag={onFlag}
          onPlace={onPlace}
        />
      )}
    />
  );
}

function PlacementHeading({
  placement,
  title,
}: {
  placement: Placement;
  title: string;
}) {
  const placementInfo = getPlacementInfo(placement);

  return (
    <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <span
        className={cn(
          'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
          placementInfo?.color
        )}
      >
        {placementInfo?.label}
      </span>
      {title}
    </h3>
  );
}

function getSubmissionKey(s: JudgingSubmission) {
  return s.id;
}

type FlatPortfolio = {
  portfolioId: string;
  submissions: JudgingSubmission[];
};

function getPortfolioKey(p: FlatPortfolio) {
  return p.portfolioId;
}

function MediterraneanDefaultGrid({
  groupedByUser,
  columns,
  onInspectPortfolio,
  onPortfolioFlag,
  onPortfolioPlace,
}: {
  groupedByUser: Record<string, Record<string, JudgingSubmission[]>>;
  columns: number;
  onInspectPortfolio: (id: string) => void;
  onPortfolioFlag: (submissionIds: string[], status: FlagStatus) => void;
  onPortfolioPlace: (
    submissionIds: string[],
    placement: Placement,
    categoryId: string
  ) => void;
}) {
  const flatPortfolios = useMemo(
    () =>
      Object.entries(groupedByUser).flatMap(([_userId, portfolios]) =>
        Object.entries(portfolios).map(
          ([portfolioId, portfolioSubmissions]) => ({
            portfolioId,
            submissions: portfolioSubmissions,
          })
        )
      ),
    [groupedByUser]
  );

  return (
    <VirtualizedGrid
      key={`portfolios-${columns}`}
      items={flatPortfolios}
      columns={columns}
      gap={24}
      estimateRowHeight={350}
      getKey={getPortfolioKey}
      renderItem={portfolio => (
        <PortfolioCard
          portfolioId={portfolio.portfolioId}
          submissions={portfolio.submissions}
          onInspect={onInspectPortfolio}
          onFlag={onPortfolioFlag}
          onPlace={onPortfolioPlace}
        />
      )}
    />
  );
}
