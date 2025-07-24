// src/pages/api/upload-image.ts
import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';
import { authenticateRequest } from '../../server/authenticateRequest';
import { handleImageUploadFormData } from '../../server/handleImageUploadFormData';
import { processImageFromR2 } from '../../server/imageProcessing';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
    console.log('[upload-image] Processing upload request');
    
    // Authentication
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, user, unauthenticatedResponse } = await authenticateRequest(authRequestClone, locals);

    if (!isAuthenticated) return unauthenticatedResponse();

    // Parse form data
    let formData: FormData;
    try {
        formData = await request.formData();
    } catch (error) {
        console.error('Error parsing form data:', error);
        return new Response(JSON.stringify({ message: 'Invalid form data. Ensure Content-Type is multipart/form-data.' }), { status: 400 });
    }

    const { ok, message, data: imageUploadData } = handleImageUploadFormData(formData);

    if (!ok) {
        return new Response(JSON.stringify({ message }), { status: 400 });
    }

    const { image, contestId, title, description, fileExtension } = imageUploadData;
    const R2Bucket = locals.runtime.env.R2_IMAGES_BUCKET;

    if (!R2Bucket) {
        console.error("R2_IMAGES_BUCKET binding is missing");
        return new Response(JSON.stringify({ message: 'Server configuration error: R2 bucket not found.' }), { status: 500 });
    }

    const imageId = nanoid();
    const r2Key = `2025/${contestId}/${user.emailAddress || 'unknown'}/${imageId}.${fileExtension}`;

    try {
        // Step 1: Upload original image to R2
        console.log('[upload-image] Uploading original image to R2');
        await R2Bucket.put(r2Key, image, {
            httpMetadata: {
                contentType: image.type,
            },
        });

        // Step 2: Process the image using modular function
        console.log('[upload-image] Processing uploaded image');
        const processingResult = await processImageFromR2(
            r2Key,
            {
                R2_IMAGES_BUCKET: locals.runtime.env.R2_IMAGES_BUCKET,
                IMAGES: locals.runtime.env.IMAGES
            },
            {
                width: 800,
                format: 'image/webp'
            }
        );

        if (!processingResult.success) {
            console.error('[upload-image] Image processing failed:', processingResult.message);
            return new Response(JSON.stringify({
                message: 'Image uploaded but processing failed',
                error: processingResult.error,
                imageId: imageId,
                r2Key: r2Key
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Step 4: Return the processed image directly to client
        console.log('[upload-image] Returning processed image to client');
        
        return new Response(processingResult.processedImageData, {
            status: 200,
            headers: {
                'Content-Type': processingResult.contentType || 'image/webp',
                'Cache-Control': 'public, max-age=31536000',
                // Custom headers with metadata
                'X-Image-Id': imageId,
                'X-Contest-Id': contestId,
                'X-Uploaded-By': user.emailAddress || 'unknown',
                'X-Original-R2-Key': r2Key,
                'X-Image-Title': title,
                'X-Image-Description': description || ''
            }
        });

    } catch (error) {
        console.error('[upload-image] Error during upload/processing:', error);
        return new Response(JSON.stringify({
            message: 'Failed to upload and process image',
            error: (error instanceof Error) ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};