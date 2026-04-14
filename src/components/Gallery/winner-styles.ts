export type RankResult = 'first' | 'second' | 'third' | 'runner-up' | string;

export type RankStyles = {
  border: string;
  badge: string;
};

const RANK_STYLES: Record<string, RankStyles> = {
  first: {
    border: 'border-gold/40',
    badge: 'bg-gold text-gold-foreground',
  },
  second: {
    border: 'border-border-strong',
    badge: 'bg-surface-raised text-foreground',
  },
  third: {
    border: 'border-warning/40',
    badge: 'bg-warning/80 text-warning-foreground',
  },
};

const DEFAULT_STYLES: RankStyles = {
  border: 'border-accent/40',
  badge: 'bg-accent text-accent-foreground',
};

export function getRankStyles(result: RankResult): RankStyles {
  return RANK_STYLES[result] ?? DEFAULT_STYLES;
}
