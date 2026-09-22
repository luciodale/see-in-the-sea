import { cn } from './ui/cn';

type JudgesBarProps = {
  judges: string[];
  label: string;
  className?: string;
};

export function JudgesBar({ judges, label, className }: JudgesBarProps) {
  if (!judges.length) return null;
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-center gap-3 mt-3',
        className
      )}
    >
      <span className="text-editorial uppercase tracking-editorial-wider text-muted-foreground">
        {label}
      </span>
      <span className="h-px w-6 bg-border-strong" />
      <span className="font-light text-sm text-foreground/80 leading-paragraph">
        {judges.join(', ')}
      </span>
    </div>
  );
}
