// src/pages/api/upload-image.ts
import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';
import { authenticateRequest } from '../../server/authenticateRequest';
import { handleImageUploadFormData } from '../../server/handleImageUploadFormData';

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
        // Store original image in R2
        console.log('[upload-image] Storing original image in R2');
        await R2Bucket.put(r2Key, image, {
            httpMetadata: {
                contentType: image.type,
            },
            customMetadata: {
                uploadedBy: user.emailAddress || 'unknown',
                title: title,
                description: description || '',
                contestId: contestId,
                uploadedAt: new Date().toISOString()
            }
        });

        // Return success with image URLs
        const baseUrl = new URL(request.url).origin;
        const originalImageUrl = `${baseUrl}/api/images/${r2Key}`;

        console.log('[upload-image] Upload completed successfully');
        
        return new Response(JSON.stringify({
            success: true,
            message: 'Image uploaded successfully',
            data: {
                imageId: imageId,
                r2Key: r2Key,
                contestId: contestId,
                uploadedBy: user.emailAddress || 'unknown',
                title: title,
                description: description || '',
                // Provide the optimized image URL
                imageUrl: originalImageUrl,
                // The serve-image endpoint will automatically optimize with:
                // - Max 1200px width
                // - WebP format
                // - Quality 85
                // - Scale-down fit
                metadata: {
                    originalFileName: image.name,
                    originalSize: image.size,
                    contentType: image.type,
                    uploadedAt: new Date().toISOString()
                }
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[upload-image] Error during upload:', error);
        return new Response(JSON.stringify({
            message: 'Failed to upload image',
            error: (error instanceof Error) ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};