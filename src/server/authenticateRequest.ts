import { createClerkClient, type ClerkClient } from '@clerk/backend';
import { decodeJwt } from '@clerk/backend/jwt';

export type TUserPublicMetadata = {
  role?: 'admin' | 'moderator' | 'user';
};

export type TUser = {
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  id: string;
  publicMetadata?: TUserPublicMetadata;
};

export type TAuthenticateRequest =
  | {
      isAuthenticated: true;
      user: TUser;
      isAdminRole: () => boolean;
      unauthenticatedResponse?: null;
    }
  | {
      isAuthenticated: false;
      user: null;
      isAdminRole: () => boolean;
      unauthenticatedResponse: () => Response;
    };

export type TAuthenticateAdmin =
  | {
      isAuthenticated: true;
      isAdmin: true;
      user: TUser;
      unauthenticatedResponse?: null;
    }
  | {
      isAuthenticated: false;
      isAdmin: false;
      user: null;
      unauthenticatedResponse: () => Response;
    };

let clerkClient: ClerkClient;

export async function authenticateRequest(
  request: Request,
  locals: App.Locals
): Promise<TAuthenticateRequest> {
  if (!clerkClient) {
    clerkClient = createClerkClient({
      secretKey: locals.runtime.env.CLERK_SECRET_KEY,
      publishableKey: locals.runtime.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
    });
  }

  const authReq = await clerkClient.authenticateRequest(request, {
    jwtKey: locals.runtime.env.CLERK_JWT_KEY,
  });

  if (authReq.isAuthenticated) {
    const decodedJWT = decodeJwt(authReq.token);
    const userId = decodedJWT.payload.sub;
    const user = await clerkClient.users.getUser(userId);
    const {
      firstName,
      lastName,
      emailAddresses: [{ emailAddress }],
      id,
      publicMetadata,
    } = user;

    return {
      isAuthenticated: true,
      user: { firstName, lastName, emailAddress, id, publicMetadata },
      isAdminRole: () => publicMetadata?.role === 'admin',
    };
  }

  return {
    isAuthenticated: false,
    user: null,
    isAdminRole: () => false,
    unauthenticatedResponse: () =>
      new Response(
        JSON.stringify({
          message: `Unauthorized, status: ${authReq.status}`,
        }),
        { status: 401 }
      ),
  };
}

export async function authenticateAdmin(
  request: Request,
  locals: App.Locals
): Promise<TAuthenticateAdmin> {
  if (!clerkClient) {
    clerkClient = createClerkClient({
      secretKey: locals.runtime.env.CLERK_SECRET_KEY,
      publishableKey: locals.runtime.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
    });
  }

  const authReq = await clerkClient.authenticateRequest(request, {
    jwtKey: locals.runtime.env.CLERK_JWT_KEY,
  });

  if (authReq.isAuthenticated) {
    const decodedJWT = decodeJwt(authReq.token);
    const userId = decodedJWT.payload.sub;
    const user = await clerkClient.users.getUser(userId);
    const {
      firstName,
      lastName,
      emailAddresses: [{ emailAddress }],
      id,
      publicMetadata,
    } = user;

    // Check admin role immediately
    const userRole = publicMetadata?.role;
    if (userRole !== 'admin') {
      // Return 404 to hide endpoint from non-admins
      return {
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        unauthenticatedResponse: () => new Response(null, { status: 404 }),
      };
    }

    return {
      isAuthenticated: true,
      isAdmin: true,
      user: { firstName, lastName, emailAddress, id, publicMetadata },
    };
  }

  return {
    isAuthenticated: false,
    isAdmin: false,
    user: null,
    unauthenticatedResponse: () => new Response(null, { status: 404 }),
  };
}
