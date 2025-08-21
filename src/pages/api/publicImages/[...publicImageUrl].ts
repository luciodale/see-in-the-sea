import type { APIRoute } from 'astro';
import {
  createCachedImageResponse,
  getCachedResponse,
} from '../../../server/cacheUtils';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals, request }) => {
  const cachedResponse = await getCachedResponse(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const { publicImageUrl } = params;

    if (!publicImageUrl || typeof publicImageUrl !== 'string') {
      return new Response('Image key required', { status: 400 });
    }

    // Get the R2 bucket and Images service bindings
    const r2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;
    const IMAGES = locals.runtime.env.IMAGES;

    if (!r2Bucket) {
      return new Response('R2 bucket not configured', { status: 500 });
    }

    // Fetch the image directly from R2 using the r2Key
    const r2Object = await r2Bucket.get(publicImageUrl);

    if (!r2Object || !r2Object.body) {
      return new Response('Image not found', { status: 404 });
    }

    // If Images service is available, use it for optimization
    if (IMAGES) {
      try {
        console.log(
          '[serve-public-image] IMAGES service available, transforming image'
        );

        const imageTransformer = IMAGES.input(r2Object.body);

        const webOptimizedTransformer = imageTransformer
          .transform({
            width: 750,
          })
          .output({
            format: 'image/webp',
            quality: 50,
          });

        const transformedImage = await webOptimizedTransformer;
        console.log('[serve-public-image] Transformed image successfully');
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
          '[serve-public-image] Image transformation failed, serving original:',
          imageError
        );
        // Fallback to original image if transformation fails
        return createCachedImageResponse(
          r2Object.body,
          r2Object.httpMetadata?.contentType || 'image/jpeg',
          {
            'X-Optimized': 'fallback',
          }
        );
      }
    }

    // No Images service available, serve original image from R2
    console.log(
      '[serve-public-image] No Images service available, serving original image'
    );
    return createCachedImageResponse(
      r2Object.body,
      r2Object.httpMetadata?.contentType || 'image/jpeg',
      {
        'X-Optimized': 'none',
      }
    );
  } catch (error) {
    console.error('Error serving public image:', error);
    return new Response('Internal server error', { status: 500 });
  }
};
