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
  replacedSubmissionId?: string; // For image replacement
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
  startDate: string;
  endDate: string;
  maxSubmissionsPerCategory?: number;
  isActive?: boolean;
};

export type CreateContestResponse = {
  success: boolean;
  message: string;
  data?: {
    contestId: string;
    name: string;
    startDate: string;
    endDate: string;
  };
};

export type ContestListResponse = {
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    description: string | null;
    startDate: string;
    endDate: string;
    maxSubmissionsPerCategory: number;
    isActive: boolean;
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

// Type guards for runtime type checking
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

export function isApiError(response: ApiResponse): response is ErrorResponse {
  return response.success === false;
}
