import { ClerkProvider } from "@clerk/clerk-react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { routeTree } from './generated.ts';

const router = createRouter({ routeTree })
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const redirectUrl = '/user/manage'

export function App({clerkPublicKey}: {clerkPublicKey?: string}) {
    if(!clerkPublicKey) {
        throw new Error('Missing Publishable Key')
    }
    
    return (
        <StrictMode>
            <ClerkProvider publishableKey={clerkPublicKey} afterSignOutUrl='/' 
            signInForceRedirectUrl={redirectUrl}
            signUpForceRedirectUrl={redirectUrl}>
                <RouterProvider router={router} />
            </ClerkProvider>
        </StrictMode>
    )
}