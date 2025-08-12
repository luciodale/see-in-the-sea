// Shared API response types - Single source of truth for client/server

import type { Category, Contest, Submission } from '../db/index.js';

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
};

export type UploadResponse = ApiResponse<UploadResult>;

// Form Data Types (for client-side)
export type UploadFormData = {
  image: File;
  contestId: string;
  categoryId: string;
  title: string;
  description?: string;
};

// Error Response Type
export type ErrorResponse = {
  success: false;
  message: string;
  error?: string;
};

// Contest Management Types
export type CreateContestFormData = {
  id: string;
  name: string;
  description?: string;
  year: number;
  maxSubmissionsPerCategory?: number;
  status?: 'active' | 'inactive' | 'assessment';
};

export type CreateContestResponse = {
  success: boolean;
  message: string;
  data?: {
    contestId: string;
    name: string;
    year: number;
  };
};

export type UpdateContestRequest = {
  id: string;
  name?: string;
  description?: string | null;
  year?: number;
  status?: 'active' | 'inactive' | 'assessment';
  maxSubmissionsPerCategory?: number;
};

export type UpdateContestResponse = ApiResponse<{ id: string }>;

export type ContestListResponse = {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    description: string | null;
    year: number;
    status: 'active' | 'inactive' | 'assessment';
    maxSubmissionsPerCategory: number;
    createdAt: string;
    updatedAt: string;
  }>;
};

// Submission Management Types
export type ManageSubmissionFormData = {
  id?: string; // For updates
  contestId: string;
  categoryId: string;
  userEmail: string;
  title: string;
  description?: string;
  replaceImage?: boolean; // For image replacement
};

export type ManageSubmissionResponse = {
  success: boolean;
  message: string;
  data?: {
    submissionId: string;
    title: string;
    contestId: string;
    categoryId: string;
    userEmail: string;
  };
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
  imageUrl: string;
  r2Key: string;
  userEmail: string;
  uploadedAt: string;
  contestId: string;
  contestName: string;
  categoryId: string;
  categoryName: string;
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
  imageUrl: string | null;
  r2Key: string;
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

// Type guards for runtime type checking
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

export function isApiError(response: ApiResponse): response is ErrorResponse {
  return response.success === false;
}
