/**
 * UI-specific types that are simplified versions of database types
 * These types only include the fields needed for UI components
 */

export type UISubmission = {
  id: string;
  title: string;
  description: string | null;
  r2ImageId: string | null;
  portfolio?: string;
  portfolioPhotoType?: string;
};

export type UICategory = {
  id: string;
  name: string;
  maxSubmissions: number;
  submissions: UISubmission[];
};
