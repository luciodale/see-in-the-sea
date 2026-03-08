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
  { value: 'first', label: '1\u00B0', color: 'bg-yellow-500' },
  { value: 'second', label: '2\u00B0', color: 'bg-gray-400' },
  { value: 'third', label: '3\u00B0', color: 'bg-amber-600' },
  { value: 'runner-up', label: 'M', color: 'bg-blue-500' },
];

export type PortfolioGroup = {
  portfolioId: string;
  submissions: JudgingSubmission[];
};

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
