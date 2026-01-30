// Shared API response types - Single source of truth for client/server

import type { Category, Contest, Submission } from '../db/index';

// Base API response wrapper
export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};

// Contest API Types
export type ContestWithCategories = {
  contest: Contest;
  categories: Category[];
};

export type ContestsResponse = ApiResponse<ContestWithCategories>;

// Submissions API Types
export type CategoryWithSubmissions = Category & {
  submissions: Submission[];
  submissionCount: number;
  maxSubmissions: number;
};

export type UserContestData = {
  contest: Contest | null;
  categories: CategoryWithSubmissions[];
};

export type SubmissionsResponse = ApiResponse<UserContestData>;

// Payment API Types
export type PaymentStatusData = {
  hasPaid: boolean;
};

export type PaymentStatusResponse = ApiResponse<PaymentStatusData>;

// Upload API Types
export type UploadMetadata = {
  originalFileName: string;
  originalSize: number;
  contentType: string;
  uploadedAt: string;
};

export type UploadResult = {
  submissionId: string;
  contestId: string;
  categoryId: string;
  uploadedBy: string;
  title: string;
  description: string;
  imageUrl: string;
  action: 'create' | 'replace';
  metadata: UploadMetadata;
  portfolio?: string;
  portfolioPhotoType?: string;
};

export type UploadResponse = ApiResponse<UploadResult>;

// Form Data Types (for client-side)
export type UploadFormData = {
  image: File;
  contestId: string;
  categoryId: string;
  title: string;
  description?: string;
  portfolio?: string;
  portfolioPhotoType?: string;
};

// Error Response Type
export type ErrorResponse = {
  success: false;
  message: string;
  error?: string;
};

export type SubmissionListResponse = {
  success: boolean;
  data: AdminSubmission[];
  totalCount: number;
};

// Admin Submission Browser Types
export type AdminSubmission = {
  id: string;
  title: string;
  description: string | null;
  r2ImageId: string | null;
  userEmail: string;
  uploadedAt: string | null;
  contestId: string;
  contestName: string;
  categoryId: string;
  categoryName: string;
  portfolio: string | null;
  portfolioPhotoType: string | null;
  // User data from Clerk
  firstName?: string;
  lastName?: string;
  userCreatedAt?: string;
  userLastActiveAt?: string;
  // Payment status
  hasPaid: boolean;
};

export type AdminSubmissionsResponse = {
  success: boolean;
  data: AdminSubmission[];
  totalCount: number;
};

// Admin Results Types
export type AdminResultRow = {
  resultId: string;
  categoryId: string;
  categoryName: string | null;
  result: 'first' | 'second' | 'third' | 'runner-up';
  submissionId: string;
  title: string;
  userEmail: string;
  r2ImageId: string | null;
  contestId: string;
  uploadedAt: string;
  firstName: string | null;
  lastName: string | null;
};

export type AdminResultsResponse = {
  success: boolean;
  data: AdminResultRow[];
  totalCount: number;
  message?: string;
};

// Manage Results (admin) - request/response types
export type UpdateResultRequest = {
  resultId: string;
  result: 'first' | 'second' | 'third' | 'runner-up';
  firstName: string | null;
  lastName: string | null;
};

export type UpdateResultResponse = ApiResponse<object>;

// Judges API Types
export type JudgeRow = { fullName: string };
export type JudgesResponse = ApiResponse<JudgeRow[]>;

// Admin Old Contests Types
export type ContestYearsData = {
  years: number[];
};
export type ContestYearsResponse = ApiResponse<ContestYearsData>;

export type Judge = {
  id: string;
  contestId: string;
  fullName: string;
  createdAt?: string | null;
};

export type ResultData = {
  id: string;
  submissionId: string;
  result: string;
  firstName: string | null;
  lastName: string | null;
  createdAt?: string | null;
};

export type SubmissionWithResult = Submission & {
  result: ResultData | null;
  category: Category | null;
};

export type ContestDetailsData = {
  contest: Contest;
  judges: Judge[];
  submissions: SubmissionWithResult[];
};

export type ContestDetailsResponse = ApiResponse<ContestDetailsData>;

export type CreateOldContestData = {
  contest: {
    id: string;
    name: string;
    description: string;
    year: number;
    status: 'active' | 'inactive' | 'assessment';
    maxSubmissionsPerCategory: number;
  };
  judges: Array<{
    id: string;
    contestId: string;
    fullName: string;
  }>;
};

export type CreateOldContestResponse = ApiResponse<CreateOldContestData>;

export type CreateOldContestSubmissionData = {
  submissionId: string;
  resultId: string;
};

export type CreateOldContestSubmissionResponse =
  ApiResponse<CreateOldContestSubmissionData>;

export type DeleteSubmissionResponse = ApiResponse<object>;

export type CreateJudgeData = {
  id: string;
  contestId: string;
  fullName: string;
};

export type CreateJudgeResponse = ApiResponse<CreateJudgeData>;
export type UpdateJudgeResponse = ApiResponse<object>;
export type DeleteJudgeResponse = ApiResponse<object>;

// Admin Winners Preview (from judging_flags, not results)
export type WinnersPreviewRow = {
  categoryId: string;
  categoryName: string;
  placement: 'first' | 'second' | 'third' | 'runner-up';
  userEmail: string;
  firstName: string | undefined;
  lastName: string | undefined;
  submissionId: string;
  title: string;
  r2ImageId: string | null;
};

export type WinnersPreviewResponse = ApiResponse<WinnersPreviewRow[]>;

// Checkout API Types
export type CheckoutResponse = {
  success: boolean;
  url?: string;
  message?: string;
};

// Type guards for runtime type checking
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

export function isApiError(response: ApiResponse): response is ErrorResponse {
  return response.success === false;
}
