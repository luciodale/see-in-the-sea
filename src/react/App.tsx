import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { AuthProvider } from "./auth/AuthProvider";
import { routeTree } from './generated.ts';

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export function App() {
    return (
        <StrictMode>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </StrictMode>
    )
}