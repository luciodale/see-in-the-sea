import type { APIRoute } from 'astro';
import { getBackendTranslation } from '../../../i18n/utils';
import {
  createCachedImageResponse,
  getCachedResponse,
  storeInCache,
} from '../../../server/cacheUtils';

export const prerender = false;

/**
 * Unified image serving endpoint
 * Serves images using r2_image_id format: contest/category/id
 * No database lookup needed - serves directly from R2
 */
export const GET: APIRoute = async ({ params, locals, request, url }) => {
  const cachedResponse = await getCachedResponse(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  const { imageUrl } = params;

  if (!imageUrl || typeof imageUrl !== 'string') {
    return new Response(
      getBackendTranslation('error.image-key-required', request),
      { status: 400 }
    );
  }

  // Check query params for image variants
  const serveOriginal = url.searchParams.get('original') === 'true';
  const serveThumbnail = url.searchParams.get('thumb') === 'true';

  let finalResponse: Response | null = null;

  try {
    const r2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;
    const IMAGES = locals.runtime.env.IMAGES;

    if (!r2Bucket) {
      return new Response(
        getBackendTranslation('error.r2-not-configured', request),
        { status: 500 }
      );
    }

    // Fetch the image directly from R2 using the r2_image_id (imageUrl)
    console.log('[serve-image] Fetching image from R2:', imageUrl);
    const r2Object = await r2Bucket.get(imageUrl);

    if (!r2Object || !r2Object.body) {
      console.log('[serve-image] Image not found in R2:', imageUrl);
      return new Response(
        getBackendTranslation('error.image-not-found', request),
        { status: 404 }
      );
    }

    // If original is requested, skip optimization
    if (serveOriginal) {
      console.log('[serve-image] Serving original uncompressed image');
      finalResponse = createCachedImageResponse(
        r2Object.body,
        r2Object.httpMetadata?.contentType || 'image/jpeg',
        {
          'X-Optimized': 'original',
        }
      );
    }
    // If Images service is available, use it for optimization
    else if (IMAGES) {
      try {
        const imageWidth = serveThumbnail ? 400 : 1400;
        const imageQuality = serveThumbnail ? 80 : 93;
        console.log(
          `[serve-image] Transforming image (${serveThumbnail ? 'thumb' : 'full'})`
        );

        const imageTransformer = IMAGES.input(r2Object.body);

        const webOptimizedTransformer = imageTransformer
          .transform({
            width: imageWidth,
            fit: 'contain',
          })
          .output({
            format: 'image/webp',
            quality: imageQuality,
          });

        const transformedImage = await webOptimizedTransformer;
        console.log('[serve-image] Image transformed successfully');
        const response = transformedImage.response();

        finalResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Optimized': serveThumbnail ? 'thumb' : 'web',
          },
        });
      } catch (imageError) {
        console.log(
          '[serve-image] Image transformation failed, serving original:',
          imageError
        );
        // Fallback to original image if transformation fails
        finalResponse = createCachedImageResponse(
          r2Object.body,
          r2Object.httpMetadata?.contentType || 'image/jpeg',
          {
            'X-Optimized': 'fallback',
          }
        );
      }
    } else {
      // No Images service available, serve original image from R2
      console.log('[serve-image] Serving original image (no IMAGES service)');
      finalResponse = createCachedImageResponse(
        r2Object.body,
        r2Object.httpMetadata?.contentType || 'image/jpeg',
        {
          'X-Optimized': 'none',
        }
      );
    }

    if (finalResponse) {
      storeInCache(request, finalResponse, locals);
    }

    return (
      finalResponse || new Response('Internal server error', { status: 500 })
    );
  } catch (error) {
    console.error('[serve-image] Error serving image:', error);
    return new Response(
      getBackendTranslation('error.internal-server', request),
      { status: 500 }
    );
  }
};
