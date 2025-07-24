// Modular image processing functions - can be easily extracted to separate worker later

export interface ImageProcessingResult {
    success: boolean;
    message: string;
    processedImageData?: ArrayBuffer;
    contentType?: string;
    error?: string;
}

/**
 * Process an image from R2 using Cloudflare Images
 * This function is modular and can be easily moved to a separate worker
 */
export async function processImageFromR2(
    r2Key: string,
    env: {
        R2_IMAGES_BUCKET: any;
        IMAGES: any;
    },
    transformOptions: {
        width?: number;
        height?: number;
        format?: 'image/webp' | 'image/jpeg' | 'image/png';
    } = { width: 800, format: 'image/webp' }
): Promise<ImageProcessingResult> {
    try {
        const { R2_IMAGES_BUCKET, IMAGES } = env;
        
        if (!R2_IMAGES_BUCKET || !IMAGES) {
            return {
                success: false,
                message: 'Missing R2 or Images binding',
                error: 'Server configuration error'
            };
        }

        // Fetch original image from R2
        const r2Object = await R2_IMAGES_BUCKET.get(r2Key);
        if (!r2Object || !r2Object.body) {
            return {
                success: false,
                message: `Image not found in R2: ${r2Key}`,
                error: 'Image not found'
            };
        }

        console.log(`[imageProcessing] Processing image: ${r2Key}`);

        // Transform the image using Cloudflare Images
        const transformedImage = await IMAGES.input(r2Object.body)
            .transform({ 
                width: transformOptions.width,
                ...(transformOptions.height && { height: transformOptions.height })
            })
            .output({ format: transformOptions.format });
            
        // Get the response
        const response = transformedImage.response();
        
        // Handle proxy response in local development
        if (!(response instanceof Response)) {
            console.log('[imageProcessing] Converting proxy response');
            const proxyResponse = response as any;
            const processedImageData = await proxyResponse.body.arrayBuffer();
            
            return {
                success: true,
                message: 'Image processed successfully',
                processedImageData,
                contentType: transformOptions.format || 'image/webp'
            };
        }
        
        // Handle normal Response
        const processedImageData = await response.arrayBuffer();
        
        return {
            success: true,
            message: 'Image processed successfully',
            processedImageData,
            contentType: response.headers.get('content-type') || transformOptions.format || 'image/webp'
        };

    } catch (error) {
        console.error(`[imageProcessing] Error processing image ${r2Key}:`, error);
        return {
            success: false,
            message: 'Image processing failed',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}