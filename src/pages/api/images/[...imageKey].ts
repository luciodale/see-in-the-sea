import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
    const { imageKey } = params;
    
    if (!imageKey || typeof imageKey !== 'string') {
        return new Response('Image key required', { status: 400 });
    }

    try {
        const R2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;
        const IMAGES = locals.runtime.env.IMAGES;
        
        if (!R2Bucket) {
            return new Response('Storage unavailable', { status: 503 });
        }

        // Get the original image from R2
        const r2Object = await R2Bucket.get(imageKey);
        
        if (!r2Object || !r2Object.body) {
            return new Response('Image not found', { status: 404 });
        }

        // If no Images service available, serve original with caching
        if (!IMAGES) {
            console.log('[serve-image] No Images service available, serving original image');
            return new Response(r2Object.body, {
                headers: {
                    'Content-Type': r2Object.httpMetadata?.contentType || 'image/jpeg',
                    'Cache-Control': 'public, max-age=31536000, immutable'
                }
            });
        }

        console.log('[serve-image] IMAGES service available, transforming image');


        // Apply opinionated defaults for web delivery:
        // - Max width 1200px (good for most web use cases)
        // - WebP format (best balance of quality/size for web)
        // - Quality 85 (excellent quality with good compression)
        // - Scale-down fit (never enlarge, preserve aspect ratio)
        try {
            const imageTransformer = IMAGES.input(r2Object.body);
            
            const webOptimizedTransformer = imageTransformer
                .transform({ 
                    width: 1200,  // Sensible max width for web
                    fit: 'scale-down'  // Never enlarge images
                })
                .output({ 
                    format: 'image/webp',  // Best web format
                    quality: 85  // High quality with good compression
                });
            
                
                const transformedImage = await webOptimizedTransformer;
                console.log('[serve-image] Transformed image size:', transformedImage.contentType());
            const response = transformedImage.response();

            // Handle proxy response in local development
            if (!(response instanceof Response)) {
                const proxyResponse = response as any;
                return new Response(proxyResponse.body, {
                    status: proxyResponse.status || 200,
                    headers: {
                        'Content-Type': 'image/webp',
                        'Cache-Control': 'public, max-age=31536000, immutable',
                        'X-Optimized': 'web-defaults'
                    }
                });
            }
            
            // Add caching headers to the transformed response
            const finalResponse = new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    ...Object.fromEntries(response.headers.entries()),
                    'Cache-Control': 'public, max-age=31536000, immutable',
                    'X-Optimized': 'web-defaults'
                }
            });
            
            return finalResponse;
            
        } catch (imageError) {
            console.log('[serve-image] Image transformation failed, serving original:', imageError);
            // Fallback to original image if transformation fails
            return new Response(r2Object.body, {
                headers: {
                    'Content-Type': r2Object.httpMetadata?.contentType || 'image/jpeg',
                    'Cache-Control': 'public, max-age=31536000, immutable'
                }
            });
        }

    } catch (error) {
        console.error(`[serve-image] Error serving image ${imageKey}:`, error);
        return new Response('Internal server error', { status: 500 });
    }
};