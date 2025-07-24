// src/pages/api/upload-image.ts
import type { APIRoute } from 'astro';
import { nanoid } from 'nanoid';
import { UPLOAD_IMAGE_TOKEN_HEADER_NAME } from '../../constants';
import { authenticateRequest } from '../../server/authenticateRequest';
import { handleImageUploadFormData } from '../../server/handleImageUploadFormData';

export const prerender = false;

export const GET: APIRoute = async () => {
    return new Response('update-image ok', { status: 200 });
}

export const POST: APIRoute = async ({ request, locals }) => {
    // It's crucial to clone the request BEFORE attempting to read its body with .formData()
    // authenticateRequest should ideally only read headers, but cloning is safest if there's any
    // possibility it might consume the body (e.g., for webhook signature verification).
    const authRequestClone = request.clone() as typeof request;
    const { isAuthenticated, user, unauthenticatedResponse } = await authenticateRequest(authRequestClone, locals);

    if (!isAuthenticated) return unauthenticatedResponse();

    // Parse multipart/form-data body
    let formData: FormData;
    try {
        formData = await request.formData(); // This consumes the original request body
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
        console.error("R2_IMAGES_BUCKET binding is missing in locals.runtime.env");
        return new Response(JSON.stringify({ message: 'Server configuration error: R2 bucket not found.' }), { status: 500 });
    }

    const imageId = nanoid();
    const r2Key = `2025/${contestId}/${user.emailAddress}/${imageId}.${fileExtension}`;

    try {
        console.log('BUCKET', R2Bucket);
        await R2Bucket.put(r2Key, image, {
            httpMetadata: {
                contentType: image.type,
            },
        });


        console.log('process image url', new URL('/api/process-image', request.url).toString())
        locals.runtime.ctx.waitUntil(

        fetch(new URL('/api/process-image', request.url).toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    [UPLOAD_IMAGE_TOKEN_HEADER_NAME]: locals.runtime.env.UPLOAD_IMAGE_ENDPOINT_TOKEN || ''
                },
                body: JSON.stringify({ r2Key, uploadedBy: user.emailAddress, title, description: description || '' }),
            }).then(async (response) => {
                // THIS IS THE CRUCIAL LOG:
                console.log(`[upload-image] Process-image response status: ${response.status}`);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`[upload-image] Process-image call failed with status ${response.status}: ${errorText}`);
                }
                return response; // IMPORTANT: Ensure the promise chain continues
            })
            .catch(e => {
                console.error("[upload-image] Error calling image processing endpoint via fetch:", e);
                if (e instanceof TypeError) {
                    console.error("[upload-image] Possible network or URL issue for process-image:", e.message);
                }
            }));
        

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