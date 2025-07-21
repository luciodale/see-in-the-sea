// src/pages/api/image.ts
import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid'; // For generating short unique IDs
import { authenticateRequest } from '../../server/authenticateRequest'; // Your custom authentication utility

export const prerender = false;

// Helper to get file extension from MIME type
function getFileExtensionFromMime(mimeType: string): string | null {
    switch (mimeType) {
        case 'image/jpeg': return 'jpeg';
        case 'image/png': return 'png';
        case 'image/gif': return 'gif';
        case 'image/webp': return 'webp';
        case 'image/svg+xml': return 'svg';
        // Add more as needed
        default: return null;
    }
}

// --- POST: Handle Image Upload via multipart/form-data and Streaming ---
export const POST: APIRoute = async ({ request, locals }) => {
    // 1. Authenticate Request
    // It's crucial to clone the request BEFORE attempting to read its body with .formData()
    // authenticateRequest should ideally only read headers, but cloning is safest if there's any
    // possibility it might consume the body (e.g., for webhook signature verification).
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, user, unauthenticatedResponse } = await authenticateRequest(authRequestClone, locals);

    if (!isAuthenticated) return unauthenticatedResponse();

    // 2. Parse multipart/form-data body
    let formData: FormData;
    try {
        formData = await request.formData(); // This consumes the original request body
    } catch (error) {
        console.error('Error parsing form data:', error);
        return new Response(JSON.stringify({ message: 'Invalid form data. Ensure Content-Type is multipart/form-data.' }), { status: 400 });
    }

    // Extract fields from FormData
    const imageFile = formData.get('image') as File; // 'image' should be the 'name' attribute of your file input
    const contestId = formData.get('contestId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;

    // 3. Basic Validation
    if (!imageFile || !contestId || !title) {
        return new Response(JSON.stringify({ message: 'Missing image file, contestId, or title.' }), { status: 400 });
    }
    // Ensure it's actually a File object and an image type
    if (!(imageFile instanceof File) || !imageFile.type.startsWith('image/')) {
        return new Response(JSON.stringify({ message: 'Invalid image file provided. Must be an image file.' }), { status: 400 });
    }

    const fileExtension = getFileExtensionFromMime(imageFile.type);
    if (!fileExtension) {
        return new Response(JSON.stringify({ message: `Unsupported image type: ${imageFile.type}.` }), { status: 400 });
    }
    
    const R2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;

    if (!R2Bucket) {
        console.error("R2_IMAGES_BUCKET binding is missing in locals.runtime.env");
        return new Response(JSON.stringify({ message: 'Server configuration error: R2 bucket not found.' }), { status: 500 });
    }

    // Generate a unique ID for this image instance using nanoid
    const imageId = nanoid();
    // R2 Key: images/contestId/user.emailAddress/imageId.fileExtension
    const r2Key = `images/${contestId}/${user.emailAddress}/${imageId}.${fileExtension}`;


    // 5. Perform the upload to R2 by streaming the file directly
    try {
        console.log('BUCKET', R2Bucket)
        await R2Bucket.put(r2Key, imageFile, {
            httpMetadata: {
                contentType: imageFile.type, // Use the actual MIME type of the uploaded file
            },
            // Removed contentLength, not supported by R2PutOptions
            // Add other options like customMetadata, checksums, etc., if needed
        });

        // NOTE: Since R2 is private, we won't return a direct public URL here.
        // Instead, return the r2Key (or imageId) which the client will use to request
        // the image via GET /api/image?key=...
        return new Response(JSON.stringify({
            message: 'Image uploaded securely to R2 via streaming.',
            imageId: imageId,
            r2Key: r2Key,
            contestId: contestId,
            uploadedBy: user.emailAddress,
            title: title
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error during R2 upload via streaming:', error);
        return new Response(JSON.stringify({
            message: 'Failed to upload image to R2 via streaming.',
            error: (error instanceof Error) ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};