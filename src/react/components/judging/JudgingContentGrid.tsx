import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Trophy } from 'lucide-react';
import { useCallback, useState } from 'react';
import type {
  FlagStatus,
  FilterStatus,
  JudgingSubmission,
  Placement,
  PortfolioGroup,
} from '../../types/judging';
import { PLACEMENTS } from '../../types/judging';
import { PortfolioCard } from './PortfolioCard';
import { SortableItem } from './SortableItem';
import { SubmissionCard } from './SubmissionCard';

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
  onFlag: (submissionId: string, status: FlagStatus) => void;
  onPlace: (submissionId: string, placement: Placement) => void;
  onPortfolioFlag: (submissionIds: string[], status: FlagStatus) => void;
  onPortfolioPlace: (
    submissionIds: string[],
    placement: Placement,
    categoryId: string
  ) => void;
};

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 text-center">
        {error}
      </div>
    );
  }

  if (sortedSubmissions.length === 0) {
    return (
      <div className="text-center py-20 text-slate-400">
        {filterStatus === 'winners' ? (
          <div>
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nessun vincitore selezionato</p>
            <p className="text-sm mt-2">
              Assegna 1&deg;, 2&deg;, 3&deg; o M per vedere i vincitori qui
            </p>
          </div>
        ) : (
          'Nessuna foto corrisponde a questo filtro'
        )}
      </div>
    );
  }

  // Winners view
  if (filterStatus === 'winners') {
    if (isMediterranean) {
      return (
        <div className="grid grid-cols-1 gap-6">
          {(['first', 'second', 'third', 'runner-up'] as const).map(
            placement => {
              const placementInfo = PLACEMENTS.find(p => p.value === placement);
              const placementPortfolios = portfoliosList.filter(p =>
                p.submissions.some(s => s.placement === placement)
              );

              if (placementPortfolios.length === 0) return null;

              return (
                <div key={placement} className="space-y-6">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <span
                      className={`${placementInfo?.color} w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}
                    >
                      {placementInfo?.label}
                    </span>
                    <span className="text-slate-300">
                      {placement === 'first' && '\uD83E\uDD47 1\u00B0 Posto'}
                      {placement === 'second' && '\uD83E\uDD48 2\u00B0 Posto'}
                      {placement === 'third' && '\uD83E\uDD49 3\u00B0 Posto'}
                      {placement === 'runner-up' &&
                        `Menzioni (${placementPortfolios.length})`}
                    </span>
                  </h3>
                  <div className="grid gap-6" style={gridStyle(columns)}>
                    {placementPortfolios.map(portfolio => (
                      <PortfolioCard
                        key={portfolio.portfolioId}
                        portfolioId={portfolio.portfolioId}
                        submissions={portfolio.submissions}
                        showImages
                        onInspect={onInspectPortfolio}
                        onFlag={onPortfolioFlag}
                        onPlace={onPortfolioPlace}
                      />
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      );
    }

    // Non-Mediterranean Winners
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['second', 'first', 'third'] as const).map(placement => {
            const winner = sortedSubmissions.find(
              s => s.placement === placement
            );
            const placementInfo = PLACEMENTS.find(p => p.value === placement);
            const isFirst = placement === 'first';

            return (
              <div
                key={placement}
                className={`${isFirst ? 'md:-mt-4 md:order-2' : placement === 'second' ? 'md:order-1' : 'md:order-3'}`}
              >
                <div
                  className={`text-center mb-3 ${isFirst ? 'text-2xl' : 'text-lg'}`}
                >
                  <span
                    className={`${placementInfo?.color} inline-flex items-center justify-center ${isFirst ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm'} rounded-full font-bold shadow-lg`}
                  >
                    {placementInfo?.label}
                  </span>
                  <p className="text-slate-300 mt-2 font-medium">
                    {placement === 'first' && '\uD83E\uDD47 1\u00B0 Posto'}
                    {placement === 'second' && '\uD83E\uDD48 2\u00B0 Posto'}
                    {placement === 'third' && '\uD83E\uDD49 3\u00B0 Posto'}
                  </p>
                </div>
                {winner ? (
                  <div
                    className={`${isFirst ? 'ring-2 ring-yellow-500/50' : ''} rounded-lg overflow-hidden`}
                  >
                    <SubmissionCard
                      submission={winner}
                      size="large"
                      onInspect={onInspectSubmission}
                      onFlag={onFlag}
                      onPlace={onPlace}
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-slate-800/50 rounded-lg flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-slate-700 gap-2">
                    <span className="text-4xl">&#127942;</span>
                    <span className="text-sm">Non assegnato</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {sortedSubmissions.filter(s => s.placement === 'runner-up').length >
          0 && (
          <div className="mt-8 pt-8 border-t border-slate-800">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="bg-blue-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                M
              </span>
              <span className="text-slate-300">
                Menzioni (
                {
                  sortedSubmissions.filter(s => s.placement === 'runner-up')
                    .length
                }
                )
              </span>
            </h3>
            <div className="grid gap-4" style={gridStyle(columns)}>
              {sortedSubmissions
                .filter(s => s.placement === 'runner-up')
                .map(submission => (
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
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-500">Trascina per riordinare</p>
            <button
              type="button"
              onClick={resetPortfolioOrder}
              className="text-xs text-slate-400 hover:text-white transition-colors"
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
                <div className="opacity-80 rotate-1 shadow-2xl shadow-black/50 ring-2 ring-emerald-500 rounded-xl">
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

    // Default Mediterranean grid
    return (
      <div className="grid gap-6" style={gridStyle(columns)}>
        {Object.entries(groupedByUser).flatMap(([_userId, portfolios]) =>
          Object.entries(portfolios).map(
            ([portfolioId, portfolioSubmissions]) => (
              <PortfolioCard
                key={portfolioId}
                portfolioId={portfolioId}
                submissions={portfolioSubmissions}
                onInspect={onInspectPortfolio}
                onFlag={onPortfolioFlag}
                onPlace={onPortfolioPlace}
              />
            )
          )
        )}
      </div>
    );
  }

  // Non-Mediterranean shortlisted - draggable
  if (filterStatus === 'shortlisted') {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500">Trascina per riordinare</p>
          <button
            type="button"
            onClick={resetSubmissionOrder}
            className="text-xs text-slate-400 hover:text-white transition-colors"
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
              <div className="opacity-80 rotate-1 shadow-2xl shadow-black/50 ring-2 ring-emerald-500 rounded-lg w-64">
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

  // Default grid
  return (
    <div className="grid gap-4" style={gridStyle(columns)}>
      {sortedSubmissions.map(submission => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          size="large"
          onInspect={onInspectSubmission}
          onFlag={onFlag}
          onPlace={onPlace}
        />
      ))}
    </div>
  );
}
