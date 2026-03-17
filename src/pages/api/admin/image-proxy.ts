import type { APIRoute } from 'astro';
import { IMAGES_BASE_URL } from '../../../constants';
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

  try {
    const imageUrl = `${IMAGES_BASE_URL}/${key}`;
    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, message: 'Image not found' }),
        { status: response.status }
      );
    }

    return new Response(response.body, {
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'application/octet-stream',
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
