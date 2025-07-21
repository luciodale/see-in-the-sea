import type { APIRoute } from "astro";
import { authenticateRequest } from "../../server/authenticateRequest";
export const prerender = false


export const GET: APIRoute = async ({request, locals }) => {
   const {isAuthenticated, user, unauthenticatedResponse} = await authenticateRequest(request, locals)
    
   if(!isAuthenticated) return unauthenticatedResponse()
    
  return new Response(
    JSON.stringify({user}),
  );
};