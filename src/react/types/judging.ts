export type Placement = 'first' | 'second' | 'third' | 'runner-up' | null;
export type FlagStatus = 'pending' | 'shortlisted' | 'rejected';
export type FilterStatus =
  | 'all'
  | 'pending'
  | 'shortlisted'
  | 'rejected'
  | 'winners';

export type JudgingSubmission = {
  id: string;
  title: string;
  description: string | null;
  r2ImageId: string | null;
  categoryId: string;
  placement: Placement;
  flagStatus: FlagStatus;
  rating: number | null;
  portfolio?: string | null;
  portfolioPhotoType?: string | null;
  anonymousUserId?: string;
  isSubmitted?: boolean;
};

export type PlacementInfo = {
  value: Placement;
  label: string;
  color: string;
};

export const PLACEMENTS: PlacementInfo[] = [
  { value: 'first', label: '1\u00B0', color: 'bg-gold text-gold-foreground' },
  {
    value: 'second',
    label: '2\u00B0',
    color: 'bg-surface-raised text-foreground',
  },
  {
    value: 'third',
    label: '3\u00B0',
    color: 'bg-warning/80 text-warning-foreground',
  },
  { value: 'runner-up', label: 'M', color: 'bg-accent text-accent-foreground' },
];

export type PortfolioGroup = {
  portfolioId: string;
  submissions: JudgingSubmission[];
};

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
