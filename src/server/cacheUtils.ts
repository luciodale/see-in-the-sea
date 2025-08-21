/**
 * Utility functions for handling HTTP caching
 */

/**
 * Checks if a cached response exists for the given request
 * @param request - The incoming HTTP request
 * @returns The cached response if found, null otherwise
 */
export async function getCachedResponse(
  request: Request
): Promise<Response | null> {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[cache-utils] Cache HIT');
      return cachedResponse;
    }
    console.log('[cache-utils] Cache MISS');
    return null;
  } catch (error) {
    console.log('[cache-utils] Cache check failed:', error);
    return null;
  }
}

/**
 * Creates standard caching headers for images
 * @returns Object with caching headers
 */
export function getImageCachingHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year (365 days)
    Expires: new Date(Date.now() + 31536000000).toUTCString(), // Expires in 1 year (365 days)
  };
}

/**
 * Creates a response with standard image caching headers
 * @param body - The response body
 * @param contentType - The content type header
 * @param additionalHeaders - Additional headers to include
 * @returns Response with caching headers
 */
export function createCachedImageResponse(
  body: BodyInit,
  contentType: string,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(body, {
    headers: {
      'Content-Type': contentType,
      ...getImageCachingHeaders(),
      ...additionalHeaders,
    },
  });
}
