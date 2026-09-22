import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import type { ContestSummary } from '../../../types/api';
import { cn } from '../ui/cn';

const STATUS_DOT: Record<ContestSummary['status'], string> = {
  active: 'bg-success',
  assessment: 'bg-warning',
  inactive: 'bg-subtle-foreground',
};

const STATUS_LABEL: Record<ContestSummary['status'], string | null> = {
  active: 'Attivo',
  assessment: 'Valutazione',
  inactive: null,
};

type StatusDotProps = {
  status: ContestSummary['status'];
};

function StatusDot({ status }: StatusDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('size-1.5 shrink-0 rounded-full', STATUS_DOT[status])}
    />
  );
}

type ContestPickerProps = {
  contests: ContestSummary[];
  selectedContestId: string | null | undefined;
  onChange: (contestId: string) => void;
};

export function ContestPicker({
  contests,
  selectedContestId,
  onChange,
}: ContestPickerProps) {
  const selected = contests.find(c => c.id === selectedContestId);

  return (
    <Listbox value={selectedContestId ?? ''} onChange={onChange}>
      <div className="relative shrink-0">
        <ListboxButton
          aria-label="Seleziona concorso"
          className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-foreground transition-colors cursor-pointer hover:border-border-strong hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-open:border-border-strong data-open:bg-surface-hover"
        >
          {selected ? (
            <>
              <StatusDot status={selected.status} />
              <span className="truncate">
                {selected.name}{' '}
                <span className="text-muted-foreground">{selected.year}</span>
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Seleziona concorso</span>
          )}
          <ChevronDownIcon className="h-3 w-3 text-muted-foreground" />
        </ListboxButton>

        <ListboxOptions
          transition
          className="absolute right-0 z-50 mt-2 max-h-80 min-w-64 origin-top-right overflow-y-auto rounded-xl border border-border-strong bg-popover p-1 shadow-2xl transition focus:outline-none data-closed:scale-95 data-closed:opacity-0 data-enter:duration-100 data-leave:duration-75"
        >
          {contests.map(contest => (
            <ListboxOption
              key={contest.id}
              value={contest.id}
              className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/85 transition-colors cursor-pointer data-focus:bg-surface-hover data-focus:text-foreground data-selected:text-foreground"
            >
              <StatusDot status={contest.status} />
              <span className="flex-1 whitespace-nowrap">
                {contest.name}{' '}
                <span className="text-muted-foreground">{contest.year}</span>
              </span>
              {STATUS_LABEL[contest.status] && (
                <span className="text-editorial uppercase tracking-editorial text-subtle-foreground">
                  {STATUS_LABEL[contest.status]}
                </span>
              )}
              <CheckIcon className="invisible h-3.5 w-3.5 text-foreground group-data-selected:visible" />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
