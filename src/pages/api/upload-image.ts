import type { APIRoute } from 'astro';
import { getDb } from '../../db/index.js';
import { authenticateRequest } from '../../server/authenticateRequest';
import {
  canUploadToContest,
  checkSubmissionLimits,
  validateActiveCategory,
  validateActiveContest,
} from '../../server/contestService';
import type { UploadResponse } from '../../types/api.js';

import {
  deleteImageFromR2,
  deleteSubmission,
  generateImageUrlWithUserId,
  generateR2Key,
  storeImageInR2,
  storeSubmissionMetadata,
  validateUserOwnsSubmission,
} from '../../server/imageService';

import {
  validateImageFile,
  validateSubmissionAction,
  validateUploadFormData,
} from '../../server/validationService';

export const prerender = false;

/**
 * POST /api/upload-image
 * Handles new image uploads and image replacements
 * Supports optional 'replacedSubmissionId' for replacing existing images
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
        message: 'Server configuration error: Missing R2 bucket or database.',
      }),
      { status: 500 }
    );
  }

  const db = getDb(D1Database);

  try {
    // Step 2: Authentication
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, user, isAdminRole, unauthenticatedResponse } =
      await authenticateRequest(authRequestClone, locals);

    if (!isAuthenticated) {
      return unauthenticatedResponse();
    }

    let userEmail = user.emailAddress || 'unknown';
    const userId = user.id; // Added userId

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
            message: 'Access denied. Admin role required for admin uploads.',
            error: 'INSUFFICIENT_PERMISSIONS',
          }),
          { status: 403 }
        );
      }

      // Validate admin upload parameters
      if (!adminUserEmail) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'User email is required for admin uploads.',
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
      replacedSubmissionId,
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
          message: 'Contest not found or inactive.',
        }),
        { status: 400 }
      );
    }

    if (!categoryValidation.isValid) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid or inactive category.',
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
          message: 'Submissions are closed for this contest.',
        }),
        { status: 403 }
      );
    }

    // Step 5: Handle replacement logic
    const isReplacement = !!replacedSubmissionId;
    let replacedSubmission = null;

    if (isReplacement) {
      // Validate user owns the submission they want to replace
      const ownershipValidation = await validateUserOwnsSubmission(
        db,
        replacedSubmissionId,
        userEmail
      );

      if (!ownershipValidation.isOwner) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'You can only replace your own submissions.',
          }),
          { status: 403 }
        );
      }

      replacedSubmission = ownershipValidation.submission;
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
      submissionLimits.maxAllowed,
      isReplacement
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

    // Step 7: Generate new image paths and URLs
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
    ); // Use userId in URL path

    // Step 8: Execute the upload operation
    console.log(
      `[upload-image] ${isReplacement ? 'Replacing' : 'Creating'} submission`
    );

    // Store new image in R2
    await storeImageInR2(R2Bucket, r2Key, image, {
      submissionId,
      uploadedBy: userEmail,
      title,
      description: description || '',
      contestId,
      categoryId,
    });

    // Store submission metadata in database
    await storeSubmissionMetadata(db, {
      id: submissionId,
      contestId,
      categoryId,
      userEmail,
      title,
      description: description || '',
      r2Key,
      imageUrl: imageUrlPath, // Store the path without domain
      originalFilename: image.name,
      fileSize: image.size,
      contentType: image.type,
    });

    // Step 9: Clean up replaced submission if this is a replacement
    if (isReplacement && replacedSubmission) {
      try {
        // Delete old image from R2
        await deleteImageFromR2(R2Bucket, replacedSubmission.r2Key);

        // Delete old submission from database
        await deleteSubmission(db, replacedSubmissionId);

        console.log(
          '[upload-image] Successfully cleaned up replaced submission'
        );
      } catch (cleanupError) {
        console.error(
          '[upload-image] Cleanup error (non-fatal):',
          cleanupError
        );
        // Don't fail the request if cleanup fails - new image is already uploaded
      }
    }

    console.log('[upload-image] Upload completed successfully');

    // Step 10: Return success response
    const response: UploadResponse = {
      success: true,
      message: isReplacement
        ? 'Image replaced successfully!'
        : 'Image uploaded successfully!',
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
        message: 'Failed to upload image',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
