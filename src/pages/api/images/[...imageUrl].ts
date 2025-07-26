import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { getDb, submissions } from '../../../db';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const { imageUrl } = params;

  if (!imageUrl || typeof imageUrl !== 'string') {
    return new Response('Image key required', { status: 400 });
  }

  try {
    // split the extension from the imageUrl
    const R2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;
    const IMAGES = locals.runtime.env.IMAGES;
    const D1Database = locals.runtime.env.DB;

    if (!R2Bucket || !D1Database) {
      return new Response('Storage or database unavailable', { status: 503 });
    }

    const db = getDb(D1Database);

    // Step 1: Parse userId-based imageUrl and find submission
    console.log('[serve-image] Looking up submission for imageUrl:', imageUrl);

    // Parse the imageUrl structure: contest-id/category-id/user-id/submission-id
    const urlParts = imageUrl.split('/');
    if (urlParts.length !== 4) {
      console.log('[serve-image] Invalid imageUrl format:', imageUrl);
      return new Response('Invalid image URL format', { status: 400 });
    }

    const [contestId, categoryId, userId, submissionId] = urlParts;
    console.log('[serve-image] Parsed URL parts:', {
      contestId,
      categoryId,
      userId,
      submissionId,
    });

    // Find the submission by submissionId (this is unique)
    const submissionResult = await db
      .select({
        r2Key: submissions.r2Key,
        userEmail: submissions.userEmail,
        title: submissions.title,
      })
      .from(submissions)
      .where(eq(submissions.id, submissionId))
      .limit(1);

    if (submissionResult.length === 0) {
      console.log(
        '[serve-image] No submission found for submissionId:',
        submissionId
      );
      return new Response('Image not found', { status: 404 });
    }

    const { r2Key } = submissionResult[0];
    console.log('[serve-image] Found r2Key:', r2Key);

    // Step 2: Get the original image from R2 using the r2Key
    const r2Object = await R2Bucket.get(r2Key);

    if (!r2Object || !r2Object.body) {
      console.log('[serve-image] Image not found in R2 for key:', r2Key);
      return new Response('Image not found in storage', { status: 404 });
    }

    // Step 3: Transform and serve the image
    // If no Images service available, serve original with caching
    if (!IMAGES) {
      console.log(
        '[serve-image] No Images service available, serving original image'
      );
      return new Response(r2Object.body, {
        headers: {
          'Content-Type': r2Object.httpMetadata?.contentType || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    console.log('[serve-image] IMAGES service available, transforming image');

    // Apply aggressive optimization for web delivery:
    // - Max width 500px (aggressive size reduction for web)
    // - WebP format (best compression for web)
    // - Quality 75 (good balance of quality vs aggressive compression)
    // - Scale-down fit (never enlarge, preserve aspect ratio)
    try {
      const imageTransformer = IMAGES.input(r2Object.body);

      const webOptimizedTransformer = imageTransformer
        .transform({
          width: 500, // Aggressive width reduction
          fit: 'scale-down', // Never enlarge images
        })
        .output({
          format: 'image/webp', // Best web format
          quality: 75, // More aggressive compression while maintaining good quality
        });

      const transformedImage = await webOptimizedTransformer;
      console.log('[serve-image] Transformed image successfully');
      const response = transformedImage.response();

      // Add caching headers to the transformed response
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers.entries()),
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Optimized': 'web-aggressive',
        },
      });
    } catch (imageError) {
      console.log(
        '[serve-image] Image transformation failed, serving original:',
        imageError
      );
      // Fallback to original image if transformation fails
      return new Response(r2Object.body, {
        headers: {
          'Content-Type': r2Object.httpMetadata?.contentType || 'image/jpeg',
        },
      });
    }
  } catch (error) {
    console.error(`[serve-image] Error serving image ${imageUrl}:`, error);
    return new Response('Internal server error', { status: 500 });
  }
};
