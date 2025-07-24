import { MAX_IMAGE_SIZE } from '../constants';
import { getFileExtensionFromMime } from './utils';

export type THandleImageUploadFormData = {
    ok: true;
    message?: null;
    data: {
        image: File;
        contestId: string;
        title: string;
        fileExtension: string;
        description?: string;
    }
} | {
    ok: false;
    message: string;
    data?: null;
};

export function handleImageUploadFormData(
    formData: FormData,
): THandleImageUploadFormData {
    const imageFile = formData.get('image') as File;
    const contestId = formData.get('contestId') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;

    if (!imageFile || !contestId || !title) {
        return {
            ok: false,
            message: 'Missing image file, contestId, or title.'
        };
    }

    if (!(imageFile instanceof File) || !imageFile.type.startsWith('image/')) {
        return {
            ok: false,
            message: 'Invalid image file provided. Must be an image file.'
        };
    }

    const fileExtension = getFileExtensionFromMime(imageFile.type);
    
    if (!fileExtension) {
        return {
            ok: false,
            message: `Unsupported image type: ${imageFile.type}.`
        };
    }

    if (imageFile.size > MAX_IMAGE_SIZE) {
        return {
            ok: false,
            message: 'Image file is too large. Maximum size is 10MB.'
        };
    }

    return {
        ok: true,
        data: {
            image: imageFile,
            contestId: contestId,
            title: title,
            description: description || undefined,
            fileExtension: fileExtension
        }
    }
}