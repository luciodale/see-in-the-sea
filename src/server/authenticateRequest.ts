import { createClerkClient, type ClerkClient } from "@clerk/backend";
import { decodeJwt } from "@clerk/backend/jwt";

type TUser = {
  firstName: string | null
  lastName: string | null
  emailAddress: string | null
}

type TAuthenticateRequest = {
  isAuthenticated: true
  user: TUser
  unauthenticatedResponse?: null
} | {
  isAuthenticated: false
  user: null
  unauthenticatedResponse: () =>  Response

}

let clerkClient: ClerkClient

export async function authenticateRequest(request: Request, locals: App.Locals): Promise<TAuthenticateRequest> {

  if(!clerkClient) {
    clerkClient = createClerkClient({
      secretKey: locals.runtime.env.CLERK_SECRET_KEY,
      publishableKey: locals.runtime.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
    })
  }

  const authReq = await clerkClient.authenticateRequest(request, {
    jwtKey: locals.runtime.env.CLERK_JWT_KEY,
  })


  if(authReq.isAuthenticated) {
    const decodedJWT =decodeJwt(authReq.token)
    const userId = decodedJWT.payload.sub
    const user = await clerkClient.users.getUser(userId)
    const {firstName,lastName,emailAddresses: [{emailAddress}] } = user 

    return {isAuthenticated: true, user: {firstName,lastName,emailAddress}}
  }

  return {isAuthenticated: false, user: null,
    unauthenticatedResponse: () => new Response(
      JSON.stringify({
        message: `Unauthorized, status: ${authReq.status}`,
      }),
      {status: 401}
    )
  }
}

