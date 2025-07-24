import type { APIRoute } from 'astro';
import { UPLOAD_IMAGE_TOKEN_HEADER_NAME } from '../../constants';

export const prerender = false; 

export const POST: APIRoute = async ({ request, locals }) => {
    // --- SECURITY CHECK (CRITICAL!) ---
    // This endpoint should NOT be directly accessible by external clients
    // It should only be called internally or with strong authentication.
    const internalSecret = request.headers.get(UPLOAD_IMAGE_TOKEN_HEADER_NAME);
    if (!internalSecret || internalSecret !== locals.runtime.env.UPLOAD_IMAGE_ENDPOINT_TOKEN) {
        console.warn("Unauthorized access attempt to process-image endpoint.");
        return new Response('Unauthorized', { status: 401 });
    }
    // --- END SECURITY CHECK ---

    let requestBody: { r2Key: string; uploadedBy: string; title: string; description?: string; };
    try {
        requestBody = await request.json();
    } catch (error) {
        console.error('Error parsing JSON body for process-image:', error);
        return new Response(JSON.stringify({ message: 'Invalid JSON body.' }), { status: 400 });
    }

    const { r2Key, uploadedBy, title, description } = requestBody;

    if (!r2Key) {
        return new Response(JSON.stringify({ message: 'Missing r2Key in request body.' }), { status: 400 });
    }

    const R2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;
    const CLOUDFLARE_ACCOUNT_ID = locals.runtime.env.ACCOUNT_ID; 
    const IMAGES_API_TOKEN = locals.runtime.env.IMAGES_API_TOKEN;

    console.log('R2Bucket', R2Bucket);
    console.log('CLOUDFLARE_ACCOUNT_ID', CLOUDFLARE_ACCOUNT_ID);
    console.log('IMAGES_API_TOKEN', IMAGES_API_TOKEN);

    if (!R2Bucket || !CLOUDFLARE_ACCOUNT_ID || !IMAGES_API_TOKEN) {
        console.error("Missing required environment variables for Cloudflare Images processing.");
        return new Response(JSON.stringify({ message: 'Server configuration error.' }), { status: 500 });
    }

    try {
        // 1. Fetch image from R2
        const r2Object = await R2Bucket.get(r2Key);

        if (!r2Object) {
            console.error(`R2 object not found for key: ${r2Key}`);
            return new Response(JSON.stringify({ message: `Image with key "${r2Key}" not found in R2.` }), { status: 404 });
        }

        // 2. Prepare and Upload to Cloudflare Images
        const formData = new FormData();
        const blob = new Blob([r2Object.body as any], { type: r2Object.httpMetadata?.contentType || 'image/jpeg' });
        formData.append('file', blob, r2Key.split('/').pop() || 'image.jpg');

        // Add metadata for Cloudflare Images
        formData.append('id', r2Key); // Use R2 key as an ID within Cloudflare Images
        formData.append('metadata', JSON.stringify({
            source: 'r2',
            originalKey: r2Key,
            uploadedBy: uploadedBy,
            title: title,
            description: description || ''
        }));
        formData.append('requireSignedURLs', 'true'); // Example: if you want signed URLs by default

        const imagesUploadUrl = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/images/v1`;

        const uploadResponse = await fetch(imagesUploadUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${IMAGES_API_TOKEN}`,
            },
            body: formData,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            console.error('Cloudflare Images API upload failed for', r2Key, ':', errorData);
            // Log the error but still return 200 to the internal caller as its job is done,
            // the error is a processing error not a request error for this endpoint.
            return new Response(JSON.stringify({
                message: `Failed to upload R2 image to Cloudflare Images.`,
                error: errorData.errors?.[0]?.message || 'Unknown error'
            }), { status: 500 }); // Return 500 for internal logging/monitoring
        }

        const responseData = await uploadResponse.json();
        console.log(`Image ${r2Key} successfully pushed to Cloudflare Images. ID: ${responseData.result.id}`);

        // This endpoint doesn't need to send a response back to the client,
        // only for internal logging/monitoring purposes.
        return new Response(JSON.stringify({
            message: `Image ${r2Key} successfully processed and uploaded to Cloudflare Images.`,
            cloudflareImageId: responseData.result.id,
            cloudflareImageUrl: responseData.result.variants?.[0] || 'N/A'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

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