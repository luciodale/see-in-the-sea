import type { APIRoute } from 'astro';
import { authenticateAdmin } from '../../../server/authenticateRequest';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response(
      JSON.stringify({ success: false, message: 'key is required' }),
      { status: 400 }
    );
  }

  const authRequestClone = request.clone() as typeof request;
  const { isAuthenticated, isAdmin, unauthenticatedResponse } =
    await authenticateAdmin(authRequestClone, locals);

  if (!isAuthenticated || !isAdmin) {
    return unauthenticatedResponse();
  }

  const bucket = locals.runtime.env.R2_IMAGES_BUCKET;
  if (!bucket) {
    return new Response(
      JSON.stringify({ success: false, message: 'R2 bucket not available' }),
      { status: 500 }
    );
  }

  try {
    const object = await bucket.get(key);

    if (!object) {
      return new Response(
        JSON.stringify({ success: false, message: 'Image not found' }),
        { status: 404 }
      );
    }

    return new Response(object.body, {
      headers: {
        'Content-Type':
          object.httpMetadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to fetch image',
      }),
      { status: 500 }
    );
  }
};
