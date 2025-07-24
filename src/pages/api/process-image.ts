import type { APIRoute } from 'astro';
import { UPLOAD_IMAGE_TOKEN_HEADER_NAME } from '../../constants';

export const prerender = false; 

export const GET: APIRoute = async () => {
    return new Response('process-image ok', { status: 200 });
}

export const POST: APIRoute = async ({ request, locals }) => {
    // Security check
    const internalSecret = request.headers.get(UPLOAD_IMAGE_TOKEN_HEADER_NAME);
    if (!internalSecret || internalSecret !== locals.runtime.env.UPLOAD_IMAGE_ENDPOINT_TOKEN) {
        console.warn("Unauthorized access attempt to process-image endpoint.");
        return new Response('Unauthorized', { status: 401 });
    }

    let requestBody: { r2Key: string };
    try {
        requestBody = await request.json();
    } catch (error) {
        console.error('Error parsing JSON body for process-image:', error);
        return new Response(JSON.stringify({ message: 'Invalid JSON body.' }), { status: 400 });
    }

    const { r2Key } = requestBody;
    if (!r2Key) {
        return new Response(JSON.stringify({ message: 'Missing r2Key in request body.' }), { status: 400 });
    }

    const R2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;
    const IMAGES = locals.runtime.env.IMAGES;
    if (!R2Bucket || !IMAGES) {
        console.error("Missing required environment variables for R2 or Images binding.");
        return new Response(JSON.stringify({ message: 'Server configuration error.' }), { status: 500 });
    }

    try {
        // Fetch image from R2
        const r2Object = await R2Bucket.get(r2Key);
        if (!r2Object || !r2Object.body) {
            console.error(`R2 object not found for key: ${r2Key}`);
            return new Response(JSON.stringify({ message: `Image with key "${r2Key}" not found in R2.` }), { status: 404 });
        }

        // Transform the image using Images binding
        const transformedImage = await IMAGES.input(r2Object.body)
            .transform({ width: 800})
            .output({ format: "image/webp" });
        
        // Get the response
        const response = transformedImage.response();
       
        // In local development, the response might be a proxy that needs conversion
        if (!(response instanceof Response)) {
            console.log('Converting proxy response to proper Response')
            // Create a proper Response from the proxy
            const proxyResponse = response as any; // Type assertion to access properties
            const body = proxyResponse.body;
            const headers = new Headers();
            
            // Copy headers from the proxy response
            if (proxyResponse.headers) {
                if (proxyResponse.headers.forEach) {
                    proxyResponse.headers.forEach((value: string, key: string) => {
                        headers.set(key, value);
                    });
                } else if (proxyResponse.headers.get) {
                    // Handle case where headers has a get method
                    const contentType = proxyResponse.headers.get('content-type');
                    if (contentType) headers.set('content-type', contentType);
                }
            }
            
            return new Response(body, {
                status: proxyResponse.status || 200,
                statusText: proxyResponse.statusText || 'OK',
                headers: headers
            });
        }
        
        return response;


    } catch (error) {
        console.error(`Exception during processing image ${r2Key}:`, error);
        return new Response(JSON.stringify({
            message: 'An internal error occurred during image processing.',
            error: (error instanceof Error) ? error.message : String(error)
        }), {
            status: 500
        });
    }
};