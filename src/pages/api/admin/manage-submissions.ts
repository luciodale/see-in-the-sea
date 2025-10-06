import type { APIRoute } from 'astro';
import { and, desc, eq, like } from 'drizzle-orm';
import { getDb } from '../../../db/index';
import {
  categories,
  contests,
  submissions,
  type Submission,
} from '../../../db/schema';
import { authenticateAdmin } from '../../../server/authenticateRequest';
import type {
  AdminSubmission,
  ManageSubmissionFormData,
  ManageSubmissionResponse,
  SubmissionListResponse,
} from '../../../types/api';

export const prerender = false;

// GET: List all submissions with filtering and pagination
export const GET: APIRoute = async ({ request, locals }) => {
  console.log('[manage-submissions] Processing submission list request');

  const D1Database = locals.runtime.env.DB;
  if (!D1Database) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Database not available',
      }),
      { status: 500 }
    );
  }

  const db = getDb(D1Database);

  try {
    // Step 1: Admin Authentication Check (returns 404 if not admin)
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, isAdmin, unauthenticatedResponse } =
      await authenticateAdmin(authRequestClone, locals);

    if (!isAuthenticated || !isAdmin) {
      return unauthenticatedResponse();
    }

    // Step 2: Parse query parameters for filtering
    const url = new URL(request.url);
    const contestId = url.searchParams.get('contestId');
    const categoryId = url.searchParams.get('categoryId');
    const userEmail = url.searchParams.get('userEmail');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Require contestId
    if (!contestId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Contest ID is required',
        }),
        { status: 400 }
      );
    }

    // Step 3: Build query with filters - contestId is always included
    const whereConditions = [eq(submissions.contestId, contestId)];

    if (categoryId) {
      whereConditions.push(eq(submissions.categoryId, categoryId));
    }

    if (userEmail) {
      whereConditions.push(eq(submissions.userEmail, userEmail));
    }

    if (search) {
      whereConditions.push(like(submissions.title, `%${search}%`));
    }

    const whereClause = and(...whereConditions);

    // Step 4: Fetch submissions with joins
    const allSubmissions = await db
      .select({
        id: submissions.id,
        title: submissions.title,
        description: submissions.description,
        r2ImageId: submissions.r2ImageId,
        userEmail: submissions.userEmail,
        uploadedAt: submissions.uploadedAt,
        contestId: submissions.contestId,
        contestName: contests.name,
        categoryId: submissions.categoryId,
        categoryName: categories.name,
        portfolio: submissions.portfolio,
        portfolioPhotoType: submissions.portfolioPhotoType,
      })
      .from(submissions)
      .innerJoin(contests, eq(submissions.contestId, contests.id))
      .innerJoin(categories, eq(submissions.categoryId, categories.id))
      .where(whereClause)
      .orderBy(desc(submissions.uploadedAt))
      .limit(limit)
      .offset(offset);

    // Step 5: Get total count for pagination
    const totalCountResult = await db
      .select({ count: submissions.id })
      .from(submissions)
      .innerJoin(contests, eq(submissions.contestId, contests.id))
      .innerJoin(categories, eq(submissions.categoryId, categories.id))
      .where(whereClause);

    const totalCount = totalCountResult.length;

    console.log(
      `[manage-submissions] Found ${allSubmissions.length} submissions (${totalCount} total)`
    );

    const response: SubmissionListResponse = {
      success: true,
      data: allSubmissions as AdminSubmission[],
      totalCount: totalCount,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[manage-submissions] Error fetching submissions:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch submissions',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

// POST: Create or update submission metadata and images
export const POST: APIRoute = async ({ request, locals }) => {
  console.log(
    '[manage-submissions] Processing submission creation/update request'
  );

  const D1Database = locals.runtime.env.DB;
  const R2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;
  const IMAGES = locals.runtime.env.IMAGES;

  if (!D1Database) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Database not available',
      }),
      { status: 500 }
    );
  }

  const db = getDb(D1Database);

  try {
    // Step 1: Admin Authentication Check (returns 404 if not admin)
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, isAdmin, user, unauthenticatedResponse } =
      await authenticateAdmin(authRequestClone, locals);

    if (!isAuthenticated || !isAdmin) {
      return unauthenticatedResponse();
    }

    console.log(
      `[manage-submissions] Admin access granted for user: ${user.id}`
    );

    // Step 2: Parse request data (JSON or FormData)
    let body: ManageSubmissionFormData;
    let newImageFile: File | null = null;

    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      // Handle form data (when replacing image)
      const formData = await request.formData();

      body = {
        id: formData.get('id')?.toString(),
        contestId: formData.get('contestId')?.toString() || '',
        categoryId: formData.get('categoryId')?.toString() || '',
        userEmail: formData.get('userEmail')?.toString() || '',
        title: formData.get('title')?.toString() || '',
        description: formData.get('description')?.toString(),
        replaceImage: formData.get('replaceImage') === 'true',
      };

      if (body.replaceImage) {
        const imageFile = formData.get('image') as File;
        if (imageFile && imageFile.size > 0) {
          newImageFile = imageFile;
        }
      }
    } else {
      // Handle JSON data (when only updating text)
      body = await request.json();
    }

    // Step 3: Validate required fields
    if (!body.contestId || !body.categoryId || !body.userEmail || !body.title) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'Missing required fields: contestId, categoryId, userEmail, title',
        }),
        { status: 400 }
      );
    }

    // Step 4: Verify contest exists
    const contestExists = await db
      .select()
      .from(contests)
      .where(eq(contests.id, body.contestId))
      .limit(1);

    if (contestExists.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Contest with ID "${body.contestId}" does not exist`,
        }),
        { status: 400 }
      );
    }

    // Step 5: Verify category exists
    const categoryExists = await db
      .select()
      .from(categories)
      .where(eq(categories.id, body.categoryId))
      .limit(1);

    if (categoryExists.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Category with ID "${body.categoryId}" does not exist`,
        }),
        { status: 400 }
      );
    }

    if (body.id) {
      // Update existing submission
      const existingSubmission = await db
        .select()
        .from(submissions)
        .where(eq(submissions.id, body.id))
        .limit(1);

      if (existingSubmission.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Submission with ID "${body.id}" not found`,
          }),
          { status: 404 }
        );
      }

      const submission = existingSubmission[0];
      let updateData: Partial<Submission> = {};

      // Handle image replacement if requested
      if (body.replaceImage && newImageFile) {
        if (!R2Bucket || !IMAGES) {
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Image storage unavailable',
            }),
            { status: 503 }
          );
        }

        // Import validation and image services
        const { validateImageFile } = await import(
          '../../../server/validationService'
        );
        const { generateR2ImageId } = await import(
          '../../../server/imageService'
        );

        // Validate new image
        const imageValidation = validateImageFile(newImageFile);
        if (!imageValidation.isValid) {
          return new Response(
            JSON.stringify({
              success: false,
              message: imageValidation.error,
            }),
            { status: 400 }
          );
        }

        try {
          // Generate new R2 image ID
          const { submissionId: newSubmissionId, r2ImageId: newR2ImageId } =
            generateR2ImageId(body.contestId, body.categoryId);

          // Upload new image to R2
          await R2Bucket.put(newR2ImageId, newImageFile);

          // Delete old image from R2
          if (submission.r2ImageId) {
            await R2Bucket.delete(submission.r2ImageId);
            console.log(
              `[manage-submissions] Deleted old image: ${submission.r2ImageId}`
            );
          }

          updateData = {
            id: newSubmissionId,
            description: body.description?.trim() || null,
            contestId: body.contestId,
            categoryId: body.categoryId,
            userEmail: body.userEmail.trim(),
            r2Key: newR2ImageId,
            r2ImageId: newR2ImageId,
            title: body.title.trim(),
            originalFilename: newImageFile.name,
            fileSize: newImageFile.size,
            contentType: newImageFile.type,
            uploadedAt: new Date().toISOString(),
          };

          // Only include portfolio fields if they have values
          if (body.portfolio) {
            updateData.portfolio = body.portfolio;
          }
          if (body.portfolioPhotoType) {
            updateData.portfolioPhotoType = body.portfolioPhotoType;
          }

          console.log(
            `[manage-submissions] Replaced image for submission ${body.id}`
          );
        } catch (error) {
          console.error('[manage-submissions] Image replacement error:', error);
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Failed to replace image',
            }),
            { status: 500 }
          );
        }
      } else {
        // Basic update without image replacement
        updateData = {
          title: body.title.trim(),
          description: body.description?.trim() || null,
        };

        // Only include portfolio fields if they have values
        if (body.portfolio) {
          updateData.portfolio = body.portfolio;
        }
        if (body.portfolioPhotoType) {
          updateData.portfolioPhotoType = body.portfolioPhotoType;
        }
      }

      // Update submission in database
      await db
        .update(submissions)
        .set(updateData)
        .where(eq(submissions.id, body.id));

      console.log(
        `[manage-submissions] Submission updated successfully: ${body.id}`
      );

      const response: ManageSubmissionResponse = {
        success: true,
        message: 'Submission updated successfully!',
        data: {
          submissionId: updateData.id || body.id,
          title: body.title,
          contestId: body.contestId,
          categoryId: body.categoryId,
          userEmail: body.userEmail,
        },
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            'Creating new submissions without images is not supported. Use the upload-image endpoint instead.',
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[manage-submissions] Error managing submission:', error);

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to manage submission',
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
