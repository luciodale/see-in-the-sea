import type { APIRoute } from 'astro';
import { and, eq } from 'drizzle-orm';
import { getDb } from '../../db/index';
import { payments } from '../../db/schema';
import { getBackendTranslation } from '../../i18n/utils';
import { authenticateRequest } from '../../server/authenticateRequest';
import {
  canUploadToContest,
  checkSubmissionLimits,
  validateActiveCategory,
  validateActiveContest,
} from '../../server/contestService';
import type { UploadResponse } from '../../types/api';

import {
  generateImageUrlWithUserId,
  generateR2Key,
  uploadImageWithMetadata,
} from '../../server/imageService';

import {
  validateImageFile,
  validateSubmissionAction,
  validateUploadFormData,
} from '../../server/validationService';

export const prerender = false;

/**
 * POST /api/upload-image
 * Handles new image uploads only
 */
export const POST: APIRoute = async ({ request, locals }) => {
  console.log('[upload-image] Processing upload request');

  // Get dependencies
  const R2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;
  const D1Database = locals.runtime.env.DB;

  if (!R2Bucket || !D1Database) {
    return new Response(
      JSON.stringify({
        success: false,
        message: getBackendTranslation('error.server-config-missing', request),
      }),
      { status: 500 }
    );
  }

  const db = getDb(D1Database);

  try {
    // Step 1: Authentication
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, user, isAdminRole, unauthenticatedResponse } =
      await authenticateRequest(authRequestClone, locals);

    if (!isAuthenticated) {
      return unauthenticatedResponse();
    }

    let userEmail = user.emailAddress || 'unknown';
    const userId = user.id;

    // Step 2: Parse and validate form data
    const formData = await request.formData();

    // Check if this is an admin upload on behalf of another user
    const isAdminUpload = formData.get('adminUpload') === 'true';
    const adminUserEmail = formData.get('userEmail')?.toString();

    if (isAdminUpload) {
      // Verify admin role
      if (!isAdminRole()) {
        return new Response(
          JSON.stringify({
            success: false,
            message: getBackendTranslation(
              'error.access-denied-admin',
              request
            ),
            error: getBackendTranslation(
              'error.insufficient-permissions',
              request
            ),
          }),
          { status: 403 }
        );
      }

      // Validate admin upload parameters
      if (!adminUserEmail) {
        return new Response(
          JSON.stringify({
            success: false,
            message: getBackendTranslation(
              'error.user-email-required',
              request
            ),
          }),
          { status: 400 }
        );
      }

      // Use the specified user email for the upload
      userEmail = adminUserEmail;
      console.log(
        `[upload-image] Admin ${user.id} uploading on behalf of ${userEmail}`
      );
    }

    const formValidation = validateUploadFormData(formData);

    if (!formValidation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: formValidation.error,
        }),
        { status: 400 }
      );
    }

    const {
      imageFile,
      contestId,
      categoryId,
      title,
      description,
      portfolio,
      portfolioPhotoType,
    } = formValidation.data;

    // Step 3: Validate image file
    const imageValidation = validateImageFile(imageFile);

    if (!imageValidation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: imageValidation.error,
        }),
        { status: 400 }
      );
    }

    const { image, fileExtension } = imageValidation.data;

    // Step 4: Validate contest and category exist
    const [contestValidation, categoryValidation] = await Promise.all([
      validateActiveContest(db, contestId),
      validateActiveCategory(db, categoryId),
    ]);

    if (!contestValidation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: getBackendTranslation('error.contest-not-found', request),
        }),
        { status: 400 }
      );
    }

    if (!categoryValidation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: getBackendTranslation('error.category-invalid', request),
        }),
        { status: 400 }
      );
    }

    // Enforce upload lock: contest must be active and not past end date
    const uploadAllowed = await canUploadToContest(db, contestId);
    if (!uploadAllowed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: getBackendTranslation('error.submissions-closed', request),
        }),
        { status: 403 }
      );
    }

    // Step 5: Check if user has paid (only for regular users, not admin uploads)
    if (!isAdminUpload) {
      const payment = await db
        .select()
        .from(payments)
        .where(
          and(
            eq(payments.contestId, contestId),
            eq(payments.userEmail, userEmail)
          )
        )
        .limit(1);

      if (payment.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: getBackendTranslation('error.submissions-locked', request),
          }),
          { status: 403 }
        );
      }
    }

    // Step 6: Check submission limits
    const submissionLimits = await checkSubmissionLimits(
      db,
      contestId,
      categoryId,
      userEmail
    );

    const actionValidation = validateSubmissionAction(
      submissionLimits.currentCount,
      submissionLimits.maxAllowed
    );

    if (!actionValidation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: actionValidation.error,
        }),
        { status: 400 }
      );
    }

    // Step 6: Generate new image paths and URLs
    const { submissionId, r2Key } = generateR2Key(
      contestId,
      categoryId,
      userEmail,
      fileExtension
    );
    const imageUrlPath = generateImageUrlWithUserId(
      contestId,
      categoryId,
      userId,
      submissionId
    );

    // Step 7: Execute the upload operation
    console.log('[upload-image] Creating new submission');

    // Upload image to R2 with retries and store metadata in database
    await uploadImageWithMetadata(R2Bucket, db, image, {
      submissionId,
      contestId,
      categoryId,
      userEmail,
      title,
      description: description || '',
      r2Key,
      imageUrl: imageUrlPath,
      originalFilename: image.name,
      fileSize: image.size,
      contentType: image.type,
      portfolio,
      portfolioPhotoType,
    });

    console.log('[upload-image] Upload completed successfully');

    // Step 8: Return success response
    const response: UploadResponse = {
      success: true,
      message: getBackendTranslation('success.image-uploaded', request),
      data: {
        submissionId,
        contestId,
        categoryId,
        uploadedBy: userEmail,
        title,
        description: description || '',
        imageUrl: imageUrlPath,
        action: actionValidation.data.action,
        metadata: {
          originalFileName: image.name,
          originalSize: image.size,
          contentType: image.type,
          uploadedAt: new Date().toISOString(),
        },
        portfolio,
        portfolioPhotoType,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[upload-image] Error during upload:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: getBackendTranslation('error.failed-to-upload-image', request),
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
