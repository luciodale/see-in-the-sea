// Shared API response types - Single source of truth for client/server

import type { Category, Contest, Submission } from '../db/index.js';

// Base API response wrapper
export type ApiResponse<T = unknown> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Contest API Types
export type ContestWithCategories = {
  contest: Contest;
  categories: Category[];
}

export type ContestsResponse = ApiResponse<ContestWithCategories>;

// Submissions API Types
export type CategoryWithSubmissions = Category & {
  submissions: Submission[];
  submissionCount: number;
  maxSubmissions: number;
}

export type UserContestData = {
  contest: Contest | null;
  categories: CategoryWithSubmissions[];
}

export type SubmissionsResponse = ApiResponse<UserContestData>;

// Upload API Types
export type UploadMetadata = {
  originalFileName: string;
  originalSize: number;
  contentType: string;
  uploadedAt: string;
}

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
}

export type UploadResponse = ApiResponse<UploadResult>;

// Form Data Types (for client-side)
export type UploadFormData = {
  image: File;
  contestId: string;
  categoryId: string;
  title: string;
  description?: string;
  replacedSubmissionId?: string; // For image replacement
}

// Error Response Type
export type ErrorResponse = {
  success: false;
  message: string;
  error?: string;
}

// Type guards for runtime type checking
export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
  return response.success === true && response.data !== undefined;
}

export function isApiError(response: ApiResponse): response is ErrorResponse {
  return response.success === false;
} 